from datetime import datetime, timezone
from decimal import Decimal

from flask import current_app
from sqlalchemy import or_, select

from src.lib.db import db
from src.models.catalog import AssessmentPattern, FrameworkElement, ScoringBand
from src.models.collection import ContentCollection
from src.models.corpus import AssessmentCorpus, CoreSignal, CorpusSection
from src.models.evaluation import ElementScore, EvaluationRun, EvidenceMatch
from src.models.synonym import SynonymGroup, SynonymTerm
from src.util.core_extractor import extract_core_signals
from src.util.corpus_arranger import arrange_corpus_sections
from src.util.evidence_extractor import build_evidence_streams
from src.util.pattern_matcher import match_patterns_in_sections
from src.util.result_formatter import format_evaluation_result
from src.util.b2b_taxonomy import enrich_b2b_analysis_payload, get_subcategory_key_for_element
from src.util.b2c_taxonomy import enrich_b2c_categories
from src.util.score_calculator import (
    DEFAULT_BAND_TEMPLATES,
    band_label_for_score,
    build_category_scores,
    recommendation_for_band,
    score_from_hits,
)


def _parse_collected_at(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        return datetime.now(timezone.utc)


def store_collection(payload: dict, comprehensive: dict | None) -> ContentCollection:
    raw = payload['rawEvidence']
    existing = db.session.scalar(
        select(ContentCollection).filter_by(snapshot_id=payload['snapshotId'])
    )
    if existing:
        return existing

    collection = ContentCollection(
        snapshot_id=payload['snapshotId'],
        url=payload['url'],
        collector_type=payload.get('collectorType', 'content-collect-api'),
        collected_at=_parse_collected_at(payload['collectedAt']),
        normalized_payload=raw,
        comprehensive_payload=comprehensive,
        proposed_content=payload.get('proposedContent'),
        word_count=raw.get('wordCount'),
    )
    db.session.add(collection)
    db.session.flush()
    return collection


def arrange_and_persist_corpus(
    collection: ContentCollection,
    framework_key: str,
) -> AssessmentCorpus:
    existing = db.session.scalar(
        select(AssessmentCorpus).filter_by(
            collection_id=collection.id,
            framework_key=framework_key,
        )
    )
    if existing:
        return existing

    streams = build_evidence_streams(collection.normalized_payload)
    section_rows = arrange_corpus_sections(
        framework_key,
        collection.normalized_payload,
        streams,
        collection.url,
    )

    corpus = AssessmentCorpus(
        collection_id=collection.id,
        framework_key=framework_key,
        total_sections=len(section_rows),
        total_tokens=sum(row['token_count'] for row in section_rows),
        metadata_json={'evidence_streams': {key: len(value) for key, value in streams.items()}},
    )
    db.session.add(corpus)
    db.session.flush()

    for row in section_rows:
        db.session.add(
            CorpusSection(
                corpus_id=corpus.id,
                section_key=row['section_key'],
                evidence_stream=row['evidence_stream'],
                page_url=row['page_url'],
                page_type=row['page_type'],
                priority=row['priority'],
                text_content=row['text_content'],
                token_count=row['token_count'],
                headings=row['headings'],
            )
        )

    core_signals = extract_core_signals(section_rows)
    for signal in core_signals:
        db.session.add(
            CoreSignal(
                corpus_id=corpus.id,
                signal_type=signal['signal_type'],
                signal_text=signal['signal_text'],
                confidence=Decimal(str(signal['confidence'])),
                source_section_key=signal.get('source_section_key'),
                rank_order=signal.get('rank_order', 1),
            )
        )

    db.session.flush()
    return corpus


def run_evaluation(
    payload: dict,
    framework_key: str,
    comprehensive: dict | None = None,
    analysis_id: str | None = None,
    should_persist_collection: bool = True,
) -> dict:
    engine_version = current_app.config.get('EVALUATION_ENGINE_VERSION', '1.0.0')

    collection = store_collection(payload, comprehensive) if should_persist_collection else None
    if collection is None:
        collection = store_collection(payload, comprehensive)

    corpus = arrange_and_persist_corpus(collection, framework_key)

    run = EvaluationRun(
        corpus_id=corpus.id,
        framework_key=framework_key,
        analysis_id=analysis_id,
        status='running',
        engine_version=engine_version,
    )
    db.session.add(run)
    db.session.flush()

    elements = (
        db.session.scalars(
            select(FrameworkElement)
            .filter_by(framework_key=framework_key, active=True)
            .order_by(FrameworkElement.sort_order)
        )
        .all()
    )
    if not elements:
        run.status = 'failed'
        run.error_message = f'No catalog elements for framework: {framework_key}'
        db.session.commit()
        raise ValueError(run.error_message)

    patterns = (
        db.session.scalars(
            select(AssessmentPattern).filter_by(
                framework_key=framework_key,
                active=True,
            )
        )
        .all()
    )

    synonym_rows = (
        db.session.execute(
            select(SynonymTerm, SynonymGroup.element_key)
            .join(SynonymGroup, SynonymTerm.group_id == SynonymGroup.id)
            .filter(
                SynonymTerm.active.is_(True),
                or_(
                    SynonymGroup.framework_key == framework_key,
                    SynonymGroup.framework_key.is_(None),
                ),
            )
        )
        .all()
    )

    synonym_terms = []
    for term, element_key in synonym_rows:
        term.element_key = element_key
        synonym_terms.append(term)

    section_dicts = [
        {
            'section_key': section.section_key,
            'text_content': section.text_content,
            'page_url': section.page_url,
        }
        for section in corpus.sections
    ]

    element_hits = match_patterns_in_sections(section_dicts, patterns, synonym_terms)

    band_templates = {
        row.band_label: row.recommendation_template
        for row in db.session.scalars(
            select(ScoringBand).filter(
                or_(
                    ScoringBand.framework_key == framework_key,
                    ScoringBand.framework_key == 'global',
                )
            )
        ).all()
    }
    if not band_templates:
        band_templates = DEFAULT_BAND_TEMPLATES

    scored_elements: list[dict] = []
    elements_by_category: dict[str, list[dict]] = {}

    for element in elements:
        hits = element_hits.get(element.element_key, [])
        score, confidence, match_count = score_from_hits(hits)
        band = band_label_for_score(score)
        recommendation = recommendation_for_band(
            band,
            element.element_slug,
            element.definition,
            band_templates,
        )

        evidence_text = (
            ' | '.join(hit.context_text[:120] for hit in hits[:3])
            if hits
            else 'Not found'
        )

        element_score = ElementScore(
            run_id=run.id,
            element_key=element.element_key,
            element_slug=element.element_slug,
            category_key=element.category_key,
            score=Decimal(str(score)),
            confidence=Decimal(str(confidence)),
            evidence_summary=evidence_text,
            recommendation=recommendation,
            match_count=match_count,
            sections_hit={'sections': list({hit.section_key for hit in hits})},
        )
        db.session.add(element_score)
        db.session.flush()

        for hit in hits[:10]:
            db.session.add(
                EvidenceMatch(
                    element_score_id=element_score.id,
                    pattern_id=hit.pattern_id,
                    synonym_term_id=hit.synonym_term_id,
                    section_key=hit.section_key,
                    matched_text=hit.matched_text,
                    context_text=hit.context_text,
                    page_url=hit.page_url,
                    char_offset=hit.char_offset,
                    match_weight=Decimal(str(hit.match_weight)),
                )
            )

        scored = {
            'element_key': element.element_key,
            'element_slug': element.element_slug,
            'category_key': element.category_key,
            'category_name': element.category_name,
            'score': score,
            'evidence': evidence_text,
            'recommendation': recommendation,
        }
        scored_elements.append(scored)
        elements_by_category.setdefault(element.category_key, []).append(scored)

    categories, overall_score, total_elements = build_category_scores(elements_by_category)
    raw_categories = categories
    if framework_key == 'b2c-elements':
        categories = enrich_b2c_categories(categories)

    entries = sorted(scored_elements, key=lambda item: item['score'], reverse=True)
    top_strengths = [
        {
            'element': item['element_slug'],
            'category': item['category_key'],
            **(
                {'subcategory': get_subcategory_key_for_element(
                    item['category_key'],
                    item['element_slug'],
                )}
                if framework_key == 'b2b-elements'
                else {}
            ),
            'score': item['score'],
            'evidence': item['evidence'],
        }
        for item in entries
        if item['score'] >= 0.7
    ][:5]

    critical_gaps = sorted(
        [
            {
                'element': item['element_slug'],
                'category': item['category_key'],
                **(
                    {'subcategory': get_subcategory_key_for_element(
                        item['category_key'],
                        item['element_slug'],
                    )}
                    if framework_key == 'b2b-elements'
                    else {}
                ),
                'score': item['score'],
                'recommendation': item['recommendation'],
            }
            for item in entries
            if item['score'] < 0.4
        ],
        key=lambda item: item['score'],
    )[:5]

    b2b_enrichment: dict | None = None
    if framework_key == 'b2b-elements':
        b2b_enrichment = enrich_b2b_analysis_payload(
            categories=raw_categories,
            top_strengths=top_strengths,
            critical_gaps=critical_gaps,
        )
        categories = b2b_enrichment['categories']
        top_strengths = b2b_enrichment['topStrengths']
        critical_gaps = b2b_enrichment['criticalGaps']

    core_signal_rows = (
        db.session.scalars(select(CoreSignal).filter_by(corpus_id=corpus.id))
        .all()
    )
    core_signals = [
        {
            'signalType': signal.signal_type,
            'signalText': signal.signal_text,
            'confidence': float(signal.confidence),
            'sourceSectionKey': signal.source_section_key,
        }
        for signal in core_signal_rows
    ]

    result_payload = format_evaluation_result(
        framework_key=framework_key,
        url=payload['url'],
        overall_score=overall_score,
        total_elements=total_elements,
        categories=categories,
        top_strengths=top_strengths,
        critical_gaps=critical_gaps,
        core_signals=core_signals,
        category_count=len(elements_by_category),
        expected_element_count=len(elements),
    )

    if b2b_enrichment is not None:
        result_payload['pyramidDiagnostics'] = b2b_enrichment['pyramidDiagnostics']

    run.status = 'completed'
    run.overall_score = Decimal(str(overall_score))
    run.elements_evaluated = total_elements
    run.elements_expected = len(elements)
    run.result_payload = result_payload
    run.completed_at = datetime.now(timezone.utc)
    db.session.commit()

    api_response = {
        'success': True,
        'runId': str(run.id),
        'collectionId': str(collection.id),
        'corpusId': str(corpus.id),
        'frameworkKey': framework_key,
        'message': 'Evaluation completed successfully',
        **result_payload,
    }
    return api_response

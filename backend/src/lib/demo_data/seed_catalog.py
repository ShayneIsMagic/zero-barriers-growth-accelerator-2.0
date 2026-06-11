import json
from decimal import Decimal
from pathlib import Path

from src.lib.db import db
from src.models.catalog import (
    AssessmentPattern,
    FrameworkElement,
    FrameworkSectionMap,
    ScoringBand,
)
from src.models.synonym import SynonymGroup, SynonymTerm
from src.util.corpus_arranger import DEFAULT_SECTION_MAP

CATALOG_PATH = Path(__file__).resolve().parent / 'framework_catalog.json'

GLOBAL_BANDS = [
    (
        'excellent',
        Decimal('0.800'),
        Decimal('1.000'),
        'Strong signal for {display_name}. Maintain consistency across hero, CTA, and body copy.',
    ),
    (
        'good',
        Decimal('0.600'),
        Decimal('0.799'),
        '{display_name} is present but could be stronger. Surface it in hero or primary CTA.',
    ),
    (
        'needs_work',
        Decimal('0.400'),
        Decimal('0.599'),
        'Weak signal for {display_name}. Strengthen with explicit copy about {definition}.',
    ),
    (
        'poor',
        Decimal('0.000'),
        Decimal('0.399'),
        'No clear signal for {display_name}. Add dedicated copy addressing {definition}.',
    ),
]

SECTION_STREAM_LABELS: dict[str, str] = {
    'hero': 'Headlines and hero copy',
    'functional_claims': 'Functional value claims',
    'cta': 'Calls to action',
    'testimonial': 'Testimonials and social proof',
    'body': 'Body copy',
    'proof': 'Proof points and case studies',
    'promise': 'Brand promises',
    'purpose': 'Purpose and WHY language',
    'navigation': 'Navigation labels',
    'imagery': 'Image alt text and visual signals',
    'market': 'Market and demand signals',
    'monetization': 'Pricing and conversion signals',
    'growth': 'Growth and retention signals',
}


def _load_catalog() -> dict:
    return json.loads(CATALOG_PATH.read_text(encoding='utf-8'))


def _seed_scoring_bands() -> None:
    for band_label, min_score, max_score, template in GLOBAL_BANDS:
        exists = ScoringBand.query.filter_by(
            framework_key='global',
            band_label=band_label,
        ).first()
        if exists:
            continue
        db.session.add(
            ScoringBand(
                framework_key='global',
                band_label=band_label,
                min_score=min_score,
                max_score=max_score,
                recommendation_template=template,
            )
        )


def _seed_section_maps() -> None:
    for framework_key, sections in DEFAULT_SECTION_MAP.items():
        for section_key, _stream_key, priority in sections:
            exists = FrameworkSectionMap.query.filter_by(
                framework_key=framework_key,
                section_key=section_key,
            ).first()
            if exists:
                continue
            db.session.add(
                FrameworkSectionMap(
                    framework_key=framework_key,
                    section_key=section_key,
                    priority=priority,
                    weight=Decimal('1.0'),
                    description=SECTION_STREAM_LABELS.get(section_key),
                )
            )


def _deactivate_stale_elements(framework_key: str, active_element_keys: set[str]) -> None:
    """Mark catalog rows removed from the bundled JSON as inactive."""
    stale_rows = FrameworkElement.query.filter(
        FrameworkElement.framework_key == framework_key,
        FrameworkElement.active.is_(True),
        FrameworkElement.element_key.notin_(active_element_keys),
    ).all()
    for row in stale_rows:
        row.active = False


def _seed_framework_catalog(framework: dict) -> None:
    framework_key = framework['frameworkKey']
    active_element_keys: set[str] = set()

    for element in framework['elements']:
        active_element_keys.add(element['elementKey'])
        element_key = element['elementKey']
        keywords = element.get('keywords') or []

        row = FrameworkElement.query.filter_by(
            framework_key=framework_key,
            element_key=element_key,
        ).first()
        if not row:
            row = FrameworkElement(
                framework_key=framework_key,
                category_key=element['categoryKey'],
                category_name=element['categoryName'],
                element_slug=element['elementSlug'],
                element_key=element_key,
                display_name=element.get('displayName'),
                definition=element.get('definition') or None,
                sort_order=element.get('sortOrder', 0),
            )
            db.session.add(row)
            db.session.flush()
        else:
            row.category_key = element['categoryKey']
            row.category_name = element['categoryName']
            row.element_slug = element['elementSlug']
            row.display_name = element.get('displayName')
            row.definition = element.get('definition') or None
            row.sort_order = element.get('sortOrder', 0)
            row.active = True

        for keyword in keywords:
            pattern_exists = AssessmentPattern.query.filter_by(
                framework_key=framework_key,
                element_key=element_key,
                pattern_text=keyword,
            ).first()
            if pattern_exists:
                continue
            db.session.add(
                AssessmentPattern(
                    framework_key=framework_key,
                    element_key=element_key,
                    pattern_type='keyword',
                    pattern_text=keyword,
                    pattern_weight=Decimal('1.0'),
                    score_contribution=Decimal('0.15'),
                )
            )

        display_name = element.get('displayName') or element['elementSlug']
        group = SynonymGroup.query.filter_by(
            framework_key=framework_key,
            element_key=element_key,
            canonical_term=display_name,
        ).first()
        if not group:
            group = SynonymGroup(
                framework_key=framework_key,
                element_key=element_key,
                canonical_term=display_name,
                group_type='keyword',
                source='seed',
            )
            db.session.add(group)
            db.session.flush()

        for keyword in keywords:
            term_exists = SynonymTerm.query.filter_by(group_id=group.id, term=keyword).first()
            if term_exists:
                continue
            db.session.add(
                SynonymTerm(
                    group_id=group.id,
                    term=keyword,
                    term_type='keyword',
                    match_weight=Decimal('1.0'),
                )
            )

    _deactivate_stale_elements(framework_key, active_element_keys)


def seed_all() -> None:
    catalog = _load_catalog()
    _seed_scoring_bands()
    _seed_section_maps()
    for framework in catalog['frameworks']:
        _seed_framework_catalog(framework)
    db.session.commit()

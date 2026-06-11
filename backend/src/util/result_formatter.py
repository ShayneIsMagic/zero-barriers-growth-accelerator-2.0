"""Format evaluation engine output to match FE chunked analysis contract."""

from __future__ import annotations

from typing import Any

FRAMEWORK_DISPLAY_NAMES: dict[str, str] = {
    'b2c-elements': 'B2C Elements of Value',
    'b2b-elements': 'B2B Elements of Value',
    'clifton': 'CliftonStrengths',
    'golden-circle': 'Golden Circle (Simon Sinek)',
    'brand-archetypes': 'Jambojon Brand Archetypes',
    'revenue-trends': 'Revenue Trends',
}

ARCHETYPE_DISPLAY_NAMES: dict[str, str] = {
    'sage': 'The Sage',
    'explorer': 'The Explorer',
    'hero': 'The Hero',
    'outlaw': 'The Outlaw',
    'magician': 'The Magician',
    'regular_guy_girl': 'The Regular Guy/Girl',
    'jester': 'The Jester',
    'caregiver': 'The Caregiver',
    'creator': 'The Creator',
    'innocent': 'The Innocent',
    'lover': 'The Lover',
    'ruler': 'The Ruler',
}

CO_PRIMARY_TOLERANCE = 0.05
SECONDARY_MIN_SCORE = 0.6


def _strength_label(score: float) -> str:
    if score >= 0.8:
        return 'Dominant'
    if score >= 0.6:
        return 'Strong'
    if score >= 0.4:
        return 'Moderate'
    return 'Weak/Absent'


def _rank_archetypes(categories: dict[str, Any]) -> dict[str, Any] | None:
    all_ranked: list[dict[str, Any]] = []

    for group, category_raw in categories.items():
        if not isinstance(category_raw, dict):
            continue
        elements = category_raw.get('elements')
        if not isinstance(elements, dict):
            continue
        for slug, detail in elements.items():
            if not isinstance(detail, dict):
                continue
            score = float(detail.get('score', 0))
            all_ranked.append(
                {
                    'slug': slug,
                    'displayName': ARCHETYPE_DISPLAY_NAMES.get(
                        slug, slug.replace('_', ' ').title()
                    ),
                    'group': group,
                    'score': score,
                    'evidence': str(detail.get('evidence', '')),
                    'strengthLabel': _strength_label(score),
                }
            )

    if not all_ranked:
        return None

    all_ranked.sort(key=lambda item: item['score'], reverse=True)
    top_score = all_ranked[0]['score']
    primary = [
        item for item in all_ranked if top_score - item['score'] <= CO_PRIMARY_TOLERANCE
    ]
    primary_slugs = {item['slug'] for item in primary}
    secondary = [
        item
        for item in all_ranked
        if item['slug'] not in primary_slugs and item['score'] >= SECONDARY_MIN_SCORE
    ]
    dominant_cluster = [item for item in all_ranked if item['score'] >= 0.8]

    def _summary(item: dict[str, Any]) -> dict[str, Any]:
        return {
            'name': item['displayName'],
            'slug': item['slug'],
            'score': item['score'],
            'strength': item['strengthLabel'],
            'group': item['group'],
            'evidence': item['evidence'],
        }

    return {
        'primary_archetype': (
            _summary(primary[0])
            if len(primary) == 1
            else [_summary(item) for item in primary]
        ),
        'secondary_archetypes': [_summary(item) for item in secondary],
        'dominant_cluster': [_summary(item) for item in dominant_cluster],
        'archetype_ranking': {
            'overallScore': round(
                sum(item['score'] for item in all_ranked) / len(all_ranked), 3
            ),
            'allRanked': [_summary(item) for item in all_ranked],
        },
    }


def build_chunked_report(
    framework_key: str,
    url: str,
    overall_score: float,
    categories: dict[str, Any],
    top_strengths: list[dict[str, Any]],
    critical_gaps: list[dict[str, Any]],
    verification: dict[str, Any],
) -> str:
    framework_name = FRAMEWORK_DISPLAY_NAMES.get(framework_key, framework_key)
    breakdown = verification.get('breakdown', {})
    analyzed = verification.get('total_elements_analyzed', 0)
    expected = verification.get('total_elements_in_framework', 0)
    complete = verification.get('all_elements_accounted_for', False)

    category_lines = []
    for category_raw in categories.values():
        if not isinstance(category_raw, dict):
            continue
        category_lines.append(
            f"- {category_raw.get('categoryName', 'Category')}: "
            f"{float(category_raw.get('categoryScore', 0)):.3f} "
            f"({category_raw.get('elementCount', 0)} elements)"
        )
        subcategories = category_raw.get('subcategories')
        if isinstance(subcategories, dict):
            for sub_raw in subcategories.values():
                if not isinstance(sub_raw, dict):
                    continue
                category_lines.append(
                    f"  - {sub_raw.get('subcategoryName', 'Subcategory')}: "
                    f"{float(sub_raw.get('subcategoryScore', 0)):.3f} "
                    f"({sub_raw.get('elementCount', 0)} elements)"
                )

    strength_lines = [
        f"- {item['element']} ({item['category']}): {float(item['score']):.3f}"
        for item in top_strengths
    ]
    gap_lines = [
        f"- {item['element']} ({item['category']}): {float(item['score']):.3f} -> "
        f"{item['recommendation']}"
        for item in critical_gaps
    ]

    return (
        f'# {framework_name} Chunked Report\n\n'
        f'## Overall\n'
        f'- URL: {url}\n'
        f'- Overall Score: {overall_score:.3f}\n'
        f'- Elements Analyzed: {analyzed}/{expected}\n'
        f"- Completeness: {'pass' if complete else 'fail'}\n\n"
        f'## Category Scores\n'
        f"{chr(10).join(category_lines) or '- No categories analyzed'}\n\n"
        f'## Top Strengths\n'
        f"{chr(10).join(strength_lines) or '- No high-scoring strengths found'}\n\n"
        f'## Critical Gaps\n'
        f"{chr(10).join(gap_lines) or '- No critical gaps found'}\n\n"
        f'## Coverage Breakdown\n'
        f"- Present (>=0.6): {breakdown.get('present', 0)}\n"
        f"- Partial (>0 and <0.6): {breakdown.get('partial', 0)}\n"
        f"- Missing (0): {breakdown.get('missing', 0)}\n"
    )


def format_evaluation_result(
    *,
    framework_key: str,
    url: str,
    overall_score: float,
    total_elements: int,
    categories: dict[str, Any],
    top_strengths: list[dict[str, Any]],
    critical_gaps: list[dict[str, Any]],
    core_signals: list[dict[str, Any]],
    category_count: int,
    expected_element_count: int | None = None,
) -> dict[str, Any]:
    entries: list[tuple[str, str, dict[str, Any]]] = []
    for category_key, category_raw in categories.items():
        if not isinstance(category_raw, dict):
            continue
        subcategories = category_raw.get('subcategories')
        if isinstance(subcategories, dict):
            for sub_raw in subcategories.values():
                if not isinstance(sub_raw, dict):
                    continue
                for slug, detail in (sub_raw.get('elements') or {}).items():
                    if isinstance(detail, dict):
                        entries.append((category_key, slug, detail))
            continue
        for slug, detail in (category_raw.get('elements') or {}).items():
            if isinstance(detail, dict):
                entries.append((category_key, slug, detail))

    present = len([item for item in entries if float(item[2].get('score', 0)) >= 0.6])
    partial = len(
        [
            item
            for item in entries
            if 0 < float(item[2].get('score', 0)) < 0.6
        ]
    )
    analyzed_total = len(entries)
    expected_total = expected_element_count or total_elements
    missing = analyzed_total - present - partial
    all_accounted = analyzed_total == expected_total

    verification = {
        'total_elements_in_framework': expected_total,
        'total_elements_analyzed': analyzed_total,
        'completeness_check': 'pass' if all_accounted else 'fail',
        'all_elements_accounted_for': all_accounted,
        'breakdown': {
            'present': present,
            'partial': partial,
            'missing': missing,
            'total': analyzed_total,
        },
    }

    chunked_report = build_chunked_report(
        framework_key=framework_key,
        url=url,
        overall_score=overall_score,
        categories=categories,
        top_strengths=top_strengths,
        critical_gaps=critical_gaps,
        verification=verification,
    )

    result: dict[str, Any] = {
        'framework': FRAMEWORK_DISPLAY_NAMES.get(framework_key, framework_key),
        'url': url,
        'overallScore': overall_score,
        'totalElements': total_elements,
        'categories': categories,
        'topStrengths': top_strengths,
        'criticalGaps': critical_gaps,
        'analysisMethod': 'deterministic-flask',
        'chunksCompleted': category_count,
        'chunksTotal': category_count,
        'blockCount': category_count,
        'verification': verification,
        'chunkedReport': chunked_report,
        'coreSignals': core_signals,
    }

    if framework_key == 'brand-archetypes':
        archetype_fields = _rank_archetypes(categories)
        if archetype_fields:
            result.update(archetype_fields)

    return result

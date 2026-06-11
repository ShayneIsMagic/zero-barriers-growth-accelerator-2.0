from decimal import Decimal

from src.util.pattern_matcher import MatchHit


def score_from_hits(hits: list[MatchHit], contribution: float = 0.15) -> tuple[float, float, int]:
    """Convert pattern hits to flat 0.0-1.0 score and confidence."""
    if not hits:
        return 0.0, 0.0, 0

    raw = sum(hit.match_weight * contribution for hit in hits)
    unique_sections = len({hit.section_key for hit in hits})

    if raw <= 0:
        score = 0.1
    elif raw < 0.3:
        score = 0.35
    elif raw < 0.6:
        score = 0.55
    elif unique_sections >= 2:
        score = min(1.0, 0.65 + raw * 0.35)
    else:
        score = min(0.79, 0.45 + raw * 0.3)

    confidence = min(1.0, 0.4 + len(hits) * 0.1 + unique_sections * 0.1)
    return round(score, 3), round(confidence, 4), len(hits)


def band_label_for_score(score: float) -> str:
    if score >= 0.8:
        return 'excellent'
    if score >= 0.6:
        return 'good'
    if score >= 0.4:
        return 'needs_work'
    return 'poor'


def recommendation_for_band(
    band_label: str,
    element_slug: str,
    definition: str | None,
    templates: dict[str, str],
) -> str:
    template = templates.get(band_label, templates.get('poor', ''))
    return template.format(
        element_slug=element_slug,
        display_name=element_slug.replace('_', ' ').title(),
        definition=definition or 'this value element',
    )


DEFAULT_BAND_TEMPLATES = {
    'excellent': (
        'Strong signal for {display_name}. Maintain consistency across hero, CTA, and body copy.'
    ),
    'good': (
        '{display_name} is present but could be stronger. Surface it in hero or primary CTA.'
    ),
    'needs_work': (
        'Weak signal for {display_name}. Strengthen with explicit copy about {definition}.'
    ),
    'poor': (
        'No clear signal for {display_name}. Add dedicated copy addressing {definition}.'
    ),
}


def build_category_scores(
    elements_by_category: dict[str, list[dict]],
) -> tuple[dict, float, int]:
    categories: dict = {}
    all_scores: list[float] = []
    total_elements = 0

    for category_key, elements in elements_by_category.items():
        element_map = {}
        category_scores: list[float] = []

        for element in elements:
            score = float(element['score'])
            element_map[element['element_slug']] = {
                'score': score,
                'evidence': element['evidence'],
                'recommendation': element['recommendation'],
            }
            category_scores.append(score)
            all_scores.append(score)
            total_elements += 1

        category_score = (
            round(sum(category_scores) / len(category_scores), 3)
            if category_scores
            else 0.0
        )

        categories[category_key] = {
            'categoryName': elements[0]['category_name'] if elements else category_key,
            'categoryScore': category_score,
            'elementCount': len(elements),
            'elements': element_map,
        }

    overall = round(sum(all_scores) / len(all_scores), 3) if all_scores else 0.0
    return categories, overall, total_elements

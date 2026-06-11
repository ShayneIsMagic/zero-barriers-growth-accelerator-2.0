"""B2C Elements of Value taxonomy — flat categories only (no subcategories)."""

from __future__ import annotations

from typing import Any

B2C_ELEMENT_DISPLAY_NAMES: dict[str, str] = {
    'saves_time': 'Saves time',
    'simplifies': 'Simplifies',
    'makes_money': 'Makes money',
    'reduces_effort': 'Reduces effort',
    'reduces_cost': 'Reduces cost',
    'reduces_risk': 'Reduces risk',
    'organizes': 'Organizes',
    'integrates': 'Integrates',
    'connects': 'Connects',
    'quality': 'Quality',
    'variety': 'Variety',
    'informs': 'Informs',
    'avoids_hassles': 'Avoids hassles',
    'sensory_appeal': 'Sensory appeal',
    'reduces_anxiety': 'Reduces anxiety',
    'rewards_me': 'Rewards me',
    'nostalgia': 'Nostalgia',
    'design_aesthetics': 'Design/aesthetics',
    'badge_value': 'Badge value',
    'wellness': 'Wellness',
    'therapeutic': 'Therapeutic value',
    'fun_entertainment': 'Fun/entertainment',
    'attractiveness': 'Attractive appearance',
    'provides_access': 'Provides access',
    'provides_hope': 'Provides hope',
    'self_actualization': 'Self-actualization',
    'motivation': 'Motivation',
    'heirloom': 'Heirloom',
    'affiliation': 'Affiliation/belonging',
    'affiliation_belonging': 'Affiliation/belonging',
    'self_transcendence': 'Self-transcendence',
}

B2C_CATEGORY_TAXONOMY: dict[str, dict[str, Any]] = {
    'functional': {
        'categoryName': 'Functional',
        'elements': [
            'saves_time',
            'simplifies',
            'makes_money',
            'reduces_effort',
            'reduces_cost',
            'reduces_risk',
            'organizes',
            'integrates',
            'connects',
            'quality',
            'variety',
            'informs',
            'avoids_hassles',
            'sensory_appeal',
        ],
    },
    'emotional': {
        'categoryName': 'Emotional',
        'elements': [
            'reduces_anxiety',
            'rewards_me',
            'nostalgia',
            'design_aesthetics',
            'badge_value',
            'wellness',
            'therapeutic',
            'fun_entertainment',
            'attractiveness',
            'provides_access',
        ],
    },
    'life_changing': {
        'categoryName': 'Life-Changing',
        'elements': [
            'provides_hope',
            'self_actualization',
            'motivation',
            'heirloom',
            'affiliation',
        ],
    },
    'social_impact': {
        'categoryName': 'Social Impact',
        'elements': ['self_transcendence'],
    },
}


def _average(scores: list[float]) -> float:
    if not scores:
        return 0.0
    return round(sum(scores) / len(scores), 3)


def get_category_diagnostic_guide(category_key: str) -> dict[str, Any] | None:
    taxonomy = B2C_CATEGORY_TAXONOMY.get(category_key)
    if not taxonomy:
        return None
    labels = [
        B2C_ELEMENT_DISPLAY_NAMES.get(slug, slug) for slug in taxonomy['elements']
    ]
    return {
        'categoryKey': category_key,
        'categoryName': taxonomy['categoryName'],
        'elements': taxonomy['elements'],
        'weakCategoryAction': (
            f'Evaluate these {len(taxonomy["elements"])} defining values: '
            f'{", ".join(labels)}'
        ),
    }


def enrich_b2c_categories(categories: dict[str, Any]) -> dict[str, Any]:
    """Normalize B2C categories: flat elements only, categoryScore from element average."""
    enriched: dict[str, Any] = {}

    for category_key, category_raw in categories.items():
        if not isinstance(category_raw, dict):
            enriched[category_key] = category_raw
            continue

        elements = category_raw.get('elements') or {}
        if not isinstance(elements, dict):
            enriched[category_key] = category_raw
            continue

        taxonomy = B2C_CATEGORY_TAXONOMY.get(category_key)
        category_name = (
            taxonomy['categoryName']
            if taxonomy
            else category_raw.get('categoryName', category_key)
        )

        scores = [
            float(detail.get('score', 0))
            for detail in elements.values()
            if isinstance(detail, dict)
        ]

        enriched[category_key] = {
            'categoryName': category_name,
            'categoryScore': _average(scores),
            'elementCount': len(taxonomy['elements']) if taxonomy else len(elements),
            'elements': elements,
        }

    return enriched

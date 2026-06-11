"""B2B Elements of Value taxonomy aligned to the Bain & Company pyramid.

Scoring hierarchy (runtime rollups — matchers score elements only):
- subcategoryScore = mean of element scores in subcategory
- categoryScore (Table Stakes) = mean of 4 element scores
- categoryScore (other tiers) = mean of subcategory scores
- overallScore = mean of all 40 element scores (computed in evaluation_engine)
"""

from __future__ import annotations

from typing import Any

B2B_ELEMENT_DISPLAY_NAMES: dict[str, str] = {
    'meeting_specifications': 'Meeting specifications',
    'acceptable_price': 'Acceptable price',
    'regulatory_compliance': 'Regulatory compliance',
    'ethical_standards': 'Ethical standards',
    'improved_top_line': 'Improved top line',
    'cost_reduction': 'Cost reduction',
    'product_quality': 'Product quality',
    'scalability': 'Scalability',
    'innovation': 'Innovation',
    'time_savings': 'Time savings',
    'reduced_effort': 'Reduced effort',
    'decreased_hassles': 'Decreased hassles',
    'information': 'Information',
    'transparency': 'Transparency',
    'organization': 'Organization',
    'simplification': 'Simplification',
    'connection': 'Connection',
    'integration': 'Integration',
    'availability': 'Availability',
    'variety': 'Variety',
    'configurability': 'Configurability',
    'responsiveness': 'Responsiveness',
    'expertise': 'Expertise',
    'commitment': 'Commitment',
    'stability': 'Stability',
    'cultural_fit': 'Cultural fit',
    'risk_reduction': 'Risk reduction',
    'reach': 'Reach',
    'flexibility': 'Flexibility',
    'component_quality': 'Component quality',
    'network_expansion': 'Network expansion',
    'marketability': 'Marketability',
    'reputational_assurance': 'Reputational assurance',
    'design_aesthetics_b2b': 'Design & aesthetics',
    'growth_development': 'Growth & development',
    'reduced_anxiety_b2b': 'Reduced anxiety',
    'fun_perks': 'Fun & perks',
    'vision': 'Vision',
    'hope_b2b': 'Hope',
    'social_responsibility': 'Social responsibility',
}

B2B_CATEGORY_TAXONOMY: dict[str, dict[str, Any]] = {
    'table_stakes': {
        'categoryName': 'Table Stakes',
        'subcategories': None,
        'elements': [
            'meeting_specifications',
            'acceptable_price',
            'regulatory_compliance',
            'ethical_standards',
        ],
    },
    'functional': {
        'categoryName': 'Functional Value',
        'subcategories': {
            'economic': {
                'subcategoryName': 'Economic',
                'elements': ['improved_top_line', 'cost_reduction'],
            },
            'performance': {
                'subcategoryName': 'Performance',
                'elements': ['product_quality', 'scalability', 'innovation'],
            },
        },
    },
    'ease_of_business': {
        'categoryName': 'Ease of Doing Business',
        'subcategories': {
            'productivity': {
                'subcategoryName': 'Productivity',
                'elements': [
                    'time_savings',
                    'reduced_effort',
                    'decreased_hassles',
                    'information',
                    'transparency',
                ],
            },
            'operational': {
                'subcategoryName': 'Operational',
                'elements': [
                    'organization',
                    'simplification',
                    'connection',
                    'integration',
                ],
            },
            'access': {
                'subcategoryName': 'Access',
                'elements': ['availability', 'variety', 'configurability'],
            },
            'relationship': {
                'subcategoryName': 'Relationship',
                'elements': [
                    'responsiveness',
                    'expertise',
                    'commitment',
                    'stability',
                    'cultural_fit',
                ],
            },
            'strategic': {
                'subcategoryName': 'Strategic',
                'elements': [
                    'risk_reduction',
                    'reach',
                    'flexibility',
                    'component_quality',
                ],
            },
        },
    },
    'individual': {
        'categoryName': 'Individual Value',
        'subcategories': {
            'career': {
                'subcategoryName': 'Career',
                'elements': [
                    'network_expansion',
                    'marketability',
                    'reputational_assurance',
                ],
            },
            'personal': {
                'subcategoryName': 'Personal',
                'elements': [
                    'design_aesthetics_b2b',
                    'growth_development',
                    'reduced_anxiety_b2b',
                    'fun_perks',
                ],
            },
        },
    },
    'inspirational': {
        'categoryName': 'Inspirational Value',
        'subcategories': {
            'purpose': {
                'subcategoryName': 'Purpose',
                'elements': ['vision', 'hope_b2b', 'social_responsibility'],
            },
        },
    },
}


def _average(scores: list[float]) -> float:
    if not scores:
        return 0.0
    return round(sum(scores) / len(scores), 3)


def get_category_diagnostic_guide(category_key: str) -> dict[str, Any] | None:
    """Drill-down metadata: weak tier → subcategory (if any) → defining elements."""
    taxonomy = B2B_CATEGORY_TAXONOMY.get(category_key)
    if not taxonomy:
        return None

    subcategories = taxonomy.get('subcategories')
    if subcategories is None:
        elements = taxonomy.get('elements') or []
        labels = [B2B_ELEMENT_DISPLAY_NAMES.get(slug, slug) for slug in elements]
        return {
            'categoryKey': category_key,
            'categoryName': taxonomy['categoryName'],
            'hasSubcategories': False,
            'singleSubcategoryTier': False,
            'weakCategoryAction': f'Evaluate each Table Stakes value: {", ".join(labels)}',
            'subcategories': [],
        }

    subcategory_guides = []
    for sub_key, sub_meta in subcategories.items():
        labels = [
            B2B_ELEMENT_DISPLAY_NAMES.get(slug, slug) for slug in sub_meta['elements']
        ]
        subcategory_guides.append(
            {
                'subcategoryKey': sub_key,
                'subcategoryName': sub_meta['subcategoryName'],
                'elements': sub_meta['elements'],
                'weakSubcategoryAction': f'Evaluate these values: {", ".join(labels)}',
            }
        )

    single = len(subcategories) == 1
    sole = next(iter(subcategories.values()))
    sole_labels = [
        B2B_ELEMENT_DISPLAY_NAMES.get(slug, slug) for slug in sole['elements']
    ]
    return {
        'categoryKey': category_key,
        'categoryName': taxonomy['categoryName'],
        'hasSubcategories': True,
        'singleSubcategoryTier': single,
        'weakCategoryAction': (
            f'Inspect {sole["subcategoryName"]} — its elements define the entire tier ({", ".join(sole_labels)})'
            if single
            else 'Find the weakest subcategory, then evaluate its defining elements'
        ),
        'subcategories': subcategory_guides,
    }


def _strength_label(score: float) -> str:
    if score >= 0.8:
        return 'Dominant'
    if score >= 0.6:
        return 'Strong'
    if score >= 0.4:
        return 'Moderate'
    return 'Weak/Absent'


def get_subcategory_key_for_element(category_key: str, element_slug: str) -> str | None:
    taxonomy = B2B_CATEGORY_TAXONOMY.get(category_key)
    subcategories = taxonomy.get('subcategories') if taxonomy else None
    if not subcategories:
        return None
    for sub_key, sub_meta in subcategories.items():
        if element_slug in sub_meta['elements']:
            return sub_key
    return None


def _enrich_element_detail(slug: str, detail: dict[str, Any]) -> dict[str, Any]:
    score = float(detail.get('score', 0))
    return {
        **detail,
        'displayName': B2B_ELEMENT_DISPLAY_NAMES.get(slug, slug.replace('_', ' ').title()),
        'strengthLabel': _strength_label(score),
    }


def _count_present(elements: dict[str, Any]) -> int:
    return len(
        [
            detail
            for detail in elements.values()
            if isinstance(detail, dict) and float(detail.get('score', 0)) >= 0.6
        ]
    )


def _count_weak(elements: dict[str, Any], weak_threshold: float) -> int:
    return len(
        [
            detail
            for detail in elements.values()
            if isinstance(detail, dict) and float(detail.get('score', 0)) < weak_threshold
        ]
    )


def enrich_b2b_categories_detailed(
    categories: dict[str, Any],
    weak_threshold: float = 0.4,
) -> dict[str, Any]:
    """Add strength labels, counts, ranks, and weakest-subcategory metadata."""
    base = enrich_b2b_categories(categories)
    enriched: dict[str, Any] = {}

    for category_key, category_raw in base.items():
        if not isinstance(category_raw, dict):
            enriched[category_key] = category_raw
            continue

        taxonomy = B2B_CATEGORY_TAXONOMY.get(category_key)
        category_score = float(category_raw.get('categoryScore', 0))
        category_entry: dict[str, Any] = {
            'categoryName': category_raw.get('categoryName', category_key),
            'categoryScore': category_score,
            'strengthLabel': _strength_label(category_score),
            'elementCount': category_raw.get('elementCount', 0),
        }

        subcategories = category_raw.get('subcategories')
        if isinstance(subcategories, dict) and taxonomy and taxonomy.get('subcategories'):
            sub_entries: list[dict[str, Any]] = []
            for sub_key, sub_meta in taxonomy['subcategories'].items():
                sub_raw = subcategories.get(sub_key, {})
                sub_elements_raw = sub_raw.get('elements') if isinstance(sub_raw, dict) else {}
                if not isinstance(sub_elements_raw, dict):
                    sub_elements_raw = {}

                detailed_elements: dict[str, Any] = {}
                for slug in sub_meta['elements']:
                    detail = sub_elements_raw.get(slug, {
                        'score': 0.0,
                        'evidence': 'Not evaluated',
                        'recommendation': 'No recommendation',
                    })
                    if isinstance(detail, dict):
                        detailed_elements[slug] = _enrich_element_detail(slug, detail)

                scores = [
                    float(detail.get('score', 0))
                    for detail in detailed_elements.values()
                    if isinstance(detail, dict)
                ]
                sub_score = _average(scores)
                sub_entries.append(
                    {
                        'subcategoryKey': sub_key,
                        'subcategoryName': sub_meta['subcategoryName'],
                        'subcategoryScore': sub_score,
                        'strengthLabel': _strength_label(sub_score),
                        'elementCount': len(sub_meta['elements']),
                        'presentCount': _count_present(detailed_elements),
                        'weakCount': _count_weak(detailed_elements, weak_threshold),
                        'elements': detailed_elements,
                    }
                )

            sub_entries.sort(key=lambda item: item['subcategoryScore'], reverse=True)
            ranked_subs: dict[str, Any] = {}
            for index, sub_entry in enumerate(sub_entries, start=1):
                ranked_subs[sub_entry['subcategoryKey']] = {
                    'subcategoryName': sub_entry['subcategoryName'],
                    'subcategoryScore': sub_entry['subcategoryScore'],
                    'strengthLabel': sub_entry['strengthLabel'],
                    'elementCount': sub_entry['elementCount'],
                    'presentCount': sub_entry['presentCount'],
                    'weakCount': sub_entry['weakCount'],
                    'rank': index,
                    'elements': sub_entry['elements'],
                }

            weakest = sub_entries[-1] if sub_entries else None
            category_entry['categoryScore'] = _average(
                [item['subcategoryScore'] for item in sub_entries]
            )
            category_entry['strengthLabel'] = _strength_label(category_entry['categoryScore'])
            if weakest:
                category_entry['weakestSubcategoryKey'] = weakest['subcategoryKey']
                category_entry['weakestSubcategoryName'] = weakest['subcategoryName']
                category_entry['weakestSubcategoryScore'] = weakest['subcategoryScore']
            category_entry['subcategories'] = ranked_subs
            enriched[category_key] = category_entry
            continue

        elements_raw = category_raw.get('elements') or {}
        if not isinstance(elements_raw, dict):
            elements_raw = {}

        slugs = taxonomy.get('elements') if taxonomy else list(elements_raw.keys())
        detailed_elements = {}
        for slug in slugs or []:
            detail = elements_raw.get(slug, {
                'score': 0.0,
                'evidence': 'Not evaluated',
                'recommendation': 'No recommendation',
            })
            if isinstance(detail, dict):
                detailed_elements[slug] = _enrich_element_detail(slug, detail)

        scores = [
            float(detail.get('score', 0))
            for detail in detailed_elements.values()
            if isinstance(detail, dict)
        ]
        category_entry['categoryScore'] = _average(scores)
        category_entry['strengthLabel'] = _strength_label(category_entry['categoryScore'])
        category_entry['elements'] = detailed_elements
        enriched[category_key] = category_entry

    return enriched


def resolve_b2b_drill_down_target(
    category_key: str,
    breakdown: dict[str, Any],
    weak_threshold: float = 0.4,
) -> dict[str, Any] | None:
    guide = get_category_diagnostic_guide(category_key)
    if not guide:
        return None

    if not guide['hasSubcategories']:
        elements = breakdown.get('elements') or {}
        if not isinstance(elements, dict):
            return None
        weak_elements = [
            slug
            for slug, detail in elements.items()
            if isinstance(detail, dict) and float(detail.get('score', 0)) < weak_threshold
        ]
        if not weak_elements:
            return None
        return {
            'categoryKey': category_key,
            'categoryName': guide['categoryName'],
            'elementSlugs': weak_elements,
            'elementDisplayNames': [
                B2B_ELEMENT_DISPLAY_NAMES.get(slug, slug.replace('_', ' ').title())
                for slug in weak_elements
            ],
            'reason': (
                f'Weak Table Stakes tier — target defining values below {weak_threshold}'
            ),
        }

    subcategories = breakdown.get('subcategories')
    if not isinstance(subcategories, dict) or not subcategories:
        return None

    weakest_sub = min(
        subcategories.items(),
        key=lambda item: float(item[1].get('subcategoryScore', 0))
        if isinstance(item[1], dict)
        else 0.0,
    )
    subcategory_key, subcategory_breakdown = weakest_sub
    if not isinstance(subcategory_breakdown, dict):
        return None

    subcategory_guide = next(
        (
            entry
            for entry in guide['subcategories']
            if entry['subcategoryKey'] == subcategory_key
        ),
        None,
    )

    sub_elements = subcategory_breakdown.get('elements') or {}
    if not isinstance(sub_elements, dict):
        sub_elements = {}

    weak_elements = sorted(
        [
            slug
            for slug, detail in sub_elements.items()
            if isinstance(detail, dict) and float(detail.get('score', 0)) < weak_threshold
        ],
        key=lambda slug: float(sub_elements[slug].get('score', 0))
        if isinstance(sub_elements.get(slug), dict)
        else 0.0,
    )
    element_slugs = weak_elements or (subcategory_guide or {}).get('elements', [])

    return {
        'categoryKey': category_key,
        'categoryName': guide['categoryName'],
        'subcategoryKey': subcategory_key,
        'subcategoryName': subcategory_breakdown.get('subcategoryName', subcategory_key),
        'elementSlugs': element_slugs,
        'elementDisplayNames': [
            B2B_ELEMENT_DISPLAY_NAMES.get(slug, slug.replace('_', ' ').title())
            for slug in element_slugs
        ],
        'reason': (
            f'Weak {guide["categoryName"]} — '
            f'{subcategory_breakdown.get("subcategoryName", subcategory_key)} defines the entire tier'
            if guide.get('singleSubcategoryTier')
            else (
                f'Weakest subcategory in {guide["categoryName"]} is '
                f'{subcategory_breakdown.get("subcategoryName", subcategory_key)}'
            )
        ),
    }


def build_b2b_pyramid_diagnostics(
    categories: dict[str, Any],
    weak_tier_threshold: float = 0.6,
    weak_element_threshold: float = 0.4,
) -> dict[str, Any]:
    category_ranking = sorted(
        [
            {
                'categoryKey': category_key,
                'categoryName': (
                    category_raw.get('categoryName', category_key)
                    if isinstance(category_raw, dict)
                    else category_key
                ),
                'categoryScore': float(category_raw.get('categoryScore', 0))
                if isinstance(category_raw, dict)
                else 0.0,
                'strengthLabel': _strength_label(
                    float(category_raw.get('categoryScore', 0))
                    if isinstance(category_raw, dict)
                    else 0.0
                ),
            }
            for category_key, category_raw in categories.items()
            if isinstance(category_raw, dict)
        ],
        key=lambda item: item['categoryScore'],
    )

    subcategory_ranking = sorted(
        [
            {
                'categoryKey': category_key,
                'categoryName': category_raw.get('categoryName', category_key),
                'subcategoryKey': sub_key,
                'subcategoryName': sub_raw.get('subcategoryName', sub_key),
                'subcategoryScore': float(sub_raw.get('subcategoryScore', 0)),
                'strengthLabel': _strength_label(float(sub_raw.get('subcategoryScore', 0))),
            }
            for category_key, category_raw in categories.items()
            if isinstance(category_raw, dict)
            for sub_key, sub_raw in (category_raw.get('subcategories') or {}).items()
            if isinstance(sub_raw, dict)
        ],
        key=lambda item: item['subcategoryScore'],
    )

    weakest_tier = category_ranking[0] if category_ranking else {
        'categoryKey': '',
        'categoryName': '',
        'categoryScore': 0.0,
        'strengthLabel': 'Weak/Absent',
    }

    tier_drill_downs = [
        target
        for tier in category_ranking
        if tier['categoryScore'] < weak_tier_threshold
        for target in [
            resolve_b2b_drill_down_target(
                tier['categoryKey'],
                categories[tier['categoryKey']],
                weak_element_threshold,
            )
        ]
        if target
    ]

    primary_drill_down = (
        resolve_b2b_drill_down_target(
            weakest_tier['categoryKey'],
            categories[weakest_tier['categoryKey']],
            weak_element_threshold,
        )
        if weakest_tier.get('categoryKey')
        else None
    )

    return {
        'weakestTier': weakest_tier,
        'primaryDrillDown': primary_drill_down,
        'tierDrillDowns': tier_drill_downs,
        'categoryRanking': category_ranking,
        'subcategoryRanking': subcategory_ranking,
    }


def enrich_b2b_element_references(references: list[dict[str, Any]]) -> list[dict[str, Any]]:
    enriched: list[dict[str, Any]] = []
    for reference in references:
        category_key = str(reference.get('category', ''))
        element_slug = str(reference.get('element', ''))
        enriched.append(
            {
                **reference,
                'subcategory': reference.get('subcategory')
                or get_subcategory_key_for_element(category_key, element_slug),
            }
        )
    return enriched


def enrich_b2b_analysis_payload(
    *,
    categories: dict[str, Any],
    top_strengths: list[dict[str, Any]] | None = None,
    critical_gaps: list[dict[str, Any]] | None = None,
    weak_tier_threshold: float = 0.6,
    weak_element_threshold: float = 0.4,
) -> dict[str, Any]:
    enriched_categories = enrich_b2b_categories_detailed(
        categories,
        weak_threshold=weak_element_threshold,
    )
    return {
        'categories': enriched_categories,
        'pyramidDiagnostics': build_b2b_pyramid_diagnostics(
            enriched_categories,
            weak_tier_threshold=weak_tier_threshold,
            weak_element_threshold=weak_element_threshold,
        ),
        'topStrengths': enrich_b2b_element_references(top_strengths or []),
        'criticalGaps': enrich_b2b_element_references(critical_gaps or []),
    }


def enrich_b2b_categories(categories: dict[str, Any]) -> dict[str, Any]:
    """Add subcategory scores to B2B category payloads. Table stakes stays flat."""
    enriched: dict[str, Any] = {}

    for category_key, category_raw in categories.items():
        if not isinstance(category_raw, dict):
            enriched[category_key] = category_raw
            continue

        elements = category_raw.get('elements') or {}
        if not isinstance(elements, dict):
            enriched[category_key] = category_raw
            continue

        taxonomy = B2B_CATEGORY_TAXONOMY.get(category_key)
        if not taxonomy:
            enriched[category_key] = category_raw
            continue

        subcategories = taxonomy.get('subcategories')
        if subcategories is None:
            scores = [
                float(detail.get('score', 0))
                for detail in elements.values()
                if isinstance(detail, dict)
            ]
            enriched[category_key] = {
                **category_raw,
                'categoryName': taxonomy['categoryName'],
                'categoryScore': _average(scores),
                'elementCount': len(elements),
                'elements': elements,
            }
            continue

        subcategory_breakdown: dict[str, Any] = {}
        subcategory_scores: list[float] = []

        for sub_key, sub_meta in subcategories.items():
            sub_elements = {
                slug: elements[slug]
                for slug in sub_meta['elements']
                if slug in elements
            }
            scores = [
                float(detail.get('score', 0))
                for detail in sub_elements.values()
                if isinstance(detail, dict)
            ]
            sub_score = _average(scores)
            subcategory_scores.append(sub_score)
            subcategory_breakdown[sub_key] = {
                'subcategoryName': sub_meta['subcategoryName'],
                'subcategoryScore': sub_score,
                'elementCount': len(sub_meta['elements']),
                'elements': sub_elements,
            }

        enriched[category_key] = {
            'categoryName': taxonomy['categoryName'],
            'categoryScore': _average(subcategory_scores),
            'elementCount': len(elements),
            'subcategories': subcategory_breakdown,
        }

    return enriched

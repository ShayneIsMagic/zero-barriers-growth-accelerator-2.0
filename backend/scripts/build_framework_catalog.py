"""Build framework_catalog.json from Next.js source-of-truth files."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from archived_synonym_parsers import (
    merge_keyword_lists,
    parse_b2b_archived_synonyms,
    parse_b2c_archived_synonyms,
    parse_brand_archived_synonyms,
    parse_clifton_archived_synonyms,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
CHUNK_FILE = REPO_ROOT / 'src/lib/framework/chunk-definitions.ts'
ELEMENT_FILE = REPO_ROOT / 'src/lib/elements/element-definitions.ts'
SUPP_FILE = REPO_ROOT / 'src/lib/elements/supplementary-element-hints.ts'
ARCHETYPE_FILE = (
    REPO_ROOT / 'src/lib/ai-engines/framework-knowledge/jambojon-archetypes-framework.json'
)
OUTPUT = Path(__file__).resolve().parents[1] / 'src/lib/demo_data/framework_catalog.json'

ARCHETYPE_SLUGS = {
    'The Sage': 'sage',
    'The Explorer': 'explorer',
    'The Hero': 'hero',
    'The Outlaw': 'outlaw',
    'The Magician': 'magician',
    'The Regular Guy/Girl': 'regular_guy_girl',
    'The Jester': 'jester',
    'The Caregiver': 'caregiver',
    'The Creator': 'creator',
    'The Innocent': 'innocent',
    'The Lover': 'lover',
    'The Ruler': 'ruler',
}

REVENUE_CHUNKS = [
    ('market_signals', 'Market Signals', ['market_demand', 'trending_keywords', 'seasonal_patterns']),
    ('competitive_position', 'Competitive Position', ['competitor_gaps', 'emerging_opportunities']),
    ('monetization', 'Monetization', ['price_sensitivity', 'conversion_potential', 'upsell_opportunities', 'cross_sell_potential']),
    ('growth_retention', 'Growth & Retention', ['customer_segments', 'retention_strategies', 'expansion_opportunities']),
    ('channel_content', 'Channel & Content', ['partnership_potential', 'content_gaps', 'seo_opportunities', 'social_media_trends']),
]


def _parse_chunk_configs(content: str) -> dict[str, dict]:
    configs: dict[str, dict] = {}
    for match in re.finditer(
        r"export const (\w+)_CHUNK_CONFIG: FrameworkChunkConfig = \{([^}]+chunks: \[)([\s\S]*?)\n  \],\n\};",
        content,
    ):
        const_name = match.group(1)
        chunks_block = match.group(3)
        framework_key_match = re.search(r"frameworkKey: '([^']+)'", match.group(2))
        framework_name_match = re.search(r"frameworkName: '([^']+)'", match.group(2))
        if not framework_key_match:
            continue
        framework_key = framework_key_match.group(1)
        framework_name = framework_name_match.group(1) if framework_name_match else framework_key
        chunks = []
        for chunk_match in re.finditer(
            r"categoryName: '([^']+)',\s*categoryKey: '([^']+)',\s*elements: \[([^\]]+)\]",
            chunks_block,
        ):
            elements = [
                item.strip().strip("'")
                for item in chunk_match.group(3).split(',')
                if item.strip()
            ]
            chunks.append(
                {
                    'categoryName': chunk_match.group(1),
                    'categoryKey': chunk_match.group(2),
                    'elements': elements,
                }
            )
        configs[framework_key] = {
            'frameworkName': framework_name,
            'frameworkKey': framework_key,
            'chunks': chunks,
        }
    return configs


def _parse_element_definitions(content: str, section_name: str) -> dict[str, dict]:
    section_match = re.search(
        rf"export const {section_name} = \{{([\s\S]*?)\n\}};",
        content,
    )
    if not section_match:
        return {}
    section = section_match.group(1)
    elements: dict[str, dict] = {}
    for block in re.finditer(
        r"name: '([^']+)',\s*keywords: \[([^\]]*)\],\s*description: '([^']*)'",
        section,
    ):
        slug = block.group(1)
        keywords = [
            kw.strip().strip("'")
            for kw in block.group(2).split(',')
            if kw.strip()
        ]
        elements[slug] = {
            'keywords': keywords,
            'description': block.group(3),
        }
    return elements


def _parse_supplementary_hints(content: str, const_name: str) -> dict[str, dict]:
    match = re.search(rf"export const {const_name}[^=]*=\s*\{{([\s\S]*?)\n\}};", content)
    if not match:
        return {}
    block = match.group(1)
    hints: dict[str, dict] = {}
    for entry in re.finditer(
        r"(?:'([^']+)'|([a-z_][a-z0-9_]*)):\s*\{\s*keywords: \[([^\]]*)\],\s*description: '([^']*)'",
        block,
    ):
        key = entry.group(1) or entry.group(2)
        keywords = [
            kw.strip().strip("'")
            for kw in entry.group(3).split(',')
            if kw.strip()
        ]
        hints[key] = {
            'keywords': keywords,
            'description': entry.group(4),
        }
    return hints


def _load_archetype_elements() -> dict[str, dict]:
    data = json.loads(ARCHETYPE_FILE.read_text(encoding='utf-8'))
    elements: dict[str, dict] = {}
    for archetype in data.get('structure', {}).get('archetypes', []):
        name = archetype.get('name', '')
        slug = ARCHETYPE_SLUGS.get(name)
        if not slug:
            continue
        elements[slug] = {
            'keywords': archetype.get('keyword_signals', [])[:20],
            'description': archetype.get('definition', ''),
            'displayName': name,
        }
    return elements


def build_catalog() -> dict:
    chunk_content = CHUNK_FILE.read_text(encoding='utf-8')
    element_content = ELEMENT_FILE.read_text(encoding='utf-8')
    supp_content = SUPP_FILE.read_text(encoding='utf-8')

    chunk_configs = _parse_chunk_configs(chunk_content)
    b2c_defs = _parse_element_definitions(element_content, 'B2C_ELEMENTS')
    b2b_defs = _parse_element_definitions(element_content, 'B2B_ELEMENTS')
    clifton_defs = _parse_element_definitions(element_content, 'CLIFTON_STRENGTHS_ELEMENTS')
    gc_hints = _parse_supplementary_hints(supp_content, 'GOLDEN_CIRCLE_DIMENSION_HINTS')
    revenue_hints = _parse_supplementary_hints(supp_content, 'REVENUE_TRENDS_ELEMENT_HINTS')
    archetype_defs = _load_archetype_elements()

    archived_synonyms = {
        'b2c-elements': parse_b2c_archived_synonyms(),
        'b2b-elements': parse_b2b_archived_synonyms(),
        'clifton': parse_clifton_archived_synonyms(),
        'brand-archetypes': parse_brand_archived_synonyms(),
    }

    keyword_lookup = {
        'b2c-elements': b2c_defs,
        'b2b-elements': b2b_defs,
        'clifton': clifton_defs,
        'golden-circle': gc_hints,
        'brand-archetypes': archetype_defs,
        'revenue-trends': revenue_hints,
    }

    frameworks = []
    for framework_key, config in chunk_configs.items():
        frameworks.append(
            _build_framework_entry(
                framework_key,
                config,
                keyword_lookup,
                archived_synonyms.get(framework_key, {}),
            )
        )

    revenue_chunks = []
    for category_key, category_name, slugs in REVENUE_CHUNKS:
        revenue_chunks.append(
            {
                'categoryName': category_name,
                'categoryKey': category_key,
                'elements': slugs,
            }
        )
    frameworks.append(
        _build_framework_entry(
            'revenue-trends',
            {
                'frameworkName': 'Revenue Trends',
                'frameworkKey': 'revenue-trends',
                'chunks': revenue_chunks,
            },
            keyword_lookup,
            archived_synonyms={},
            use_composite_keys=False,
        )
    )

    return {'version': '1.0.0', 'frameworks': frameworks}


def _build_framework_entry(
    framework_key: str,
    config: dict,
    keyword_lookup: dict[str, dict[str, dict]],
    archived_synonyms: dict[str, list[str]] | None = None,
    use_composite_keys: bool | None = None,
) -> dict:
    if use_composite_keys is None:
        use_composite_keys = framework_key == 'golden-circle'

    lookup = keyword_lookup.get(framework_key, {})
    archived_lookup = archived_synonyms or {}
    elements = []
    sort_order = 0
    for chunk in config['chunks']:
        for slug in chunk['elements']:
            element_key = f"{chunk['categoryKey']}:{slug}" if use_composite_keys else slug
            meta = lookup.get(element_key, lookup.get(slug, {}))
            primary_keywords = meta.get('keywords', [])
            archived_keywords = archived_lookup.get(slug, [])
            definition = meta.get('description', '')
            elements.append(
                {
                    'categoryKey': chunk['categoryKey'],
                    'categoryName': chunk['categoryName'],
                    'elementSlug': slug,
                    'elementKey': element_key,
                    'displayName': meta.get('displayName', slug.replace('_', ' ').title()),
                    'definition': definition,
                    'keywords': merge_keyword_lists(primary_keywords, archived_keywords),
                    'sortOrder': sort_order,
                }
            )
            sort_order += 1

    return {
        'frameworkKey': framework_key,
        'frameworkName': config['frameworkName'],
        'expectedElementCount': len(elements),
        'elements': elements,
    }


def main() -> None:
    catalog = build_catalog()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(catalog, indent=2), encoding='utf-8')
    total = sum(item['expectedElementCount'] for item in catalog['frameworks'])
    archived_counts = {
        fw['frameworkKey']: sum(len(el.get('keywords', [])) for el in fw['elements'])
        for fw in catalog['frameworks']
    }
    print(f'Wrote {OUTPUT} ({len(catalog["frameworks"])} frameworks, {total} elements)')
    for key, count in archived_counts.items():
        print(f'  {key}: {count} merged keywords')


if __name__ == '__main__':
    main()

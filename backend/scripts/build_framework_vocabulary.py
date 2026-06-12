"""Build framework-vocabulary.json — unified definitions SSOT (Phase 1)."""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from archived_definition_parsers import (
    CLIFTON_DOMAIN_DEFINITIONS,
    parse_b2b_archived_definitions,
    parse_b2b_purpose_subcategory_definition,
    parse_b2c_archived_definitions,
    parse_brand_archived_definitions,
    parse_clifton_archived_definitions,
    parse_golden_circle_category_definitions,
)
from build_framework_catalog import (
    ARCHETYPE_SLUGS,
    REVENUE_CHUNKS,
    _load_archetype_elements,
    _parse_chunk_configs,
    _parse_element_definitions,
    _parse_supplementary_hints,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
CHUNK_FILE = REPO_ROOT / 'src/lib/framework/chunk-definitions.ts'
ELEMENT_FILE = REPO_ROOT / 'src/lib/elements/element-definitions.ts'
SUPP_FILE = REPO_ROOT / 'src/lib/elements/supplementary-element-hints.ts'
B2B_TAXONOMY_FILE = REPO_ROOT / 'src/lib/framework/b2b-taxonomy.ts'
ARCHETYPE_FILE = (
    REPO_ROOT / 'src/lib/ai-engines/framework-knowledge/jambojon-archetypes-framework.json'
)
OUTPUT = REPO_ROOT / 'src/lib/framework/framework-vocabulary.json'


def _parse_category_descriptions(content: str, section_name: str) -> dict[str, str]:
    section_match = re.search(
        rf"export const {section_name} = \{{([\s\S]*?)\n\}};",
        content,
    )
    if not section_match:
        return {}
    section = section_match.group(1)
    categories: dict[str, str] = {}
    for match in re.finditer(
        r"(\w+): \{\s*name: '([^']+)',\s*description:\s*(?:'([^']*)'|\n\s*'([^']*)')",
        section,
    ):
        categories[match.group(1)] = (match.group(3) or match.group(4) or '').strip()
    return categories


def _parse_display_names(content: str, const_name: str) -> dict[str, str]:
    match = re.search(
        rf'export const {const_name}(?:[^=]*)=\s*\{{([\s\S]*?)\n\}};',
        content,
    )
    if not match:
        return {}
    block = match.group(1)
    return {
        slug_match.group(1): slug_match.group(2)
        for slug_match in re.finditer(r"(\w+): '([^']+)'", block)
    }


def _parse_b2b_taxonomy(content: str) -> list[dict]:
    taxonomy_match = re.search(
        r'export const B2B_CATEGORY_TAXONOMY[^=]*=\s*\[([\s\S]*?)\n\];',
        content,
    )
    if not taxonomy_match:
        return []

    block = taxonomy_match.group(1)
    categories: list[dict] = []

    for cat_match in re.finditer(
        r"\{\s*categoryKey: '([^']+)',\s*categoryName: '([^']+)',\s*"
        r"subcategories: null,\s*elements: \[([\s\S]*?)\],\s*\}",
        block,
    ):
        elements = [
            item.strip().strip("'")
            for item in cat_match.group(3).split(',')
            if item.strip()
        ]
        categories.append(
            {
                'categoryKey': cat_match.group(1),
                'categoryName': cat_match.group(2),
                'subcategories': None,
                'elements': elements,
            }
        )

    for cat_match in re.finditer(
        r"\{\s*categoryKey: '([^']+)',\s*categoryName: '([^']+)',\s*"
        r"subcategories: \[([\s\S]*?)\n    \],\s*\}",
        block,
    ):
        subcategories_block = cat_match.group(3)
        subcategories: list[dict] = []
        for sub_match in re.finditer(
            r"subcategoryKey: '([^']+)',\s*subcategoryName: '([^']+)',\s*"
            r"elements: \[([\s\S]*?)\]",
            subcategories_block,
        ):
            sub_elements = [
                item.strip().strip("'")
                for item in sub_match.group(3).split(',')
                if item.strip()
            ]
            subcategories.append(
                {
                    'subcategoryKey': sub_match.group(1),
                    'subcategoryName': sub_match.group(2),
                    'elements': sub_elements,
                }
            )
        categories.append(
            {
                'categoryKey': cat_match.group(1),
                'categoryName': cat_match.group(2),
                'subcategories': subcategories,
                'elements': None,
            }
        )

    return categories


def _pick_definition(
    slug: str,
    archived: dict[str, str],
    typescript: dict[str, str],
    fallback: dict[str, str] | None = None,
) -> tuple[str, str]:
    fallback = fallback or {}
    if slug in archived and archived[slug].strip():
        return archived[slug].strip(), 'archived'
    if slug in typescript and typescript[slug].strip():
        return typescript[slug].strip(), 'element-definitions.ts'
    if slug in fallback and fallback[slug].strip():
        return fallback[slug].strip(), 'supplementary-element-hints.ts'
    return '', 'missing'


def _join_labels(labels: list[str]) -> str:
    if not labels:
        return ''
    if len(labels) == 1:
        return labels[0]
    if len(labels) == 2:
        return f'{labels[0]} and {labels[1]}'
    return f"{', '.join(labels[:-1])}, and {labels[-1]}"


def _compose_subcategory_definition(
    subcategory_name: str,
    element_slugs: list[str],
    display_names: dict[str, str],
    element_definitions: dict[str, str],
) -> str:
    labels = [display_names.get(slug, slug.replace('_', ' ').title()) for slug in element_slugs]
    joined = _join_labels(labels)
    if len(element_slugs) == 1:
        slug = element_slugs[0]
        element_def = element_definitions.get(slug, '')
        if element_def:
            return f'{subcategory_name} is defined by {joined}: {element_def}'
        return f'{subcategory_name} is defined by {joined}.'
    return (
        f'{subcategory_name} groups {joined} — '
        f'a Bain subcategory whose score represents those {len(element_slugs)} value elements.'
    )


def _compose_category_definition(
    category_name: str,
    element_slugs: list[str],
    display_names: dict[str, str],
    category_description: str,
) -> str:
    if category_description:
        labels = [display_names.get(slug, slug) for slug in element_slugs]
        if labels:
            return (
                f'{category_description} '
                f'Values in this tier: {_join_labels(labels)}.'
            )
        return category_description
    labels = [display_names.get(slug, slug) for slug in element_slugs]
    return f'{category_name} is defined by {_join_labels(labels)}.'


def _element_entry(
    *,
    framework_key: str,
    element_slug: str,
    element_key: str,
    display_name: str,
    definition: str,
    definition_source: str,
    category_key: str,
    category_name: str,
    subcategory_key: str | None = None,
    subcategory_name: str | None = None,
    sort_order: int,
) -> dict:
    return {
        'frameworkKey': framework_key,
        'elementSlug': element_slug,
        'elementKey': element_key,
        'displayName': display_name,
        'level': 'element',
        'definition': definition,
        'definitionSource': definition_source,
        'categoryKey': category_key,
        'categoryName': category_name,
        'subcategoryKey': subcategory_key,
        'subcategoryName': subcategory_name,
        'sortOrder': sort_order,
    }


def _category_entry(
    *,
    framework_key: str,
    category_key: str,
    category_name: str,
    definition: str,
    definition_source: str,
    element_slugs: list[str],
    subcategories: list[dict] | None = None,
) -> dict:
    entry: dict = {
        'frameworkKey': framework_key,
        'categoryKey': category_key,
        'categoryName': category_name,
        'level': 'category',
        'definition': definition,
        'definitionSource': definition_source,
        'elementSlugs': element_slugs,
    }
    if subcategories is not None:
        entry['subcategories'] = subcategories
    return entry


def build_vocabulary() -> dict:
    chunk_content = CHUNK_FILE.read_text(encoding='utf-8')
    element_content = ELEMENT_FILE.read_text(encoding='utf-8')
    supp_content = SUPP_FILE.read_text(encoding='utf-8')
    b2b_taxonomy_content = B2B_TAXONOMY_FILE.read_text(encoding='utf-8')

    chunk_configs = _parse_chunk_configs(chunk_content)
    b2c_ts_defs = {
        slug: meta['description']
        for slug, meta in _parse_element_definitions(element_content, 'B2C_ELEMENTS').items()
    }
    b2b_ts_defs = {
        slug: meta['description']
        for slug, meta in _parse_element_definitions(element_content, 'B2B_ELEMENTS').items()
    }
    clifton_ts_defs = {
        slug: meta['description']
        for slug, meta in _parse_element_definitions(
            element_content, 'CLIFTON_STRENGTHS_ELEMENTS'
        ).items()
    }
    b2c_category_defs = _parse_category_descriptions(element_content, 'B2C_ELEMENTS')
    b2b_category_defs = _parse_category_descriptions(element_content, 'B2B_ELEMENTS')
    clifton_category_defs = _parse_category_descriptions(
        element_content, 'CLIFTON_STRENGTHS_ELEMENTS'
    )
    b2b_display_names = _parse_display_names(b2b_taxonomy_content, 'B2B_ELEMENT_DISPLAY_NAMES')
    b2c_display_names = _parse_display_names(
        (REPO_ROOT / 'src/lib/framework/b2c-taxonomy.ts').read_text(encoding='utf-8'),
        'B2C_ELEMENT_DISPLAY_NAMES',
    )
    b2b_taxonomy = _parse_b2b_taxonomy(b2b_taxonomy_content)

    gc_hints = _parse_supplementary_hints(supp_content, 'GOLDEN_CIRCLE_DIMENSION_HINTS')
    revenue_hints = _parse_supplementary_hints(supp_content, 'REVENUE_TRENDS_ELEMENT_HINTS')
    archetype_json_defs = _load_archetype_elements()

    archived_b2c = parse_b2c_archived_definitions()
    archived_b2b = parse_b2b_archived_definitions()
    archived_clifton = parse_clifton_archived_definitions()
    archived_brand = parse_brand_archived_definitions()
    archived_gc_categories = parse_golden_circle_category_definitions()
    purpose_subcategory_def = parse_b2b_purpose_subcategory_definition()

    frameworks: list[dict] = []

    # --- B2C ---
    b2c_config = chunk_configs['b2c-elements']
    b2c_categories: list[dict] = []
    b2c_elements: list[dict] = []
    sort_order = 0
    for chunk in b2c_config['chunks']:
        category_key = chunk['categoryKey']
        category_name = chunk['categoryName']
        element_slugs = chunk['elements']
        category_description = b2c_category_defs.get(category_key, '')
        category_definition = _compose_category_definition(
            category_name,
            element_slugs,
            b2c_display_names,
            category_description,
        )
        b2c_categories.append(
            _category_entry(
                framework_key='b2c-elements',
                category_key=category_key,
                category_name=category_name,
                definition=category_definition,
                definition_source='element-definitions.ts' if category_description else 'generated:value-first',
                element_slugs=element_slugs,
            )
        )
        for slug in element_slugs:
            definition, source = _pick_definition(slug, archived_b2c, b2c_ts_defs)
            b2c_elements.append(
                _element_entry(
                    framework_key='b2c-elements',
                    element_slug=slug,
                    element_key=slug,
                    display_name=b2c_display_names.get(slug, slug.replace('_', ' ').title()),
                    definition=definition,
                    definition_source=source,
                    category_key=category_key,
                    category_name=category_name,
                    sort_order=sort_order,
                )
            )
            sort_order += 1

    frameworks.append(
        {
            'frameworkKey': 'b2c-elements',
            'frameworkName': b2c_config['frameworkName'],
            'expectedElementCount': len(b2c_elements),
            'categories': b2c_categories,
            'elements': b2c_elements,
        }
    )

    # --- B2B ---
    b2b_config = chunk_configs['b2b-elements']
    b2b_categories: list[dict] = []
    b2b_elements: list[dict] = []
    sort_order = 0

    for taxonomy_category in b2b_taxonomy:
        category_key = taxonomy_category['categoryKey']
        category_name = taxonomy_category['categoryName']
        category_description = b2b_category_defs.get(category_key, '')
        all_category_slugs = (
            taxonomy_category['elements']
            if taxonomy_category['subcategories'] is None
            else [
                slug
                for sub in taxonomy_category['subcategories']
                for slug in sub['elements']
            ]
        )
        subcategory_entries: list[dict] = []
        if taxonomy_category['subcategories']:
            for sub in taxonomy_category['subcategories']:
                sub_key = sub['subcategoryKey']
                sub_name = sub['subcategoryName']
                sub_slugs = sub['elements']
                merged_element_defs = {**archived_b2b, **b2b_ts_defs}
                if sub_key == 'purpose' and purpose_subcategory_def:
                    sub_definition = purpose_subcategory_def
                    sub_source = 'archived:purpose-subcategory'
                else:
                    sub_definition = _compose_subcategory_definition(
                        sub_name,
                        sub_slugs,
                        b2b_display_names,
                        merged_element_defs,
                    )
                    sub_source = 'generated:value-first'
                subcategory_entries.append(
                    {
                        'subcategoryKey': sub_key,
                        'subcategoryName': sub_name,
                        'level': 'subcategory',
                        'definition': sub_definition,
                        'definitionSource': sub_source,
                        'elementSlugs': sub_slugs,
                    }
                )
                for slug in sub_slugs:
                    definition, source = _pick_definition(slug, archived_b2b, b2b_ts_defs)
                    b2b_elements.append(
                        _element_entry(
                            framework_key='b2b-elements',
                            element_slug=slug,
                            element_key=slug,
                            display_name=b2b_display_names.get(
                                slug, slug.replace('_', ' ').title()
                            ),
                            definition=definition,
                            definition_source=source,
                            category_key=category_key,
                            category_name=category_name,
                            subcategory_key=sub_key,
                            subcategory_name=sub_name,
                            sort_order=sort_order,
                        )
                    )
                    sort_order += 1
        else:
            for slug in taxonomy_category['elements'] or []:
                definition, source = _pick_definition(slug, archived_b2b, b2b_ts_defs)
                b2b_elements.append(
                    _element_entry(
                        framework_key='b2b-elements',
                        element_slug=slug,
                        element_key=slug,
                        display_name=b2b_display_names.get(
                            slug, slug.replace('_', ' ').title()
                        ),
                        definition=definition,
                        definition_source=source,
                        category_key=category_key,
                        category_name=category_name,
                        sort_order=sort_order,
                    )
                )
                sort_order += 1

        category_definition = _compose_category_definition(
            category_name,
            all_category_slugs,
            b2b_display_names,
            category_description,
        )
        b2b_categories.append(
            _category_entry(
                framework_key='b2b-elements',
                category_key=category_key,
                category_name=category_name,
                definition=category_definition,
                definition_source='element-definitions.ts' if category_description else 'generated:value-first',
                element_slugs=all_category_slugs,
                subcategories=subcategory_entries or None,
            )
        )

    frameworks.append(
        {
            'frameworkKey': 'b2b-elements',
            'frameworkName': b2b_config['frameworkName'],
            'expectedElementCount': len(b2b_elements),
            'categories': b2b_categories,
            'elements': b2b_elements,
        }
    )

    # --- Clifton ---
    clifton_config = chunk_configs['clifton']
    clifton_categories: list[dict] = []
    clifton_elements: list[dict] = []
    sort_order = 0
    for chunk in clifton_config['chunks']:
        category_key = chunk['categoryKey']
        category_name = chunk['categoryName']
        element_slugs = chunk['elements']
        domain_def = CLIFTON_DOMAIN_DEFINITIONS.get(category_key, '')
        ts_category_def = clifton_category_defs.get(category_key, '')
        category_definition = domain_def or ts_category_def
        if domain_def and element_slugs:
            labels = _join_labels(
                [slug.replace('_', ' ').title() for slug in element_slugs]
            )
            category_definition = f'{domain_def} Themes: {labels}.'
        category_source = 'archived' if domain_def else 'element-definitions.ts'
        clifton_categories.append(
            _category_entry(
                framework_key='clifton',
                category_key=category_key,
                category_name=category_name,
                definition=category_definition,
                definition_source=category_source,
                element_slugs=element_slugs,
            )
        )
        for slug in element_slugs:
            definition, source = _pick_definition(slug, archived_clifton, clifton_ts_defs)
            clifton_elements.append(
                _element_entry(
                    framework_key='clifton',
                    element_slug=slug,
                    element_key=slug,
                    display_name=slug.replace('_', ' ').title(),
                    definition=definition,
                    definition_source=source,
                    category_key=category_key,
                    category_name=category_name,
                    sort_order=sort_order,
                )
            )
            sort_order += 1

    frameworks.append(
        {
            'frameworkKey': 'clifton',
            'frameworkName': clifton_config['frameworkName'],
            'expectedElementCount': len(clifton_elements),
            'categories': clifton_categories,
            'elements': clifton_elements,
        }
    )

    # --- Golden Circle ---
    gc_config = chunk_configs['golden-circle']
    gc_categories: list[dict] = []
    gc_elements: list[dict] = []
    sort_order = 0
    gc_ts_by_key = {key: meta['description'] for key, meta in gc_hints.items()}
    for chunk in gc_config['chunks']:
        category_key = chunk['categoryKey']
        category_name = chunk['categoryName']
        element_slugs = chunk['elements']
        category_definition = archived_gc_categories.get(category_key, '')
        category_source = 'archived' if category_definition else 'missing'
        if not category_definition:
            category_definition = (
                f'{category_name} — scored across six dimensions on the website.'
            )
            category_source = 'generated:value-first'
        gc_categories.append(
            _category_entry(
                framework_key='golden-circle',
                category_key=category_key,
                category_name=category_name,
                definition=category_definition,
                definition_source=category_source,
                element_slugs=[f'{category_key}:{slug}' for slug in element_slugs],
            )
        )
        for slug in element_slugs:
            composite_key = f'{category_key}:{slug}'
            hint_meta = gc_hints.get(composite_key, {})
            definition = hint_meta.get('description', '')
            source = 'supplementary-element-hints.ts' if definition else 'missing'
            gc_elements.append(
                _element_entry(
                    framework_key='golden-circle',
                    element_slug=slug,
                    element_key=composite_key,
                    display_name=slug.replace('_', ' ').title(),
                    definition=definition,
                    definition_source=source,
                    category_key=category_key,
                    category_name=category_name,
                    sort_order=sort_order,
                )
            )
            sort_order += 1

    frameworks.append(
        {
            'frameworkKey': 'golden-circle',
            'frameworkName': gc_config['frameworkName'],
            'expectedElementCount': len(gc_elements),
            'categories': gc_categories,
            'elements': gc_elements,
        }
    )

    # --- Brand archetypes ---
    brand_config = chunk_configs['brand-archetypes']
    brand_categories: list[dict] = []
    brand_elements: list[dict] = []
    sort_order = 0
    json_definitions = {
        slug: meta.get('description', '')
        for slug, meta in archetype_json_defs.items()
    }
    for chunk in brand_config['chunks']:
        category_key = chunk['categoryKey']
        category_name = chunk['categoryName']
        element_slugs = chunk['elements']
        display_labels = [
            next(
                (name for name, s in ARCHETYPE_SLUGS.items() if s == slug),
                slug.replace('_', ' ').title(),
            )
            for slug in element_slugs
        ]
        category_definition = (
            f'{category_name} groups {_join_labels(display_labels)} — '
            f'brands in this motivational cluster share related narrative identity patterns.'
        )
        brand_categories.append(
            _category_entry(
                framework_key='brand-archetypes',
                category_key=category_key,
                category_name=category_name,
                definition=category_definition,
                definition_source='generated:value-first',
                element_slugs=element_slugs,
            )
        )
        for slug in element_slugs:
            definition, source = _pick_definition(
                slug,
                archived_brand,
                json_definitions,
            )
            display_name = next(
                (name for name, s in ARCHETYPE_SLUGS.items() if s == slug),
                slug.replace('_', ' ').title(),
            )
            brand_elements.append(
                _element_entry(
                    framework_key='brand-archetypes',
                    element_slug=slug,
                    element_key=slug,
                    display_name=display_name,
                    definition=definition,
                    definition_source=source,
                    category_key=category_key,
                    category_name=category_name,
                    sort_order=sort_order,
                )
            )
            sort_order += 1

    frameworks.append(
        {
            'frameworkKey': 'brand-archetypes',
            'frameworkName': brand_config['frameworkName'],
            'expectedElementCount': len(brand_elements),
            'categories': brand_categories,
            'elements': brand_elements,
        }
    )

    # --- Revenue trends ---
    revenue_categories: list[dict] = []
    revenue_elements: list[dict] = []
    sort_order = 0
    revenue_ts_defs = {
        slug: meta['description']
        for slug, meta in revenue_hints.items()
    }
    for category_key, category_name, element_slugs in REVENUE_CHUNKS:
        category_definition = (
            f'{category_name} — revenue signals grouped for trend and monetization analysis.'
        )
        revenue_categories.append(
            _category_entry(
                framework_key='revenue-trends',
                category_key=category_key,
                category_name=category_name,
                definition=category_definition,
                definition_source='generated:value-first',
                element_slugs=element_slugs,
            )
        )
        for slug in element_slugs:
            definition, source = _pick_definition(
                slug,
                {},
                {},
                revenue_ts_defs,
            )
            revenue_elements.append(
                _element_entry(
                    framework_key='revenue-trends',
                    element_slug=slug,
                    element_key=slug,
                    display_name=slug.replace('_', ' ').title(),
                    definition=definition,
                    definition_source=source,
                    category_key=category_key,
                    category_name=category_name,
                    sort_order=sort_order,
                )
            )
            sort_order += 1

    frameworks.append(
        {
            'frameworkKey': 'revenue-trends',
            'frameworkName': 'Revenue Trends',
            'expectedElementCount': len(revenue_elements),
            'categories': revenue_categories,
            'elements': revenue_elements,
        }
    )

    stats = {
        'totalNodes': sum(
            len(fw['categories']) + len(fw['elements'])
            + sum(
                len(cat.get('subcategories') or [])
                for cat in fw['categories']
            )
            for fw in frameworks
        ),
        'missingDefinitions': sum(
            1
            for fw in frameworks
            for el in fw['elements']
            if el['definitionSource'] == 'missing' or not el['definition']
        ),
    }

    return {
        'version': '1.0.0',
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'phase': 'definitions-only',
        'stats': stats,
        'frameworks': frameworks,
    }


def main() -> None:
    vocabulary = build_vocabulary()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(vocabulary, indent=2), encoding='utf-8')
    print(f'Wrote {OUTPUT}')
    print(f"  frameworks: {len(vocabulary['frameworks'])}")
    print(f"  total nodes: {vocabulary['stats']['totalNodes']}")
    print(f"  missing element definitions: {vocabulary['stats']['missingDefinitions']}")
    for fw in vocabulary['frameworks']:
        missing = sum(1 for el in fw['elements'] if not el['definition'])
        subs = sum(len(cat.get('subcategories') or []) for cat in fw['categories'])
        print(
            f"  {fw['frameworkKey']}: {len(fw['elements'])} elements, "
            f"{len(fw['categories'])} categories, {subs} subcategories, "
            f'{missing} missing defs'
        )


if __name__ == '__main__':
    main()

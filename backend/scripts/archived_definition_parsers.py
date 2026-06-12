"""Parse authoritative definitions from archived assessment reference docs."""

from __future__ import annotations

import re
from pathlib import Path

from archived_synonym_parsers import (
    ARCHETYPE_NAME_ALIASES,
    ARCHETYPE_SLUGS,
    B2B_COMPLETE,
    B2C_COMPLETE,
    B2C_TITLE_TO_SLUG,
    B2B_TITLE_TO_SLUG,
    CLIFTON_COMPLETE,
    CLIFTON_TITLE_TO_SLUG,
    JAMBOJON_ENHANCED,
    _parse_numbered_sections,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
GOLDEN_CIRCLE_COMPLETE = REPO_ROOT / 'docs/archived/GOLDEN_CIRCLE_COMPLETE.md'

B2B_TITLE_TO_SLUG_EXTENDED: dict[str, str] = {
    **B2B_TITLE_TO_SLUG,
    'Social Responsibility': 'social_responsibility',
}

CLIFTON_DOMAIN_DEFINITIONS: dict[str, str] = {
    'strategic_thinking': (
        'People with Strategic Thinking strengths absorb and analyze information '
        'that informs better decisions.'
    ),
    'relationship_building': (
        'People with Relationship Building strengths build strong relationships '
        'that hold a team together and make it greater than the sum of its parts.'
    ),
    'influencing': (
        'People with Influencing strengths help a team reach a broader audience.'
    ),
    'executing': (
        'People with Executing strengths make things happen.'
    ),
}


def _extract_inline_definition(section_body: str) -> str:
    match = re.search(r'\*\*Definition\*\*:\s*(.+)', section_body)
    if match:
        line = match.group(1).strip()
        return line.split('\n', 1)[0].strip()
    theme_match = re.search(r'\*\*Theme Description\*\*:\s*(.+)', section_body)
    if theme_match:
        line = theme_match.group(1).strip()
        return line.split('\n', 1)[0].strip()
    return ''


def _extract_blockquote_definition(section_text: str) -> str:
    quote_match = re.search(
        r'### \*\*Official Definition\*\*[^:\n]*:\s*\n\n((?:> .+\n?)+)',
        section_text,
    )
    if not quote_match:
        return ''
    lines = quote_match.group(1).strip().split('\n')
    return ' '.join(line.lstrip('> ').strip() for line in lines if line.strip())


def _extract_plain_definition(section_text: str) -> str:
    match = re.search(
        r'### \*\*Definition\*\*:\s*\n\n(.+?)(?=\n\n###|\n\n##|\Z)',
        section_text,
        re.DOTALL,
    )
    if not match:
        return ''
    paragraph = match.group(1).strip().split('\n\n')[0].strip()
    return re.sub(r'\s+', ' ', paragraph)


def parse_b2c_archived_definitions(
    path: Path = B2C_COMPLETE,
) -> dict[str, str]:
    content = path.read_text(encoding='utf-8')
    result: dict[str, str] = {}
    for title, body in _parse_numbered_sections(content):
        slug = B2C_TITLE_TO_SLUG.get(title)
        if not slug:
            continue
        definition = _extract_inline_definition(body)
        if definition:
            result[slug] = definition
    return result


def parse_b2b_archived_definitions(
    path: Path = B2B_COMPLETE,
) -> dict[str, str]:
    content = path.read_text(encoding='utf-8')
    result: dict[str, str] = {}
    for title, body in _parse_numbered_sections(content):
        slug = B2B_TITLE_TO_SLUG_EXTENDED.get(title)
        if not slug:
            continue
        definition = _extract_inline_definition(body)
        if definition:
            result[slug] = definition
    return result


def parse_b2b_purpose_subcategory_definition(
    path: Path = B2B_COMPLETE,
) -> str:
    """Legacy archived doc lists Purpose as tier item #1 — use for subcategory prose."""
    content = path.read_text(encoding='utf-8')
    for title, body in _parse_numbered_sections(content):
        if title == 'Purpose':
            return _extract_inline_definition(body)
    return ''


def parse_clifton_archived_definitions(
    path: Path = CLIFTON_COMPLETE,
) -> dict[str, str]:
    content = path.read_text(encoding='utf-8')
    result: dict[str, str] = {}
    for title, body in _parse_numbered_sections(content):
        base_title = re.sub(r'\s*\([^)]+\)\s*$', '', title).strip()
        slug = CLIFTON_TITLE_TO_SLUG.get(base_title)
        if not slug:
            continue
        definition = _extract_inline_definition(body)
        if definition:
            result[slug] = definition
    return result


def parse_brand_archived_definitions(
    path: Path = JAMBOJON_ENHANCED,
) -> dict[str, str]:
    content = path.read_text(encoding='utf-8')
    result: dict[str, str] = {}
    for match in re.finditer(
        r'### ARCHETYPE \d+:\s*(The [^\n]+)\n([\s\S]*?)(?=### ARCHETYPE \d+:|## )',
        content,
    ):
        name = match.group(1).strip()
        body = match.group(2)
        slug = ARCHETYPE_NAME_ALIASES.get(name) or ARCHETYPE_SLUGS.get(name)
        if not slug:
            continue
        definition_match = re.search(
            r'\*\*Core Purpose:\*\*\s*(.+)',
            body,
        )
        if definition_match:
            result[slug] = definition_match.group(1).strip().split('\n', 1)[0].strip()
    return result


def parse_golden_circle_category_definitions(
    path: Path = GOLDEN_CIRCLE_COMPLETE,
) -> dict[str, str]:
    content = path.read_text(encoding='utf-8')
    sections = {
        'why': r'## 💡 \*\*1\. WHY - Core Purpose\*\*',
        'how': r'## 🛠️ \*\*2\. HOW - Unique Process/Differentiator\*\*',
        'what': r'## 📦 \*\*3\. WHAT - Products/Services\*\*',
        'who': r'## 👥 \*\*4\. WHO - Target Audience/Identity\*\*',
    }
    result: dict[str, str] = {}
    keys = list(sections.keys())
    for index, (key, header_pattern) in enumerate(sections.items()):
        start_match = re.search(header_pattern, content)
        if not start_match:
            continue
        start = start_match.start()
        next_header = sections[keys[index + 1]] if index + 1 < len(keys) else None
        end = len(content)
        if next_header:
            next_match = re.search(next_header, content[start + 1 :])
            if next_match:
                end = start + 1 + next_match.start()
        section_text = content[start:end]
        definition = _extract_blockquote_definition(section_text)
        if not definition:
            definition = _extract_plain_definition(section_text)
        if definition:
            result[key] = definition
    return result

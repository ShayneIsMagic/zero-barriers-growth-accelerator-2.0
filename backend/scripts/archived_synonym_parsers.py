"""Parse deep synonym catalogs from archived assessment reference docs."""

from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

B2C_COMPLETE = REPO_ROOT / 'docs/archived/B2C_ELEMENTS_OF_VALUE_COMPLETE.md'
B2B_COMPLETE = REPO_ROOT / 'docs/archived/B2B_ELEMENTS_OF_VALUE_COMPLETE.md'
CLIFTON_COMPLETE = REPO_ROOT / 'docs/archived/CLIFTONSTRENGTHS_COMPLETE.md'
JAMBOJON_ENHANCED = REPO_ROOT / 'docs/JAMBOJON_ARCHETYPES_ENHANCED.md'

ARCHETYPE_NAME_ALIASES = {
    'The Regular Guy/Girl (Everyman)': 'regular_guy_girl',
}

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

B2C_TITLE_TO_SLUG: dict[str, str] = {
    'Self-Transcendence': 'self_transcendence',
    'Provides Hope': 'provides_hope',
    'Self-Actualization': 'self_actualization',
    'Motivation': 'motivation',
    'Heirloom': 'heirloom',
    'Affiliation and Belonging': 'affiliation',
    'Reduces Anxiety': 'reduces_anxiety',
    'Rewards Me': 'rewards_me',
    'Nostalgia': 'nostalgia',
    'Design / Aesthetics': 'design_aesthetics',
    'Badge Value': 'badge_value',
    'Wellness': 'wellness',
    'Therapeutic Value': 'therapeutic',
    'Fun / Entertainment': 'fun_entertainment',
    'Attractiveness': 'attractiveness',
    'Provides Access': 'provides_access',
    'Saves Time': 'saves_time',
    'Simplifies': 'simplifies',
    'Makes Money': 'makes_money',
    'Reduces Risk': 'reduces_risk',
    'Organizes': 'organizes',
    'Integrates': 'integrates',
    'Connects': 'connects',
    'Reduces Effort': 'reduces_effort',
    'Avoids Hassles': 'avoids_hassles',
    'Reduces Cost': 'reduces_cost',
    'Quality': 'quality',
    'Variety': 'variety',
    'Sensory Appeal': 'sensory_appeal',
    'Informs': 'informs',
}

B2B_TITLE_TO_SLUG: dict[str, str] = {
    'Vision': 'vision',
    'Hope': 'hope_b2b',
    'Network Expansion': 'network_expansion',
    'Marketability': 'marketability',
    'Reputational Assurance': 'reputational_assurance',
    'Design & Aesthetics': 'design_aesthetics_b2b',
    'Growth & Development': 'growth_development',
    'Reduced Anxiety': 'reduced_anxiety_b2b',
    'Fun & Perks': 'fun_perks',
    'Time Savings': 'time_savings',
    'Reduced Effort': 'reduced_effort',
    'Decreased Hassles': 'decreased_hassles',
    'Information': 'information',
    'Transparency': 'transparency',
    'Organization': 'organization',
    'Simplification': 'simplification',
    'Connection': 'connection',
    'Integration': 'integration',
    'Availability': 'availability',
    'Variety': 'variety',
    'Configurability': 'configurability',
    'Responsiveness': 'responsiveness',
    'Expertise': 'expertise',
    'Commitment': 'commitment',
    'Stability': 'stability',
    'Cultural Fit': 'cultural_fit',
    'Risk Reduction': 'risk_reduction',
    'Reach': 'reach',
    'Flexibility': 'flexibility',
    'Component Quality': 'component_quality',
    'Improved Top Line': 'improved_top_line',
    'Cost Reduction': 'cost_reduction',
    'Product Quality': 'product_quality',
    'Scalability': 'scalability',
    'Innovation': 'innovation',
    'Meeting Specifications': 'meeting_specifications',
    'Acceptable Price': 'acceptable_price',
    'Regulatory Compliance': 'regulatory_compliance',
    'Ethical Standards': 'ethical_standards',
    'Access': 'access',
}

CLIFTON_TITLE_TO_SLUG: dict[str, str] = {
    'Analytical': 'analytical',
    'Context': 'context',
    'Futuristic': 'futuristic',
    'Ideation': 'ideation',
    'Input': 'input',
    'Intellection': 'intellection',
    'Learner': 'learner',
    'Strategic': 'strategic',
    'Adaptability': 'adaptability',
    'Connectedness': 'connectedness',
    'Developer': 'developer',
    'Empathy': 'empathy',
    'Harmony': 'harmony',
    'Includer': 'includer',
    'Individualization': 'individualization',
    'Positivity': 'positivity',
    'Relator': 'relator',
    'Activator': 'activator',
    'Command': 'command',
    'Communication': 'communication',
    'Competition': 'competition',
    'Maximizer': 'maximizer',
    'Self-Assurance': 'self_assurance',
    'Significance': 'significance',
    'Woo': 'woo',
    'Achiever': 'achiever',
    'Arranger': 'arranger',
    'Belief': 'belief',
    'Consistency': 'consistency',
    'Deliberative': 'deliberative',
    'Discipline': 'discipline',
    'Focus': 'focus',
    'Responsibility': 'responsibility',
    'Restorative': 'restorative',
}


def _split_synonym_line(line: str) -> list[str]:
    return [part.strip() for part in line.split(',') if part.strip()]


def _parse_numbered_sections(content: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, str]] = []
    matches = list(
        re.finditer(
            r'^### \*\*\d+\.\s*([^*]+)\*\*(?:\s*\([^)]+\))?\s*$',
            content,
            re.MULTILINE,
        )
    )
    for index, match in enumerate(matches):
        title = match.group(1).strip()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(content)
        sections.append((title, content[start:end]))
    return sections


def _extract_synonyms_block(section_body: str) -> list[str]:
    match = re.search(r'\*\*Synonyms\*\*:\s*(.+)', section_body)
    if not match:
        return []
    line = match.group(1).strip()
    line = line.split('\n', 1)[0].strip()
    return _split_synonym_line(line)


def parse_b2c_archived_synonyms(path: Path = B2C_COMPLETE) -> dict[str, list[str]]:
    content = path.read_text(encoding='utf-8')
    result: dict[str, list[str]] = {}
    for title, body in _parse_numbered_sections(content):
        slug = B2C_TITLE_TO_SLUG.get(title)
        if not slug:
            continue
        synonyms = _extract_synonyms_block(body)
        if synonyms:
            result[slug] = synonyms
    return result


def parse_b2b_archived_synonyms(path: Path = B2B_COMPLETE) -> dict[str, list[str]]:
    content = path.read_text(encoding='utf-8')
    result: dict[str, list[str]] = {}
    for title, body in _parse_numbered_sections(content):
        slug = B2B_TITLE_TO_SLUG.get(title)
        if not slug:
            continue
        synonyms = _extract_synonyms_block(body)
        if synonyms:
            result[slug] = synonyms
    if 'access' not in result and 'availability' in result:
        result['access'] = list(result['availability'])
    return result


def parse_clifton_archived_synonyms(path: Path = CLIFTON_COMPLETE) -> dict[str, list[str]]:
    content = path.read_text(encoding='utf-8')
    result: dict[str, list[str]] = {}
    for title, body in _parse_numbered_sections(content):
        base_title = re.sub(r'\s*\([^)]+\)\s*$', '', title).strip()
        slug = CLIFTON_TITLE_TO_SLUG.get(base_title)
        if not slug:
            continue
        synonyms = _extract_synonyms_block(body)
        if synonyms:
            result[slug] = synonyms
    return result


def parse_brand_archived_synonyms(path: Path = JAMBOJON_ENHANCED) -> dict[str, list[str]]:
    content = path.read_text(encoding='utf-8')
    result: dict[str, list[str]] = {}
    for match in re.finditer(
        r'### ARCHETYPE \d+:\s*(The [^\n]+)\n([\s\S]*?)(?=### ARCHETYPE \d+:|## )',
        content,
    ):
        name = match.group(1).strip()
        body = match.group(2)
        slug = ARCHETYPE_NAME_ALIASES.get(name) or ARCHETYPE_SLUGS.get(name)
        if not slug:
            continue
        block = re.search(
            r'\*\*Comprehensive Synonym List:\*\*\s*([\s\S]*?)\*\*What to Look For:\*\*',
            body,
        )
        if not block:
            continue
        synonyms: list[str] = []
        for line in block.group(1).splitlines():
            category_match = re.match(r'-\s*\*\*[^:]+:\s*(.+)', line.strip())
            if not category_match:
                continue
            synonyms.extend(_split_synonym_line(category_match.group(1)))
        if synonyms:
            result[slug] = synonyms
    return result


def merge_keyword_lists(*sources: list[str]) -> list[str]:
    merged: list[str] = []
    seen: set[str] = set()
    for source in sources:
        for keyword in source:
            cleaned = keyword.strip()
            if not cleaned:
                continue
            key = cleaned.lower()
            if key in seen:
                continue
            seen.add(key)
            merged.append(cleaned)
    return merged

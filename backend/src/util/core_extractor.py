import re
from decimal import Decimal


PURPOSE_PATTERNS = [
    re.compile(r'\b(our mission|our purpose|we believe|why we exist)\b', re.I),
    re.compile(r'\b(vision|values|manifesto|cause)\b', re.I),
]

AUDIENCE_PATTERNS = [
    re.compile(r'\b(for (teams|businesses|companies|people|founders|leaders))\b', re.I),
    re.compile(r'\b(target audience|ideal customer|who we serve)\b', re.I),
]

DIFFERENTIATOR_PATTERNS = [
    re.compile(r'\b(unique|only we|unlike|different from|stand out)\b', re.I),
    re.compile(r'\b(proprietary|exclusive|first to|industry-leading)\b', re.I),
]


def _extract_sentences(text: str, patterns: list[re.Pattern[str]], limit: int = 3) -> list[str]:
    sentences = re.split(r'[\n\r]+|(?<=[.!?])\s+', text)
    hits: list[str] = []
    for sentence in sentences:
        stripped = sentence.strip()
        if not stripped or len(stripped) < 20:
            continue
        if any(pattern.search(stripped) for pattern in patterns):
            hits.append(stripped)
        if len(hits) >= limit:
            break
    return hits


def extract_core_signals(sections: list[dict]) -> list[dict]:
    """Uncover core brand messaging from arranged corpus sections."""
    signals: list[dict] = []
    combined_text = '\n'.join(section['text_content'] for section in sections)

    purpose_hits = _extract_sentences(combined_text, PURPOSE_PATTERNS, 3)
    for index, text in enumerate(purpose_hits, start=1):
        signals.append(
            {
                'signal_type': 'purpose_statement',
                'signal_text': text,
                'confidence': float(Decimal('0.85') - Decimal('0.05') * (index - 1)),
                'source_section_key': 'purpose',
                'rank_order': index,
            }
        )

    audience_hits = _extract_sentences(combined_text, AUDIENCE_PATTERNS, 2)
    for index, text in enumerate(audience_hits, start=1):
        signals.append(
            {
                'signal_type': 'target_audience',
                'signal_text': text,
                'confidence': float(Decimal('0.75') - Decimal('0.05') * (index - 1)),
                'source_section_key': 'body',
                'rank_order': index,
            }
        )

    diff_hits = _extract_sentences(combined_text, DIFFERENTIATOR_PATTERNS, 2)
    for index, text in enumerate(diff_hits, start=1):
        signals.append(
            {
                'signal_type': 'differentiator',
                'signal_text': text,
                'confidence': float(Decimal('0.70') - Decimal('0.05') * (index - 1)),
                'source_section_key': 'hero',
                'rank_order': index,
            }
        )

    hero_sections = [section for section in sections if section['section_key'] == 'hero']
    if hero_sections and hero_sections[0]['text_content'].strip():
        signals.insert(
            0,
            {
                'signal_type': 'value_theme',
                'signal_text': hero_sections[0]['text_content'].split('\n')[0][:300],
                'confidence': 0.80,
                'source_section_key': 'hero',
                'rank_order': 0,
            },
        )

    return signals

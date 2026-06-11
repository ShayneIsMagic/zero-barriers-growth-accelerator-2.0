import re
from dataclasses import dataclass


@dataclass
class MatchHit:
    matched_text: str
    context_text: str
    section_key: str
    page_url: str | None
    char_offset: int
    pattern_id: str | None
    synonym_term_id: str | None
    match_weight: float


def _find_phrase_matches(
    text: str,
    phrase: str,
    section_key: str,
    page_url: str | None,
    pattern_id: str | None,
    weight: float,
    is_negative: bool,
) -> list[MatchHit]:
    if not phrase or not text:
        return []

    hits: list[MatchHit] = []
    pattern = re.compile(re.escape(phrase), re.I)
    for match in pattern.finditer(text):
        start = max(0, match.start() - 60)
        end = min(len(text), match.end() + 60)
        hits.append(
            MatchHit(
                matched_text=match.group(0),
                context_text=text[start:end],
                section_key=section_key,
                page_url=page_url,
                char_offset=match.start(),
                pattern_id=pattern_id,
                synonym_term_id=None,
                match_weight=-weight if is_negative else weight,
            )
        )
    return hits


def match_patterns_in_sections(
    sections: list[dict],
    patterns: list,
    synonym_terms: list | None = None,
) -> dict[str, list[MatchHit]]:
    """Match assessment patterns and synonym terms against corpus sections."""
    element_hits: dict[str, list[MatchHit]] = {}
    synonym_terms = synonym_terms or []

    for pattern in patterns:
        element_key = pattern.element_key
        element_hits.setdefault(element_key, [])

        for section in sections:
            section_key = section['section_key']
            if pattern.context_section and pattern.context_section != section_key:
                continue

            text = section['text_content']
            page_url = section.get('page_url')

            element_hits[element_key].extend(
                _find_phrase_matches(
                    text,
                    pattern.pattern_text,
                    section_key,
                    page_url,
                    str(pattern.id),
                    float(pattern.pattern_weight),
                    pattern.is_negative,
                )
            )

    for term_row in synonym_terms:
        element_key = term_row.element_key
        if not element_key:
            continue
        element_hits.setdefault(element_key, [])

        for section in sections:
            element_hits[element_key].extend(
                _find_phrase_matches(
                    section['text_content'],
                    term_row.term,
                    section['section_key'],
                    section.get('page_url'),
                    None,
                    float(term_row.match_weight),
                    term_row.is_negative,
                )
            )

    return element_hits

import re
from typing import TypedDict


class EvidenceStreams(TypedDict):
    ctas: list[str]
    headlines: list[str]
    testimonials: list[str]
    promises: list[str]
    purpose_language: list[str]
    functional_claims: list[str]
    image_alt_signals: list[str]
    navigation_labels: list[str]
    extracted_keywords: list[str]


def _unique_non_empty(values: list[str], limit: int) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        normalized = re.sub(r'\s+', ' ', value).strip()
        if not normalized:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(normalized)
        if len(result) >= limit:
            break
    return result


def _to_sentences(text: str) -> list[str]:
    parts = re.split(r'[\n\r]+|(?<=[.!?])\s+', text)
    return [line.strip() for line in parts if line.strip()]


def _pick_matching_sentences(
    sentences: list[str],
    patterns: list[re.Pattern[str]],
    limit: int,
) -> list[str]:
    matched = [
        line
        for line in sentences
        if any(pattern.search(line) for pattern in patterns)
    ]
    return _unique_non_empty(matched, limit)


def build_evidence_streams(raw_evidence: dict) -> EvidenceStreams:
    """Mirror Puppeteer evidence protocol from Next.js collection payload."""
    text = str(raw_evidence.get('cleanText') or '')
    sentences = _to_sentences(text)

    headings = raw_evidence.get('headings') or {}
    raw_headlines = [
        *(headings.get('h1') or []),
        *(headings.get('h2') or []),
        *(headings.get('h3') or []),
    ]

    content = raw_evidence.get('content') or {}
    link_texts = [
        str(item.get('text') or '')
        for item in (content.get('links') or [])
        if item.get('text')
    ]
    button_texts = [
        text_value
        for item in (content.get('buttons') or [])
        for text_value in [item.get('text'), item.get('ariaLabel')]
        if text_value
    ]

    seo = raw_evidence.get('seo') or {}
    image_alts = [
        str(item.get('alt') or '')
        for item in (content.get('images') or [])
        if item.get('alt')
    ]
    image_alts.extend(
        str(alt) for alt in (seo.get('imageAltTexts') or []) if alt
    )

    cta_from_text = _pick_matching_sentences(
        sentences,
        [
            re.compile(
                r'\b(get|start|join|book|claim|schedule|try|download|contact|learn|discover|explore|apply|buy|subscribe)\b',
                re.I,
            ),
            re.compile(r'\b(click here|see how|learn more|get started|start now)\b', re.I),
        ],
        40,
    )

    return {
        'ctas': _unique_non_empty([*button_texts, *link_texts, *cta_from_text], 50),
        'headlines': _unique_non_empty([str(h) for h in raw_headlines], 40),
        'testimonials': _pick_matching_sentences(
            sentences,
            [
                re.compile(
                    r'\b(testimonial|review|customer|client|case study|success story)\b',
                    re.I,
                ),
                re.compile(r'["\'].{10,}["\']'),
                re.compile(r'\b(they helped|we achieved|we saw|our team|our business)\b', re.I),
            ],
            25,
        ),
        'promises': _pick_matching_sentences(
            sentences,
            [
                re.compile(
                    r'\b(guarantee|promise|we will|you will|risk[- ]free|money[- ]back|no[- ]risk|secure|safe)\b',
                    re.I,
                ),
            ],
            25,
        ),
        'purpose_language': _pick_matching_sentences(
            sentences,
            [
                re.compile(
                    r'\b(our mission|our purpose|we believe|why we|vision|values|manifesto)\b',
                    re.I,
                ),
            ],
            20,
        ),
        'functional_claims': _pick_matching_sentences(
            sentences,
            [
                re.compile(
                    r'\b(save(s)? time|faster|simple|easy|reduce(s|d)? cost|reduce(s|d)? risk|integrate(s|d)?|connect(s|ed)?|quality|scalable|innovation)\b',
                    re.I,
                ),
            ],
            35,
        ),
        'image_alt_signals': _unique_non_empty(image_alts, 30),
        'navigation_labels': _unique_non_empty(link_texts, 40),
        'extracted_keywords': _unique_non_empty(
            [str(kw) for kw in (raw_evidence.get('extractedKeywords') or []) if kw],
            50,
        ),
    }

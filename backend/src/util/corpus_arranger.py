from src.util.evidence_extractor import EvidenceStreams


DEFAULT_SECTION_MAP: dict[str, list[tuple[str, str, int]]] = {
    'b2c-elements': [
        ('hero', 'headlines', 1),
        ('functional_claims', 'functional_claims', 2),
        ('cta', 'ctas', 3),
        ('testimonial', 'testimonials', 4),
        ('body', 'clean_text', 5),
    ],
    'b2b-elements': [
        ('hero', 'headlines', 1),
        ('functional_claims', 'functional_claims', 2),
        ('proof', 'testimonials', 3),
        ('promise', 'promises', 4),
        ('cta', 'ctas', 5),
        ('body', 'clean_text', 6),
    ],
    'golden-circle': [
        ('purpose', 'purpose_language', 1),
        ('hero', 'headlines', 2),
        ('promise', 'promises', 3),
        ('functional_claims', 'functional_claims', 4),
        ('testimonial', 'testimonials', 5),
        ('body', 'clean_text', 6),
    ],
    'clifton': [
        ('purpose', 'purpose_language', 1),
        ('hero', 'headlines', 2),
        ('testimonial', 'testimonials', 3),
        ('navigation', 'navigation_labels', 4),
        ('body', 'clean_text', 5),
    ],
    'brand-archetypes': [
        ('hero', 'headlines', 1),
        ('purpose', 'purpose_language', 2),
        ('imagery', 'image_alt_signals', 3),
        ('cta', 'ctas', 4),
        ('body', 'clean_text', 5),
    ],
    'revenue-trends': [
        ('hero', 'headlines', 1),
        ('functional_claims', 'functional_claims', 2),
        ('market', 'extracted_keywords', 3),
        ('monetization', 'ctas', 4),
        ('proof', 'testimonials', 5),
        ('growth', 'promises', 6),
        ('body', 'clean_text', 7),
    ],
}


def _token_count(text: str) -> int:
    return len(text.split())


def arrange_corpus_sections(
    framework_key: str,
    raw_evidence: dict,
    streams: EvidenceStreams,
    url: str,
) -> list[dict]:
    """Build assessment-specific corpus sections from collected content."""
    section_map = DEFAULT_SECTION_MAP.get(framework_key, DEFAULT_SECTION_MAP['b2c-elements'])
    clean_text = str(raw_evidence.get('cleanText') or '')
    headings = raw_evidence.get('headings')

    sections: list[dict] = []

    for section_key, stream_key, priority in section_map:
        if stream_key == 'clean_text':
            text_content = clean_text
            evidence_stream = None
        else:
            items = streams.get(stream_key, [])  # type: ignore[arg-type]
            text_content = '\n'.join(items) if items else ''
            evidence_stream = stream_key

        if not text_content.strip() and section_key != 'body':
            continue

        sections.append(
            {
                'section_key': section_key,
                'evidence_stream': evidence_stream,
                'page_url': url,
                'page_type': 'homepage' if section_key == 'hero' else None,
                'priority': priority,
                'text_content': text_content or clean_text[:5000],
                'token_count': _token_count(text_content or clean_text[:5000]),
                'headings': headings if section_key == 'hero' else None,
            }
        )

    if not any(section['section_key'] == 'body' for section in sections) and clean_text:
        sections.append(
            {
                'section_key': 'body',
                'evidence_stream': None,
                'page_url': url,
                'page_type': None,
                'priority': 10,
                'text_content': clean_text,
                'token_count': _token_count(clean_text),
                'headings': None,
            }
        )

    return sections

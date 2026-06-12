#!/usr/bin/env python3
"""Enrich framework vocabulary with synonyms from archived docs and optional Datamuse API.

Usage (from /backend):
  pipenv run python scripts/enrich_framework_synonyms.py --source manual-only
  pipenv run python scripts/enrich_framework_synonyms.py --source datamuse --limit 5

Outputs:
  src/lib/framework/framework-synonym-enrichment.json  (review before catalog merge)
  src/lib/framework/framework-synonym-enrichment-review.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_ROOT.parent
VOCAB_PATH = REPO_ROOT / 'src/lib/framework/framework-vocabulary.json'
OUT_JSON = REPO_ROOT / 'src/lib/framework/framework-synonym-enrichment.json'
OUT_CSV = REPO_ROOT / 'src/lib/framework/framework-synonym-enrichment-review.csv'

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from scripts.archived_synonym_parsers import (  # noqa: E402
    parse_b2b_archived_synonyms,
    parse_b2c_archived_synonyms,
    parse_brand_archived_synonyms,
    parse_clifton_archived_synonyms,
)


def load_vocabulary() -> dict[str, Any]:
    return json.loads(VOCAB_PATH.read_text(encoding='utf-8'))


def fetch_datamuse_synonyms(term: str, max_results: int = 8) -> list[str]:
    query = urllib.parse.urlencode({'ml': term, 'max': str(max_results)})
    url = f'https://api.datamuse.com/words?{query}'
    with urllib.request.urlopen(url, timeout=10) as response:
        payload = json.loads(response.read().decode('utf-8'))
    return [item['word'] for item in payload if isinstance(item, dict) and 'word' in item]


def merge_synonyms(*sources: list[str] | None) -> list[str]:
    seen: set[str] = set()
    merged: list[str] = []
    for source in sources:
        if not source:
            continue
        for raw in source:
            normalized = raw.strip().lower()
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            merged.append(raw.strip())
    return merged


def build_archived_index() -> dict[tuple[str, str], list[str]]:
    by_framework: dict[str, dict[str, list[str]]] = {
        'b2c-elements': parse_b2c_archived_synonyms(),
        'b2b-elements': parse_b2b_archived_synonyms(),
        'clifton-strengths': parse_clifton_archived_synonyms(),
        'brand-archetypes': parse_brand_archived_synonyms(),
    }
    index: dict[tuple[str, str], list[str]] = {}
    for framework_key, elements in by_framework.items():
        for element_key, synonyms in elements.items():
            index[(framework_key, element_key)] = synonyms
    return index


def build_enrichment(source: str, datamuse_limit: int) -> dict[str, Any]:
    vocab = load_vocabulary()
    archived_index = build_archived_index()

    entries: list[dict[str, Any]] = []
    review_rows: list[dict[str, str]] = []

    for framework in vocab.get('frameworks', []):
        framework_key = framework['frameworkKey']
        for element in framework.get('elements', []):
            element_key = element['elementKey']
            display_name = element.get('displayName', element_key)
            manual = archived_index.get((framework_key, element_key), [])
            existing = element.get('synonyms') or []
            datamuse: list[str] = []

            if source == 'datamuse' and datamuse_limit > 0:
                try:
                    datamuse = fetch_datamuse_synonyms(display_name, datamuse_limit)
                    time.sleep(0.15)
                except Exception as exc:  # noqa: BLE001
                    datamuse = []
                    review_rows.append(
                        {
                            'framework_key': framework_key,
                            'element_key': element_key,
                            'display_name': display_name,
                            'status': f'datamuse_error:{exc}',
                            'synonyms': '',
                        }
                    )
                    continue

            combined = merge_synonyms(existing, manual, datamuse)
            entries.append(
                {
                    'frameworkKey': framework_key,
                    'elementKey': element_key,
                    'displayName': display_name,
                    'synonyms': combined,
                    'sources': {
                        'existing': len(existing),
                        'archived': len(manual),
                        'datamuse': len(datamuse),
                    },
                }
            )
            review_rows.append(
                {
                    'framework_key': framework_key,
                    'element_key': element_key,
                    'display_name': display_name,
                    'status': 'ok',
                    'synonyms': '; '.join(combined),
                }
            )

    return {
        'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'source': source,
        'elementCount': len(entries),
        'entries': entries,
        '_reviewRows': review_rows,
    }


def write_outputs(payload: dict[str, Any]) -> None:
    review_rows = payload.pop('_reviewRows', [])
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, indent=2), encoding='utf-8')

    with OUT_CSV.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=['framework_key', 'element_key', 'display_name', 'status', 'synonyms'],
        )
        writer.writeheader()
        writer.writerows(review_rows)

    print(f'Wrote {OUT_JSON} ({payload["elementCount"]} elements)')
    print(f'Wrote {OUT_CSV}')


def main() -> int:
    parser = argparse.ArgumentParser(description='Enrich framework synonyms for review')
    parser.add_argument(
        '--source',
        choices=('manual-only', 'datamuse'),
        default='manual-only',
        help='manual-only uses archived parsers; datamuse adds API suggestions',
    )
    parser.add_argument(
        '--limit',
        type=int,
        default=8,
        help='Max Datamuse synonyms per element (datamuse source only)',
    )
    args = parser.parse_args()

    payload = build_enrichment(args.source, args.limit)
    write_outputs(payload)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

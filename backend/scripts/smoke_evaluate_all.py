#!/usr/bin/env python3
"""Run deterministic evaluation for all six frameworks — no AI, no HTTP server.

Usage (from /backend):
  pipenv run python scripts/smoke_evaluate_all.py
"""

from __future__ import annotations

import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from create_app import create_app  # noqa: E402
from src.lib.demo_data.seed_catalog import seed_all  # noqa: E402
from src.util.evaluation_engine import run_evaluation  # noqa: E402

SAMPLE_PAYLOAD = {
    'url': 'https://example.com',
    'snapshotId': 'snap-smoke-all',
    'collectedAt': '2025-06-08T12:00:00.000Z',
    'collectorType': 'content-collect-api',
    'rawEvidence': {
        'title': 'Why we exist',
        'cleanText': (
            'We believe in inspiring change. Our mission is clear: we help teams '
            'discover their purpose and deliver proven results. Reduce cost and '
            'improve top line with scalable innovation. Growing market demand.'
        ),
        'wordCount': 30,
        'headings': {'h1': ['Start with why'], 'h2': [], 'h3': []},
        'extractedKeywords': ['demand', 'partnership'],
        'url': 'https://example.com',
        'seo': {},
    },
}

FRAMEWORKS = [
    'golden-circle',
    'b2c-elements',
    'b2b-elements',
    'clifton',
    'brand-archetypes',
    'revenue-trends',
]


def main() -> int:
    app = create_app()
    failures: list[str] = []

    with app.app_context():
        seed_all()

        for framework_key in FRAMEWORKS:
            result = run_evaluation(
                SAMPLE_PAYLOAD,
                framework_key,
                should_persist_collection=False,
            )
            verification = result.get('verification') or {}
            analyzed = verification.get('total_elements_analyzed', 0)
            expected = verification.get('total_elements_in_framework', 0)
            complete = verification.get('all_elements_accounted_for', False)
            score = result.get('overallScore', 0)
            method = result.get('analysisMethod', 'unknown')

            status = 'PASS' if complete else 'FAIL'
            print(
                f'{status} {framework_key}: score={score:.3f} '
                f'elements={analyzed}/{expected} method={method}'
            )

            if not complete:
                failures.append(
                    f'{framework_key}: expected {expected} elements, got {analyzed}'
                )

    if failures:
        print('\nSmoke test failed:')
        for message in failures:
            print(f'  - {message}')
        return 1

    print('\nAll six frameworks passed deterministic smoke test (no AI).')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

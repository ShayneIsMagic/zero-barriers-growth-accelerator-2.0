#!/usr/bin/env python3
"""HTTP QA: POST all six frameworks to /api/evaluate, then GET each runId."""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

BASE_URL = 'http://localhost:5001'
EXPECTED = {
    'b2c-elements': 30,
    'b2b-elements': 40,
    'golden-circle': 24,
    'clifton': 34,
    'brand-archetypes': 12,
    'revenue-trends': 16,
}

SAMPLE_EVIDENCE = {
    'title': 'QA sample',
    'cleanText': (
        'We believe in inspiring change. Reduce cost and improve top line with '
        'scalable innovation. Growing market demand and partnership opportunities. '
        'Strategic thinking, empathy, courage, vision, and social responsibility.'
    ),
    'wordCount': 30,
    'headings': {'h1': ['Start with why'], 'h2': [], 'h3': []},
    'extractedKeywords': ['demand', 'partnership'],
    'url': 'https://example.com',
    'seo': {},
}


def post_evaluate(framework_key: str, snapshot_suffix: str) -> dict:
    body = {
        'frameworkKey': framework_key,
        'persistCollection': True,
        'payload': {
            'url': 'https://example.com',
            'snapshotId': f'snap-qa-{snapshot_suffix}',
            'collectedAt': '2025-06-08T12:00:00.000Z',
            'collectorType': 'content-collect-api',
            'rawEvidence': SAMPLE_EVIDENCE,
        },
    }
    request = urllib.request.Request(
        f'{BASE_URL}/api/evaluate',
        data=json.dumps(body).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode('utf-8'))


def get_run(run_id: str) -> dict:
    request = urllib.request.Request(
        f'{BASE_URL}/api/evaluate/{run_id}',
        method='GET',
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode('utf-8'))


def main() -> int:
    failures: list[str] = []

    for framework_key, expected_count in EXPECTED.items():
        try:
            post_result = post_evaluate(framework_key, framework_key)
        except urllib.error.URLError as exc:
            failures.append(f'{framework_key}: POST failed — {exc}')
            print(f'FAIL {framework_key}: POST {exc}')
            continue

        if not post_result.get('success'):
            failures.append(f'{framework_key}: POST success=false')
            print(f'FAIL {framework_key}: POST success=false')
            continue

        verification = post_result.get('verification') or {}
        analyzed = verification.get('total_elements_analyzed', 0)
        expected = verification.get('total_elements_in_framework', 0)
        complete = verification.get('all_elements_accounted_for', False)
        run_id = post_result.get('runId')
        method = post_result.get('analysisMethod')

        post_ok = (
            analyzed == expected_count
            and expected == expected_count
            and complete
            and method == 'deterministic-flask'
        )
        print(
            f'{"PASS" if post_ok else "FAIL"} POST {framework_key}: '
            f'{analyzed}/{expected_count} runId={run_id}'
        )
        if not post_ok:
            failures.append(
                f'{framework_key}: POST elements {analyzed}/{expected_count} complete={complete}'
            )

        if framework_key == 'b2b-elements':
            if not post_result.get('pyramidDiagnostics'):
                failures.append(f'{framework_key}: missing pyramidDiagnostics on POST')
                print(f'FAIL {framework_key}: missing pyramidDiagnostics')

        if not run_id:
            failures.append(f'{framework_key}: missing runId')
            continue

        try:
            get_result = get_run(str(run_id))
        except urllib.error.URLError as exc:
            failures.append(f'{framework_key}: GET failed — {exc}')
            print(f'FAIL {framework_key}: GET {exc}')
            continue

        if not get_result.get('success') or get_result.get('status') != 'completed':
            failures.append(f'{framework_key}: GET not completed')
            print(f'FAIL {framework_key}: GET status={get_result.get("status")}')
            continue

        get_payload = get_result.get('result') or {}
        get_verification = get_payload.get('verification') or {}
        get_analyzed = get_verification.get('total_elements_analyzed', 0)
        get_ok = get_analyzed == expected_count
        print(
            f'{"PASS" if get_ok else "FAIL"} GET  {framework_key}: '
            f'{get_analyzed}/{expected_count}'
        )
        if not get_ok:
            failures.append(
                f'{framework_key}: GET elements {get_analyzed}/{expected_count}'
            )

    if failures:
        print('\nQA failures:')
        for message in failures:
            print(f'  - {message}')
        return 1

    print('\nAll six frameworks passed POST + GET runId HTTP QA.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

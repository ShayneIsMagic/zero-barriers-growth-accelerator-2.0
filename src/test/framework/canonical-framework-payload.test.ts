import { describe, expect, it } from 'vitest';
import {
  buildCanonicalFrameworkPayload,
  normalizeRawEvidence,
} from '@/types/canonical-framework-payload';

describe('normalizeRawEvidence', () => {
  it('unwraps nested rawEvidence from canonical pasted JSON', () => {
    const inner = {
      title: 'Why we exist',
      cleanText: 'We believe in inspiring change.',
      wordCount: 6,
    };

    expect(
      normalizeRawEvidence({
        url: 'https://example.com',
        snapshotId: 'snap-qa',
        rawEvidence: inner,
      })
    ).toEqual(inner);
  });

  it('promotes content.text to cleanText for page records', () => {
    expect(
      normalizeRawEvidence({
        title: 'About',
        content: { text: 'Enterprise solutions for growth.' },
      })
    ).toMatchObject({
      title: 'About',
      cleanText: 'Enterprise solutions for growth.',
    });
  });

  it('buildCanonicalFrameworkPayload normalizes nested evidence', () => {
    const payload = buildCanonicalFrameworkPayload({
      url: 'https://example.com',
      collectorType: 'content-collect-api',
      rawEvidence: {
        snapshotId: 'snap-qa',
        rawEvidence: {
          title: 'Example',
          cleanText: 'Sample copy for scoring.',
        },
      },
    });

    expect(payload.rawEvidence).toEqual({
      title: 'Example',
      cleanText: 'Sample copy for scoring.',
    });
  });
});

import { describe, expect, it } from 'vitest';
import { resolveCollectedContentPayload } from '@/lib/content-collection/resolve-collected-content';

describe('resolveCollectedContentPayload', () => {
  it('returns nested existing payloads from compare responses', () => {
    const existing = {
      title: 'Example',
      metaDescription: 'Desc',
      wordCount: 10,
      extractedKeywords: ['example'],
      headings: { h1: ['Hi'], h2: [], h3: [] },
      cleanText: 'Hello world example content',
      url: 'https://example.com',
      seo: {
        metaTitle: 'Example',
        metaDescription: 'Desc',
        extractedKeywords: ['example'],
        headings: { h1: ['Hi'], h2: [], h3: [] },
      },
    };

    expect(
      resolveCollectedContentPayload({ existing }, 'https://example.com')
    ).toEqual(existing);
  });

  it('transforms comprehensive compare payloads copied from Content Comparison', () => {
    const resolved = resolveCollectedContentPayload(
      {
        url: 'https://example.com',
        pages: [
          {
            title: 'Example Domain',
            metaDescription: 'Example description',
            content: { text: 'Example body text for testing collection reuse.' },
            headings: { h1: ['Example Domain'], h2: [], h3: [] },
            keywords: { allKeywords: ['example', 'domain'] },
          },
        ],
        content: { totalWords: 8 },
      },
      'https://example.com'
    );

    expect(resolved?.url).toBe('https://example.com');
    expect(resolved?.cleanText).toContain('Example body text');
    expect(resolved?.headings.h1).toContain('Example Domain');
  });
});

import { describe, expect, it } from 'vitest';
import { pickPrimaryPageUrl } from '@/lib/framework/page-to-existing-content';

describe('pickPrimaryPageUrl', () => {
  const pages = [
    { url: 'https://zerobarriers.io/' },
    { url: 'https://zerobarriers.io/services' },
    { url: 'https://zerobarriers.io/about' },
  ];

  it('prefers the entered URL when it matches a collected page', () => {
    expect(
      pickPrimaryPageUrl(pages, 'https://zerobarriers.io/services#human')
    ).toBe('https://zerobarriers.io/services');
  });

  it('falls back to homepage when preferred URL is missing', () => {
    expect(pickPrimaryPageUrl(pages, 'https://zerobarriers.io/contact')).toBe(
      'https://zerobarriers.io/'
    );
  });

  it('returns first page when no homepage exists', () => {
    const deepPages = [
      { url: 'https://example.com/blog/post-1' },
      { url: 'https://example.com/blog/post-2' },
    ];
    expect(pickPrimaryPageUrl(deepPages)).toBe(
      'https://example.com/blog/post-1'
    );
  });
});

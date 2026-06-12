import { describe, expect, it, vi } from 'vitest';
import { buildFrameworkPageRunParams } from '@/lib/framework/framework-page-run-params';

describe('framework-page-run-params', () => {
  it('returns null when url is empty', () => {
    expect(buildFrameworkPageRunParams({ url: '  ' })).toBeNull();
  });

  it('parses scraped JSON and skips collection', () => {
    const params = buildFrameworkPageRunParams({
      url: 'https://example.com',
      scrapedContent: '{"title":"Example"}',
    });
    expect(params?.skipCollection).toBe(true);
    expect(params?.existingContent).toEqual({ title: 'Example' });
  });

  it('reports invalid scraped JSON via setLocalError', () => {
    const setLocalError = vi.fn();
    expect(
      buildFrameworkPageRunParams({
        url: 'https://example.com',
        scrapedContent: '{bad',
        setLocalError,
      })
    ).toBeNull();
    expect(setLocalError).toHaveBeenCalledWith(
      'Invalid JSON in scraped content field'
    );
  });
});

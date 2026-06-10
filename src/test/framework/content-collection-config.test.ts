import { describe, expect, it } from 'vitest';
import {
  CONTENT_COLLECTION_DEFAULTS,
  resolveContentCollectionOptions,
} from '@/lib/server/content-collection/config';

describe('content collection config', () => {
  it('defaults to homepage-only collection', () => {
    expect(CONTENT_COLLECTION_DEFAULTS.maxPages).toBe(0);
    expect(CONTENT_COLLECTION_DEFAULTS.maxDepth).toBe(0);
  });

  it('keeps homepage-only when includeSubpages is false', () => {
    const resolved = resolveContentCollectionOptions({ includeSubpages: false });
    expect(resolved.includeSubpages).toBe(false);
    expect(resolved.maxPages).toBe(0);
  });
});

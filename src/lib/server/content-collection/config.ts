/**
 * Shared Puppeteer collection defaults — aligned with live content-comparison behavior.
 * Initial collect: homepage only (swift), full browser metadata, no Ollama.
 */

import type { ContentCollectionOptions } from '@/types/content-collection';

const parsedMaxPages = Number(process.env.CONTENT_COLLECTION_MAX_PAGES ?? '0');
const parsedMaxDepth = Number(process.env.CONTENT_COLLECTION_MAX_DEPTH ?? '0');
const parsedTimeout = Number(process.env.CONTENT_COLLECTION_TIMEOUT_MS ?? '15000');

export const CONTENT_COLLECTION_DEFAULTS = {
  /** Extra pages beyond homepage (0 = homepage only). */
  maxPages: Number.isFinite(parsedMaxPages) ? parsedMaxPages : 0,
  maxDepth: Number.isFinite(parsedMaxDepth) ? parsedMaxDepth : 0,
  timeoutMs: Number.isFinite(parsedTimeout) ? parsedTimeout : 15000,
} as const;

export function resolveContentCollectionOptions(
  overrides?: ContentCollectionOptions
): Required<Pick<ContentCollectionOptions, 'maxPages' | 'maxDepth'>> &
  ContentCollectionOptions {
  const includeSubpages = overrides?.includeSubpages ?? CONTENT_COLLECTION_DEFAULTS.maxPages > 0;

  return {
    ...overrides,
    maxPages: overrides?.maxPages ?? CONTENT_COLLECTION_DEFAULTS.maxPages,
    maxDepth: overrides?.maxDepth ?? CONTENT_COLLECTION_DEFAULTS.maxDepth,
    includeSubpages,
  };
}

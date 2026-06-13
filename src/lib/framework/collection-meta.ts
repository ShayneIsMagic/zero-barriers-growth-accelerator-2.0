import type { ContentCollectionMode } from '@/types/content-collection';

export interface CollectionDisplayMeta {
  pageCount: number | null;
  wordCount: number | null;
  title: string | null;
  source: 'cache' | 'fresh' | null;
  mode: ContentCollectionMode | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Derive display metadata from multi-page / compare LocalForage payloads.
 */
export function deriveCollectionDisplayMeta(
  rawData: unknown,
  isFromCache: boolean,
  mode: ContentCollectionMode | null,
  collectedWordCount?: number | null,
  collectedTitle?: string | null
): CollectionDisplayMeta {
  const source: CollectionDisplayMeta['source'] =
    rawData || collectedWordCount
      ? isFromCache
        ? 'cache'
        : 'fresh'
      : null;

  if (!isRecord(rawData)) {
    return {
      pageCount: null,
      wordCount: collectedWordCount ?? null,
      title: collectedTitle ?? null,
      source,
      mode,
    };
  }

  let pageCount: number | null = null;
  if (Array.isArray(rawData.pages)) {
    pageCount = rawData.pages.length;
  } else if (typeof rawData.totalPagesScraped === 'number') {
    pageCount = rawData.totalPagesScraped;
  }

  let wordCount = collectedWordCount ?? null;
  if (wordCount === null && isRecord(rawData.siteSummary)) {
    const total = rawData.siteSummary.totalWordCount;
    if (typeof total === 'number') {
      wordCount = total;
    }
  }

  let title = collectedTitle ?? null;
  if (!title && Array.isArray(rawData.pages) && rawData.pages.length > 0) {
    const first = rawData.pages[0];
    if (isRecord(first) && typeof first.title === 'string') {
      title = first.title;
    }
  }

  return {
    pageCount,
    wordCount,
    title,
    source,
    mode,
  };
}

/**
 * Unified content collection hook.
 * Uses the same protocol as content-comparison and multi-page-scraping.
 */

import { useState } from 'react';
import { apiCall } from '@/lib/api-call';
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';
import type {
  CollectedContentPayload,
  ContentCollectionMode,
  ContentCollectionOptions,
} from '@/types/content-collection';

interface UseContentCollectionReturn {
  collectedData: CollectedContentPayload | null;
  rawData: unknown | null;
  isCollecting: boolean;
  error: string | null;
  isFromCache: boolean;
  mode: ContentCollectionMode | null;
  collectContent: (
    url: string,
    options?: ContentCollectionOptions
  ) => Promise<CollectedContentPayload | null>;
  clearCollected: (url?: string) => Promise<void>;
}

function isValidUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function useContentCollection(): UseContentCollectionReturn {
  const [collectedData, setCollectedData] =
    useState<CollectedContentPayload | null>(null);
  const [rawData, setRawData] = useState<unknown | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [mode, setMode] = useState<ContentCollectionMode | null>(null);

  const collectContent = async (
    url: string,
    options: ContentCollectionOptions = {}
  ): Promise<CollectedContentPayload | null> => {
    const trimmedUrl = url.trim();
    const collectionMode = options.mode ?? 'comprehensive';

    if (!trimmedUrl) {
      setError('Please enter a URL');
      return null;
    }

    if (!isValidUrl(trimmedUrl)) {
      setError(
        `Invalid URL: "${trimmedUrl}". URLs must start with http:// or https://`
      );
      return null;
    }

    setIsCollecting(true);
    setError(null);
    setIsFromCache(false);

    try {
      const cached = await UnifiedLocalForageStorage.getPuppeteerData(trimmedUrl);
      if (cached?.data) {
        const cachedExisting =
          (cached.data as { existing?: CollectedContentPayload }).existing ||
          (cached.data as CollectedContentPayload);
        setCollectedData(cachedExisting);
        setRawData(cached.data);
        setMode(collectionMode);
        setIsFromCache(true);
        return cachedExisting;
      }

      const endpoint =
        collectionMode === 'multi-page'
          ? '/api/scrape-multi-page'
          : '/api/content/collect';

      const body =
        collectionMode === 'multi-page'
          ? { url: trimmedUrl, options }
          : { url: trimmedUrl, mode: collectionMode, options };

      const { data: result } = await apiCall<{
        success: boolean;
        error?: string;
        existing?: CollectedContentPayload;
        comprehensive?: unknown;
        data?: unknown;
      }>(endpoint, {
        method: 'POST',
        body,
        showErrorToast: true,
      });

      if (!result?.success) {
        throw new Error(result?.error || 'Content collection failed');
      }

      const existing =
        result.existing ||
        (result.data as { existing?: CollectedContentPayload })?.existing;

      if (!existing) {
        throw new Error('Collection succeeded but no content payload returned');
      }

      const storagePayload = result.comprehensive ?? result.data ?? existing;
      await UnifiedLocalForageStorage.storePuppeteerData(
        trimmedUrl,
        storagePayload
      );

      setCollectedData(existing);
      setRawData(storagePayload);
      setMode(collectionMode);
      return existing;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Content collection failed';
      setError(message);
      return null;
    } finally {
      setIsCollecting(false);
    }
  };

  const clearCollected = async (url?: string): Promise<void> => {
    if (url) {
      const store = (await import('localforage')).default.createInstance({
        name: 'ZeroBarriers',
        storeName: 'puppeteer_data',
      });
      await store.removeItem(url);
    } else {
      await UnifiedLocalForageStorage.clearAll();
    }
    setCollectedData(null);
    setRawData(null);
    setIsFromCache(false);
    setMode(null);
  };

  return {
    collectedData,
    rawData,
    isCollecting,
    error,
    isFromCache,
    mode,
    collectContent,
    clearCollected,
  };
}

'use client';

import { useState } from 'react';
import { apiCall } from '@/lib/api-call';
import {
  CONTENT_COMPARE_ENDPOINT,
  CONTENT_MULTI_PAGE_ENDPOINT,
} from '@/lib/content-collection/endpoints';
import { resolveCollectedContentPayload } from '@/lib/content-collection/resolve-collected-content';
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
        const cachedExisting = resolveCollectedContentPayload(
          cached.data,
          trimmedUrl
        );
        if (cachedExisting) {
          setCollectedData(cachedExisting);
          setRawData(cached.data);
          setMode(collectionMode);
          setIsFromCache(true);
          return cachedExisting;
        }
      }

      if (collectionMode === 'multi-page') {
        const { data: result } = await apiCall<{
          success: boolean;
          error?: string;
          data?: unknown;
        }>(CONTENT_MULTI_PAGE_ENDPOINT, {
          method: 'POST',
          body: { url: trimmedUrl, options },
          showErrorToast: true,
        });

        if (!result?.success || !result.data) {
          throw new Error(result?.error || 'Multi-page collection failed');
        }

        const existing = resolveCollectedContentPayload(result.data, trimmedUrl);
        if (!existing) {
          throw new Error('Multi-page collection succeeded but content is unusable');
        }

        await UnifiedLocalForageStorage.storePuppeteerData(
          trimmedUrl,
          result.data
        );

        setCollectedData(existing);
        setRawData(result.data);
        setMode(collectionMode);
        return existing;
      }

      const { data: result } = await apiCall<{
        success: boolean;
        error?: string;
        existing?: CollectedContentPayload;
        comprehensive?: unknown;
      }>(CONTENT_COMPARE_ENDPOINT, {
        method: 'POST',
        body: {
          url: trimmedUrl,
          proposedContent: '',
        },
        showErrorToast: true,
      });

      if (!result?.success) {
        throw new Error(result?.error || 'Content collection failed');
      }

      const existing =
        result.existing ??
        resolveCollectedContentPayload(result.comprehensive, trimmedUrl);

      if (!existing) {
        throw new Error('Collection succeeded but no content payload returned');
      }

      const storagePayload = result.comprehensive ?? existing;
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

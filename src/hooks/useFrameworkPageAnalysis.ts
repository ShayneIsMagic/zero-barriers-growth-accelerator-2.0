'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChunkedAnalysis } from '@/hooks/useChunkedAnalysis';
import { useContentCollection } from '@/hooks/useContentCollection';
import {
  persistFrameworkRunToLocalForage,
  resolveReportStorageKey,
} from '@/lib/framework/save-framework-report';
import {
  FLASK_FRAMEWORK_KEYS,
  runFlaskFrameworkEvaluation,
} from '@/lib/services/flask-evaluation.service';
import type {
  CollectedContentPayload,
  ContentCollectionOptions,
} from '@/types/content-collection';

interface RunFrameworkAnalysisParams {
  url: string;
  proposedContent?: string;
  existingContent?: CollectedContentPayload | Record<string, unknown> | null;
  analysisType?: string;
  skipCollection?: boolean;
}

interface UseFrameworkPageAnalysisOptions {
  /** When true (default), save JSON + markdown variants to LocalForage after success. */
  persistToLocalForage?: boolean;
  reportStorageKey?: string;
  /** Prefer multi-page scraping (same path as /dashboard/multi-page-scraping). */
  preferMultiPageCollection?: boolean;
}

const DEFAULT_MULTI_PAGE_OPTIONS: ContentCollectionOptions = {
  mode: 'multi-page',
  maxPages: 10,
  maxDepth: 2,
  includeSubpages: true,
  includeBlog: true,
  includeProducts: true,
  includeAbout: true,
  includeContact: true,
  includeServices: true,
};

/**
 * Combines unified content collection with chunked per-category analysis.
 * Supports explicit Collect → Evaluate workflow with LocalForage cache reuse.
 */
export function useFrameworkPageAnalysis(
  endpoint: string,
  options: UseFrameworkPageAnalysisOptions = {}
) {
  const {
    persistToLocalForage = true,
    reportStorageKey,
    preferMultiPageCollection = true,
  } = options;
  const chunked = useChunkedAnalysis(endpoint);
  const collection = useContentCollection();
  const lastPersistedResultRef = useRef<string | null>(null);
  const wasAnalyzingRef = useRef(false);
  const lastRunUrlRef = useRef<string | null>(null);
  const lastPreloadedUrlRef = useRef<string | null>(null);
  const [flaskResult, setFlaskResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [isFlaskRunning, setIsFlaskRunning] = useState(false);
  const [flaskError, setFlaskError] = useState<string | null>(null);

  const collectionOptions = preferMultiPageCollection
    ? DEFAULT_MULTI_PAGE_OPTIONS
    : { mode: 'comprehensive' as const };

  const resolveExistingContent = useCallback(
    async (
      params: RunFrameworkAnalysisParams
    ): Promise<CollectedContentPayload | Record<string, unknown> | null> => {
      if (params.existingContent) {
        return params.existingContent;
      }

      if (params.skipCollection) {
        return collection.collectedData;
      }

      const trimmedUrl = params.url.trim();
      const collected = await collection.collectContent(
        trimmedUrl,
        collectionOptions
      );
      return collected;
    },
    [collection, collectionOptions]
  );

  const collectOnly = useCallback(
    async (
      url: string,
      collectOptions?: ContentCollectionOptions
    ): Promise<CollectedContentPayload | null> => {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        return null;
      }
      return collection.collectContent(trimmedUrl, {
        ...collectionOptions,
        ...collectOptions,
      });
    },
    [collection, collectionOptions]
  );

  const preloadCachedContent = useCallback(
    async (url: string): Promise<CollectedContentPayload | null> => {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        return null;
      }
      return collection.preloadFromCache(trimmedUrl);
    },
    [collection]
  );

  const runAnalysis = useCallback(
    async (params: RunFrameworkAnalysisParams): Promise<void> => {
      const trimmedUrl = params.url.trim();
      if (!trimmedUrl) {
        return;
      }

      lastRunUrlRef.current = trimmedUrl;

      const existingContent = await resolveExistingContent(params);
      if (!existingContent) {
        return;
      }

      await chunked.runAnalysis({
        url: trimmedUrl,
        proposedContent: params.proposedContent ?? '',
        existingContent,
        collectorType: 'content-collect-api',
        analysisType: params.analysisType ?? 'full',
        stream: true,
      });
    },
    [chunked, resolveExistingContent]
  );

  const runDeterministicAnalysis = useCallback(
    async (params: RunFrameworkAnalysisParams): Promise<void> => {
      const trimmedUrl = params.url.trim();
      const frameworkKey = FLASK_FRAMEWORK_KEYS[endpoint];
      if (!trimmedUrl || !frameworkKey) {
        return;
      }

      setFlaskError(null);
      setIsFlaskRunning(true);
      lastRunUrlRef.current = trimmedUrl;

      try {
        const existingContent = await resolveExistingContent(params);

        if (!existingContent) {
          throw new Error(
            'Collect content first (Step 1) or paste scraped JSON before running evaluation'
          );
        }

        const flaskResponse = await runFlaskFrameworkEvaluation({
          frameworkKey,
          pageUrl: trimmedUrl,
          existingContent:
            typeof existingContent === 'object' && existingContent !== null
              ? (existingContent as Record<string, unknown>)
              : {},
          proposedContent: params.proposedContent?.trim() || undefined,
        });

        setFlaskResult({
          success: true,
          url: trimmedUrl,
          analysis: flaskResponse,
          analysisMethod: 'flask-deterministic',
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Flask evaluation failed';
        setFlaskError(message);
        setFlaskResult(null);
      } finally {
        setIsFlaskRunning(false);
      }
    },
    [endpoint, resolveExistingContent]
  );

  useEffect(() => {
    const finishedRun = wasAnalyzingRef.current && !chunked.isAnalyzing;
    wasAnalyzingRef.current = chunked.isAnalyzing;

    if (!persistToLocalForage || !finishedRun || !chunked.result) {
      return;
    }

    const url =
      lastRunUrlRef.current ??
      (typeof chunked.result.url === 'string'
        ? chunked.result.url
        : typeof chunked.result.analysis?.url === 'string'
          ? chunked.result.analysis.url
          : null);

    if (!url) {
      return;
    }

    const storageKey = resolveReportStorageKey(endpoint, reportStorageKey);
    const persistKey = `${url}:${storageKey}:${chunked.result.analysis?.overallScore ?? 'na'}`;

    if (lastPersistedResultRef.current === persistKey) {
      return;
    }

    lastPersistedResultRef.current = persistKey;

    void persistFrameworkRunToLocalForage(url, storageKey, chunked.result).catch(
      () => {
        lastPersistedResultRef.current = null;
      }
    );
  }, [
    chunked.result,
    chunked.isAnalyzing,
    endpoint,
    persistToLocalForage,
    reportStorageKey,
  ]);

  useEffect(() => {
    if (!persistToLocalForage || !flaskResult || isFlaskRunning) {
      return;
    }

    const url =
      lastRunUrlRef.current ??
      (typeof flaskResult.url === 'string' ? flaskResult.url : null);

    if (!url) {
      return;
    }

    const storageKey = resolveReportStorageKey(endpoint, reportStorageKey);
    const analysis = flaskResult.analysis as Record<string, unknown> | undefined;
    const persistKey = `flask:${url}:${storageKey}:${analysis?.overallScore ?? 'na'}`;

    if (lastPersistedResultRef.current === persistKey) {
      return;
    }

    lastPersistedResultRef.current = persistKey;

    void persistFrameworkRunToLocalForage(url, storageKey, flaskResult).catch(
      () => {
        lastPersistedResultRef.current = null;
      }
    );
  }, [
    endpoint,
    flaskResult,
    isFlaskRunning,
    persistToLocalForage,
    reportStorageKey,
  ]);

  const activeResult = flaskResult ?? chunked.result;
  const analysisMethod =
    flaskResult !== null ? 'flask-deterministic' : 'ai-chunked';

  const isEvaluating =
    chunked.isAnalyzing || isFlaskRunning;

  return {
    isAnalyzing: isEvaluating || collection.isCollecting,
    isEvaluating,
    isCollecting: collection.isCollecting,
    isFlaskRunning,
    isFromCache: collection.isFromCache,
    collectedData: collection.collectedData,
    rawCollectionData: collection.rawData,
    collectionMode: collection.mode,
    percent: flaskResult ? 100 : chunked.percent,
    currentCategory: chunked.currentCategory,
    completedCategories: chunked.completedCategories,
    result: activeResult,
    analysisMethod,
    error: flaskError || chunked.error || collection.error,
    canonicalPayload: chunked.canonicalPayload,
    runAnalysis,
    runDeterministicAnalysis,
    collectOnly,
    preloadCachedContent,
    clearCollected: collection.clearCollected,
    clearFlaskResult: () => {
      setFlaskResult(null);
      setFlaskError(null);
    },
  };
}

/** Auto-load cached multi-page LocalForage data when the URL field changes. */
export function usePreloadCachedContentOnUrl(
  url: string,
  preloadCachedContent: (url: string) => Promise<CollectedContentPayload | null>
): void {
  const preloadRef = useRef(preloadCachedContent);
  preloadRef.current = preloadCachedContent;

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed || typeof window === 'undefined') {
      return;
    }

    const timer = window.setTimeout(() => {
      void preloadRef.current(trimmed);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [url]);
}

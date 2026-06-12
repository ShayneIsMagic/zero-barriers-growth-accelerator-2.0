'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChunkedAnalysis } from '@/hooks/useChunkedAnalysis';
import { useContentCollection } from '@/hooks/useContentCollection';
import {
  persistFrameworkRunToLocalForage,
  resolveReportStorageKey,
} from '@/lib/framework/save-framework-report';
import {
  evaluateWithFlask,
  FLASK_FRAMEWORK_KEYS,
} from '@/lib/services/flask-evaluation.service';
import type { CollectedContentPayload } from '@/types/content-collection';
import { buildCanonicalFrameworkPayload } from '@/types/canonical-framework-payload';

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
}

/**
 * Combines unified content collection with chunked per-category analysis.
 * Preserves progress UI, traceability, and thorough element-by-element review.
 */
export function useFrameworkPageAnalysis(
  endpoint: string,
  options: UseFrameworkPageAnalysisOptions = {}
) {
  const { persistToLocalForage = true, reportStorageKey } = options;
  const chunked = useChunkedAnalysis(endpoint);
  const collection = useContentCollection();
  const lastPersistedResultRef = useRef<string | null>(null);
  const wasAnalyzingRef = useRef(false);
  const lastRunUrlRef = useRef<string | null>(null);
  const [flaskResult, setFlaskResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [isFlaskRunning, setIsFlaskRunning] = useState(false);
  const [flaskError, setFlaskError] = useState<string | null>(null);

  const runAnalysis = useCallback(
    async (params: RunFrameworkAnalysisParams): Promise<void> => {
      const trimmedUrl = params.url.trim();
      if (!trimmedUrl) {
        return;
      }

      lastRunUrlRef.current = trimmedUrl;

      let existingContent = params.existingContent ?? null;

      if (!existingContent && !params.skipCollection) {
        const collected = await collection.collectContent(trimmedUrl, {
          mode: 'comprehensive',
        });
        if (!collected) {
          return;
        }
        existingContent = collected;
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
    [chunked, collection]
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
        let existingContent = params.existingContent ?? null;

        if (!existingContent && !params.skipCollection) {
          const collected = await collection.collectContent(trimmedUrl, {
            mode: 'comprehensive',
          });
          if (!collected) {
            return;
          }
          existingContent = collected;
        }

        if (!existingContent) {
          throw new Error('Collected content is required for Flask evaluation');
        }

        const evidence =
          typeof existingContent === 'object' && existingContent !== null
            ? (existingContent as Record<string, unknown>)
            : {};

        const flaskResponse = await evaluateWithFlask({
          frameworkKey,
          payload: buildCanonicalFrameworkPayload({
            url: trimmedUrl,
            collectorType: 'content-collect-api',
            rawEvidence: evidence,
            proposedContent: params.proposedContent?.trim() || undefined,
          }),
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
    [collection, endpoint]
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

  const activeResult = flaskResult ?? chunked.result;
  const analysisMethod =
    flaskResult !== null ? 'flask-deterministic' : 'ai-chunked';

  return {
    isAnalyzing:
      chunked.isAnalyzing || collection.isCollecting || isFlaskRunning,
    isCollecting: collection.isCollecting,
    isFlaskRunning,
    isFromCache: collection.isFromCache,
    collectedData: collection.collectedData,
    percent: flaskResult ? 100 : chunked.percent,
    currentCategory: chunked.currentCategory,
    completedCategories: chunked.completedCategories,
    result: activeResult,
    analysisMethod,
    error: flaskError || chunked.error || collection.error,
    canonicalPayload: chunked.canonicalPayload,
    runAnalysis,
    runDeterministicAnalysis,
    clearCollected: collection.clearCollected,
    clearFlaskResult: () => {
      setFlaskResult(null);
      setFlaskError(null);
    },
  };
}

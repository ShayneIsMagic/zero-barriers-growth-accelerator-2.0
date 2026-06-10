'use client';

import { useCallback } from 'react';
import { useChunkedAnalysis } from '@/hooks/useChunkedAnalysis';
import { useContentCollection } from '@/hooks/useContentCollection';
import type { CollectedContentPayload } from '@/types/content-collection';

interface RunFrameworkAnalysisParams {
  url: string;
  proposedContent?: string;
  existingContent?: CollectedContentPayload | Record<string, unknown> | null;
  analysisType?: string;
  skipCollection?: boolean;
}

/**
 * Combines unified content collection with chunked per-category analysis.
 * Preserves progress UI, traceability, and thorough element-by-element review.
 */
export function useFrameworkPageAnalysis(endpoint: string) {
  const chunked = useChunkedAnalysis(endpoint);
  const collection = useContentCollection();

  const runAnalysis = useCallback(
    async (params: RunFrameworkAnalysisParams): Promise<void> => {
      const trimmedUrl = params.url.trim();
      if (!trimmedUrl) {
        return;
      }

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

  return {
    isAnalyzing: chunked.isAnalyzing || collection.isCollecting,
    isCollecting: collection.isCollecting,
    isFromCache: collection.isFromCache,
    collectedData: collection.collectedData,
    percent: chunked.percent,
    currentCategory: chunked.currentCategory,
    completedCategories: chunked.completedCategories,
    result: chunked.result,
    error: chunked.error || collection.error,
    canonicalPayload: chunked.canonicalPayload,
    runAnalysis,
    clearCollected: collection.clearCollected,
  };
}

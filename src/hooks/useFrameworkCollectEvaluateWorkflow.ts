'use client';

import { useCallback } from 'react';
import { buildFrameworkPageRunParams } from '@/lib/framework/framework-page-run-params';
import {
  useFrameworkPageAnalysis,
  usePreloadCachedContentOnUrl,
} from '@/hooks/useFrameworkPageAnalysis';

export interface UseFrameworkCollectEvaluateWorkflowOptions {
  endpoint: string;
  url: string;
  proposedContent?: string;
  scrapedContent?: string;
  setLocalError?: (message: string | null) => void;
}

/**
 * Collect → Evaluate workflow shared by framework dashboard pages.
 */
export function useFrameworkCollectEvaluateWorkflow(
  options: UseFrameworkCollectEvaluateWorkflowOptions
) {
  const {
    endpoint,
    url,
    proposedContent,
    scrapedContent,
    setLocalError,
  } = options;

  const analysis = useFrameworkPageAnalysis(endpoint, {
    preferMultiPageCollection: true,
  });

  usePreloadCachedContentOnUrl(url, analysis.preloadCachedContent);

  const handleCollect = useCallback(async (): Promise<void> => {
    setLocalError?.(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setLocalError?.('Please enter a URL');
      return;
    }
    await analysis.collectOnly(trimmed);
  }, [analysis.collectOnly, setLocalError, url]);

  const handleRefreshCollection = useCallback(async (): Promise<void> => {
    setLocalError?.(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setLocalError?.('Please enter a URL');
      return;
    }
    await analysis.clearCollected(trimmed);
    await analysis.collectOnly(trimmed);
  }, [analysis.clearCollected, analysis.collectOnly, setLocalError, url]);

  const runEvaluationAi = useCallback(async (): Promise<void> => {
    const params = buildFrameworkPageRunParams({
      url,
      proposedContent,
      scrapedContent,
      collectedContent: analysis.collectedData,
      setLocalError,
    });
    if (!params) {
      return;
    }
    if (!params.skipCollection && !analysis.collectedData) {
      setLocalError?.('Collect content first (Step 1) or paste scraped JSON');
      return;
    }
    setLocalError?.(null);
    await analysis.runAnalysis({
      ...params,
      existingContent: params.existingContent ?? analysis.collectedData,
      skipCollection: true,
    });
  }, [
    analysis.collectedData,
    analysis.runAnalysis,
    proposedContent,
    scrapedContent,
    setLocalError,
    url,
  ]);

  const runEvaluationFlask = useCallback(async (): Promise<void> => {
    const params = buildFrameworkPageRunParams({
      url,
      proposedContent,
      scrapedContent,
      collectedContent: analysis.collectedData,
      setLocalError,
    });
    if (!params) {
      return;
    }
    if (!params.skipCollection && !analysis.collectedData) {
      setLocalError?.('Collect content first (Step 1) or paste scraped JSON');
      return;
    }
    setLocalError?.(null);
    await analysis.runDeterministicAnalysis({
      ...params,
      existingContent: params.existingContent ?? analysis.collectedData,
      skipCollection: true,
    });
  }, [
    analysis.collectedData,
    analysis.runDeterministicAnalysis,
    proposedContent,
    scrapedContent,
    setLocalError,
    url,
  ]);

  return {
    ...analysis,
    handleCollect,
    handleRefreshCollection,
    runEvaluationAi,
    runEvaluationFlask,
    hasCollectedContent: Boolean(analysis.collectedData),
  };
}

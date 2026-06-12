/**
 * Unified Analysis Data Hook
 * One hook for ALL analysis pages - handles caching, scraping, analysis, and storage
 */

import { useState } from 'react';
import { apiCall } from '@/lib/api-call';
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';
import { CONTENT_COMPARE_ENDPOINT } from '@/lib/content-collection/endpoints';

interface UseAnalysisDataOptions {
  proposedContent?: string;
  existingContent?: any;
  analysisType?: string;
  maxPages?: number;
  maxDepth?: number;
  includeSubpages?: boolean;
}

interface UseAnalysisDataReturn {
  data: any | null;
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
  cacheInfo: any;
  runAnalysis: (url: string, options?: UseAnalysisDataOptions) => Promise<any>;
  clearCache: (url?: string) => Promise<void>;
}

export function useAnalysisData(
  analysisType: string
): UseAnalysisDataReturn {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<any>(null);

  // Helper function to validate URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const runAnalysis = async (
    url: string,
    options: UseAnalysisDataOptions = {}
  ): Promise<any> => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return null;
    }

    const trimmedUrl = url.trim();
    
    // Validate URL format before proceeding
    if (!isValidUrl(trimmedUrl)) {
      setError(`Invalid URL: "${trimmedUrl}". URLs must start with http:// or https://`);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError(null);
    setData(null);
    setIsFromCache(false);

    try {
      // Map analysis types to actual API endpoints
      const apiEndpoint =
        analysisType === 'compare'
          ? '/api/analyze/compare'
          : `/api/analyze/${analysisType}`;

      // Compare flow should use /api/analyze/compare as the source of truth
      // for comprehensive reusable content instead of pre-scraping via /api/scrape/content.
      const shouldPreScrape = analysisType !== 'compare';

      // Step 1: Check Local Forage cache FIRST
      const cached = await UnifiedLocalForageStorage.getPuppeteerData(trimmedUrl);

      let puppeteerData = cached?.data;
      let usedCache = false;

      if (cached) {
        setIsFromCache(true);
        usedCache = true;
      } else {
        setIsFromCache(false);
      }

      // Step 2: Pre-scrape only for non-compare flows — use compare API (same as Content Comparison)
      if (!puppeteerData && shouldPreScrape) {
        const { data: compareResult } = await apiCall<{
          success: boolean;
          error?: string;
          comprehensive?: unknown;
          existing?: unknown;
        }>(CONTENT_COMPARE_ENDPOINT, {
          method: 'POST',
          body: {
            url: trimmedUrl,
            proposedContent: '',
          },
          showErrorToast: true,
        });

        if (!compareResult?.success) {
          throw new Error(compareResult?.error || 'Scraping failed');
        }

        puppeteerData = compareResult.comprehensive ?? compareResult.existing;

        if (puppeteerData) {
          await UnifiedLocalForageStorage.storePuppeteerData(
            trimmedUrl,
            puppeteerData
          );
        }
      }

      // Step 3: Run analysis
      
      const { data: analysisResult } = await apiCall<{
        success: boolean;
        error?: string;
        comprehensive?: unknown;
        readableMarkdown?: string;
        analysis?: {
          chunkedReport?: string;
          unifiedReport?: string;
        };
      }>(apiEndpoint, {
        method: 'POST',
        body: {
          url: trimmedUrl,
          comprehensiveData: puppeteerData,
          proposedContent: options.proposedContent || '',
          existingContent: options.existingContent,
          analysisType: options.analysisType || 'full',
          includeSubpages: options.maxPages != null ? options.maxPages > 0 : false,
          maxPages: options.maxPages,
          maxDepth: options.maxDepth,
        },
        showErrorToast: true,
      });

      if (!analysisResult?.success) {
        throw new Error(analysisResult?.error || 'Analysis failed');
      }

      if (!analysisResult) {
        throw new Error('Analysis failed');
      }

      // Compare route can return rich multi-page comprehensive data.
      // Persist it so framework selection/reports can be reused from local storage.
      if (analysisType === 'compare' && analysisResult.comprehensive) {
        await UnifiedLocalForageStorage.storePuppeteerData(
          trimmedUrl,
          analysisResult.comprehensive
        );
      }

      // Step 4: Store analysis result
      if (analysisResult) {
        await UnifiedLocalForageStorage.storeReport(
          trimmedUrl,
          analysisResult,
          'json',
          analysisType
        );

        const chunkedReport =
          typeof analysisResult?.analysis?.chunkedReport === 'string'
            ? analysisResult.analysis.chunkedReport
            : null;
        const unifiedReport =
          typeof analysisResult?.analysis?.unifiedReport === 'string'
            ? analysisResult.analysis.unifiedReport
            : null;
        const readableMarkdown =
          typeof analysisResult?.readableMarkdown === 'string'
            ? analysisResult.readableMarkdown
            : null;

        if (chunkedReport) {
          await UnifiedLocalForageStorage.storeReport(
            trimmedUrl,
            chunkedReport,
            'markdown',
            `${analysisType}-chunked`
          );
        }

        if (unifiedReport) {
          await UnifiedLocalForageStorage.storeReport(
            trimmedUrl,
            unifiedReport,
            'markdown',
            `${analysisType}-unified`
          );
        }

        if (readableMarkdown) {
          await UnifiedLocalForageStorage.storeReport(
            trimmedUrl,
            readableMarkdown,
            'markdown',
            `${analysisType}-readable`
          );
        }
      }

      // Update cache info
      const storageInfo = await UnifiedLocalForageStorage.getStorageInfo();
      setCacheInfo(storageInfo);

      setData(analysisResult);
      setIsFromCache(usedCache);
      return analysisResult;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async (url?: string): Promise<void> => {
    try {
      if (url) {
        // Clear specific URL cache
        await UnifiedLocalForageStorage.getPuppeteerData(url).then(
          async (cached) => {
            if (cached) {
              // Remove from storage
              const store = (await import('localforage')).default.createInstance({
                name: 'ZeroBarriers',
                storeName: 'puppeteer_data',
              });
              await store.removeItem(url);
            }
          }
        );
      } else {
        // Clear all cache
        await UnifiedLocalForageStorage.clearAll();
      }
      setCacheInfo(await UnifiedLocalForageStorage.getStorageInfo());
    } catch (err) {
      void err; // Failed to clear cache
    }
  };

  return {
    data,
    isLoading,
    error,
    isFromCache,
    cacheInfo,
    runAnalysis,
    clearCache,
  };
}


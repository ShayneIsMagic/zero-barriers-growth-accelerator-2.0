/**
 * Persist framework analysis runs to LocalForage with URL-forward naming.
 */

import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';
import { extractAnalysisPayload, extractUrlFromPayload } from '@/lib/framework/framework-results-adapter';

const ENDPOINT_STORAGE_KEYS: Record<string, string> = {
  '/api/analyze/elements-value-b2c-standalone': 'elements-value-b2c-standalone',
  '/api/analyze/elements-value-b2b-standalone': 'elements-value-b2b-standalone',
  '/api/analyze/clifton-strengths-standalone': 'clifton-strengths-standalone',
  '/api/analyze/golden-circle-standalone': 'golden-circle-standalone',
  '/api/analyze/brand-archetypes-standalone': 'brand-archetypes-standalone',
  '/api/analyze/revenue-trends': 'revenue-trends',
};

export interface FrameworkRunResult {
  analysis?: unknown;
  comparison?: unknown;
  readableMarkdown?: string;
  url?: string;
  pageUrl?: string;
  traceability?: unknown;
}

export function resolveReportStorageKey(
  endpoint: string,
  override?: string
): string {
  if (override) {
    return override;
  }
  return ENDPOINT_STORAGE_KEYS[endpoint] ?? endpoint.replace(/^\/api\/analyze\//, '');
}

/**
 * Save JSON analysis + optional markdown variants (chunked / unified / readable).
 */
export async function persistFrameworkRunToLocalForage(
  url: string,
  reportStorageKey: string,
  result: FrameworkRunResult
): Promise<string[]> {
  const resolvedUrl = extractUrlFromPayload(result, url) ?? url;
  const reportIds: string[] = [];

  const wrapper = {
    url: resolvedUrl,
    pageUrl: result.pageUrl ?? resolvedUrl,
    assessmentType: reportStorageKey,
    analysis: extractAnalysisPayload(result) ?? result.analysis,
    readableMarkdown: result.readableMarkdown,
    traceability: result.traceability,
    savedAt: new Date().toISOString(),
  };

  const jsonId = await UnifiedLocalForageStorage.storeReport(
    resolvedUrl,
    wrapper,
    'json',
    reportStorageKey
  );
  reportIds.push(jsonId);

  const analysis = extractAnalysisPayload(result);
  const chunkedReport =
    analysis && typeof analysis.chunkedReport === 'string'
      ? analysis.chunkedReport
      : null;
  const unifiedReport =
    analysis && typeof analysis.unifiedReport === 'string'
      ? analysis.unifiedReport
      : null;
  const readableMarkdown =
    typeof result.readableMarkdown === 'string' ? result.readableMarkdown : null;

  if (chunkedReport) {
    const id = await UnifiedLocalForageStorage.storeReport(
      resolvedUrl,
      chunkedReport,
      'markdown',
      `${reportStorageKey}-chunked`
    );
    reportIds.push(id);
  }

  if (unifiedReport) {
    const id = await UnifiedLocalForageStorage.storeReport(
      resolvedUrl,
      unifiedReport,
      'markdown',
      `${reportStorageKey}-unified`
    );
    reportIds.push(id);
  }

  if (readableMarkdown) {
    const id = await UnifiedLocalForageStorage.storeReport(
      resolvedUrl,
      readableMarkdown,
      'markdown',
      `${reportStorageKey}-readable`
    );
    reportIds.push(id);
  }

  return reportIds;
}

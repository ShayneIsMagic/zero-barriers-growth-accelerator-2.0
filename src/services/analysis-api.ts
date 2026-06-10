/**
 * Analysis report API helpers — AGENTS-app apiCall layer.
 */

import { ApiCallError, apiCall } from '@/lib/api-call';

async function fetchAnalysisSubReport<T>(path: string): Promise<T | null> {
  try {
    const { data } = await apiCall<T>(path, {
      method: 'GET',
      showErrorToast: false,
    });
    return data;
  } catch (error) {
    if (error instanceof ApiCallError && error.status === 404) {
      return null;
    }
    return null;
  }
}

export interface AnalysisRecord {
  url?: string;
  createdAt?: string;
  status?: string;
}

export interface FullAnalysisReport {
  id: string;
  url: string;
  createdAt: string;
  status: string;
  goldenCircle: unknown;
  elementsOfValueB2C: unknown;
  elementsOfValueB2B: unknown;
  cliftonStrengths: unknown;
  lighthouse: unknown;
  seo: unknown;
}

export async function fetchFullAnalysisReport(
  analysisId: string,
  fallbackUrl?: string
): Promise<FullAnalysisReport> {
  const { data: analysis } = await apiCall<AnalysisRecord>(
    `/api/analysis/${analysisId}`,
    { method: 'GET', showErrorToast: false }
  );

  if (!analysis) {
    throw new Error('Analysis not found');
  }

  const [
    goldenCircle,
    elementsOfValueB2C,
    elementsOfValueB2B,
    cliftonStrengths,
    lighthouse,
    seo,
  ] = await Promise.all([
    fetchAnalysisSubReport(`/api/analysis/golden-circle/${analysisId}`),
    fetchAnalysisSubReport(`/api/analysis/elements-value-b2c/${analysisId}`),
    fetchAnalysisSubReport(`/api/analysis/elements-value-b2b/${analysisId}`),
    fetchAnalysisSubReport(`/api/analysis/clifton-strengths/${analysisId}`),
    fetchAnalysisSubReport(`/api/analysis/lighthouse/${analysisId}`),
    fetchAnalysisSubReport(`/api/analysis/seo/${analysisId}`),
  ]);

  return {
    id: analysisId,
    url: analysis.url || fallbackUrl || '',
    createdAt: analysis.createdAt || '',
    status: analysis.status || 'unknown',
    goldenCircle,
    elementsOfValueB2C,
    elementsOfValueB2B,
    cliftonStrengths,
    lighthouse,
    seo,
  };
}

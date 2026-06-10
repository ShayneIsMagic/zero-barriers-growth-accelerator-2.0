import type { AIAnalysisResponse } from '@/lib/free-ai-analysis';

export function getAnalysisText(response: AIAnalysisResponse): string {
  if (typeof response.analysis === 'string') {
    return response.analysis;
  }
  if (response.analysis && typeof response.analysis === 'object') {
    return JSON.stringify(response.analysis);
  }
  if (typeof response.raw === 'string') {
    return response.raw;
  }
  if (typeof response.originalText === 'string') {
    return response.originalText;
  }
  return JSON.stringify(response);
}

export function parseAnalysisJson<T = Record<string, unknown>>(
  response: AIAnalysisResponse
): T {
  if (
    typeof response.analysis === 'object' &&
    response.analysis !== null &&
    !Array.isArray(response.analysis)
  ) {
    return response.analysis as T;
  }
  return JSON.parse(getAnalysisText(response)) as T;
}

export function isAnalysisSuccess(response: AIAnalysisResponse): boolean {
  if (response.success === false) {
    return false;
  }
  if (response.error && !response.analysis && !response.raw) {
    return false;
  }
  return true;
}

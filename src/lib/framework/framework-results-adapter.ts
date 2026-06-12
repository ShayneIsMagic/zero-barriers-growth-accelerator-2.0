/**
 * Normalize saved/API analysis payloads for shared result panels.
 */

import type { StoredReport } from '@/lib/services/unified-localforage-storage.service';

export type FrameworkResultKind =
  | 'b2b-elements'
  | 'b2c-elements'
  | 'clifton-strengths'
  | 'brand-archetypes'
  | 'golden-circle'
  | 'revenue-trends'
  | 'content-comparison'
  | 'unknown';

export interface NormalizedFrameworkResult {
  kind: FrameworkResultKind;
  analysis: Record<string, unknown> | null;
  readableMarkdown?: string;
  url?: string;
  timestamp?: string;
  assessmentType?: string;
}

const ASSESSMENT_TYPE_TO_KIND: Record<string, FrameworkResultKind> = {
  'b2b-elements': 'b2b-elements',
  'elements-value-b2b-standalone': 'b2b-elements',
  'elements-value-b2b-standalone-chunked': 'b2b-elements',
  'b2c-elements': 'b2c-elements',
  'elements-value-b2c-standalone': 'b2c-elements',
  'elements-value-b2c-standalone-chunked': 'b2c-elements',
  'clifton-strengths': 'clifton-strengths',
  'clifton-strengths-standalone': 'clifton-strengths',
  'clifton-strengths-standalone-chunked': 'clifton-strengths',
  'golden-circle': 'golden-circle',
  'golden-circle-standalone': 'golden-circle',
  'golden-circle-standalone-chunked': 'golden-circle',
  'jambojon-archetypes': 'brand-archetypes',
  'brand-archetypes-standalone': 'brand-archetypes',
  'brand-archetypes-standalone-chunked': 'brand-archetypes',
  'revenue-trends': 'revenue-trends',
  'revenue-trends-readable': 'revenue-trends',
  compare: 'content-comparison',
  'content-comparison': 'content-comparison',
};

export interface ContentComparisonReportPayload {
  existing?: Record<string, unknown>;
  proposed?: Record<string, unknown> | null;
  comparison?: unknown;
  success?: boolean;
  message?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonContent(content: string | unknown): unknown {
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }
  return content;
}

/** True when object looks like a chunked/Flask analysis root (categories at top level). */
function looksLikeAnalysisRoot(value: Record<string, unknown>): boolean {
  return (
    'categories' in value ||
    ('overallScore' in value && 'totalElements' in value) ||
    'pyramidDiagnostics' in value
  );
}

export function extractAnalysisPayload(raw: unknown): Record<string, unknown> | null {
  const parsed = parseJsonContent(raw);
  if (!isRecord(parsed)) {
    return null;
  }

  if (parsed.analysis && isRecord(parsed.analysis)) {
    return parsed.analysis;
  }

  if (looksLikeAnalysisRoot(parsed)) {
    return parsed;
  }

  if (parsed.comparison && isRecord(parsed.comparison)) {
    const comparison = parsed.comparison;
    if (comparison.analysis && isRecord(comparison.analysis)) {
      return comparison.analysis;
    }
    if (looksLikeAnalysisRoot(comparison)) {
      return comparison;
    }
  }

  if (parsed.data && isRecord(parsed.data)) {
    const nested = extractAnalysisPayload(parsed.data);
    if (nested) {
      return nested;
    }
  }

  return null;
}

/** Live API / LocalForage run payloads use `analysis`; legacy paths used `comparison`. */
export function resolveFrameworkRunAnalysis(
  result: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!result) {
    return null;
  }
  return extractAnalysisPayload(result);
}

export function resolveFrameworkRunExisting(
  result: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!result) {
    return null;
  }
  if (isRecord(result.existing)) {
    return result.existing;
  }
  if (isRecord(result.existingData)) {
    return result.existingData;
  }
  return null;
}

export function extractContentComparisonPayload(
  raw: unknown
): ContentComparisonReportPayload | null {
  const parsed = parseJsonContent(raw);
  if (!isRecord(parsed)) {
    return null;
  }

  if (isRecord(parsed.existing) || parsed.comparison !== undefined) {
    return {
      existing: isRecord(parsed.existing) ? parsed.existing : undefined,
      proposed: isRecord(parsed.proposed) ? parsed.proposed : null,
      comparison: parsed.comparison,
      success: typeof parsed.success === 'boolean' ? parsed.success : undefined,
      message: typeof parsed.message === 'string' ? parsed.message : undefined,
    };
  }

  return null;
}

export function detectFrameworkKind(
  assessmentType?: string,
  payload?: Record<string, unknown> | null
): FrameworkResultKind {
  if (assessmentType) {
    const normalized = assessmentType.replace(/-readable$/, '').replace(/-unified$/, '');
    const direct = ASSESSMENT_TYPE_TO_KIND[assessmentType] ?? ASSESSMENT_TYPE_TO_KIND[normalized];
    if (direct) {
      return direct;
    }
    if (assessmentType.includes('b2b')) {
      return 'b2b-elements';
    }
    if (assessmentType.includes('b2c')) {
      return 'b2c-elements';
    }
    if (assessmentType.includes('clifton')) {
      return 'clifton-strengths';
    }
    if (assessmentType.includes('archetype') || assessmentType.includes('jambojon')) {
      return 'brand-archetypes';
    }
    if (assessmentType.includes('golden')) {
      return 'golden-circle';
    }
    if (assessmentType.includes('revenue')) {
      return 'revenue-trends';
    }
  }

  if (payload) {
    const frameworkKey = payload.frameworkKey;
    if (typeof frameworkKey === 'string') {
      const fromKey = ASSESSMENT_TYPE_TO_KIND[frameworkKey];
      if (fromKey) {
        return fromKey;
      }
    }
    if (payload.pyramidDiagnostics) {
      return 'b2b-elements';
    }
    if (payload.top_five_strengths || payload.domain_rankings) {
      return 'clifton-strengths';
    }
    if (payload.top_three_archetypes || payload.primary_archetype) {
      return 'brand-archetypes';
    }
  }

  return 'unknown';
}

export function extractOverallScore(
  analysis: Record<string, unknown> | null
): number | null {
  if (!analysis) {
    return null;
  }
  if (typeof analysis.overallScore === 'number') {
    return analysis.overallScore;
  }
  if (typeof analysis.overall_score === 'number') {
    return analysis.overall_score > 1
      ? analysis.overall_score / 100
      : analysis.overall_score;
  }
  return null;
}

export function extractReadableMarkdown(raw: unknown): string | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }
  if (typeof raw.readableMarkdown === 'string') {
    return raw.readableMarkdown;
  }
  if (typeof raw.chunkedReport === 'string') {
    return raw.chunkedReport;
  }
  const analysis = extractAnalysisPayload(raw);
  if (analysis) {
    if (typeof analysis.unifiedReport === 'string') {
      return analysis.unifiedReport;
    }
    if (typeof analysis.chunkedReport === 'string') {
      return analysis.chunkedReport;
    }
    if (typeof analysis.fallbackMarkdown === 'string') {
      return analysis.fallbackMarkdown;
    }
  }
  return undefined;
}

export function extractUrlFromPayload(raw: unknown, fallback?: string): string | undefined {
  if (!isRecord(raw)) {
    return fallback;
  }
  if (typeof raw.url === 'string' && raw.url.trim()) {
    return raw.url.trim();
  }
  if (typeof raw.pageUrl === 'string' && raw.pageUrl.trim()) {
    return raw.pageUrl.trim();
  }
  const analysis = extractAnalysisPayload(raw);
  if (analysis && typeof analysis.url === 'string') {
    return analysis.url;
  }
  return fallback;
}

export function normalizeStoredReportContent(
  report: StoredReport
): NormalizedFrameworkResult {
  const content = parseJsonContent(report.content);
  const analysis = report.format === 'json' ? extractAnalysisPayload(content) : null;

  return {
    kind: detectFrameworkKind(report.assessmentType, analysis),
    analysis,
    readableMarkdown:
      report.format === 'markdown' && typeof report.content === 'string'
        ? report.content
        : extractReadableMarkdown(content),
    url: report.url,
    timestamp: report.timestamp,
    assessmentType: report.assessmentType,
  };
}

export function buildUrlReportLabel(url: string, maxLength = 72): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const path =
      parsed.pathname && parsed.pathname !== '/'
        ? parsed.pathname.replace(/\/$/, '')
        : '';
    const label = `${host}${path}`;
    return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
  } catch {
    return url.length > maxLength ? `${url.slice(0, maxLength - 1)}…` : url;
  }
}

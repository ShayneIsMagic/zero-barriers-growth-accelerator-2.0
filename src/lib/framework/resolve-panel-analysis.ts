import {
  detectFrameworkKind,
  extractAnalysisPayload,
  type FrameworkResultKind,
} from '@/lib/framework/framework-results-adapter';

const ASSESSMENT_TYPE_MAP: Record<string, FrameworkResultKind> = {
  'b2c-elements': 'b2c-elements',
  'b2b-elements': 'b2b-elements',
  'golden-circle': 'golden-circle',
  'clifton-strengths': 'clifton-strengths',
  'content-comparison': 'unknown',
};

export function mapAssessmentTypeToKind(
  assessmentType: string
): FrameworkResultKind {
  return ASSESSMENT_TYPE_MAP[assessmentType] ?? detectFrameworkKind(assessmentType);
}

export function resolvePanelAnalysis(
  data: unknown
): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  const fromWrapper =
    extractAnalysisPayload(record) ??
    extractAnalysisPayload(record.comparison) ??
    extractAnalysisPayload(record.analysis);

  if (fromWrapper?.categories) {
    return fromWrapper;
  }

  if (record.categories && typeof record.categories === 'object') {
    return record;
  }

  const comparison = record.comparison;
  if (comparison && typeof comparison === 'object' && !Array.isArray(comparison)) {
    const comparisonRecord = comparison as Record<string, unknown>;
    if (comparisonRecord.categories) {
      return comparisonRecord;
    }
  }

  const analysis = record.analysis;
  if (analysis && typeof analysis === 'object' && !Array.isArray(analysis)) {
    const analysisRecord = analysis as Record<string, unknown>;
    if (analysisRecord.categories) {
      return analysisRecord;
    }
  }

  return null;
}

export function hasStructuredFrameworkAnalysis(data: unknown): boolean {
  return resolvePanelAnalysis(data) !== null;
}

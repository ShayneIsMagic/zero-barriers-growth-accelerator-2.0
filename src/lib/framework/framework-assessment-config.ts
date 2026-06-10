/**
 * Maps Framework Analysis Runner assessment types to chunked standalone endpoints.
 */

export interface ChunkedFrameworkAssessmentConfig {
  endpoint: string;
  frameworkName: string;
  reportStorageKey: string;
}

export const CHUNKED_FRAMEWORK_ASSESSMENTS: Record<
  string,
  ChunkedFrameworkAssessmentConfig
> = {
  'golden-circle': {
    endpoint: '/api/analyze/golden-circle-standalone',
    frameworkName: 'golden-circle',
    reportStorageKey: 'golden-circle-standalone',
  },
  'elements-value-b2c': {
    endpoint: '/api/analyze/elements-value-b2c-standalone',
    frameworkName: 'b2c-elements',
    reportStorageKey: 'elements-value-b2c-standalone',
  },
  'elements-value-b2b': {
    endpoint: '/api/analyze/elements-value-b2b-standalone',
    frameworkName: 'b2b-elements',
    reportStorageKey: 'elements-value-b2b-standalone',
  },
  'clifton-strengths': {
    endpoint: '/api/analyze/clifton-strengths-standalone',
    frameworkName: 'clifton',
    reportStorageKey: 'clifton-strengths-standalone',
  },
  'jambojon-archetypes': {
    endpoint: '/api/analyze/brand-archetypes-standalone',
    frameworkName: 'brand-archetypes',
    reportStorageKey: 'brand-archetypes-standalone',
  },
};

export function getChunkedAssessmentConfig(
  assessmentType: string
): ChunkedFrameworkAssessmentConfig | null {
  return CHUNKED_FRAMEWORK_ASSESSMENTS[assessmentType] ?? null;
}

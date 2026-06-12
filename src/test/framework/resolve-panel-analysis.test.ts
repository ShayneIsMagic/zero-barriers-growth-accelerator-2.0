import { describe, expect, it } from 'vitest';
import {
  hasStructuredFrameworkAnalysis,
  mapAssessmentTypeToKind,
  resolvePanelAnalysis,
} from '@/lib/framework/resolve-panel-analysis';

describe('resolve-panel-analysis', () => {
  it('maps assessment types to framework kinds', () => {
    expect(mapAssessmentTypeToKind('b2b-elements')).toBe('b2b-elements');
    expect(mapAssessmentTypeToKind('golden-circle')).toBe('golden-circle');
  });

  it('extracts nested analysis from API wrapper', () => {
    const payload = {
      success: true,
      comparison: {
        categories: { functional: { elements: { saves_time: { score: 0.5 } } } },
        overallScore: 0.5,
      },
    };
    const analysis = resolvePanelAnalysis(payload);
    expect(analysis?.overallScore).toBe(0.5);
    expect(hasStructuredFrameworkAnalysis(payload)).toBe(true);
  });

  it('returns null for legacy percent-only payloads', () => {
    const legacy = { overall_score: 72, table_stakes_score: 65 };
    expect(resolvePanelAnalysis(legacy)).toBeNull();
    expect(hasStructuredFrameworkAnalysis(legacy)).toBe(false);
  });
});

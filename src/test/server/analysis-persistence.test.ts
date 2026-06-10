import { describe, expect, it } from 'vitest';
import { resolveStandaloneScore } from '@/lib/server/analysis-persistence';

describe('analysis-persistence', () => {
  it('resolves flat overallScore from chunked analysis', () => {
    expect(resolveStandaloneScore({ overallScore: 0.72 })).toBe(0.72);
  });

  it('resolves legacy overall_score number', () => {
    expect(resolveStandaloneScore({ overall_score: 85 })).toBe(85);
  });

  it('returns null when no score field is present', () => {
    expect(resolveStandaloneScore({ categories: {} })).toBeNull();
  });
});

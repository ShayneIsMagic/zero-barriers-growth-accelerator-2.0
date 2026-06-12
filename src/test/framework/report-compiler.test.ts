import { describe, expect, it } from 'vitest';
import { compileCompanyReports } from '@/lib/framework/report-compiler';
import type { StoredReport } from '@/lib/services/unified-localforage-storage.service';

function makeReport(
  partial: Partial<StoredReport> & Pick<StoredReport, 'id' | 'timestamp' | 'content'>
): StoredReport {
  return {
    url: 'https://example.com',
    domain: 'example.com',
    type: 'json',
    format: 'json',
    assessmentType: 'elements-value-b2b-standalone',
    assessmentDisplayName: 'B2B Elements of Value',
    displayName: 'example.com — B2B',
    ...partial,
  };
}

describe('report-compiler', () => {
  it('builds timeline with score deltas for same assessment type', () => {
    const reports: StoredReport[] = [
      makeReport({
        id: 'a',
        timestamp: '2025-01-01T12:00:00.000Z',
        content: {
          analysis: {
            overallScore: 0.4,
            categories: {
              table_stakes: {
                categoryName: 'Table Stakes',
                categoryScore: 0.4,
                elements: {
                  meeting_specifications: {
                    score: 0.4,
                    evidence: 'e',
                    recommendation: 'r',
                  },
                },
              },
            },
          },
        },
      }),
      makeReport({
        id: 'b',
        timestamp: '2025-02-01T12:00:00.000Z',
        version: 2,
        content: {
          analysis: {
            overallScore: 0.55,
            categories: {
              table_stakes: {
                categoryName: 'Table Stakes',
                categoryScore: 0.55,
                elements: {
                  meeting_specifications: {
                    score: 0.55,
                    evidence: 'e2',
                    recommendation: 'r2',
                  },
                },
              },
            },
          },
        },
      }),
    ];

    const compiled = compileCompanyReports('example.com', reports);

    expect(compiled.timeline).toHaveLength(2);
    expect(compiled.timeline[0].overallScore).toBe(0.4);
    expect(compiled.timeline[1].overallScore).toBe(0.55);
    expect(compiled.timeline[1].scoreDeltaFromPrevious).toBeCloseTo(0.15);
    expect(compiled.markdown).toContain('Company assessment compile');
    expect(compiled.markdown).toContain('Latest B2B Elements snapshot');
  });
});

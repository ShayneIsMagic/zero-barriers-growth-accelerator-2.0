import { describe, expect, it } from 'vitest';
import {
  groupSummariesByCompany,
  sortReportsByTimestampDesc,
  toStoredReportSummary,
} from '@/lib/framework/reports-index';
import type { StoredReport } from '@/lib/services/unified-localforage-storage.service';

function makeReport(overrides: Partial<StoredReport>): StoredReport {
  return {
    id: 'report-1',
    url: 'https://zerobarriers.io',
    type: 'json',
    content: { analysis: { overallScore: 0.5, categories: {} } },
    format: 'json',
    timestamp: '2026-06-01T12:00:00.000Z',
    assessmentType: 'elements-value-b2b-standalone',
    ...overrides,
  };
}

describe('reports-index', () => {
  it('builds summary without content payload', () => {
    const summary = toStoredReportSummary(makeReport({}));
    expect(summary.id).toBe('report-1');
    expect(summary.frameworkKind).toBe('b2b-elements');
    expect('content' in summary).toBe(false);
  });

  it('sorts summaries newest first', () => {
    const sorted = sortReportsByTimestampDesc([
      { timestamp: '2026-06-01T12:00:00.000Z' },
      { timestamp: '2026-06-10T12:00:00.000Z' },
    ]);
    expect(sorted[0]?.timestamp).toContain('2026-06-10');
  });

  it('groups summaries by domain', () => {
    const groups = groupSummariesByCompany([
      toStoredReportSummary(
        makeReport({ id: 'a', domain: 'zerobarriers.io' })
      ),
      toStoredReportSummary(
        makeReport({
          id: 'b',
          url: 'https://example.com',
          domain: 'example.com',
        })
      ),
    ]);
    expect(Object.keys(groups)).toHaveLength(2);
    expect(groups['zerobarriers.io']).toHaveLength(1);
  });
});

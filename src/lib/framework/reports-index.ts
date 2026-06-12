import type { StoredReport } from '@/lib/services/unified-localforage-storage.service';
import {
  detectFrameworkKind,
  extractAnalysisPayload,
  type FrameworkResultKind,
} from '@/lib/framework/framework-results-adapter';

export interface StoredReportSummary {
  id: string;
  url: string;
  domain?: string;
  displayName?: string;
  type: StoredReport['type'];
  format: StoredReport['format'];
  timestamp: string;
  formattedDate?: string;
  version?: number;
  assessmentType?: string;
  assessmentDisplayName?: string;
  frameworkKind: FrameworkResultKind;
}

export interface ReportsIndexMeta {
  version: number;
  lastRebuiltAt: string;
  entryCount: number;
}

export const REPORTS_INDEX_META_KEY = '__reports_index_meta__';
export const REPORTS_INDEX_VERSION = 1;

export function toStoredReportSummary(report: StoredReport): StoredReportSummary {
  const frameworkKind = detectFrameworkKind(
    report.assessmentType,
    report.format === 'json' ? extractAnalysisPayload(report.content) : null
  );

  return {
    id: report.id,
    url: report.url,
    domain: report.domain,
    displayName: report.displayName,
    type: report.type,
    format: report.format,
    timestamp: report.timestamp,
    formattedDate: report.formattedDate,
    version: report.version,
    assessmentType: report.assessmentType,
    assessmentDisplayName: report.assessmentDisplayName,
    frameworkKind,
  };
}

export function sortReportsByTimestampDesc<T extends { timestamp: string }>(
  reports: T[]
): T[] {
  return [...reports].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function groupSummariesByCompany(
  summaries: StoredReportSummary[]
): Record<string, StoredReportSummary[]> {
  const groups: Record<string, StoredReportSummary[]> = {};
  for (const summary of summaries) {
    const key = summary.domain ?? summary.url;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(summary);
  }
  for (const key of Object.keys(groups)) {
    groups[key] = sortReportsByTimestampDesc(groups[key]);
  }
  return groups;
}

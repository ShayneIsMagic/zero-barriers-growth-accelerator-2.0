/**
 * Compile multiple LocalForage reports for one company/URL into a single timeline report.
 */

import type { StoredReport } from '@/lib/services/unified-localforage-storage.service';
import {
  detectFrameworkKind,
  extractAnalysisPayload,
  extractOverallScore,
  normalizeStoredReportContent,
} from '@/lib/framework/framework-results-adapter';
import {
  formatFractionalScore,
  formatFractionalScoreDecimal,
  generateElementsValueMarkdown,
  type ElementsValueFramework,
} from '@/lib/framework/elements-value-display';

export interface ReportTimelineEntry {
  reportId: string;
  url: string;
  assessmentType: string;
  assessmentDisplayName: string;
  timestamp: string;
  formattedDate?: string;
  overallScore: number | null;
  scoreDeltaFromPrevious: number | null;
  version?: number;
}

export interface CompiledCompanyReport {
  companyKey: string;
  primaryUrl: string;
  reportCount: number;
  jsonReportCount: number;
  dateRange: { from: string; to: string } | null;
  timeline: ReportTimelineEntry[];
  markdown: string;
}

function isJsonStructuredReport(report: StoredReport): boolean {
  if (report.format !== 'json') {
    return false;
  }
  const kind = detectFrameworkKind(
    report.assessmentType,
    extractAnalysisPayload(report.content)
  );
  return kind !== 'unknown';
}

export function groupReportsByCompany(
  reports: StoredReport[]
): Record<string, StoredReport[]> {
  const groups: Record<string, StoredReport[]> = {};
  for (const report of reports) {
    const key = report.domain ?? report.url;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(report);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
  return groups;
}

function formatScoreDelta(delta: number | null): string {
  if (delta === null || !Number.isFinite(delta)) {
    return '—';
  }
  const points = Math.round(delta * 1000) / 10;
  if (points > 0) {
    return `+${points} pp`;
  }
  if (points < 0) {
    return `${points} pp`;
  }
  return 'no change';
}

function buildTimelineEntry(
  report: StoredReport,
  previousScore: number | null
): ReportTimelineEntry {
  const normalized = normalizeStoredReportContent(report);
  const overallScore = extractOverallScore(normalized.analysis);
  const scoreDeltaFromPrevious =
    overallScore !== null && previousScore !== null
      ? overallScore - previousScore
      : null;

  return {
    reportId: report.id,
    url: report.url,
    assessmentType: report.assessmentType ?? 'unknown',
    assessmentDisplayName:
      report.assessmentDisplayName ?? report.assessmentType ?? 'Report',
    timestamp: report.timestamp,
    formattedDate: report.formattedDate,
    overallScore,
    scoreDeltaFromPrevious,
    version: report.version,
  };
}

function latestAnalysisSection(
  reports: StoredReport[],
  kind: 'b2b-elements' | 'b2c-elements'
): string {
  const framework: ElementsValueFramework = kind === 'b2b-elements' ? 'b2b' : 'b2c';
  const candidates = reports
    .filter((r) => r.format === 'json' && detectFrameworkKind(r.assessmentType) === kind)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const latest = candidates[0];
  if (!latest) {
    return `_No ${kind.toUpperCase()} JSON reports found for this company._\n`;
  }

  const analysis = extractAnalysisPayload(latest.content);
  if (!analysis) {
    return `_Latest ${kind} report has no structured analysis._\n`;
  }

  return generateElementsValueMarkdown(framework, analysis, {
    url: latest.url,
    title: latest.displayName,
  });
}

/**
 * Build one compiled markdown report for all JSON runs under a company key (domain).
 */
export function compileCompanyReports(
  companyKey: string,
  reports: StoredReport[]
): CompiledCompanyReport {
  const companyReports = reports
    .filter((r) => (r.domain ?? r.url) === companyKey || r.domain === companyKey)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const jsonReports = companyReports.filter(isJsonStructuredReport);
  const primaryUrl = companyReports[0]?.url ?? companyKey;

  const timeline: ReportTimelineEntry[] = [];
  const scoreByAssessment = new Map<string, number | null>();

  for (const report of jsonReports) {
    const assessmentKey = report.assessmentType ?? 'unknown';
    const previousScore = scoreByAssessment.get(assessmentKey) ?? null;
    const entry = buildTimelineEntry(report, previousScore);
    timeline.push(entry);
    scoreByAssessment.set(assessmentKey, entry.overallScore);
  }

  const timestamps = companyReports.map((r) => r.timestamp).sort();
  const dateRange =
    timestamps.length > 0
      ? { from: timestamps[0], to: timestamps[timestamps.length - 1] }
      : null;

  const timelineTable = timeline
    .map((entry) => {
      const dateLabel = entry.formattedDate ?? new Date(entry.timestamp).toLocaleString();
      const scoreLabel =
        entry.overallScore !== null
          ? formatFractionalScore(entry.overallScore)
          : '—';
      return `| ${dateLabel} | ${entry.assessmentDisplayName} | ${scoreLabel} (${formatFractionalScoreDecimal(entry.overallScore ?? 0)}) | ${formatScoreDelta(entry.scoreDeltaFromPrevious)} | v${entry.version ?? 1} |`;
    })
    .join('\n');

  const changeNotes = timeline
    .filter(
      (entry) =>
        entry.scoreDeltaFromPrevious !== null &&
        Math.abs(entry.scoreDeltaFromPrevious) >= 0.01
    )
    .map((entry) => {
      const direction =
        (entry.scoreDeltaFromPrevious ?? 0) > 0 ? 'improved' : 'declined';
      return `- **${entry.assessmentDisplayName}** (${entry.formattedDate ?? entry.timestamp}): score ${direction} by ${formatScoreDelta(entry.scoreDeltaFromPrevious)} (now ${formatFractionalScore(entry.overallScore ?? 0)}).`;
    })
    .join('\n');

  const b2bLatest = latestAnalysisSection(jsonReports, 'b2b-elements');
  const b2cLatest = latestAnalysisSection(jsonReports, 'b2c-elements');

  const markdown = `# Company assessment compile — ${companyKey}

**Primary URL:** ${primaryUrl}
**Reports included:** ${companyReports.length} total (${jsonReports.length} structured JSON)
**Date range:** ${dateRange ? `${new Date(dateRange.from).toLocaleString()} → ${new Date(dateRange.to).toLocaleString()}` : 'N/A'}

---

## Run timeline (oldest → newest)

| Date | Assessment | Score | Change vs prior run | Version |
|------|------------|-------|---------------------|---------|
${timelineTable || '| — | — | — | — | — |'}

---

## Notable score changes

${changeNotes || '_No material score changes between consecutive runs of the same assessment type._'}

---

## Latest B2B Elements snapshot

${b2bLatest}

---

## Latest B2C Elements snapshot

${b2cLatest}

---

_Compiled ${new Date().toLocaleString()} from LocalForage reports keyed to **${companyKey}**._
`;

  return {
    companyKey,
    primaryUrl,
    reportCount: companyReports.length,
    jsonReportCount: jsonReports.length,
    dateRange,
    timeline,
    markdown,
  };
}

export function filterReportsForCompile(reports: StoredReport[]): StoredReport[] {
  return reports.filter(
    (report) =>
      report.format === 'json' &&
      !report.assessmentType?.endsWith('-readable') &&
      !report.assessmentType?.endsWith('-unified') &&
      !report.assessmentType?.endsWith('-chunked')
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { FrameworkResultsPanel } from '@/components/analysis/FrameworkResultsPanel';
import {
  extractContentComparisonPayload,
  normalizeStoredReportContent,
  type ContentComparisonReportPayload,
} from '@/lib/framework/framework-results-adapter';
import type { StoredReport } from '@/lib/services/unified-localforage-storage.service';

interface ReportStructuredPreviewProps {
  report: StoredReport;
}

function ContentComparisonReportPreview({
  payload,
}: {
  payload: ContentComparisonReportPayload;
}) {
  const existing = payload.existing;
  const proposed = payload.proposed;
  const comparison = payload.comparison;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/40 p-4">
        <p className="text-sm font-medium">Content Comparison Report</p>
        <p className="text-xs text-muted-foreground mt-1">
          Side-by-side scrape and AI comparison output saved from Content Comparison.
        </p>
      </div>

      {existing && (
        <div className="rounded-lg border p-4 space-y-2 text-sm">
          <p className="font-medium">Existing content</p>
          <p>
            <span className="text-muted-foreground">Title: </span>
            {typeof existing.title === 'string' ? existing.title : 'N/A'}
          </p>
          <p>
            <span className="text-muted-foreground">Word count: </span>
            {typeof existing.wordCount === 'number' ? existing.wordCount : 'N/A'}
          </p>
          {Array.isArray(existing.extractedKeywords) && existing.extractedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {existing.extractedKeywords.slice(0, 8).map((keyword) => (
                <Badge key={String(keyword)} variant="secondary" className="text-xs">
                  {String(keyword)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {proposed && (
        <div className="rounded-lg border p-4 space-y-2 text-sm">
          <p className="font-medium">Proposed content</p>
          <p>
            <span className="text-muted-foreground">Title: </span>
            {typeof proposed.title === 'string' ? proposed.title : 'N/A'}
          </p>
        </div>
      )}

      {comparison !== undefined && comparison !== null && (
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-sm font-medium">Comparison output</p>
          {typeof comparison === 'string' ? (
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">
              {comparison}
            </pre>
          ) : typeof comparison === 'object' &&
            comparison !== null &&
            'error' in comparison &&
            typeof (comparison as { error?: unknown }).error === 'string' ? (
            <p className="text-sm text-destructive">
              {(comparison as { error: string }).error}
            </p>
          ) : (
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">
              {JSON.stringify(comparison, null, 2)}
            </pre>
          )}
        </div>
      )}

      {!existing && !proposed && comparison === undefined && (
        <p className="text-sm text-muted-foreground">
          No structured comparison fields found. Open the Raw tab for full content.
        </p>
      )}
    </div>
  );
}

export function ReportStructuredPreview({ report }: ReportStructuredPreviewProps) {
  const normalized = normalizeStoredReportContent(report);
  const comparisonPayload =
    normalized.kind === 'content-comparison' ||
    report.assessmentType === 'compare' ||
    report.assessmentType === 'content-comparison'
      ? extractContentComparisonPayload(report.content)
      : null;

  if (comparisonPayload) {
    return <ContentComparisonReportPreview payload={comparisonPayload} />;
  }

  if (normalized.analysis) {
    return (
      <FrameworkResultsPanel
        kind={normalized.kind}
        analysis={normalized.analysis}
        readableMarkdown={normalized.readableMarkdown}
        defaultExpanded
      />
    );
  }

  if (normalized.readableMarkdown) {
    return (
      <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
        {normalized.readableMarkdown}
      </pre>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      No structured analysis found. Open the Raw tab for full content.
    </p>
  );
}

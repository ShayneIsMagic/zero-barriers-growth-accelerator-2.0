'use client';

import { FrameworkResultsPanel } from '@/components/analysis/FrameworkResultsPanel';
import { normalizeStoredReportContent } from '@/lib/framework/framework-results-adapter';
import type { StoredReport } from '@/lib/services/unified-localforage-storage.service';

interface ReportStructuredPreviewProps {
  report: StoredReport;
}

export function ReportStructuredPreview({ report }: ReportStructuredPreviewProps) {
  const normalized = normalizeStoredReportContent(report);

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

'use client';

import { FrameworkResultsPanel } from '@/components/analysis/FrameworkResultsPanel';
import type { FrameworkResultKind } from '@/lib/framework/framework-results-adapter';
import {
  mapAssessmentTypeToKind,
  resolvePanelAnalysis,
} from '@/lib/framework/resolve-panel-analysis';

interface FrameworkStructuredResultsProps {
  data: unknown;
  kind?: FrameworkResultKind;
  assessmentType?: string;
  defaultExpanded?: boolean;
  readableMarkdown?: string;
}

export function FrameworkStructuredResults({
  data,
  kind,
  assessmentType,
  defaultExpanded = false,
  readableMarkdown,
}: FrameworkStructuredResultsProps) {
  const analysis = resolvePanelAnalysis(data);
  const resolvedKind =
    kind ??
    (assessmentType ? mapAssessmentTypeToKind(assessmentType) : 'unknown');

  if (!analysis || resolvedKind === 'unknown') {
    return null;
  }

  return (
    <FrameworkResultsPanel
      kind={resolvedKind}
      analysis={analysis}
      readableMarkdown={readableMarkdown}
      defaultExpanded={defaultExpanded}
    />
  );
}

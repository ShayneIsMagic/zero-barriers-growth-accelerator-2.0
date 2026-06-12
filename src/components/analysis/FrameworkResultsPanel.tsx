'use client';

import { MarkdownFallbackViewer } from '@/components/analysis/MarkdownFallbackViewer';
import { BrandArchetypeResultsPanel } from '@/components/analysis/BrandArchetypeResultsPanel';
import { CliftonThemeResultsPanel } from '@/components/analysis/CliftonThemeResultsPanel';
import { ElementsValueResultsPanel } from '@/components/analysis/ElementsValueResultsPanel';
import { GoldenCircleResultsPanel } from '@/components/analysis/GoldenCircleResultsPanel';
import { RevenueTrendsResultsPanel } from '@/components/analysis/RevenueTrendsResultsPanel';
import type { FrameworkResultKind } from '@/lib/framework/framework-results-adapter';

interface FrameworkResultsPanelProps {
  kind: FrameworkResultKind;
  analysis: Record<string, unknown> | null | undefined;
  readableMarkdown?: string;
  defaultExpanded?: boolean;
}

export function FrameworkResultsPanel({
  kind,
  analysis,
  readableMarkdown,
  defaultExpanded = false,
}: FrameworkResultsPanelProps) {
  if (analysis?._isFallback && typeof analysis.fallbackMarkdown === 'string') {
    return (
      <MarkdownFallbackViewer
        frameworkName={kind}
        markdownContent={analysis.fallbackMarkdown}
        errorMessage={
          typeof analysis.error === 'string' ? analysis.error : undefined
        }
      />
    );
  }

  switch (kind) {
    case 'b2b-elements':
      return (
        <ElementsValueResultsPanel
          framework="b2b"
          analysis={analysis}
          defaultExpanded={defaultExpanded}
        />
      );
    case 'b2c-elements':
      return (
        <ElementsValueResultsPanel
          framework="b2c"
          analysis={analysis}
          defaultExpanded={defaultExpanded}
        />
      );
    case 'clifton-strengths':
      return <CliftonThemeResultsPanel analysis={analysis} />;
    case 'brand-archetypes':
      return <BrandArchetypeResultsPanel analysis={analysis} />;
    case 'golden-circle':
      return (
        <GoldenCircleResultsPanel
          analysis={analysis}
          defaultExpanded={defaultExpanded}
        />
      );
    case 'revenue-trends':
      return (
        <RevenueTrendsResultsPanel
          analysis={analysis}
          defaultExpanded={defaultExpanded}
        />
      );
    case 'unknown':
    default:
      if (readableMarkdown) {
        return (
          <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
            {readableMarkdown}
          </pre>
        );
      }
      if (analysis && typeof analysis.chunkedReport === 'string') {
        return (
          <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
            {analysis.chunkedReport}
          </pre>
        );
      }
      return (
        <p className="text-sm text-muted-foreground">
          No structured preview available for this report type.
        </p>
      );
  }
}

'use client';

import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import {
  formatFractionalScore,
  formatFractionalScoreDecimal,
  getFractionalScoreBadgeVariant,
  getFractionalScoreTextClass,
} from '@/lib/framework/elements-value-display';
import {
  parseGoldenCircleAnalysis,
  type GoldenCircleDimensionDetail,
  type GoldenCircleLayerView,
} from '@/lib/framework/golden-circle-display';
import { Target, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface GoldenCircleResultsPanelProps {
  analysis: Record<string, unknown> | null | undefined;
  defaultExpanded?: boolean;
  variant?: 'full' | 'recommendations';
}

export function GoldenCircleResultsPanel({
  analysis,
  defaultExpanded = false,
  variant = 'full',
}: GoldenCircleResultsPanelProps) {
  const view = useMemo(
    () =>
      analysis && typeof analysis === 'object'
        ? parseGoldenCircleAnalysis(analysis)
        : null,
    [analysis]
  );

  if (!view) {
    return null;
  }

  const improvementItems = view.allDimensionsRanked.filter(
    (item) => item.recommendation && item.recommendation !== 'No recommendation'
  );

  if (variant === 'recommendations') {
    if (improvementItems.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No dimension-level recommendations in this analysis.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {improvementItems.map((item) => (
          <DimensionRow key={item.elementKey} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Golden Circle (Simon Sinek)</span>
          <Badge variant="secondary">
            Overall {formatFractionalScoreDecimal(view.overallScore)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {view.totalDimensions} dimensions analyzed
          </span>
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall score</span>
            <span className={getFractionalScoreTextClass(view.overallScore)}>
              {formatFractionalScore(view.overallScore)}
            </span>
          </div>
          <Progress
            value={Math.round(view.overallScore * 100)}
            className="h-2"
          />
        </div>
      </div>

      {view.topStrengths.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h4 className="text-sm font-semibold">Top strengths</h4>
          </div>
          <div className="space-y-2">
            {view.topStrengths.map((item) => (
              <div
                key={item.elementKey}
                className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/40"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.displayName}</span>
                  <Badge variant={getFractionalScoreBadgeVariant(item.score)}>
                    {formatFractionalScoreDecimal(item.score)}
                  </Badge>
                  <Badge variant="outline">{item.layerName}</Badge>
                </div>
                {item.evidence ? (
                  <p className="text-xs text-muted-foreground">{item.evidence}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Circle breakdown</h4>
        <p className="text-xs text-muted-foreground">
          WHY → HOW → WHAT → WHO layers ranked by score within each ring.
        </p>
        <Accordion
          type="multiple"
          defaultValue={
            defaultExpanded
              ? view.layers.map((layer) => layer.layerKey)
              : view.layers.slice(0, 1).map((layer) => layer.layerKey)
          }
          className="rounded-lg border px-4"
        >
          {view.layers.map((layer) => (
            <LayerAccordionItem key={layer.layerKey} layer={layer} />
          ))}
        </Accordion>
      </section>

      {improvementItems.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold">Recommendations</h4>
          <div className="space-y-2">
            {improvementItems.slice(0, 8).map((item) => (
              <DimensionRow key={item.elementKey} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function LayerAccordionItem({ layer }: { layer: GoldenCircleLayerView }) {
  return (
    <AccordionItem value={layer.layerKey}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-1 items-center justify-between gap-3 pr-2 text-left">
          <span className="font-medium">{layer.layerName}</span>
          <span
            className={`text-sm ${getFractionalScoreTextClass(layer.layerScore)}`}
          >
            {formatFractionalScoreDecimal(layer.layerScore)}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pb-2">
          {layer.dimensions.map((dimension) => (
            <DimensionRow key={dimension.elementKey} item={dimension} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function DimensionRow({ item }: { item: GoldenCircleDimensionDetail }) {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{item.displayName}</span>
        <Badge variant={getFractionalScoreBadgeVariant(item.score)}>
          {formatFractionalScoreDecimal(item.score)}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Evidence: </span>
        {item.evidence}
      </p>
      {item.recommendation && item.recommendation !== 'No recommendation' ? (
        <p className="mt-2 text-xs">
          <span className="font-medium">Recommendation: </span>
          {item.recommendation}
        </p>
      ) : null}
    </div>
  );
}

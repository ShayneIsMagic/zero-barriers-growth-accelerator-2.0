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
  parseRevenueTrendsAnalysis,
  type RevenueCategoryView,
  type RevenueSignalDetail,
} from '@/lib/framework/revenue-trends-display';
import { VocabularyDefinitionHint } from '@/components/analysis/VocabularyDefinitionHint';
import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

const VOCABULARY_FRAMEWORK_KEY = 'revenue-trends' as const;

interface RevenueTrendsResultsPanelProps {
  analysis: Record<string, unknown> | null | undefined;
  defaultExpanded?: boolean;
  variant?: 'full' | 'recommendations';
}

export function RevenueTrendsResultsPanel({
  analysis,
  defaultExpanded = false,
  variant = 'full',
}: RevenueTrendsResultsPanelProps) {
  const view = useMemo(
    () =>
      analysis && typeof analysis === 'object'
        ? parseRevenueTrendsAnalysis(analysis)
        : null,
    [analysis]
  );

  if (!view) {
    return null;
  }

  const improvementItems = view.allSignalsRanked.filter(
    (item) => item.recommendation && item.recommendation !== 'No recommendation'
  );

  if (variant === 'recommendations') {
    if (improvementItems.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No signal-level recommendations in this analysis.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {improvementItems.map((item) => (
          <SignalRow key={`${item.categoryKey}:${item.slug}`} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Revenue Trends</span>
          <Badge variant="secondary">
            Overall {formatFractionalScoreDecimal(view.overallScore)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {view.totalSignals} revenue signals analyzed
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
            <h4 className="text-sm font-semibold">Top revenue signals</h4>
          </div>
          <div className="space-y-2">
            {view.topStrengths.map((item) => (
              <div
                key={`${item.categoryKey}:${item.slug}`}
                className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/40"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.displayName}</span>
                  <VocabularyDefinitionHint
                    frameworkKey={VOCABULARY_FRAMEWORK_KEY}
                    elementKey={item.slug}
                  />
                  <Badge variant={getFractionalScoreBadgeVariant(item.score)}>
                    {formatFractionalScoreDecimal(item.score)}
                  </Badge>
                  <Badge variant="outline">{item.categoryName}</Badge>
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
        <h4 className="text-sm font-semibold">Category breakdown</h4>
        <p className="text-xs text-muted-foreground">
          Market signals, monetization, and growth categories ranked by score.
        </p>
        <Accordion
          type="multiple"
          defaultValue={
            defaultExpanded
              ? view.categories.map((category) => category.categoryKey)
              : view.categories.slice(0, 1).map((category) => category.categoryKey)
          }
          className="rounded-lg border px-4"
        >
          {view.categories.map((category) => (
            <CategoryAccordionItem key={category.categoryKey} category={category} />
          ))}
        </Accordion>
      </section>

      {improvementItems.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold">Recommendations</h4>
          <div className="space-y-2">
            {improvementItems.slice(0, 8).map((item) => (
              <SignalRow key={`${item.categoryKey}:${item.slug}`} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CategoryAccordionItem({ category }: { category: RevenueCategoryView }) {
  return (
    <AccordionItem value={category.categoryKey}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-1 items-center justify-between gap-3 pr-2 text-left">
          <span className="font-medium">{category.categoryName}</span>
          <VocabularyDefinitionHint
            frameworkKey={VOCABULARY_FRAMEWORK_KEY}
            elementKey={category.categoryKey}
            categoryKey={category.categoryKey}
          />
          <span
            className={`text-sm ${getFractionalScoreTextClass(category.categoryScore)}`}
          >
            {formatFractionalScoreDecimal(category.categoryScore)}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pb-2">
          {category.signals.map((signal) => (
            <SignalRow key={`${category.categoryKey}:${signal.slug}`} item={signal} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function SignalRow({ item }: { item: RevenueSignalDetail }) {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{item.displayName}</span>
        <VocabularyDefinitionHint
          frameworkKey={VOCABULARY_FRAMEWORK_KEY}
          elementKey={item.slug}
        />
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

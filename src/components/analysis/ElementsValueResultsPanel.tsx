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
  type ElementsValueAnalysisPayload,
  type ElementsValueCategoryView,
  type ElementsValueElementDetail,
  type ElementsValueFramework,
  type ElementsValueStrength,
  formatFractionalScore,
  formatFractionalScoreDecimal,
  getFractionalScoreBadgeVariant,
  getFractionalScoreTextClass,
  parseElementsValueAnalysis,
} from '@/lib/framework/elements-value-display';
import type { B2BPyramidDiagnostics } from '@/lib/framework/b2b-taxonomy';
import { TrendingUp, Target } from 'lucide-react';

interface ElementsValueResultsPanelProps {
  framework: ElementsValueFramework;
  analysis: ElementsValueAnalysisPayload | Record<string, unknown> | null | undefined;
  /** When true, category accordions start expanded */
  defaultExpanded?: boolean;
  /** Limit which sections render */
  variant?: 'full' | 'recommendations';
}

export function ElementsValueResultsPanel({
  framework,
  analysis,
  defaultExpanded = false,
  variant = 'full',
}: ElementsValueResultsPanelProps) {
  const view = parseElementsValueAnalysis(
    framework,
    analysis as ElementsValueAnalysisPayload | null | undefined
  );

  if (!view) {
    return null;
  }

  const frameworkLabel =
    framework === 'b2b'
      ? 'B2B Elements of Value'
      : 'B2C Elements of Value';

  const improvementItems = [...view.allElementsRanked]
    .filter((item) => item.recommendation && item.recommendation !== 'No recommendation')
    .sort((a, b) => a.score - b.score);

  if (variant === 'recommendations') {
    if (improvementItems.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No element-level recommendations in this analysis.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Sorted by element score — lower scores surface first as natural improvement areas.
        </p>
        <div className="space-y-2">
          {improvementItems.map((item) => (
            <RecommendationRow key={item.slug} item={item} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{frameworkLabel}</span>
          <Badge variant="secondary">
            Overall {formatFractionalScoreDecimal(view.overallScore)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {view.totalElements} elements analyzed
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
            {view.topStrengths.map((strength) => (
              <StrengthCard key={`${strength.category}-${strength.element}`} strength={strength} />
            ))}
          </div>
        </section>
      )}

      {framework === 'b2b' && view.pyramidDiagnostics?.primaryDrillDown && (
        <PyramidDrillDownSection diagnostics={view.pyramidDiagnostics} />
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">
          {framework === 'b2b' ? 'Pyramid breakdown' : 'Category breakdown'}
        </h4>
        <p className="text-xs text-muted-foreground">
          Categories ranked by score. Lower scores indicate opportunity areas.
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
            <CategoryAccordionItem
              key={category.categoryKey}
              category={category}
            />
          ))}
        </Accordion>
      </section>

      {improvementItems.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold">Recommendations</h4>
          <p className="text-xs text-muted-foreground">
            Sorted by element score — lower scores surface first as natural improvement areas.
          </p>
          <div className="space-y-2">
            {improvementItems.slice(0, 10).map((item) => (
              <RecommendationRow key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}

      <details className="rounded-lg border">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          All elements ranked ({view.allElementsRanked.length})
        </summary>
        <div className="grid gap-2 border-t p-4 sm:grid-cols-2">
          {view.allElementsRanked.map((item, index) => (
            <div
              key={item.slug}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>
                {index + 1}. {item.displayName}
              </span>
              <Badge variant={getFractionalScoreBadgeVariant(item.score)}>
                {formatFractionalScoreDecimal(item.score)}
              </Badge>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

interface StrengthCardProps {
  strength: ElementsValueStrength;
}

function StrengthCard({ strength }: StrengthCardProps) {
  const location = strength.subcategoryLabel
    ? `${strength.categoryLabel} → ${strength.subcategoryLabel}`
    : strength.categoryLabel;

  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/40">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="font-medium">{strength.displayName}</span>
        <Badge variant={getFractionalScoreBadgeVariant(strength.score)}>
          {formatFractionalScoreDecimal(strength.score)}
        </Badge>
        <Badge variant="outline">{location}</Badge>
      </div>
      {strength.evidence ? (
        <p className="text-xs text-muted-foreground">{strength.evidence}</p>
      ) : null}
    </div>
  );
}

interface CategoryAccordionItemProps {
  category: ElementsValueCategoryView;
}

function CategoryAccordionItem({ category }: CategoryAccordionItemProps) {
  return (
    <AccordionItem value={category.categoryKey}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-1 items-center justify-between gap-3 pr-2 text-left">
          <div className="space-y-1">
            <span className="font-medium">{category.categoryName}</span>
            {category.weakestSubcategoryName ? (
              <p className="text-xs font-normal text-muted-foreground">
                Weakest: {category.weakestSubcategoryName} (
                {formatFractionalScoreDecimal(category.weakestSubcategoryScore ?? 0)})
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {category.strengthLabel ? (
              <Badge variant="outline">{category.strengthLabel}</Badge>
            ) : null}
            <span
              className={`text-sm ${getFractionalScoreTextClass(category.categoryScore)}`}
            >
              {formatFractionalScore(category.categoryScore)}
            </span>
            <Badge variant="outline">{category.elementCount} elements</Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pb-4">
        {category.subcategories ? (
          category.subcategories.map((subcategory) => (
            <div key={subcategory.subcategoryKey} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h5 className="text-sm font-medium">{subcategory.subcategoryName}</h5>
                  <p className="text-xs text-muted-foreground">
                    {subcategory.presentCount ?? 0} present · {subcategory.weakCount ?? 0} weak
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {subcategory.strengthLabel ? (
                    <Badge variant="outline">{subcategory.strengthLabel}</Badge>
                  ) : null}
                  <Badge variant="secondary">
                    {formatFractionalScoreDecimal(subcategory.subcategoryScore)}
                  </Badge>
                </div>
              </div>
              <ElementList elements={subcategory.elements} />
            </div>
          ))
        ) : (
          <ElementList elements={category.elements ?? []} />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

interface PyramidDrillDownSectionProps {
  diagnostics: B2BPyramidDiagnostics;
}

function PyramidDrillDownSection({ diagnostics }: PyramidDrillDownSectionProps) {
  const primary = diagnostics.primaryDrillDown;
  if (!primary) {
    return null;
  }

  const location = primary.subcategoryName
    ? `${primary.categoryName} → ${primary.subcategoryName}`
    : primary.categoryName;

  return (
    <section className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-amber-700 dark:text-amber-400" />
        <h4 className="text-sm font-semibold">Priority drill-down</h4>
      </div>
      <p className="text-xs text-muted-foreground">{primary.reason}</p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline">
          Weakest tier: {diagnostics.weakestTier.categoryName} (
          {formatFractionalScoreDecimal(diagnostics.weakestTier.categoryScore)})
        </Badge>
        <Badge variant="secondary">{location}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {primary.elementDisplayNames.map((name, index) => (
          <Badge key={`${primary.elementSlugs[index]}-${name}`} variant="destructive">
            {name}
          </Badge>
        ))}
      </div>
      {diagnostics.tierDrillDowns.length > 1 ? (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">
            {diagnostics.tierDrillDowns.length - 1} additional weak tier
            {diagnostics.tierDrillDowns.length - 1 === 1 ? '' : 's'}
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {diagnostics.tierDrillDowns.slice(1).map((target) => (
              <li key={`${target.categoryKey}-${target.subcategoryKey ?? 'flat'}`}>
                {target.categoryName}
                {target.subcategoryName ? ` → ${target.subcategoryName}` : ''}:{' '}
                {target.elementDisplayNames.join(', ')}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

interface ElementListProps {
  elements: ElementsValueElementDetail[];
}

function ElementList({ elements }: ElementListProps) {
  return (
    <div className="space-y-2">
      {elements.map((element) => (
        <div
          key={element.slug}
          className="rounded-md border bg-background p-3 text-sm"
        >
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-medium">{element.displayName}</span>
            <Badge variant={getFractionalScoreBadgeVariant(element.score)}>
              {formatFractionalScoreDecimal(element.score)}
            </Badge>
          </div>
          {element.evidence ? (
            <p className="text-xs text-muted-foreground">{element.evidence}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

interface RecommendationRowProps {
  item: ElementsValueElementDetail;
}

function RecommendationRow({ item }: RecommendationRowProps) {
  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="font-medium">{item.displayName}</span>
        <Badge variant={getFractionalScoreBadgeVariant(item.score)}>
          {formatFractionalScoreDecimal(item.score)}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{item.recommendation}</p>
    </div>
  );
}

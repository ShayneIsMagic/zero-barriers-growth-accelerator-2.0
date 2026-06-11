/**
 * Display helpers for B2B/B2C Elements of Value analysis payloads.
 * Scores are fractional 0.0–1.0 from chunked analysis and Flask evaluation.
 */

import {
  B2B_ELEMENT_DISPLAY_NAMES,
  type B2BCategoryBreakdown,
  type B2BElementScore,
  type B2BPyramidDiagnostics,
  type B2BSubcategoryBreakdown,
} from '@/lib/framework/b2b-taxonomy';
import {
  B2C_ELEMENT_DISPLAY_NAMES,
  type B2CCategoryBreakdown,
  type B2CElementScore,
} from '@/lib/framework/b2c-taxonomy';

export type ElementsValueFramework = 'b2b' | 'b2c';

export interface ElementsValueElementDetail {
  slug: string;
  displayName: string;
  score: number;
  evidence: string;
  recommendation: string;
}

export interface ElementsValueStrength {
  element: string;
  displayName: string;
  category: string;
  categoryLabel: string;
  subcategory?: string;
  subcategoryLabel?: string;
  score: number;
  evidence: string;
}

export interface ElementsValueSubcategoryView {
  subcategoryKey: string;
  subcategoryName: string;
  subcategoryScore: number;
  strengthLabel?: string;
  presentCount?: number;
  weakCount?: number;
  rank?: number;
  elements: ElementsValueElementDetail[];
}

export interface ElementsValueCategoryView {
  categoryKey: string;
  categoryName: string;
  categoryScore: number;
  strengthLabel?: string;
  elementCount: number;
  weakestSubcategoryKey?: string;
  weakestSubcategoryName?: string;
  weakestSubcategoryScore?: number;
  elements?: ElementsValueElementDetail[];
  subcategories?: ElementsValueSubcategoryView[];
}

export interface ElementsValueAnalysisView {
  framework: ElementsValueFramework;
  overallScore: number;
  totalElements: number;
  topStrengths: ElementsValueStrength[];
  categories: ElementsValueCategoryView[];
  allElementsRanked: ElementsValueElementDetail[];
  pyramidDiagnostics?: B2BPyramidDiagnostics;
}

export interface ElementsValueAnalysisPayload {
  overallScore?: number;
  totalElements?: number;
  categories?: Record<string, unknown>;
  topStrengths?: Array<Record<string, unknown>>;
  criticalGaps?: Array<Record<string, unknown>>;
  pyramidDiagnostics?: B2BPyramidDiagnostics;
  _isFallback?: boolean;
  fallbackMarkdown?: string;
  error?: string;
}

/** Normalize 0–1 fractional scores; legacy 0–100 inputs are scaled down. */
export function normalizeFractionalScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }
  return score > 1 ? score / 100 : score;
}

export function formatFractionalScore(score: number): string {
  const normalized = normalizeFractionalScore(score);
  return `${Math.round(normalized * 100)}%`;
}

export function formatFractionalScoreDecimal(score: number): string {
  return normalizeFractionalScore(score).toFixed(3);
}

export function getFractionalScoreTextClass(score: number): string {
  const normalized = normalizeFractionalScore(score);
  if (normalized >= 0.7) {
    return 'text-green-600 dark:text-green-400';
  }
  if (normalized >= 0.5) {
    return 'text-yellow-600 dark:text-yellow-400';
  }
  return 'text-red-600 dark:text-red-400';
}

export function getFractionalScoreBadgeVariant(
  score: number
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const normalized = normalizeFractionalScore(score);
  if (normalized >= 0.7) {
    return 'default';
  }
  if (normalized >= 0.5) {
    return 'secondary';
  }
  return 'destructive';
}

function getElementDisplayName(
  framework: ElementsValueFramework,
  slug: string
): string {
  if (framework === 'b2b') {
    return B2B_ELEMENT_DISPLAY_NAMES[slug] ?? slug.replace(/_/g, ' ');
  }
  return B2C_ELEMENT_DISPLAY_NAMES[slug] ?? slug.replace(/_/g, ' ');
}

function parseElementDetail(
  framework: ElementsValueFramework,
  slug: string,
  raw: unknown
): ElementsValueElementDetail {
  const detail = (raw ?? {}) as Partial<B2BElementScore | B2CElementScore>;
  return {
    slug,
    displayName: getElementDisplayName(framework, slug),
    score: normalizeFractionalScore(
      typeof detail.score === 'number' ? detail.score : 0
    ),
    evidence:
      typeof detail.evidence === 'string' ? detail.evidence : 'Not evaluated',
    recommendation:
      typeof detail.recommendation === 'string'
        ? detail.recommendation
        : 'No recommendation',
  };
}

function sortElementsByScoreDesc(
  elements: ElementsValueElementDetail[]
): ElementsValueElementDetail[] {
  return [...elements].sort((a, b) => b.score - a.score);
}

function parseB2BCategory(
  categoryKey: string,
  raw: unknown
): ElementsValueCategoryView {
  const category = raw as B2BCategoryBreakdown;
  const categoryName =
    typeof category.categoryName === 'string'
      ? category.categoryName
      : categoryKey.replace(/_/g, ' ');

  if (category.subcategories) {
    const subcategories: ElementsValueSubcategoryView[] = Object.entries(
      category.subcategories
    )
      .map(([subcategoryKey, subRaw]) => {
        const sub = subRaw as B2BSubcategoryBreakdown;
        const elements = sortElementsByScoreDesc(
          Object.entries(sub.elements ?? {}).map(([slug, detail]) =>
            parseElementDetail('b2b', slug, detail)
          )
        );
        return {
          subcategoryKey,
          subcategoryName:
            sub.subcategoryName ?? subcategoryKey.replace(/_/g, ' '),
          subcategoryScore: normalizeFractionalScore(sub.subcategoryScore ?? 0),
          strengthLabel:
            typeof sub.strengthLabel === 'string' ? sub.strengthLabel : undefined,
          presentCount:
            typeof sub.presentCount === 'number' ? sub.presentCount : undefined,
          weakCount: typeof sub.weakCount === 'number' ? sub.weakCount : undefined,
          rank: typeof sub.rank === 'number' ? sub.rank : undefined,
          elements,
        };
      })
      .sort((a, b) => b.subcategoryScore - a.subcategoryScore);

    return {
      categoryKey,
      categoryName,
      categoryScore: normalizeFractionalScore(category.categoryScore ?? 0),
      strengthLabel:
        typeof category.strengthLabel === 'string'
          ? category.strengthLabel
          : undefined,
      elementCount: category.elementCount ?? 0,
      weakestSubcategoryKey:
        typeof category.weakestSubcategoryKey === 'string'
          ? category.weakestSubcategoryKey
          : undefined,
      weakestSubcategoryName:
        typeof category.weakestSubcategoryName === 'string'
          ? category.weakestSubcategoryName
          : undefined,
      weakestSubcategoryScore:
        typeof category.weakestSubcategoryScore === 'number'
          ? normalizeFractionalScore(category.weakestSubcategoryScore)
          : undefined,
      subcategories,
    };
  }

  const elements = sortElementsByScoreDesc(
    Object.entries(category.elements ?? {}).map(([slug, detail]) =>
      parseElementDetail('b2b', slug, detail)
    )
  );

  return {
    categoryKey,
    categoryName,
    categoryScore: normalizeFractionalScore(category.categoryScore ?? 0),
    strengthLabel:
      typeof category.strengthLabel === 'string' ? category.strengthLabel : undefined,
    elementCount: category.elementCount ?? elements.length,
    elements,
  };
}

function parseB2CCategory(
  categoryKey: string,
  raw: unknown
): ElementsValueCategoryView {
  const category = raw as B2CCategoryBreakdown;
  const elements = sortElementsByScoreDesc(
    Object.entries(category.elements ?? {}).map(([slug, detail]) =>
      parseElementDetail('b2c', slug, detail)
    )
  );

  return {
    categoryKey,
    categoryName:
      typeof category.categoryName === 'string'
        ? category.categoryName
        : categoryKey.replace(/_/g, ' '),
    categoryScore: normalizeFractionalScore(category.categoryScore ?? 0),
    elementCount: category.elementCount ?? elements.length,
    elements,
  };
}

function flattenCategoryElements(
  category: ElementsValueCategoryView
): ElementsValueElementDetail[] {
  if (category.elements) {
    return category.elements;
  }
  return (category.subcategories ?? []).flatMap((sub) => sub.elements);
}

function buildTopStrengths(
  framework: ElementsValueFramework,
  payload: ElementsValueAnalysisPayload,
  categories: ElementsValueCategoryView[]
): ElementsValueStrength[] {
  const fromApi = payload.topStrengths ?? [];
  if (fromApi.length > 0) {
    return fromApi.map((item) => {
      const element = String(item.element ?? '');
      const categoryKey = String(item.category ?? '');
      const category = categories.find((c) => c.categoryKey === categoryKey);
      const subcategoryKey =
        typeof item.subcategory === 'string' ? item.subcategory : undefined;
      const subcategory = category?.subcategories?.find(
        (s) => s.subcategoryKey === subcategoryKey
      );

      return {
        element,
        displayName: getElementDisplayName(framework, element),
        category: categoryKey,
        categoryLabel: category?.categoryName ?? categoryKey,
        subcategory: subcategoryKey,
        subcategoryLabel: subcategory?.subcategoryName,
        score: normalizeFractionalScore(
          typeof item.score === 'number' ? item.score : 0
        ),
        evidence:
          typeof item.evidence === 'string' ? item.evidence : 'Not specified',
      };
    });
  }

  const ranked = categories
    .flatMap((category) =>
      flattenCategoryElements(category).map((detail) => ({
        element: detail.slug,
        displayName: detail.displayName,
        category: category.categoryKey,
        categoryLabel: category.categoryName,
        score: detail.score,
        evidence: detail.evidence,
      }))
    )
    .filter((item) => item.score >= 0.7)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return ranked;
}

export function parseElementsValueAnalysis(
  framework: ElementsValueFramework,
  payload: ElementsValueAnalysisPayload | null | undefined
): ElementsValueAnalysisView | null {
  if (!payload || payload._isFallback) {
    return null;
  }

  const rawCategories = payload.categories ?? {};
  const categories = Object.entries(rawCategories)
    .map(([categoryKey, raw]) =>
      framework === 'b2b'
        ? parseB2BCategory(categoryKey, raw)
        : parseB2CCategory(categoryKey, raw)
    )
    .sort((a, b) => b.categoryScore - a.categoryScore);

  const allElementsRanked = sortElementsByScoreDesc(
    categories.flatMap((category) => flattenCategoryElements(category))
  );

  const overallScore =
    typeof payload.overallScore === 'number'
      ? normalizeFractionalScore(payload.overallScore)
      : allElementsRanked.length > 0
        ? allElementsRanked.reduce((sum, item) => sum + item.score, 0) /
          allElementsRanked.length
        : 0;

  return {
    framework,
    overallScore,
    totalElements:
      payload.totalElements ?? allElementsRanked.length,
    topStrengths: buildTopStrengths(framework, payload, categories),
    categories,
    allElementsRanked,
    pyramidDiagnostics:
      framework === 'b2b' && payload.pyramidDiagnostics
        ? (payload.pyramidDiagnostics as B2BPyramidDiagnostics)
        : undefined,
  };
}

export function generateElementsValueMarkdown(
  framework: ElementsValueFramework,
  payload: ElementsValueAnalysisPayload,
  meta?: { url?: string; title?: string }
): string {
  const view = parseElementsValueAnalysis(framework, payload);
  if (!view) {
    return `# ${framework.toUpperCase()} Elements of Value Analysis\n\nNo structured analysis available.\n`;
  }

  const frameworkLabel =
    framework === 'b2b'
      ? 'B2B Elements of Value'
      : 'B2C Elements of Value';

  const strengthLines = view.topStrengths
    .map(
      (item, index) =>
        `### ${index + 1}. ${item.displayName} (${formatFractionalScoreDecimal(item.score)})
- **Category:** ${item.categoryLabel}${item.subcategoryLabel ? ` → ${item.subcategoryLabel}` : ''}
- **Evidence:** ${item.evidence}`
    )
    .join('\n\n');

  const categoryLines = view.categories
    .map((category) => {
      const header = `## ${category.categoryName} — ${formatFractionalScoreDecimal(category.categoryScore)}`;
      if (category.subcategories) {
        const subLines = category.subcategories
          .map((sub) => {
            const elementLines = sub.elements
              .map(
                (el) =>
                  `- **${el.displayName}** (${formatFractionalScoreDecimal(el.score)}): ${el.evidence}`
              )
              .join('\n');
            return `### ${sub.subcategoryName} — ${formatFractionalScoreDecimal(sub.subcategoryScore)}\n${elementLines}`;
          })
          .join('\n\n');
        return `${header}\n\n${subLines}`;
      }

      const elementLines = (category.elements ?? [])
        .map(
          (el) =>
            `- **${el.displayName}** (${formatFractionalScoreDecimal(el.score)}): ${el.evidence}`
        )
        .join('\n');
      return `${header}\n\n${elementLines}`;
    })
    .join('\n\n');

  return `# ${frameworkLabel} Analysis

**URL:** ${meta?.url ?? 'N/A'}
**Date:** ${new Date().toLocaleString()}
**Overall score:** ${formatFractionalScoreDecimal(view.overallScore)} (${formatFractionalScore(view.overallScore)})
**Elements analyzed:** ${view.totalElements}

---

## Top strengths

${strengthLines || '_No elements scored at or above 0.7._'}

---

## Value breakdown (ranked by category score)

${categoryLines}

---

## All elements (ranked by score)

${view.allElementsRanked
  .map(
    (el, index) =>
      `${index + 1}. **${el.displayName}** — ${formatFractionalScoreDecimal(el.score)}`
  )
  .join('\n')}
`;
}

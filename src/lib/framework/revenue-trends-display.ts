/**
 * Display helpers for Revenue Trends (16 signals across 5 categories).
 */

import {
  normalizeFractionalScore,
  type ElementsValueElementDetail,
} from '@/lib/framework/elements-value-display';

export interface RevenueSignalDetail extends ElementsValueElementDetail {
  categoryKey: string;
  categoryName: string;
}

export interface RevenueCategoryView {
  categoryKey: string;
  categoryName: string;
  categoryScore: number;
  signalCount: number;
  signals: RevenueSignalDetail[];
}

export interface RevenueTrendsAnalysisView {
  overallScore: number;
  totalSignals: number;
  topStrengths: RevenueSignalDetail[];
  categories: RevenueCategoryView[];
  allSignalsRanked: RevenueSignalDetail[];
}

interface SignalScore {
  score: number;
  evidence: string;
  recommendation: string;
}

const REVENUE_CATEGORY_ORDER = [
  { key: 'market_signals', name: 'Market Signals' },
  { key: 'competitive_position', name: 'Competitive Position' },
  { key: 'monetization', name: 'Monetization' },
  { key: 'growth_retention', name: 'Growth & Retention' },
  { key: 'channel_content', name: 'Channel & Content' },
] as const;

const SIGNAL_DISPLAY_NAMES: Record<string, string> = {
  market_demand: 'Market demand',
  trending_keywords: 'Trending keywords',
  seasonal_patterns: 'Seasonal patterns',
  competitor_gaps: 'Competitor gaps',
  emerging_opportunities: 'Emerging opportunities',
  price_sensitivity: 'Price sensitivity',
  conversion_potential: 'Conversion potential',
  upsell_opportunities: 'Upsell opportunities',
  cross_sell_potential: 'Cross-sell potential',
  customer_segments: 'Customer segments',
  retention_strategies: 'Retention strategies',
  expansion_opportunities: 'Expansion opportunities',
  partnership_potential: 'Partnership potential',
  content_gaps: 'Content gaps',
  seo_opportunities: 'SEO opportunities',
  social_media_trends: 'Social media trends',
};

function parseSignalDetail(
  categoryKey: string,
  categoryName: string,
  slug: string,
  raw: unknown
): RevenueSignalDetail {
  const detail = (raw ?? {}) as Partial<SignalScore>;
  return {
    slug,
    categoryKey,
    categoryName,
    displayName: SIGNAL_DISPLAY_NAMES[slug] ?? slug.replace(/_/g, ' '),
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

function isSignalMap(value: unknown): value is Record<string, SignalScore> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return Object.values(value).every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      typeof (entry as SignalScore).score === 'number'
  );
}

export function parseRevenueTrendsAnalysis(
  analysis: Record<string, unknown> | null | undefined
): RevenueTrendsAnalysisView | null {
  if (!analysis || typeof analysis !== 'object') {
    return null;
  }

  const categoriesRaw = analysis.categories;
  if (!categoriesRaw || typeof categoriesRaw !== 'object') {
    return null;
  }

  const categories: RevenueCategoryView[] = [];
  const allSignalsRanked: RevenueSignalDetail[] = [];

  for (const categoryMeta of REVENUE_CATEGORY_ORDER) {
    const categoryRaw = (categoriesRaw as Record<string, unknown>)[
      categoryMeta.key
    ];
    if (!categoryRaw || typeof categoryRaw !== 'object') {
      continue;
    }

    const category = categoryRaw as {
      categoryName?: string;
      categoryScore?: number;
      elementCount?: number;
      elements?: unknown;
    };

    if (!isSignalMap(category.elements)) {
      continue;
    }

    const categoryName =
      typeof category.categoryName === 'string'
        ? category.categoryName
        : categoryMeta.name;

    const signals = Object.entries(category.elements)
      .map(([slug, detail]) =>
        parseSignalDetail(categoryMeta.key, categoryName, slug, detail)
      )
      .sort((a, b) => b.score - a.score);

    allSignalsRanked.push(...signals);

    const categoryScore =
      typeof category.categoryScore === 'number'
        ? normalizeFractionalScore(category.categoryScore)
        : signals.length > 0
          ? parseFloat(
              (
                signals.reduce((sum, item) => sum + item.score, 0) /
                signals.length
              ).toFixed(3)
            )
          : 0;

    categories.push({
      categoryKey: categoryMeta.key,
      categoryName,
      categoryScore,
      signalCount: category.elementCount ?? signals.length,
      signals,
    });
  }

  if (allSignalsRanked.length === 0) {
    return null;
  }

  allSignalsRanked.sort((a, b) => b.score - a.score);

  const overallScore =
    typeof analysis.overallScore === 'number'
      ? normalizeFractionalScore(analysis.overallScore)
      : parseFloat(
          (
            allSignalsRanked.reduce((sum, item) => sum + item.score, 0) /
            allSignalsRanked.length
          ).toFixed(3)
        );

  const totalSignals =
    typeof analysis.totalElements === 'number'
      ? analysis.totalElements
      : allSignalsRanked.length;

  return {
    overallScore,
    totalSignals,
    topStrengths: allSignalsRanked.slice(0, 5),
    categories,
    allSignalsRanked,
  };
}

export function generateRevenueTrendsMarkdown(
  result: Record<string, unknown>
): string {
  const analysis =
    (result.analysis as Record<string, unknown> | undefined) ??
    (result.comparison as Record<string, unknown> | undefined);
  const view = analysis ? parseRevenueTrendsAnalysis(analysis) : null;
  const existing = result.existing as Record<string, unknown> | undefined;

  let body = `# Revenue Trends Analysis

**URL:** ${String(result.url ?? 'N/A')}
**Date:** ${new Date().toLocaleString()}
**Overall score:** ${view ? view.overallScore.toFixed(3) : 'N/A'}

---

`;

  if (view) {
    for (const category of view.categories) {
      body += `## ${category.categoryName} (${category.categoryScore.toFixed(3)})\n\n`;
      for (const signal of category.signals) {
        body += `### ${signal.displayName} — ${signal.score.toFixed(3)}\n`;
        body += `**Evidence:** ${signal.evidence}\n\n`;
        body += `**Recommendation:** ${signal.recommendation}\n\n`;
      }
    }
  } else if (analysis) {
    body += `\`\`\`json\n${JSON.stringify(analysis, null, 2)}\n\`\`\`\n`;
  }

  if (existing) {
    body += `\n---\n\n## Existing Content\n\n**Title:** ${String(existing.title ?? 'N/A')}\n`;
  }

  return body;
}

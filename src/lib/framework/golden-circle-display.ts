/**
 * Display helpers for Golden Circle (24 dimensions across WHY/HOW/WHAT/WHO).
 */

import { GOLDEN_CIRCLE_CHUNK_CONFIG } from '@/lib/framework/chunk-definitions';
import {
  normalizeFractionalScore,
  type ElementsValueElementDetail,
} from '@/lib/framework/elements-value-display';

export interface GoldenCircleDimensionDetail extends ElementsValueElementDetail {
  elementKey: string;
  layerKey: string;
  layerName: string;
}

export interface GoldenCircleLayerView {
  layerKey: string;
  layerName: string;
  layerScore: number;
  dimensionCount: number;
  dimensions: GoldenCircleDimensionDetail[];
}

export interface GoldenCircleAnalysisView {
  overallScore: number;
  totalDimensions: number;
  topStrengths: GoldenCircleDimensionDetail[];
  layers: GoldenCircleLayerView[];
  allDimensionsRanked: GoldenCircleDimensionDetail[];
}

interface DimensionScore {
  score: number;
  evidence: string;
  recommendation: string;
}

const LAYER_ORDER = ['why', 'how', 'what', 'who'] as const;

const DIMENSION_DISPLAY_NAMES: Record<string, string> = (() => {
  const names: Record<string, string> = {};
  for (const chunk of GOLDEN_CIRCLE_CHUNK_CONFIG.chunks) {
    for (const slug of chunk.elements) {
      const key = `${chunk.categoryKey}:${slug}`;
      names[key] =
        slug.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      names[slug] =
        names[key];
    }
  }
  return names;
})();

function parseDimensionDetail(
  layerKey: string,
  layerName: string,
  slug: string,
  raw: unknown
): GoldenCircleDimensionDetail {
  const detail = (raw ?? {}) as Partial<DimensionScore>;
  const elementKey = `${layerKey}:${slug}`;
  return {
    slug,
    elementKey,
    layerKey,
    layerName,
    displayName: DIMENSION_DISPLAY_NAMES[elementKey] ?? slug.replace(/_/g, ' '),
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

function isDimensionMap(value: unknown): value is Record<string, DimensionScore> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return Object.values(value).every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      typeof (entry as DimensionScore).score === 'number'
  );
}

export function parseGoldenCircleAnalysis(
  analysis: Record<string, unknown> | null | undefined
): GoldenCircleAnalysisView | null {
  if (!analysis || typeof analysis !== 'object') {
    return null;
  }

  const categories = analysis.categories;
  if (!categories || typeof categories !== 'object') {
    return null;
  }

  const layers: GoldenCircleLayerView[] = [];
  const allDimensionsRanked: GoldenCircleDimensionDetail[] = [];

  for (const layerKey of LAYER_ORDER) {
    const categoryRaw = (categories as Record<string, unknown>)[layerKey];
    if (!categoryRaw || typeof categoryRaw !== 'object') {
      continue;
    }

    const category = categoryRaw as {
      categoryName?: string;
      categoryScore?: number;
      elementCount?: number;
      elements?: unknown;
    };

    if (!isDimensionMap(category.elements)) {
      continue;
    }

    const layerName =
      typeof category.categoryName === 'string'
        ? category.categoryName
        : layerKey.toUpperCase();

    const dimensions = Object.entries(category.elements)
      .map(([slug, detail]) =>
        parseDimensionDetail(layerKey, layerName, slug, detail)
      )
      .sort((a, b) => b.score - a.score);

    allDimensionsRanked.push(...dimensions);

    const layerScore =
      typeof category.categoryScore === 'number'
        ? normalizeFractionalScore(category.categoryScore)
        : dimensions.length > 0
          ? parseFloat(
              (
                dimensions.reduce((sum, item) => sum + item.score, 0) /
                dimensions.length
              ).toFixed(3)
            )
          : 0;

    layers.push({
      layerKey,
      layerName,
      layerScore,
      dimensionCount: category.elementCount ?? dimensions.length,
      dimensions,
    });
  }

  if (allDimensionsRanked.length === 0) {
    return null;
  }

  allDimensionsRanked.sort((a, b) => b.score - a.score);

  const overallScore =
    typeof analysis.overallScore === 'number'
      ? normalizeFractionalScore(analysis.overallScore)
      : parseFloat(
          (
            allDimensionsRanked.reduce((sum, item) => sum + item.score, 0) /
            allDimensionsRanked.length
          ).toFixed(3)
        );

  const totalDimensions =
    typeof analysis.totalElements === 'number'
      ? analysis.totalElements
      : allDimensionsRanked.length;

  return {
    overallScore,
    totalDimensions,
    topStrengths: allDimensionsRanked.slice(0, 5),
    layers,
    allDimensionsRanked,
  };
}

export function generateGoldenCircleMarkdown(
  result: Record<string, unknown>
): string {
  const analysis =
    (result.analysis as Record<string, unknown> | undefined) ??
    (result.comparison as Record<string, unknown> | undefined);
  const view = analysis ? parseGoldenCircleAnalysis(analysis) : null;
  const existing = result.existing as Record<string, unknown> | undefined;
  const proposed = result.proposed as Record<string, unknown> | undefined;

  let body = `# Golden Circle Analysis

**URL:** ${String(result.url ?? 'N/A')}
**Date:** ${new Date().toLocaleString()}
**Overall score:** ${view ? view.overallScore.toFixed(3) : 'N/A'}

---

`;

  if (view) {
    for (const layer of view.layers) {
      body += `## ${layer.layerName} (${layer.layerScore.toFixed(3)})\n\n`;
      for (const dimension of layer.dimensions) {
        body += `### ${dimension.displayName} — ${dimension.score.toFixed(3)}\n`;
        body += `**Evidence:** ${dimension.evidence}\n\n`;
        body += `**Recommendation:** ${dimension.recommendation}\n\n`;
      }
    }
  } else if (analysis) {
    body += `\`\`\`json\n${JSON.stringify(analysis, null, 2)}\n\`\`\`\n`;
  }

  if (existing) {
    body += `\n---\n\n## Existing Content\n\n**Title:** ${String(existing.title ?? 'N/A')}\n`;
  }

  if (proposed) {
    body += `\n## Proposed Content\n\n**Title:** ${String(proposed.title ?? 'N/A')}\n`;
  }

  return body;
}

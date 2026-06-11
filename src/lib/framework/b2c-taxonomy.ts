/**
 * B2C Elements of Value taxonomy — flat categories only (no subcategories).
 *
 * VALUE-FIRST PRINCIPLE: Each category is defined entirely by its value elements.
 * categoryScore = average of element scores in that category.
 * Diagnostic: weak category → evaluate the elements that define it.
 *
 * Human-readable doc: docs/frameworks/B2C-CATEGORY-TAXONOMY.md
 */

import { B2C_CHUNK_CONFIG } from '@/lib/framework/chunk-definitions';

export interface B2CElementScore {
  score: number;
  evidence: string;
  recommendation: string;
}

export interface B2CCategoryBreakdown {
  categoryName: string;
  categoryScore: number;
  elementCount: number;
  elements: Record<string, B2CElementScore>;
}

export interface B2CCategoryTaxonomy {
  categoryKey: string;
  categoryName: string;
  elements: string[];
}

/** Consumer-facing labels for element slugs. */
export const B2C_ELEMENT_DISPLAY_NAMES: Record<string, string> = {
  saves_time: 'Saves time',
  simplifies: 'Simplifies',
  makes_money: 'Makes money',
  reduces_effort: 'Reduces effort',
  reduces_cost: 'Reduces cost',
  reduces_risk: 'Reduces risk',
  organizes: 'Organizes',
  integrates: 'Integrates',
  connects: 'Connects',
  quality: 'Quality',
  variety: 'Variety',
  informs: 'Informs',
  avoids_hassles: 'Avoids hassles',
  sensory_appeal: 'Sensory appeal',
  reduces_anxiety: 'Reduces anxiety',
  rewards_me: 'Rewards me',
  nostalgia: 'Nostalgia',
  design_aesthetics: 'Design/aesthetics',
  badge_value: 'Badge value',
  wellness: 'Wellness',
  therapeutic: 'Therapeutic value',
  fun_entertainment: 'Fun/entertainment',
  attractiveness: 'Attractive appearance',
  provides_access: 'Provides access',
  provides_hope: 'Provides hope',
  self_actualization: 'Self-actualization',
  motivation: 'Motivation',
  heirloom: 'Heirloom',
  affiliation: 'Affiliation/belonging',
  affiliation_belonging: 'Affiliation/belonging',
  self_transcendence: 'Self-transcendence',
};

export const B2C_CATEGORY_TAXONOMY: B2CCategoryTaxonomy[] =
  B2C_CHUNK_CONFIG.chunks.map((chunk) => ({
    categoryKey: chunk.categoryKey,
    categoryName: chunk.categoryName,
    elements: chunk.elements,
  }));

const TAXONOMY_BY_KEY = new Map(
  B2C_CATEGORY_TAXONOMY.map((category) => [category.categoryKey, category])
);

export const B2C_VALUE_FIRST_PRINCIPLE =
  'A B2C category exists only as the set of value elements it groups; categoryScore represents those values. There are no subcategories.';

function averageScores(scores: number[]): number {
  if (scores.length === 0) return 0;
  return parseFloat(
    (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(3)
  );
}

function pickElements(
  allElements: Record<string, B2CElementScore>,
  slugs: string[]
): Record<string, B2CElementScore> {
  const picked: Record<string, B2CElementScore> = {};
  for (const slug of slugs) {
    if (allElements[slug]) {
      picked[slug] = allElements[slug];
    }
  }
  return picked;
}

export function getElementsForCategory(categoryKey: string): string[] {
  return TAXONOMY_BY_KEY.get(categoryKey)?.elements ?? [];
}

export function getAllB2CElementSlugs(): string[] {
  return B2C_CATEGORY_TAXONOMY.flatMap((category) => category.elements);
}

export function rollupB2CCategoryBreakdown(
  categoryKey: string,
  categoryName: string,
  elements: Record<string, B2CElementScore>
): B2CCategoryBreakdown {
  const taxonomy = TAXONOMY_BY_KEY.get(categoryKey);
  const definingSlugs = taxonomy?.elements ?? Object.keys(elements);
  const picked = pickElements(elements, definingSlugs);
  const scores = Object.values(picked).map((element) => element.score);

  return {
    categoryName: taxonomy?.categoryName ?? categoryName,
    categoryScore: averageScores(scores),
    elementCount: definingSlugs.length,
    elements: picked,
  };
}

export interface B2CCategoryDiagnosticGuide {
  categoryKey: string;
  categoryName: string;
  elements: string[];
  elementDisplayNames: string[];
  weakCategoryAction: string;
}

/** Weak category → evaluate the elements that define it (no subcategory layer). */
export function getB2CCategoryDiagnosticGuide(
  categoryKey: string
): B2CCategoryDiagnosticGuide | null {
  const taxonomy = TAXONOMY_BY_KEY.get(categoryKey);
  if (!taxonomy) return null;

  const labels = taxonomy.elements.map(getB2CElementDisplayName);
  return {
    categoryKey,
    categoryName: taxonomy.categoryName,
    elements: taxonomy.elements,
    elementDisplayNames: labels,
    weakCategoryAction: `Evaluate these ${taxonomy.elements.length} defining values: ${labels.join(', ')}`,
  };
}

export function getAllB2CCategoryDiagnosticGuides(): B2CCategoryDiagnosticGuide[] {
  return B2C_CATEGORY_TAXONOMY.map((category) =>
    getB2CCategoryDiagnosticGuide(category.categoryKey)
  ).filter((guide): guide is B2CCategoryDiagnosticGuide => guide !== null);
}

export interface B2CDrillDownTarget {
  categoryKey: string;
  categoryName: string;
  elementSlugs: string[];
  elementDisplayNames: string[];
  reason: string;
}

export function resolveB2CDrillDownTarget(
  categoryKey: string,
  breakdown: B2CCategoryBreakdown,
  weakThreshold = 0.4
): B2CDrillDownTarget | null {
  const guide = getB2CCategoryDiagnosticGuide(categoryKey);
  if (!guide) return null;

  const weakElements = Object.entries(breakdown.elements)
    .filter(([, detail]) => detail.score < weakThreshold)
    .sort(([, a], [, b]) => a.score - b.score)
    .map(([slug]) => slug);

  if (weakElements.length === 0) return null;

  return {
    categoryKey,
    categoryName: guide.categoryName,
    elementSlugs: weakElements,
    elementDisplayNames: weakElements.map(getB2CElementDisplayName),
    reason: `Weak ${guide.categoryName} — target defining value elements below ${weakThreshold}`,
  };
}

export const B2C_SCORING_HIERARCHY = {
  element: 'score each element 0.0–1.0 from website evidence',
  category: 'categoryScore = sum of element scores in category ÷ element count',
  overall: 'overallScore = sum of all 30 element scores ÷ 30',
} as const;

export const B2C_SCORING_PROMPT_INSTRUCTIONS = `Score each B2C element 0.0-1.0 (flat fractional scoring):
- 0.8-1.0: Excellent — best-in-class signal in website copy
- 0.6-0.79: Good — present with solid evidence
- 0.4-0.59: Needs Work — weak or inconsistent signal
- 0.0-0.39: Poor — absent or contradictory

Score ELEMENTS only. B2C has no subcategories — the runtime computes categoryScore as the average of element scores in each tier.
overallScore = average of all 30 element scores.`;

export function isB2CFrameworkName(frameworkName: string): boolean {
  const key = frameworkName.toLowerCase();
  return key.includes('b2c') && !key.includes('b2b');
}

export function getB2CElementDisplayName(slug: string): string {
  return B2C_ELEMENT_DISPLAY_NAMES[slug] ?? slug.replace(/_/g, ' ');
}

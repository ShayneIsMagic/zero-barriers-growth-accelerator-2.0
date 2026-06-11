/**
 * B2B Elements of Value taxonomy aligned to the Bain & Company pyramid.
 * Source: https://media.bain.com/b2b-eov/ (40 elements, 5 tiers)
 *
 * VALUE-FIRST PRINCIPLE: Categories and subcategories are not independent labels.
 * Each group is defined entirely by the value elements it contains. A subcategory
 * score represents those specific values; a category score represents the values
 * in all of its subcategories (or elements, for Table Stakes).
 *
 * Human-readable canonical doc (change this file first, then sync downstream):
 * docs/frameworks/B2B-BAIN-PYRAMID-TAXONOMY.md
 */

export interface B2BElementScore {
  score: number;
  evidence: string;
  recommendation: string;
  displayName?: string;
  strengthLabel?: string;
}

export interface B2BSubcategoryBreakdown {
  subcategoryName: string;
  subcategoryScore: number;
  elementCount: number;
  elements: Record<string, B2BElementScore>;
  strengthLabel?: string;
  presentCount?: number;
  weakCount?: number;
  rank?: number;
}

export interface B2BCategoryBreakdown {
  categoryName: string;
  categoryScore: number;
  elementCount: number;
  strengthLabel?: string;
  weakestSubcategoryKey?: string;
  weakestSubcategoryName?: string;
  weakestSubcategoryScore?: number;
  elements?: Record<string, B2BElementScore>;
  subcategories?: Record<string, B2BSubcategoryBreakdown>;
}

export interface B2BSubcategoryTaxonomy {
  subcategoryKey: string;
  subcategoryName: string;
  elements: string[];
}

export interface B2BCategoryTaxonomy {
  categoryKey: string;
  categoryName: string;
  /** When null, `elements` lists the value types that define this category (Table Stakes). */
  subcategories: B2BSubcategoryTaxonomy[] | null;
  /** Value elements that define the category when there are no subcategories. */
  elements?: string[];
}

/** Bain display labels for element slugs (internal keys stay snake_case). */
export const B2B_ELEMENT_DISPLAY_NAMES: Record<string, string> = {
  meeting_specifications: 'Meeting specifications',
  acceptable_price: 'Acceptable price',
  regulatory_compliance: 'Regulatory compliance',
  ethical_standards: 'Ethical standards',
  improved_top_line: 'Improved top line',
  cost_reduction: 'Cost reduction',
  product_quality: 'Product quality',
  scalability: 'Scalability',
  innovation: 'Innovation',
  time_savings: 'Time savings',
  reduced_effort: 'Reduced effort',
  decreased_hassles: 'Decreased hassles',
  information: 'Information',
  transparency: 'Transparency',
  organization: 'Organization',
  simplification: 'Simplification',
  connection: 'Connection',
  integration: 'Integration',
  availability: 'Availability',
  variety: 'Variety',
  configurability: 'Configurability',
  responsiveness: 'Responsiveness',
  expertise: 'Expertise',
  commitment: 'Commitment',
  stability: 'Stability',
  cultural_fit: 'Cultural fit',
  risk_reduction: 'Risk reduction',
  reach: 'Reach',
  flexibility: 'Flexibility',
  component_quality: 'Component quality',
  network_expansion: 'Network expansion',
  marketability: 'Marketability',
  reputational_assurance: 'Reputational assurance',
  design_aesthetics_b2b: 'Design & aesthetics',
  growth_development: 'Growth & development',
  reduced_anxiety_b2b: 'Reduced anxiety',
  fun_perks: 'Fun & perks',
  vision: 'Vision',
  hope_b2b: 'Hope',
  social_responsibility: 'Social responsibility',
};

export const B2B_CATEGORY_TAXONOMY: B2BCategoryTaxonomy[] = [
  {
    categoryKey: 'table_stakes',
    categoryName: 'Table Stakes',
    subcategories: null,
    elements: [
      'meeting_specifications',
      'acceptable_price',
      'regulatory_compliance',
      'ethical_standards',
    ],
  },
  {
    categoryKey: 'functional',
    categoryName: 'Functional Value',
    subcategories: [
      {
        subcategoryKey: 'economic',
        subcategoryName: 'Economic',
        elements: ['improved_top_line', 'cost_reduction'],
      },
      {
        subcategoryKey: 'performance',
        subcategoryName: 'Performance',
        elements: ['product_quality', 'scalability', 'innovation'],
      },
    ],
  },
  {
    categoryKey: 'ease_of_business',
    categoryName: 'Ease of Doing Business',
    subcategories: [
      {
        subcategoryKey: 'productivity',
        subcategoryName: 'Productivity',
        elements: [
          'time_savings',
          'reduced_effort',
          'decreased_hassles',
          'information',
          'transparency',
        ],
      },
      {
        subcategoryKey: 'operational',
        subcategoryName: 'Operational',
        elements: [
          'organization',
          'simplification',
          'connection',
          'integration',
        ],
      },
      {
        subcategoryKey: 'access',
        subcategoryName: 'Access',
        elements: ['availability', 'variety', 'configurability'],
      },
      {
        subcategoryKey: 'relationship',
        subcategoryName: 'Relationship',
        elements: [
          'responsiveness',
          'expertise',
          'commitment',
          'stability',
          'cultural_fit',
        ],
      },
      {
        subcategoryKey: 'strategic',
        subcategoryName: 'Strategic',
        elements: [
          'risk_reduction',
          'reach',
          'flexibility',
          'component_quality',
        ],
      },
    ],
  },
  {
    categoryKey: 'individual',
    categoryName: 'Individual Value',
    subcategories: [
      {
        subcategoryKey: 'career',
        subcategoryName: 'Career',
        elements: [
          'network_expansion',
          'marketability',
          'reputational_assurance',
        ],
      },
      {
        subcategoryKey: 'personal',
        subcategoryName: 'Personal',
        elements: [
          'design_aesthetics_b2b',
          'growth_development',
          'reduced_anxiety_b2b',
          'fun_perks',
        ],
      },
    ],
  },
  {
    categoryKey: 'inspirational',
    categoryName: 'Inspirational Value',
    subcategories: [
      {
        subcategoryKey: 'purpose',
        subcategoryName: 'Purpose',
        elements: ['vision', 'hope_b2b', 'social_responsibility'],
      },
    ],
  },
];

const TAXONOMY_BY_KEY = new Map(
  B2B_CATEGORY_TAXONOMY.map((category) => [category.categoryKey, category])
);

/** Categories and subcategories are defined by the value elements they contain. */
export const B2B_VALUE_FIRST_PRINCIPLE =
  'A category or subcategory exists only as the set of value elements it groups; scores at each level represent those values.';

export function getElementsForSubcategory(
  categoryKey: string,
  subcategoryKey: string
): string[] {
  const taxonomy = TAXONOMY_BY_KEY.get(categoryKey);
  const subcategory = taxonomy?.subcategories?.find(
    (entry) => entry.subcategoryKey === subcategoryKey
  );
  return subcategory?.elements ?? [];
}

/** All value element slugs that define a category (union of subcategories or flat list). */
export function getElementsForCategory(categoryKey: string): string[] {
  const taxonomy = TAXONOMY_BY_KEY.get(categoryKey);
  if (!taxonomy) return [];
  if (taxonomy.subcategories === null) {
    return taxonomy.elements ?? [];
  }
  return taxonomy.subcategories.flatMap((subcategory) => subcategory.elements);
}

export function getAllB2BElementSlugs(): string[] {
  return B2B_CATEGORY_TAXONOMY.flatMap((category) =>
    getElementsForCategory(category.categoryKey)
  );
}

export interface B2BSubcategoryDiagnosticGuide {
  subcategoryKey: string;
  subcategoryName: string;
  elements: string[];
  elementDisplayNames: string[];
  weakSubcategoryAction: string;
}

export interface B2BCategoryDiagnosticGuide {
  categoryKey: string;
  categoryName: string;
  hasSubcategories: boolean;
  /** When true, categoryScore always equals the sole subcategoryScore (e.g. Inspirational → Purpose). */
  singleSubcategoryTier: boolean;
  weakCategoryAction: string;
  subcategories: B2BSubcategoryDiagnosticGuide[];
}

/**
 * Diagnostic drill-down for a tier: weak category → weakest subcategory (if any) → target elements.
 * Table Stakes skips subcategories and goes straight to its four defining elements.
 */
export function getB2BCategoryDiagnosticGuide(
  categoryKey: string
): B2BCategoryDiagnosticGuide | null {
  const taxonomy = TAXONOMY_BY_KEY.get(categoryKey);
  if (!taxonomy) return null;

  if (taxonomy.subcategories === null) {
    const slugs = taxonomy.elements ?? [];
    const labels = slugs.map(getB2BElementDisplayName);
    return {
      categoryKey,
      categoryName: taxonomy.categoryName,
      hasSubcategories: false,
      singleSubcategoryTier: false,
      weakCategoryAction: `Evaluate each Table Stakes value: ${labels.join(', ')}`,
      subcategories: [],
    };
  }

  const subcategoryGuides = taxonomy.subcategories.map((subcategory) => {
    const labels = subcategory.elements.map(getB2BElementDisplayName);
    return {
      subcategoryKey: subcategory.subcategoryKey,
      subcategoryName: subcategory.subcategoryName,
      elements: subcategory.elements,
      elementDisplayNames: labels,
      weakSubcategoryAction: `Evaluate these values: ${labels.join(', ')}`,
    };
  });

  const singleSubcategoryTier = taxonomy.subcategories.length === 1;
  const soleSubcategory = taxonomy.subcategories[0];

  return {
    categoryKey,
    categoryName: taxonomy.categoryName,
    hasSubcategories: true,
    singleSubcategoryTier,
    weakCategoryAction: singleSubcategoryTier
      ? `Inspect ${soleSubcategory.subcategoryName} — its elements define the entire tier (${soleSubcategory.elements.map(getB2BElementDisplayName).join(', ')})`
      : 'Find the weakest subcategory, then evaluate the elements that define that value group',
    subcategories: subcategoryGuides,
  };
}

export function getAllB2BCategoryDiagnosticGuides(): B2BCategoryDiagnosticGuide[] {
  return B2B_CATEGORY_TAXONOMY.map((category) =>
    getB2BCategoryDiagnosticGuide(category.categoryKey)
  ).filter((guide): guide is B2BCategoryDiagnosticGuide => guide !== null);
}

export interface B2BDrillDownTarget {
  categoryKey: string;
  categoryName: string;
  subcategoryKey?: string;
  subcategoryName?: string;
  elementSlugs: string[];
  elementDisplayNames: string[];
  reason: string;
}

/** Given a scored category breakdown, suggest the next diagnostic level to inspect. */
export function resolveB2BDrillDownTarget(
  categoryKey: string,
  breakdown: B2BCategoryBreakdown,
  weakThreshold = 0.4
): B2BDrillDownTarget | null {
  const guide = getB2BCategoryDiagnosticGuide(categoryKey);
  if (!guide) return null;

  if (!guide.hasSubcategories && breakdown.elements) {
    const weakElements = Object.entries(breakdown.elements)
      .filter(([, detail]) => detail.score < weakThreshold)
      .map(([slug]) => slug);
    if (weakElements.length === 0) return null;
    return {
      categoryKey,
      categoryName: guide.categoryName,
      elementSlugs: weakElements,
      elementDisplayNames: weakElements.map(getB2BElementDisplayName),
      reason: `Weak Table Stakes tier — target defining values below ${weakThreshold}`,
    };
  }

  if (!breakdown.subcategories) return null;

  const subcategoryEntries = Object.entries(breakdown.subcategories);
  if (subcategoryEntries.length === 0) return null;

  const weakestSubcategory = subcategoryEntries.reduce((weakest, current) =>
    current[1].subcategoryScore < weakest[1].subcategoryScore ? current : weakest
  );

  const [subcategoryKey, subcategoryBreakdown] = weakestSubcategory;
  const subcategoryGuide = guide.subcategories.find(
    (entry) => entry.subcategoryKey === subcategoryKey
  );

  const weakElements = Object.entries(subcategoryBreakdown.elements)
    .filter(([, detail]) => detail.score < weakThreshold)
    .sort(([, a], [, b]) => a.score - b.score)
    .map(([slug]) => slug);

  const elementSlugs =
    weakElements.length > 0
      ? weakElements
      : subcategoryGuide?.elements ?? [];

  return {
    categoryKey,
    categoryName: guide.categoryName,
    subcategoryKey,
    subcategoryName: subcategoryBreakdown.subcategoryName,
    elementSlugs,
    elementDisplayNames: elementSlugs.map(getB2BElementDisplayName),
    reason: guide.singleSubcategoryTier
      ? `Weak ${guide.categoryName} — ${subcategoryBreakdown.subcategoryName} defines the entire tier`
      : `Weakest subcategory in ${guide.categoryName} is ${subcategoryBreakdown.subcategoryName}`,
  };
}

function averageScores(scores: number[]): number {
  if (scores.length === 0) return 0;
  return parseFloat(
    (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(3)
  );
}

function pickElements(
  allElements: Record<string, B2BElementScore>,
  slugs: string[]
): Record<string, B2BElementScore> {
  const picked: Record<string, B2BElementScore> = {};
  for (const slug of slugs) {
    if (allElements[slug]) {
      picked[slug] = allElements[slug];
    }
  }
  return picked;
}

export function rollupB2BCategoryBreakdown(
  categoryKey: string,
  categoryName: string,
  elements: Record<string, B2BElementScore>
): B2BCategoryBreakdown {
  const taxonomy = TAXONOMY_BY_KEY.get(categoryKey);
  if (!taxonomy) {
    const scores = Object.values(elements).map((element) => element.score);
    return {
      categoryName,
      categoryScore: averageScores(scores),
      elementCount: Object.keys(elements).length,
      elements,
    };
  }

  if (taxonomy.subcategories === null) {
    const scores = Object.values(elements).map((element) => element.score);
    return {
      categoryName: taxonomy.categoryName,
      categoryScore: averageScores(scores),
      elementCount: Object.keys(elements).length,
      elements,
    };
  }

  const subcategoryBreakdown: Record<string, B2BSubcategoryBreakdown> = {};
  const subcategoryScores: number[] = [];

  for (const subcategory of taxonomy.subcategories) {
    const subElements = pickElements(elements, subcategory.elements);
    const scores = Object.values(subElements).map((element) => element.score);
    const subcategoryScore = averageScores(scores);
    subcategoryScores.push(subcategoryScore);

    subcategoryBreakdown[subcategory.subcategoryKey] = {
      subcategoryName: subcategory.subcategoryName,
      subcategoryScore,
      elementCount: subcategory.elements.length,
      elements: subElements,
    };
  }

  return {
    categoryName: taxonomy.categoryName,
    categoryScore: averageScores(subcategoryScores),
    elementCount: Object.keys(elements).length,
    subcategories: subcategoryBreakdown,
  };
}

/**
 * Three-level B2B scoring hierarchy (runtime computes tiers — AI scores elements only).
 *
 * - Element: scored 0.0–1.0 from evidence (AI or Flask matcher)
 * - Subcategory: simple average of its element scores
 * - Category (tier): Table Stakes = average of elements; all other tiers = average of subcategory scores
 * - Overall: simple average of all 40 element scores (not average of 5 tier scores)
 */
export const B2B_SCORING_HIERARCHY = {
  element: 'score each element 0.0–1.0 from website evidence',
  subcategory:
    'subcategoryScore = sum of element scores in subcategory ÷ element count',
  categoryFlat: 'categoryScore = sum of element scores ÷ element count (Table Stakes only)',
  categoryTier:
    'categoryScore = sum of subcategoryScore values ÷ subcategory count',
  overall: 'overallScore = sum of all 40 element scores ÷ 40',
} as const;

export const B2B_SCORING_PROMPT_INSTRUCTIONS = `Score each B2B element 0.0-1.0 (flat fractional scoring):
- 0.8-1.0: Excellent — industry-leading signal in website copy
- 0.6-0.79: Good — present with solid evidence
- 0.4-0.59: Needs Work — weak or inconsistent signal
- 0.0-0.39: Poor — absent or contradictory

Score ELEMENTS only. The runtime computes subcategory and tier rollups:
- subcategoryScore = average of element scores in that Bain subcategory
- categoryScore (tier) = average of subcategory scores (Table Stakes: average of its 4 elements directly)
- overallScore = average of all 40 element scores`;

export function averageB2BScores(scores: number[]): number {
  return averageScores(scores);
}

export function isB2BFrameworkName(frameworkName: string): boolean {
  return frameworkName.toLowerCase().includes('b2b');
}

export function getB2BElementDisplayName(slug: string): string {
  return B2B_ELEMENT_DISPLAY_NAMES[slug] ?? slug.replace(/_/g, ' ');
}

export type B2BStrengthLabel =
  | 'Dominant'
  | 'Strong'
  | 'Moderate'
  | 'Weak/Absent';

export function getB2BStrengthLabel(score: number): B2BStrengthLabel {
  if (score >= 0.8) {
    return 'Dominant';
  }
  if (score >= 0.6) {
    return 'Strong';
  }
  if (score >= 0.4) {
    return 'Moderate';
  }
  return 'Weak/Absent';
}

export interface B2BEnrichedElementScore extends B2BElementScore {
  displayName: string;
  strengthLabel: B2BStrengthLabel;
}

export interface B2BEnrichedSubcategoryBreakdown {
  subcategoryName: string;
  subcategoryScore: number;
  strengthLabel: B2BStrengthLabel;
  elementCount: number;
  presentCount: number;
  weakCount: number;
  rank: number;
  elements: Record<string, B2BEnrichedElementScore>;
}

export interface B2BEnrichedCategoryBreakdown {
  categoryName: string;
  categoryScore: number;
  strengthLabel: B2BStrengthLabel;
  elementCount: number;
  weakestSubcategoryKey?: string;
  weakestSubcategoryName?: string;
  weakestSubcategoryScore?: number;
  elements?: Record<string, B2BEnrichedElementScore>;
  subcategories?: Record<string, B2BEnrichedSubcategoryBreakdown>;
}

export interface B2BTierRankingEntry {
  categoryKey: string;
  categoryName: string;
  categoryScore: number;
  strengthLabel: B2BStrengthLabel;
}

export interface B2BSubcategoryRankingEntry {
  categoryKey: string;
  categoryName: string;
  subcategoryKey: string;
  subcategoryName: string;
  subcategoryScore: number;
  strengthLabel: B2BStrengthLabel;
}

export interface B2BPyramidDiagnostics {
  weakestTier: B2BTierRankingEntry;
  primaryDrillDown: B2BDrillDownTarget | null;
  tierDrillDowns: B2BDrillDownTarget[];
  categoryRanking: B2BTierRankingEntry[];
  subcategoryRanking: B2BSubcategoryRankingEntry[];
}

const DEFAULT_MISSING_ELEMENT: B2BElementScore = {
  score: 0,
  evidence: 'Not evaluated',
  recommendation: 'No recommendation',
};

export function getSubcategoryKeyForElement(
  categoryKey: string,
  elementSlug: string
): string | undefined {
  const taxonomy = TAXONOMY_BY_KEY.get(categoryKey);
  if (!taxonomy?.subcategories) {
    return undefined;
  }
  return taxonomy.subcategories.find((subcategory) =>
    subcategory.elements.includes(elementSlug)
  )?.subcategoryKey;
}

function enrichElementDetail(
  slug: string,
  detail: B2BElementScore
): B2BEnrichedElementScore {
  const score = detail.score;
  return {
    ...detail,
    displayName: getB2BElementDisplayName(slug),
    strengthLabel: getB2BStrengthLabel(score),
  };
}

function ensureCategoryElements(
  slugs: string[],
  elements: Record<string, B2BElementScore>
): Record<string, B2BElementScore> {
  const ensured: Record<string, B2BElementScore> = {};
  for (const slug of slugs) {
    ensured[slug] = elements[slug] ?? DEFAULT_MISSING_ELEMENT;
  }
  return ensured;
}

function countPresent(elements: Record<string, B2BEnrichedElementScore>): number {
  return Object.values(elements).filter((element) => element.score >= 0.6).length;
}

function countWeak(
  elements: Record<string, B2BEnrichedElementScore>,
  weakThreshold: number
): number {
  return Object.values(elements).filter((element) => element.score < weakThreshold)
    .length;
}

/** Add strength labels, counts, and weakest-subcategory metadata to rolled-up categories. */
export function enrichB2BCategoriesBreakdown(
  categories: Record<string, B2BCategoryBreakdown>,
  weakThreshold = 0.4
): Record<string, B2BEnrichedCategoryBreakdown> {
  const enriched: Record<string, B2BEnrichedCategoryBreakdown> = {};

  for (const [categoryKey, breakdown] of Object.entries(categories)) {
    const taxonomy = TAXONOMY_BY_KEY.get(categoryKey);
    const categoryScore = breakdown.categoryScore;
    const base = {
      categoryName: breakdown.categoryName,
      categoryScore,
      strengthLabel: getB2BStrengthLabel(categoryScore),
      elementCount: breakdown.elementCount,
    };

    if (breakdown.subcategories && taxonomy?.subcategories) {
      const subEntries = taxonomy.subcategories.map((subcategory) => {
        const rawSub = breakdown.subcategories?.[subcategory.subcategoryKey];
        const ensured = ensureCategoryElements(
          subcategory.elements,
          rawSub?.elements ?? {}
        );
        const elements = Object.fromEntries(
          Object.entries(ensured).map(([slug, detail]) => [
            slug,
            enrichElementDetail(slug, detail),
          ])
        );
        const scores = Object.values(elements).map((element) => element.score);
        const subcategoryScore = averageScores(scores);

        return {
          subcategoryKey: subcategory.subcategoryKey,
          subcategoryName: subcategory.subcategoryName,
          subcategoryScore,
          strengthLabel: getB2BStrengthLabel(subcategoryScore),
          elementCount: subcategory.elements.length,
          presentCount: countPresent(elements),
          weakCount: countWeak(elements, weakThreshold),
          elements,
        };
      });

      subEntries.sort((a, b) => b.subcategoryScore - a.subcategoryScore);
      const rankedSubs: Record<string, B2BEnrichedSubcategoryBreakdown> = {};
      subEntries.forEach((subcategory, index) => {
        rankedSubs[subcategory.subcategoryKey] = {
          subcategoryName: subcategory.subcategoryName,
          subcategoryScore: subcategory.subcategoryScore,
          strengthLabel: subcategory.strengthLabel,
          elementCount: subcategory.elementCount,
          presentCount: subcategory.presentCount,
          weakCount: subcategory.weakCount,
          rank: index + 1,
          elements: subcategory.elements,
        };
      });

      const weakest = subEntries[subEntries.length - 1];
      enriched[categoryKey] = {
        ...base,
        categoryScore: averageScores(subEntries.map((sub) => sub.subcategoryScore)),
        weakestSubcategoryKey: weakest?.subcategoryKey,
        weakestSubcategoryName: weakest?.subcategoryName,
        weakestSubcategoryScore: weakest?.subcategoryScore,
        subcategories: rankedSubs,
      };
      continue;
    }

    const slugs =
      taxonomy?.elements ??
      Object.keys(breakdown.elements ?? {});
    const ensured = ensureCategoryElements(slugs, breakdown.elements ?? {});
    const elements = Object.fromEntries(
      Object.entries(ensured).map(([slug, detail]) => [
        slug,
        enrichElementDetail(slug, detail),
      ])
    );

    enriched[categoryKey] = {
      ...base,
      categoryScore: averageScores(Object.values(elements).map((el) => el.score)),
      elements,
    };
  }

  return enriched;
}

export function buildB2BPyramidDiagnostics(
  categories: Record<string, B2BCategoryBreakdown>,
  weakTierThreshold = 0.6,
  weakElementThreshold = 0.4
): B2BPyramidDiagnostics {
  const categoryRanking: B2BTierRankingEntry[] = Object.entries(categories)
    .map(([categoryKey, breakdown]) => ({
      categoryKey,
      categoryName: breakdown.categoryName,
      categoryScore: breakdown.categoryScore,
      strengthLabel: getB2BStrengthLabel(breakdown.categoryScore),
    }))
    .sort((a, b) => a.categoryScore - b.categoryScore);

  const subcategoryRanking: B2BSubcategoryRankingEntry[] = Object.entries(
    categories
  )
    .flatMap(([categoryKey, breakdown]) => {
      if (!breakdown.subcategories) {
        return [];
      }
      return Object.entries(breakdown.subcategories).map(
        ([subcategoryKey, subcategory]) => ({
          categoryKey,
          categoryName: breakdown.categoryName,
          subcategoryKey,
          subcategoryName: subcategory.subcategoryName,
          subcategoryScore: subcategory.subcategoryScore,
          strengthLabel: getB2BStrengthLabel(subcategory.subcategoryScore),
        })
      );
    })
    .sort((a, b) => a.subcategoryScore - b.subcategoryScore);

  const weakestTier = categoryRanking[0] ?? {
    categoryKey: '',
    categoryName: '',
    categoryScore: 0,
    strengthLabel: 'Weak/Absent' as B2BStrengthLabel,
  };

  const tierDrillDowns = categoryRanking
    .filter((tier) => tier.categoryScore < weakTierThreshold)
    .map((tier) =>
      resolveB2BDrillDownTarget(
        tier.categoryKey,
        categories[tier.categoryKey],
        weakElementThreshold
      )
    )
    .filter((target): target is B2BDrillDownTarget => target !== null);

  const primaryDrillDown = weakestTier.categoryKey
    ? resolveB2BDrillDownTarget(
        weakestTier.categoryKey,
        categories[weakestTier.categoryKey],
        weakElementThreshold
      )
    : null;

  return {
    weakestTier,
    primaryDrillDown,
    tierDrillDowns,
    categoryRanking,
    subcategoryRanking,
  };
}

export interface B2BElementReference {
  element: string;
  category: string;
  subcategory?: string;
  score: number;
  evidence?: string;
  recommendation?: string;
}

export function enrichB2BElementReferences(
  references: B2BElementReference[]
): B2BElementReference[] {
  return references.map((reference) => ({
    ...reference,
    subcategory:
      reference.subcategory ??
      getSubcategoryKeyForElement(reference.category, reference.element),
  }));
}

export interface B2BAnalysisEnrichmentInput {
  categories: Record<string, B2BCategoryBreakdown>;
  topStrengths?: B2BElementReference[];
  criticalGaps?: B2BElementReference[];
  weakTierThreshold?: number;
  weakElementThreshold?: number;
}

export interface B2BAnalysisEnrichmentResult {
  categories: Record<string, B2BEnrichedCategoryBreakdown>;
  pyramidDiagnostics: B2BPyramidDiagnostics;
  topStrengths: B2BElementReference[];
  criticalGaps: B2BElementReference[];
}

/** Full B2B post-processing: enriched rollups, pyramid drill-down, subcategory-aware strengths/gaps. */
export function enrichB2BAnalysisPayload(
  input: B2BAnalysisEnrichmentInput
): B2BAnalysisEnrichmentResult {
  const weakElementThreshold = input.weakElementThreshold ?? 0.4;
  const weakTierThreshold = input.weakTierThreshold ?? 0.6;
  const enrichedCategories = enrichB2BCategoriesBreakdown(
    input.categories,
    weakElementThreshold
  );

  return {
    categories: enrichedCategories,
    pyramidDiagnostics: buildB2BPyramidDiagnostics(
      input.categories,
      weakTierThreshold,
      weakElementThreshold
    ),
    topStrengths: enrichB2BElementReferences(input.topStrengths ?? []),
    criticalGaps: enrichB2BElementReferences(input.criticalGaps ?? []),
  };
}

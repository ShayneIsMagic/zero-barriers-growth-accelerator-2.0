import { describe, expect, it } from 'vitest';
import {
  B2B_CATEGORY_TAXONOMY,
  B2B_ELEMENT_DISPLAY_NAMES,
  buildB2BPyramidDiagnostics,
  enrichB2BAnalysisPayload,
  enrichB2BCategoriesBreakdown,
  getAllB2BCategoryDiagnosticGuides,
  getAllB2BElementSlugs,
  getB2BCategoryDiagnosticGuide,
  getB2BStrengthLabel,
  getElementsForCategory,
  getElementsForSubcategory,
  resolveB2BDrillDownTarget,
  rollupB2BCategoryBreakdown,
} from '@/lib/framework/b2b-taxonomy';
import { B2B_CHUNK_CONFIG } from '@/lib/framework/chunk-definitions';

function mockElement(score: number) {
  return { score, evidence: 'test', recommendation: 'test' };
}

describe('B2B taxonomy rollups', () => {
  it('defines 40 elements across 5 tiers', () => {
    const elementCount = B2B_CHUNK_CONFIG.chunks.reduce(
      (sum, chunk) => sum + chunk.elements.length,
      0
    );
    expect(elementCount).toBe(40);
    expect(getAllB2BElementSlugs()).toHaveLength(40);
    expect(B2B_CATEGORY_TAXONOMY).toHaveLength(5);
  });

  it('defines each category and subcategory by its value elements', () => {
    for (const chunk of B2B_CHUNK_CONFIG.chunks) {
      expect(getElementsForCategory(chunk.categoryKey)).toEqual(chunk.elements);
    }

    expect(getElementsForSubcategory('individual', 'career')).toEqual([
      'network_expansion',
      'marketability',
      'reputational_assurance',
    ]);
    expect(getElementsForSubcategory('individual', 'personal')).toEqual([
      'design_aesthetics_b2b',
      'growth_development',
      'reduced_anxiety_b2b',
      'fun_perks',
    ]);
    expect(getElementsForCategory('table_stakes')).toEqual([
      'meeting_specifications',
      'acceptable_price',
      'regulatory_compliance',
      'ethical_standards',
    ]);
  });

  it('keeps table stakes flat without subcategories', () => {
    const breakdown = rollupB2BCategoryBreakdown('table_stakes', 'Table Stakes', {
      meeting_specifications: mockElement(0.8),
      acceptable_price: mockElement(0.6),
      regulatory_compliance: mockElement(0.4),
      ethical_standards: mockElement(0.2),
    });

    expect(breakdown.subcategories).toBeUndefined();
    expect(breakdown.elements).toBeDefined();
    expect(breakdown.categoryScore).toBe(0.5);
  });

  it('rolls up inspirational purpose subcategory and tier score', () => {
    const breakdown = rollupB2BCategoryBreakdown('inspirational', 'Inspirational Value', {
      vision: mockElement(0.9),
      hope_b2b: mockElement(0.3),
      social_responsibility: mockElement(0.6),
    });

    expect(breakdown.subcategories?.purpose.subcategoryScore).toBe(0.6);
    expect(breakdown.categoryScore).toBe(0.6);
    expect(breakdown.subcategories?.purpose.elements).toHaveProperty('social_responsibility');
  });

  it('averages subcategory scores for ease of doing business', () => {
    const elements = Object.fromEntries(
      B2B_CHUNK_CONFIG.chunks
        .find((chunk) => chunk.categoryKey === 'ease_of_business')
        ?.elements.map((slug, index) => [slug, mockElement((index + 1) * 0.05)]) ?? []
    );

    const breakdown = rollupB2BCategoryBreakdown(
      'ease_of_business',
      'Ease of Doing Business',
      elements
    );

    expect(breakdown.subcategories).toHaveProperty('productivity');
    expect(breakdown.subcategories).toHaveProperty('strategic');
    expect(breakdown.subcategories?.strategic.elementCount).toBe(4);
    expect(breakdown.categoryScore).toBeGreaterThan(0);
  });

  it('matches Bain Individual career and personal subcategories', () => {
    const individual = B2B_CATEGORY_TAXONOMY.find(
      (category) => category.categoryKey === 'individual'
    );
    const career = individual?.subcategories?.find(
      (sub) => sub.subcategoryKey === 'career'
    );
    const personal = individual?.subcategories?.find(
      (sub) => sub.subcategoryKey === 'personal'
    );

    expect(career?.elements).toEqual([
      'network_expansion',
      'marketability',
      'reputational_assurance',
    ]);
    expect(personal?.elements).toEqual([
      'design_aesthetics_b2b',
      'growth_development',
      'reduced_anxiety_b2b',
      'fun_perks',
    ]);
    expect(B2B_ELEMENT_DISPLAY_NAMES.reputational_assurance).toBe(
      'Reputational assurance'
    );
    expect(B2B_ELEMENT_DISPLAY_NAMES.design_aesthetics_b2b).toBe(
      'Design & aesthetics'
    );
    expect(B2B_ELEMENT_DISPLAY_NAMES.fun_perks).toBe('Fun & perks');
  });

  it('places flexibility and component quality under ease strategic per Bain', () => {
    const functional = B2B_CATEGORY_TAXONOMY.find(
      (category) => category.categoryKey === 'functional'
    );
    const ease = B2B_CATEGORY_TAXONOMY.find(
      (category) => category.categoryKey === 'ease_of_business'
    );
    const performance = functional?.subcategories?.find(
      (sub) => sub.subcategoryKey === 'performance'
    );
    const strategic = ease?.subcategories?.find(
      (sub) => sub.subcategoryKey === 'strategic'
    );

    expect(performance?.elements).toEqual([
      'product_quality',
      'scalability',
      'innovation',
    ]);
    expect(strategic?.elements).toContain('flexibility');
    expect(strategic?.elements).toContain('component_quality');
  });

  it('computes tier score from subcategory averages not flat element average', () => {
    const breakdown = rollupB2BCategoryBreakdown('individual', 'Individual Value', {
      network_expansion: mockElement(1.0),
      marketability: mockElement(1.0),
      reputational_assurance: mockElement(1.0),
      design_aesthetics_b2b: mockElement(0.0),
      growth_development: mockElement(0.0),
      reduced_anxiety_b2b: mockElement(0.0),
      fun_perks: mockElement(0.0),
    });

    expect(breakdown.subcategories?.career.subcategoryScore).toBe(1.0);
    expect(breakdown.subcategories?.personal.subcategoryScore).toBe(0.0);
    expect(breakdown.categoryScore).toBe(0.5);
  });

  it('documents diagnostic drill-down for every tier', () => {
    const guides = getAllB2BCategoryDiagnosticGuides();
    expect(guides).toHaveLength(5);

    const inspirational = getB2BCategoryDiagnosticGuide('inspirational');
    expect(inspirational?.singleSubcategoryTier).toBe(true);
    expect(inspirational?.subcategories[0].elements).toEqual([
      'vision',
      'hope_b2b',
      'social_responsibility',
    ]);

    const tableStakes = getB2BCategoryDiagnosticGuide('table_stakes');
    expect(tableStakes?.hasSubcategories).toBe(false);

    const ease = getB2BCategoryDiagnosticGuide('ease_of_business');
    expect(ease?.subcategories).toHaveLength(5);
  });

  it('resolves inspirational drill-down to purpose elements when tier is weak', () => {
    const breakdown = rollupB2BCategoryBreakdown('inspirational', 'Inspirational Value', {
      vision: mockElement(0.55),
      hope_b2b: mockElement(0.3),
      social_responsibility: mockElement(0.4),
    });

    expect(breakdown.categoryScore).toBe(breakdown.subcategories?.purpose.subcategoryScore);

    const target = resolveB2BDrillDownTarget('inspirational', breakdown);
    expect(target?.subcategoryKey).toBe('purpose');
    expect(target?.elementSlugs).toContain('hope_b2b');
    expect(target?.reason).toContain('defines the entire tier');
  });

  it('resolves individual drill-down to weakest subcategory elements', () => {
    const breakdown = rollupB2BCategoryBreakdown('individual', 'Individual Value', {
      network_expansion: mockElement(0.8),
      marketability: mockElement(0.7),
      reputational_assurance: mockElement(0.75),
      design_aesthetics_b2b: mockElement(0.2),
      growth_development: mockElement(0.25),
      reduced_anxiety_b2b: mockElement(0.15),
      fun_perks: mockElement(0.3),
    });

    const target = resolveB2BDrillDownTarget('individual', breakdown);
    expect(target?.subcategoryKey).toBe('personal');
    expect(target?.elementSlugs).toContain('reduced_anxiety_b2b');
  });

  it('labels B2B strength bands consistently', () => {
    expect(getB2BStrengthLabel(0.85)).toBe('Dominant');
    expect(getB2BStrengthLabel(0.65)).toBe('Strong');
    expect(getB2BStrengthLabel(0.45)).toBe('Moderate');
    expect(getB2BStrengthLabel(0.2)).toBe('Weak/Absent');
  });

  it('enriches subcategories with rank, counts, and strength labels', () => {
    const breakdown = rollupB2BCategoryBreakdown('individual', 'Individual Value', {
      network_expansion: mockElement(0.8),
      marketability: mockElement(0.7),
      reputational_assurance: mockElement(0.75),
      design_aesthetics_b2b: mockElement(0.2),
      growth_development: mockElement(0.25),
      reduced_anxiety_b2b: mockElement(0.15),
      fun_perks: mockElement(0.3),
    });

    const enriched = enrichB2BCategoriesBreakdown({ individual: breakdown }).individual;
    expect(enriched.strengthLabel).toBe('Moderate');
    expect(enriched.weakestSubcategoryKey).toBe('personal');
    expect(enriched.subcategories?.career.rank).toBe(1);
    expect(enriched.subcategories?.personal.rank).toBe(2);
    expect(enriched.subcategories?.personal.weakCount).toBe(4);
    expect(enriched.subcategories?.career.elements.network_expansion.displayName).toBe(
      'Network expansion'
    );
  });

  it('builds pyramid diagnostics with primary drill-down target', () => {
    const categories = {
      table_stakes: rollupB2BCategoryBreakdown('table_stakes', 'Table Stakes', {
        meeting_specifications: mockElement(0.8),
        acceptable_price: mockElement(0.7),
        regulatory_compliance: mockElement(0.75),
        ethical_standards: mockElement(0.65),
      }),
      inspirational: rollupB2BCategoryBreakdown('inspirational', 'Inspirational Value', {
        vision: mockElement(0.2),
        hope_b2b: mockElement(0.15),
        social_responsibility: mockElement(0.25),
      }),
    };

    const diagnostics = buildB2BPyramidDiagnostics(categories);
    expect(diagnostics.weakestTier.categoryKey).toBe('inspirational');
    expect(diagnostics.primaryDrillDown?.subcategoryKey).toBe('purpose');
    expect(diagnostics.subcategoryRanking[0].subcategoryKey).toBe('purpose');
  });

  it('enriches analysis payload with pyramid diagnostics and subcategory refs', () => {
    const categories = {
      ease_of_business: rollupB2BCategoryBreakdown(
        'ease_of_business',
        'Ease of Doing Business',
        Object.fromEntries(
          getElementsForCategory('ease_of_business').map((slug, index) => [
            slug,
            mockElement(index % 5 === 0 ? 0.2 : 0.7),
          ])
        )
      ),
    };

    const enriched = enrichB2BAnalysisPayload({
      categories,
      topStrengths: [
        {
          element: 'time_savings',
          category: 'ease_of_business',
          score: 0.7,
          evidence: 'test',
        },
      ],
      criticalGaps: [
        {
          element: 'time_savings',
          category: 'ease_of_business',
          score: 0.2,
          recommendation: 'fix',
        },
      ],
    });

    expect(enriched.pyramidDiagnostics.weakestTier.categoryKey).toBe('ease_of_business');
    expect(enriched.topStrengths[0].subcategory).toBe('productivity');
    expect(enriched.categories.ease_of_business.subcategories?.productivity.presentCount).toBeGreaterThan(
      0
    );
  });
});

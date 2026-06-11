import { describe, expect, it } from 'vitest';
import { B2C_CHUNK_CONFIG } from '@/lib/framework/chunk-definitions';
import {
  getAllB2CCategoryDiagnosticGuides,
  getAllB2CElementSlugs,
  getB2CCategoryDiagnosticGuide,
  getElementsForCategory,
  resolveB2CDrillDownTarget,
  rollupB2CCategoryBreakdown,
} from '@/lib/framework/b2c-taxonomy';

function mockElement(score: number) {
  return { score, evidence: 'test', recommendation: 'test' };
}

describe('B2C taxonomy rollups', () => {
  it('defines 30 elements across 4 flat categories', () => {
    const chunkCount = B2C_CHUNK_CONFIG.chunks.reduce(
      (sum, chunk) => sum + chunk.elements.length,
      0
    );
    expect(chunkCount).toBe(30);
    expect(getAllB2CElementSlugs()).toHaveLength(30);
    expect(getAllB2CCategoryDiagnosticGuides()).toHaveLength(4);
  });

  it('defines each category by its value elements only', () => {
    for (const chunk of B2C_CHUNK_CONFIG.chunks) {
      expect(getElementsForCategory(chunk.categoryKey)).toEqual(chunk.elements);
    }
  });

  it('rolls up category score from element averages with no subcategories', () => {
    const breakdown = rollupB2CCategoryBreakdown('emotional', 'Emotional', {
      reduces_anxiety: mockElement(0.6),
      rewards_me: mockElement(0.4),
      nostalgia: mockElement(0.5),
      design_aesthetics: mockElement(0.3),
      badge_value: mockElement(0.7),
      wellness: mockElement(0.5),
      therapeutic: mockElement(0.4),
      fun_entertainment: mockElement(0.6),
      attractiveness: mockElement(0.5),
      provides_access: mockElement(0.2),
    });

    expect('subcategories' in breakdown).toBe(false);
    expect(breakdown.elementCount).toBe(10);
    expect(breakdown.categoryScore).toBeCloseTo(0.47, 2);
  });

  it('treats social impact category score as the single element score', () => {
    const breakdown = rollupB2CCategoryBreakdown('social_impact', 'Social Impact', {
      self_transcendence: mockElement(0.35),
    });

    expect(breakdown.categoryScore).toBe(0.35);
    expect(breakdown.elementCount).toBe(1);
  });

  it('resolves weak category drill-down to target elements', () => {
    const breakdown = rollupB2CCategoryBreakdown('functional', 'Functional', {
      saves_time: mockElement(0.8),
      simplifies: mockElement(0.7),
      makes_money: mockElement(0.2),
      reduces_effort: mockElement(0.75),
      reduces_cost: mockElement(0.15),
      reduces_risk: mockElement(0.6),
      organizes: mockElement(0.5),
      integrates: mockElement(0.55),
      connects: mockElement(0.5),
      quality: mockElement(0.65),
      variety: mockElement(0.5),
      informs: mockElement(0.45),
      avoids_hassles: mockElement(0.5),
      sensory_appeal: mockElement(0.4),
    });

    const guide = getB2CCategoryDiagnosticGuide('functional');
    expect(guide?.elements).toHaveLength(14);

    const target = resolveB2CDrillDownTarget('functional', breakdown);
    expect(target?.elementSlugs).toContain('reduces_cost');
    expect(target?.elementSlugs).toContain('makes_money');
  });
});

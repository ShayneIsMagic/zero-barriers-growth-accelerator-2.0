import { describe, expect, it } from 'vitest';
import {
  countPresentFromElementMap,
  flattenCategoryElementMap,
  mapFlatElementsForStorage,
} from '@/lib/services/structured-storage-utils';

function mockDetail(score: number) {
  return { score, evidence: 'test', recommendation: 'test' };
}

describe('structured-storage-utils', () => {
  it('flattens B2B subcategory elements for nested tiers', () => {
    const flattened = flattenCategoryElementMap({
      categoryName: 'Individual Value',
      subcategories: {
        career: {
          elements: {
            network_expansion: mockDetail(0.8),
            marketability: mockDetail(0.7),
          },
        },
        personal: {
          elements: {
            fun_perks: mockDetail(0.2),
          },
        },
      },
    });

    expect(Object.keys(flattened)).toEqual([
      'network_expansion',
      'marketability',
      'fun_perks',
    ]);
  });

  it('keeps flat table stakes elements unchanged', () => {
    const flattened = flattenCategoryElementMap({
      categoryName: 'Table Stakes',
      elements: {
        meeting_specifications: mockDetail(0.8),
        acceptable_price: mockDetail(0.4),
      },
    });

    expect(Object.keys(flattened)).toEqual([
      'meeting_specifications',
      'acceptable_price',
    ]);
  });

  it('counts present elements from flattened subcategory map', () => {
    const flattened = flattenCategoryElementMap({
      subcategories: {
        economic: {
          elements: {
            improved_top_line: mockDetail(0.8),
            cost_reduction: mockDetail(0.3),
          },
        },
        performance: {
          elements: {
            innovation: mockDetail(0.75),
          },
        },
      },
    });

    const counts = countPresentFromElementMap(flattened);
    expect(counts.totalElements).toBe(3);
    expect(counts.presentElements).toBe(2);
    expect(counts.fraction).toBe('2/3');
  });

  it('maps flattened elements for Prisma storage rows', () => {
    const rows = mapFlatElementsForStorage({
      scalability: mockDetail(0.86),
      cost_reduction: mockDetail(0.2),
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].present).toBe(true);
    expect(rows[1].present).toBe(false);
    expect(rows[0].confidence).toBe(0.86);
  });
});

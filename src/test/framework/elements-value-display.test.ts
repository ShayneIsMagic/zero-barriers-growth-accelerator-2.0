import { describe, expect, it } from 'vitest';
import {
  formatFractionalScore,
  normalizeFractionalScore,
  parseElementsValueAnalysis,
} from '@/lib/framework/elements-value-display';

describe('elements-value-display', () => {
  it('normalizes legacy 0-100 scores to fractional', () => {
    expect(normalizeFractionalScore(85)).toBe(0.85);
    expect(normalizeFractionalScore(0.72)).toBe(0.72);
  });

  it('formats fractional scores as percentages', () => {
    expect(formatFractionalScore(0.756)).toBe('76%');
  });

  it('parses B2B nested categories strength-first', () => {
    const view = parseElementsValueAnalysis('b2b', {
      overallScore: 0.55,
      totalElements: 3,
      topStrengths: [
        {
          element: 'innovation',
          category: 'functional',
          score: 0.82,
          evidence: 'Strong R&D messaging',
        },
      ],
      categories: {
        functional: {
          categoryName: 'Functional Value',
          categoryScore: 0.7,
          elementCount: 2,
          subcategories: {
            performance: {
              subcategoryName: 'Performance',
              subcategoryScore: 0.75,
              elementCount: 2,
              elements: {
                innovation: {
                  score: 0.82,
                  evidence: 'Strong R&D messaging',
                  recommendation: 'Keep highlighting',
                },
                scalability: {
                  score: 0.68,
                  evidence: 'Limited scale proof',
                  recommendation: 'Add case studies',
                },
              },
            },
          },
        },
        table_stakes: {
          categoryName: 'Table Stakes',
          categoryScore: 0.4,
          elementCount: 1,
          elements: {
            acceptable_price: {
              score: 0.4,
              evidence: 'No pricing clarity',
              recommendation: 'Publish pricing tiers',
            },
          },
        },
      },
    });

    expect(view).not.toBeNull();
    expect(view?.topStrengths).toHaveLength(1);
    expect(view?.categories[0]?.categoryKey).toBe('functional');
    expect(view?.categories[0]?.subcategories?.[0]?.elements[0]?.slug).toBe(
      'innovation'
    );
    expect(view?.allElementsRanked[0]?.slug).toBe('innovation');
  });

  it('parses flat B2C categories', () => {
    const view = parseElementsValueAnalysis('b2c', {
      overallScore: 0.6,
      categories: {
        functional: {
          categoryName: 'Functional',
          categoryScore: 0.65,
          elementCount: 1,
          elements: {
            saves_time: {
              score: 0.65,
              evidence: 'Fast checkout',
              recommendation: 'Highlight speed',
            },
          },
        },
      },
    });

    expect(view?.categories[0]?.elements?.[0]?.displayName).toBe('Saves time');
    expect(view?.categories[0]?.subcategories).toBeUndefined();
  });
});

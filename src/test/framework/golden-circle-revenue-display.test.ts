import { describe, expect, it } from 'vitest';

import { parseGoldenCircleAnalysis } from '@/lib/framework/golden-circle-display';
import { parseRevenueTrendsAnalysis } from '@/lib/framework/revenue-trends-display';

describe('golden-circle-display', () => {
  it('parses layered categories and dimensions', () => {
    const view = parseGoldenCircleAnalysis({
      overallScore: 0.62,
      totalElements: 24,
      categories: {
        why: {
          categoryName: 'WHY (Purpose, Cause, Belief)',
          categoryScore: 0.7,
          elementCount: 2,
          elements: {
            clarity: {
              score: 0.8,
              evidence: 'Clear mission statement',
              recommendation: 'Keep emphasizing purpose',
            },
            authenticity: {
              score: 0.6,
              evidence: 'Some generic language',
              recommendation: 'Add founder story',
            },
          },
        },
        how: {
          categoryName: 'HOW (Process, Methodology, Differentiation)',
          categoryScore: 0.5,
          elementCount: 1,
          elements: {
            clarity: {
              score: 0.5,
              evidence: 'Process mentioned briefly',
              recommendation: 'Document methodology',
            },
          },
        },
      },
    });

    expect(view?.overallScore).toBe(0.62);
    expect(view?.layers).toHaveLength(2);
    expect(view?.layers[0]?.layerKey).toBe('why');
    expect(view?.topStrengths[0]?.elementKey).toBe('why:clarity');
  });
});

describe('revenue-trends-display', () => {
  it('parses revenue signal categories', () => {
    const view = parseRevenueTrendsAnalysis({
      overallScore: 0.55,
      totalElements: 3,
      categories: {
        market_signals: {
          categoryName: 'Market Signals',
          categoryScore: 0.6,
          elementCount: 2,
          elements: {
            market_demand: {
              score: 0.7,
              evidence: 'Growing market language',
              recommendation: 'Quantify TAM',
            },
            trending_keywords: {
              score: 0.5,
              evidence: 'Limited trend references',
              recommendation: 'Add search intent copy',
            },
          },
        },
        monetization: {
          categoryName: 'Monetization',
          categoryScore: 0.4,
          elementCount: 1,
          elements: {
            conversion_potential: {
              score: 0.4,
              evidence: 'Weak CTAs',
              recommendation: 'Strengthen trial offer',
            },
          },
        },
      },
    });

    expect(view?.overallScore).toBe(0.55);
    expect(view?.categories).toHaveLength(2);
    expect(view?.categories[0]?.categoryKey).toBe('market_signals');
    expect(view?.allSignalsRanked[0]?.slug).toBe('market_demand');
  });
});

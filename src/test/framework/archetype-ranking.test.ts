import { describe, expect, it } from 'vitest';
import {
  enrichAnalysisWithArchetypeRanking,
  getArchetypeStrengthLabel,
  rankArchetypesFromAnalysis,
} from '@/lib/framework/archetype-ranking';

describe('archetype-ranking', () => {
  const sampleAnalysis = {
    overallScore: 0.65,
    categories: {
      freedom: {
        elements: {
          sage: { score: 0.87, evidence: 'Research guides', recommendation: '' },
          explorer: { score: 0.41, evidence: 'Discover nav', recommendation: '' },
          innocent: { score: 0.22, evidence: '', recommendation: '' },
        },
      },
      ego: {
        elements: {
          hero: { score: 0.74, evidence: 'Success stories', recommendation: '' },
          magician: { score: 0.55, evidence: '', recommendation: '' },
          outlaw: { score: 0.18, evidence: '', recommendation: '' },
        },
      },
      order: {
        elements: {
          caregiver: { score: 0.5, evidence: '', recommendation: '' },
          ruler: { score: 0.48, evidence: '', recommendation: '' },
          creator: { score: 0.6, evidence: '', recommendation: '' },
        },
      },
      social: {
        elements: {
          regular_guy_girl: { score: 0.35, evidence: '', recommendation: '' },
          jester: { score: 0.12, evidence: '', recommendation: '' },
          lover: { score: 0.28, evidence: '', recommendation: '' },
        },
      },
    },
  };

  it('labels strength bands from flat scores', () => {
    expect(getArchetypeStrengthLabel(0.87)).toBe('Dominant');
    expect(getArchetypeStrengthLabel(0.74)).toBe('Strong');
    expect(getArchetypeStrengthLabel(0.55)).toBe('Moderate');
    expect(getArchetypeStrengthLabel(0.12)).toBe('Weak/Absent');
  });

  it('ranks sage as primary and hero as secondary', () => {
    const ranking = rankArchetypesFromAnalysis(sampleAnalysis);
    expect(ranking).not.toBeNull();
    expect(ranking?.primary[0]?.slug).toBe('sage');
    expect(ranking?.secondary.some((item) => item.slug === 'hero')).toBe(true);
    expect(ranking?.dominantCluster.some((item) => item.slug === 'sage')).toBe(
      true
    );
    expect(ranking?.allRanked).toHaveLength(12);
  });

  it('enriches analysis with primary_archetype and secondary_archetypes', () => {
    const enriched = enrichAnalysisWithArchetypeRanking(sampleAnalysis);
    expect(enriched.primary_archetype).toBeDefined();
    expect(Array.isArray(enriched.secondary_archetypes)).toBe(true);
    expect(
      (enriched.secondary_archetypes as Array<{ slug: string }>).some(
        (item) => item.slug === 'hero'
      )
    ).toBe(true);
  });
});

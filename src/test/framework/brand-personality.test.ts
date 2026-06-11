import { describe, expect, it } from 'vitest';
import { deriveArchetypePersonality } from '@/lib/framework/brand-personality';
import { rankArchetypesFromAnalysis } from '@/lib/framework/archetype-ranking';
import { deriveCliftonPersonality } from '@/lib/framework/brand-personality';
import { rankCliftonThemesFromAnalysis } from '@/lib/framework/clifton-theme-ranking';

describe('brand-personality', () => {
  it('detects coherent sage primary personality', () => {
    const ranking = rankArchetypesFromAnalysis({
      categories: {
        freedom: {
          elements: {
            sage: { score: 0.87, evidence: 'Research', recommendation: '' },
            explorer: { score: 0.41, evidence: '', recommendation: '' },
            innocent: { score: 0.22, evidence: '', recommendation: '' },
          },
        },
        ego: {
          elements: {
            hero: { score: 0.74, evidence: 'Stories', recommendation: '' },
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
    });

    const profile = deriveArchetypePersonality(ranking!);
    expect(profile.signalType).toBe('coherent_single');
    expect(profile.headline).toContain('Sage');
    expect(profile.coherenceScore).toBeGreaterThan(0.8);
  });

  it('flags conflicting ruler and regular guy archetypes', () => {
    const ranking = rankArchetypesFromAnalysis({
      categories: {
        freedom: {
          elements: {
            sage: { score: 0.4, evidence: '', recommendation: '' },
            explorer: { score: 0.35, evidence: '', recommendation: '' },
            innocent: { score: 0.3, evidence: '', recommendation: '' },
          },
        },
        ego: {
          elements: {
            hero: { score: 0.5, evidence: '', recommendation: '' },
            magician: { score: 0.45, evidence: '', recommendation: '' },
            outlaw: { score: 0.4, evidence: '', recommendation: '' },
          },
        },
        order: {
          elements: {
            caregiver: { score: 0.5, evidence: '', recommendation: '' },
            ruler: { score: 0.78, evidence: 'Premium authority', recommendation: '' },
            creator: { score: 0.55, evidence: '', recommendation: '' },
          },
        },
        social: {
          elements: {
            regular_guy_girl: {
              score: 0.76,
              evidence: 'Everyday relatable',
              recommendation: '',
            },
            jester: { score: 0.3, evidence: '', recommendation: '' },
            lover: { score: 0.35, evidence: '', recommendation: '' },
          },
        },
      },
    });

    const profile = deriveArchetypePersonality(ranking!);
    expect(profile.tensions.some((t) => t.itemA === 'ruler')).toBe(true);
    expect(['conflicting_signals', 'coherent_blend', 'multi_dominant']).toContain(
      profile.signalType
    );
  });

  it('derives clifton personality from signature themes', () => {
    const ranking = rankCliftonThemesFromAnalysis({
      categories: {
        strategic_thinking: {
          elements: {
            analytical: { score: 0.85, evidence: 'Data-driven', recommendation: '' },
            learner: { score: 0.55, evidence: '', recommendation: '' },
          },
        },
        executing: {
          elements: {
            achiever: { score: 0.72, evidence: 'Results focus', recommendation: '' },
          },
        },
        influencing: {
          elements: {
            command: { score: 0.68, evidence: 'Lead language', recommendation: '' },
          },
        },
        relationship_building: {
          elements: {
            harmony: { score: 0.66, evidence: 'Peace messaging', recommendation: '' },
          },
        },
      },
    });

    const profile = deriveCliftonPersonality(ranking!);
    expect(profile.framework).toBe('clifton-strengths');
    expect(profile.dominantLabels[0]).toBe('Analytical');
    expect(profile.headline).toContain('Analytical');
  });
});

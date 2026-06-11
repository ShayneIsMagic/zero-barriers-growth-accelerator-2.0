import { describe, expect, it } from 'vitest';
import {
  enrichAnalysisWithCliftonRanking,
  rankCliftonThemesFromAnalysis,
} from '@/lib/framework/clifton-theme-ranking';

describe('clifton-theme-ranking', () => {
  const sampleAnalysis = {
    overallScore: 0.68,
    categories: {
      strategic_thinking: {
        categoryScore: 0.75,
        elementCount: 2,
        elements: {
          analytical: {
            score: 0.85,
            evidence: 'Metrics and research',
            recommendation: '',
          },
          learner: { score: 0.65, evidence: 'Learn hub', recommendation: '' },
        },
      },
      executing: {
        categoryScore: 0.6,
        elementCount: 1,
        elements: {
          achiever: { score: 0.6, evidence: 'Results', recommendation: '' },
        },
      },
      influencing: {
        categoryScore: 0.55,
        elementCount: 1,
        elements: {
          communication: {
            score: 0.55,
            evidence: 'Clear copy',
            recommendation: '',
          },
        },
      },
      relationship_building: {
        categoryScore: 0.5,
        elementCount: 1,
        elements: {
          relator: { score: 0.5, evidence: 'Team page', recommendation: '' },
        },
      },
    },
  };

  it('ranks analytical in top five and orders domains canonically', () => {
    const ranking = rankCliftonThemesFromAnalysis(sampleAnalysis);
    expect(ranking?.topFiveStrengths[0]?.slug).toBe('analytical');
    expect(ranking?.dominantDomain?.domainKey).toBe('strategic_thinking');
    expect(ranking?.domainSummaries[0]?.domainKey).toBe('strategic_thinking');
    expect(ranking?.domainSummaries[0]?.themes[0]?.slug).toBe('analytical');
  });

  it('enriches analysis with personality_profile', () => {
    const enriched = enrichAnalysisWithCliftonRanking(sampleAnalysis);
    expect(enriched.top_five_strengths).toHaveLength(5);
    expect(enriched.domain_rankings).toBeDefined();
    expect(enriched.signature_themes).toBeDefined();
    expect(enriched.personality_profile).toBeDefined();
    expect(
      (enriched.personality_profile as { framework: string }).framework
    ).toBe('clifton-strengths');
  });
});

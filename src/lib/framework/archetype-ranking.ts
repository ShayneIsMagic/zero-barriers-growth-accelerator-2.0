/**
 * Derive primary/secondary brand archetypes from flat chunked analysis scores.
 * Authority: docs/frameworks/Brand-Archetypes-Flat-Scoring.md
 */

import { deriveArchetypePersonality } from '@/lib/framework/brand-personality';

export interface ArchetypeElementDetail {
  score: number;
  evidence: string;
  recommendation: string;
}

export interface RankedArchetype {
  slug: string;
  displayName: string;
  group: string;
  score: number;
  evidence: string;
  strengthLabel: 'Dominant' | 'Strong' | 'Moderate' | 'Weak/Absent';
}

export interface ArchetypeRankingSummary {
  name: string;
  slug: string;
  score: number;
  strength: RankedArchetype['strengthLabel'];
  group: string;
  evidence: string;
}

export interface ArchetypeRankingResult {
  overallScore: number;
  /** Top 3 by score — primary strategic read */
  topThree: RankedArchetype[];
  /** Archetypes with weak/absent signals (score < 0.4) — what the brand is not */
  notArchetypes: RankedArchetype[];
  primary: RankedArchetype[];
  secondary: RankedArchetype[];
  dominantCluster: RankedArchetype[];
  allRanked: RankedArchetype[];
}

const ARCHETYPE_DISPLAY_NAMES: Record<string, string> = {
  sage: 'The Sage',
  explorer: 'The Explorer',
  hero: 'The Hero',
  outlaw: 'The Outlaw',
  magician: 'The Magician',
  regular_guy_girl: 'The Regular Guy/Girl',
  jester: 'The Jester',
  caregiver: 'The Caregiver',
  creator: 'The Creator',
  innocent: 'The Innocent',
  lover: 'The Lover',
  ruler: 'The Ruler',
};

const CO_PRIMARY_TOLERANCE = 0.05;
const SECONDARY_MIN_SCORE = 0.6;
const TOP_ARCHETYPE_COUNT = 3;
const WEAK_ARCHETYPE_MAX = 0.4;

export function getArchetypeStrengthLabel(
  score: number
): RankedArchetype['strengthLabel'] {
  if (score >= 0.8) return 'Dominant';
  if (score >= 0.6) return 'Strong';
  if (score >= 0.4) return 'Moderate';
  return 'Weak/Absent';
}

function toRankedArchetype(
  slug: string,
  group: string,
  detail: ArchetypeElementDetail
): RankedArchetype {
  return {
    slug,
    displayName: ARCHETYPE_DISPLAY_NAMES[slug] ?? slug,
    group,
    score: detail.score,
    evidence: detail.evidence,
    strengthLabel: getArchetypeStrengthLabel(detail.score),
  };
}

function isCategoryElements(
  value: unknown
): value is Record<string, ArchetypeElementDetail> {
  if (!value || typeof value !== 'object') return false;
  return Object.values(value).every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      typeof (entry as ArchetypeElementDetail).score === 'number'
  );
}

export function rankArchetypesFromAnalysis(
  analysis: Record<string, unknown>
): ArchetypeRankingResult | null {
  const categories = analysis.categories;
  if (!categories || typeof categories !== 'object') {
    return null;
  }

  const allRanked: RankedArchetype[] = [];

  for (const [group, categoryRaw] of Object.entries(categories)) {
    if (!categoryRaw || typeof categoryRaw !== 'object') continue;
    const elements = (categoryRaw as { elements?: unknown }).elements;
    if (!isCategoryElements(elements)) continue;

    for (const [slug, detail] of Object.entries(elements)) {
      allRanked.push(toRankedArchetype(slug, group, detail));
    }
  }

  if (allRanked.length === 0) {
    return null;
  }

  allRanked.sort((a, b) => b.score - a.score);

  const overallScore =
    typeof analysis.overallScore === 'number'
      ? analysis.overallScore
      : parseFloat(
          (
            allRanked.reduce((sum, item) => sum + item.score, 0) /
            allRanked.length
          ).toFixed(3)
        );

  const topScore = allRanked[0]?.score ?? 0;
  const primary = allRanked.filter(
    (item) => topScore - item.score <= CO_PRIMARY_TOLERANCE
  );

  const primarySlugs = new Set(primary.map((item) => item.slug));
  const secondary = allRanked.filter(
    (item) =>
      !primarySlugs.has(item.slug) && item.score >= SECONDARY_MIN_SCORE
  );

  const dominantCluster = allRanked.filter((item) => item.score >= 0.8);
  const topThree = allRanked.slice(0, TOP_ARCHETYPE_COUNT);
  const notArchetypes = allRanked
    .filter((item) => item.score < WEAK_ARCHETYPE_MAX)
    .sort((a, b) => a.score - b.score);

  return {
    overallScore,
    topThree,
    notArchetypes,
    primary,
    secondary,
    dominantCluster,
    allRanked,
  };
}

export function toArchetypeRankingSummary(
  ranked: RankedArchetype
): ArchetypeRankingSummary {
  return {
    name: ranked.displayName,
    slug: ranked.slug,
    score: ranked.score,
    strength: ranked.strengthLabel,
    group: ranked.group,
    evidence: ranked.evidence,
  };
}

export function enrichAnalysisWithArchetypeRanking(
  analysis: Record<string, unknown>
): Record<string, unknown> {
  const ranking = rankArchetypesFromAnalysis(analysis);
  if (!ranking) {
    return analysis;
  }

  return {
    ...analysis,
    top_three_archetypes: ranking.topThree.map(toArchetypeRankingSummary),
    not_archetypes: ranking.notArchetypes.map(toArchetypeRankingSummary),
    primary_archetype:
      ranking.primary.length === 1
        ? toArchetypeRankingSummary(ranking.primary[0])
        : ranking.primary.map(toArchetypeRankingSummary),
    secondary_archetypes: ranking.secondary.map(toArchetypeRankingSummary),
    dominant_cluster: ranking.dominantCluster.map(toArchetypeRankingSummary),
    archetype_ranking: {
      overallScore: ranking.overallScore,
      allRanked: ranking.allRanked.map(toArchetypeRankingSummary),
    },
    personality_profile: deriveArchetypePersonality(ranking),
  };
}

/**
 * Derive signature CliftonStrengths themes and domain balance from chunked analysis.
 * Authority: docs/frameworks/CliftonStrengths-Flat-Scoring.md
 */

import { deriveCliftonPersonality } from '@/lib/framework/brand-personality';

export interface CliftonThemeDetail {
  score: number;
  evidence: string;
  recommendation: string;
}

export interface RankedCliftonTheme {
  slug: string;
  displayName: string;
  domain: string;
  domainLabel: string;
  score: number;
  evidence: string;
  strengthLabel: 'Dominant' | 'Supporting' | 'Moderate' | 'Lesser';
}

export interface CliftonDomainSummary {
  domainKey: string;
  domainLabel: string;
  domainScore: number;
  themeCount: number;
  topTheme?: RankedCliftonTheme;
  /** Themes in this domain, ranked by score descending */
  themes: RankedCliftonTheme[];
}

export interface CliftonThemeRankingResult {
  overallScore: number;
  /** Top 5 themes across all 34 */
  topFiveStrengths: RankedCliftonTheme[];
  signatureThemes: RankedCliftonTheme[];
  supportingThemes: RankedCliftonTheme[];
  dominantDomain: CliftonDomainSummary | null;
  domainSummaries: CliftonDomainSummary[];
  allRanked: RankedCliftonTheme[];
}

const DOMAIN_DISPLAY_ORDER = [
  'strategic_thinking',
  'executing',
  'influencing',
  'relationship_building',
] as const;

const TOP_STRENGTH_COUNT = 5;

const THEME_DISPLAY_NAMES: Record<string, string> = {
  analytical: 'Analytical',
  context: 'Context',
  futuristic: 'Futuristic',
  ideation: 'Ideation',
  input: 'Input',
  intellection: 'Intellection',
  learner: 'Learner',
  strategic: 'Strategic',
  achiever: 'Achiever',
  arranger: 'Arranger',
  belief: 'Belief',
  consistency: 'Consistency',
  deliberative: 'Deliberative',
  discipline: 'Discipline',
  focus: 'Focus',
  responsibility: 'Responsibility',
  restorative: 'Restorative',
  activator: 'Activator',
  command: 'Command',
  communication: 'Communication',
  competition: 'Competition',
  maximizer: 'Maximizer',
  self_assurance: 'Self-Assurance',
  significance: 'Significance',
  woo: 'Woo',
  adaptability: 'Adaptability',
  connectedness: 'Connectedness',
  developer: 'Developer',
  empathy: 'Empathy',
  harmony: 'Harmony',
  includer: 'Includer',
  individualization: 'Individualization',
  positivity: 'Positivity',
  relator: 'Relator',
};

const DOMAIN_LABELS: Record<string, string> = {
  strategic_thinking: 'Strategic Thinking',
  executing: 'Executing',
  influencing: 'Influencing',
  relationship_building: 'Relationship Building',
};

const SIGNATURE_MIN_SCORE = 0.8;
const SUPPORTING_MIN_SCORE = 0.6;
const CO_SIGNATURE_TOLERANCE = 0.05;

export function getCliftonStrengthLabel(
  score: number
): RankedCliftonTheme['strengthLabel'] {
  if (score >= 0.8) return 'Dominant';
  if (score >= 0.6) return 'Supporting';
  if (score >= 0.4) return 'Moderate';
  return 'Lesser';
}

function isCategoryElements(
  value: unknown
): value is Record<string, CliftonThemeDetail> {
  if (!value || typeof value !== 'object') return false;
  return Object.values(value).every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      typeof (entry as CliftonThemeDetail).score === 'number'
  );
}

function toRankedTheme(
  slug: string,
  domain: string,
  detail: CliftonThemeDetail
): RankedCliftonTheme {
  return {
    slug,
    displayName: THEME_DISPLAY_NAMES[slug] ?? slug.replace(/_/g, ' '),
    domain,
    domainLabel: DOMAIN_LABELS[domain] ?? domain.replace(/_/g, ' '),
    score: detail.score,
    evidence: detail.evidence,
    strengthLabel: getCliftonStrengthLabel(detail.score),
  };
}

export function rankCliftonThemesFromAnalysis(
  analysis: Record<string, unknown>
): CliftonThemeRankingResult | null {
  const categories = analysis.categories;
  if (!categories || typeof categories !== 'object') {
    return null;
  }

  const allRanked: RankedCliftonTheme[] = [];

  for (const [domainKey, categoryRaw] of Object.entries(categories)) {
    if (!categoryRaw || typeof categoryRaw !== 'object') continue;
    const elements = (categoryRaw as { elements?: unknown }).elements;
    if (!isCategoryElements(elements)) continue;

    for (const [slug, detail] of Object.entries(elements)) {
      allRanked.push(toRankedTheme(slug, domainKey, detail));
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
  const coSignature = allRanked.filter(
    (item) => topScore - item.score <= CO_SIGNATURE_TOLERANCE && item.score >= SIGNATURE_MIN_SCORE
  );

  const signatureThemes =
    coSignature.length > 0
      ? coSignature
      : allRanked.filter((item) => item.score >= SIGNATURE_MIN_SCORE);

  const signatureSlugs = new Set(signatureThemes.map((item) => item.slug));
  const supportingThemes = allRanked.filter(
    (item) =>
      !signatureSlugs.has(item.slug) && item.score >= SUPPORTING_MIN_SCORE
  );

  const domainSummaries: CliftonDomainSummary[] = Object.entries(categories)
    .map(([domainKey, categoryRaw]) => {
      if (!categoryRaw || typeof categoryRaw !== 'object') {
        return null;
      }
      const category = categoryRaw as {
        categoryScore?: number;
        elementCount?: number;
        elements?: Record<string, CliftonThemeDetail>;
      };
      const domainThemes = allRanked
        .filter((item) => item.domain === domainKey)
        .sort((a, b) => b.score - a.score);
      const domainScore =
        typeof category.categoryScore === 'number'
          ? category.categoryScore
          : domainThemes.length > 0
            ? domainThemes.reduce((sum, item) => sum + item.score, 0) /
              domainThemes.length
            : 0;

      return {
        domainKey,
        domainLabel: DOMAIN_LABELS[domainKey] ?? domainKey.replace(/_/g, ' '),
        domainScore: parseFloat(domainScore.toFixed(3)),
        themeCount: category.elementCount ?? domainThemes.length,
        themes: domainThemes,
        ...(domainThemes[0] ? { topTheme: domainThemes[0] } : {}),
      };
    })
    .filter((item): item is CliftonDomainSummary => item !== null);

  const domainSummariesOrdered = DOMAIN_DISPLAY_ORDER.map((domainKey) =>
    domainSummaries.find((domain) => domain.domainKey === domainKey)
  ).filter((domain): domain is CliftonDomainSummary => domain !== undefined);

  const domainSummariesByScore = [...domainSummariesOrdered].sort(
    (a, b) => b.domainScore - a.domainScore
  );

  return {
    overallScore,
    topFiveStrengths: allRanked.slice(0, TOP_STRENGTH_COUNT),
    signatureThemes,
    supportingThemes,
    dominantDomain: domainSummariesByScore[0] ?? null,
    domainSummaries: domainSummariesOrdered,
    allRanked,
  };
}

export function enrichAnalysisWithCliftonRanking(
  analysis: Record<string, unknown>
): Record<string, unknown> {
  const ranking = rankCliftonThemesFromAnalysis(analysis);
  if (!ranking) {
    return analysis;
  }

  return {
    ...analysis,
    top_five_strengths: ranking.topFiveStrengths.map((theme) => ({
      name: theme.displayName,
      slug: theme.slug,
      score: theme.score,
      strength: theme.strengthLabel,
      domain: theme.domainLabel,
      evidence: theme.evidence,
    })),
    domain_rankings: ranking.domainSummaries.map((domain) => ({
      name: domain.domainLabel,
      slug: domain.domainKey,
      score: domain.domainScore,
      themeCount: domain.themeCount,
      themes: domain.themes.map((theme) => ({
        name: theme.displayName,
        slug: theme.slug,
        score: theme.score,
        strength: theme.strengthLabel,
        evidence: theme.evidence,
      })),
    })),
    signature_themes: ranking.signatureThemes.map((theme) => ({
      name: theme.displayName,
      slug: theme.slug,
      score: theme.score,
      strength: theme.strengthLabel,
      domain: theme.domainLabel,
      evidence: theme.evidence,
    })),
    supporting_themes: ranking.supportingThemes.map((theme) => ({
      name: theme.displayName,
      slug: theme.slug,
      score: theme.score,
      strength: theme.strengthLabel,
      domain: theme.domainLabel,
      evidence: theme.evidence,
    })),
    dominant_domain: ranking.dominantDomain
      ? {
          name: ranking.dominantDomain.domainLabel,
          slug: ranking.dominantDomain.domainKey,
          score: ranking.dominantDomain.domainScore,
        }
      : null,
    theme_ranking: {
      overallScore: ranking.overallScore,
      allRanked: ranking.allRanked.map((theme) => ({
        name: theme.displayName,
        slug: theme.slug,
        score: theme.score,
        strength: theme.strengthLabel,
        domain: theme.domainLabel,
        evidence: theme.evidence,
      })),
    },
    personality_profile: deriveCliftonPersonality(ranking),
  };
}

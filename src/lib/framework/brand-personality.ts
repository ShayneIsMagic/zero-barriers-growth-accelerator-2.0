/**
 * Derive site/page "personality" from dominant CliftonStrengths themes and brand archetypes.
 * Flags coherent blends, multi-dominant voices, and conflicting signals.
 */

import type { ArchetypeRankingResult } from '@/lib/framework/archetype-ranking';
import type { CliftonThemeRankingResult } from '@/lib/framework/clifton-theme-ranking';

export type PersonalitySignalType =
  | 'coherent_single'
  | 'coherent_blend'
  | 'multi_dominant'
  | 'conflicting_signals'
  | 'undefined_identity'
  | 'generic_messaging';

export interface PersonalityTension {
  itemA: string;
  itemB: string;
  labelA: string;
  labelB: string;
  scoreA: number;
  scoreB: number;
  reason: string;
}

export interface PersonalityProfile {
  framework: 'brand-archetypes' | 'clifton-strengths';
  headline: string;
  summary: string;
  signalType: PersonalitySignalType;
  dominantLabels: string[];
  supportingLabels: string[];
  tensions: PersonalityTension[];
  /** 0–1 — higher means more consistent personality signals */
  coherenceScore: number;
}

const TENSION_MIN_SCORE = 0.6;
const MULTI_DOMINANT_MIN = 3;
const UNDEFINED_MAX_TOP = 0.5;
const GENERIC_SPREAD_MAX = 0.15;
const SIGNATURE_MIN_SCORE = 0.8;

const ARCHETYPE_TENSION_PAIRS: Array<{
  slugA: string;
  slugB: string;
  reason: string;
}> = [
  {
    slugA: 'ruler',
    slugB: 'regular_guy_girl',
    reason: 'Elite control conflicts with approachable everyman positioning',
  },
  {
    slugA: 'innocent',
    slugB: 'outlaw',
    reason: 'Pure optimism conflicts with rebellious disruption',
  },
  {
    slugA: 'hero',
    slugB: 'jester',
    reason: 'Serious achievement conflicts with playful irreverence',
  },
  {
    slugA: 'sage',
    slugB: 'jester',
    reason: 'Authoritative wisdom conflicts with humorous levity',
  },
  {
    slugA: 'caregiver',
    slugB: 'outlaw',
    reason: 'Nurturing support conflicts with rule-breaking tone',
  },
  {
    slugA: 'ruler',
    slugB: 'explorer',
    reason: 'Structured authority conflicts with freedom-seeking adventure',
  },
  {
    slugA: 'innocent',
    slugB: 'magician',
    reason: 'Simple trust conflicts with transformative complexity',
  },
  {
    slugA: 'creator',
    slugB: 'ruler',
    reason: 'Artistic freedom conflicts with imposed control',
  },
  {
    slugA: 'hero',
    slugB: 'innocent',
    reason: 'Bold challenge narrative conflicts with sheltered simplicity',
  },
  {
    slugA: 'lover',
    slugB: 'sage',
    reason: 'Passionate intimacy conflicts with detached expertise',
  },
];

const CLIFTON_TENSION_PAIRS: Array<{
  slugA: string;
  slugB: string;
  reason: string;
}> = [
  {
    slugA: 'command',
    slugB: 'harmony',
    reason: 'Decisive authority conflicts with consensus-seeking tone',
  },
  {
    slugA: 'competition',
    slugB: 'harmony',
    reason: 'Win-at-all-costs language conflicts with cooperative peace-making',
  },
  {
    slugA: 'deliberative',
    slugB: 'activator',
    reason: 'Cautious deliberation conflicts with urgent action messaging',
  },
  {
    slugA: 'consistency',
    slugB: 'individualization',
    reason: 'Uniform standards conflict with celebrate-uniqueness positioning',
  },
  {
    slugA: 'focus',
    slugB: 'adaptability',
    reason: 'Narrow prioritization conflicts with go-with-the-flow flexibility',
  },
  {
    slugA: 'maximizer',
    slugB: 'harmony',
    reason: 'Relentless excellence conflicts with conflict-avoidant calm',
  },
  {
    slugA: 'belief',
    slugB: 'adaptability',
    reason: 'Fixed values messaging conflicts with fluid responsiveness',
  },
  {
    slugA: 'significance',
    slugB: 'harmony',
    reason: 'Stand-out importance conflicts with blend-in consensus',
  },
];

function findTensions(
  ranked: Array<{ slug: string; displayName: string; score: number }>,
  pairs: Array<{ slugA: string; slugB: string; reason: string }>
): PersonalityTension[] {
  const bySlug = new Map(ranked.map((item) => [item.slug, item]));
  const tensions: PersonalityTension[] = [];

  for (const pair of pairs) {
    const a = bySlug.get(pair.slugA);
    const b = bySlug.get(pair.slugB);
    if (!a || !b) continue;
    if (a.score < TENSION_MIN_SCORE || b.score < TENSION_MIN_SCORE) continue;

    tensions.push({
      itemA: pair.slugA,
      itemB: pair.slugB,
      labelA: a.displayName,
      labelB: b.displayName,
      scoreA: a.score,
      scoreB: b.score,
      reason: pair.reason,
    });
  }

  return tensions.sort(
    (left, right) =>
      Math.min(right.scoreA, right.scoreB) - Math.min(left.scoreA, left.scoreB)
  );
}

function computeCoherenceScore(
  signalType: PersonalitySignalType,
  tensionCount: number
): number {
  const base: Record<PersonalitySignalType, number> = {
    coherent_single: 0.95,
    coherent_blend: 0.85,
    multi_dominant: 0.55,
    conflicting_signals: 0.35,
    undefined_identity: 0.25,
    generic_messaging: 0.2,
  };
  return parseFloat(
    Math.max(0, base[signalType] - tensionCount * 0.08).toFixed(2)
  );
}

function joinLabels(labels: string[]): string {
  if (labels.length === 0) return 'Undefined';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}–${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`;
}

export function deriveArchetypePersonality(
  ranking: ArchetypeRankingResult
): PersonalityProfile {
  const topScore = ranking.allRanked[0]?.score ?? 0;
  const spread =
    topScore - (ranking.allRanked[ranking.allRanked.length - 1]?.score ?? 0);

  const dominantLabels = ranking.topThree.map((item) => item.displayName);
  const supportingLabels = ranking.notArchetypes
    .slice(0, 3)
    .map((item) => item.displayName);

  const tensions = findTensions(ranking.allRanked, ARCHETYPE_TENSION_PAIRS);

  let signalType: PersonalitySignalType;
  let summary: string;

  if (topScore < UNDEFINED_MAX_TOP) {
    signalType = 'undefined_identity';
    summary =
      'No archetype clearly leads the narrative. Messaging reads as generic or product-spec focused rather than a distinct brand personality.';
  } else if (spread <= GENERIC_SPREAD_MAX && topScore < 0.65) {
    signalType = 'generic_messaging';
    summary =
      'Scores cluster in a narrow middle band with no strong archetype voice. The site may lack a memorable brand personality.';
  } else if (tensions.length >= 2) {
    signalType = 'conflicting_signals';
    summary = `Multiple archetype voices compete at similar strength (${joinLabels(dominantLabels)} with tension from ${tensions
      .slice(0, 2)
      .map((t) => `${t.labelA} vs ${t.labelB}`)
      .join('; ')}). Visitors may perceive mixed or inconsistent brand tone across pages.`;
  } else if (ranking.dominantCluster.length >= MULTI_DOMINANT_MIN) {
    signalType = 'multi_dominant';
    summary = `${ranking.dominantCluster.length} archetypes score as dominant (≥0.8): ${ranking.dominantCluster
      .map((item) => item.displayName)
      .join(', ')}. The brand projects multiple strong personalities — intentional only if pages target different audiences.`;
  } else if (ranking.primary.length > 1) {
    signalType = 'coherent_blend';
    summary = `Co-primary archetype blend (${joinLabels(dominantLabels)}). These voices reinforce each other when messaging is intentional; watch for page-level drift.`;
  } else {
    signalType = 'coherent_single';
    const primary = ranking.primary[0];
    summary = `A clear ${primary?.displayName ?? 'archetype'} personality leads the brand voice${
      supportingLabels.length > 0
        ? `, supported by ${supportingLabels.join(', ')}`
        : ''
    }.`;
  }

  const headline =
    signalType === 'undefined_identity' || signalType === 'generic_messaging'
      ? 'Undefined brand personality'
      : `${joinLabels(dominantLabels)} brand voice`;

  return {
    framework: 'brand-archetypes',
    headline,
    summary,
    signalType,
    dominantLabels,
    supportingLabels,
    tensions,
    coherenceScore: computeCoherenceScore(signalType, tensions.length),
  };
}

export function deriveCliftonPersonality(
  ranking: CliftonThemeRankingResult
): PersonalityProfile {
  const topScore = ranking.allRanked[0]?.score ?? 0;
  const spread =
    topScore - (ranking.allRanked[ranking.allRanked.length - 1]?.score ?? 0);

  const dominantLabels = ranking.topFiveStrengths.map((item) => item.displayName);

  const supportingLabels = ranking.domainSummaries
    .slice(0, 2)
    .map((domain) => domain.domainLabel);

  const tensions = findTensions(ranking.allRanked, CLIFTON_TENSION_PAIRS);

  const domainsWithSignature = ranking.domainSummaries.filter(
    (domain) => (domain.topTheme?.score ?? 0) >= SIGNATURE_MIN_SCORE
  );

  let signalType: PersonalitySignalType;
  let summary: string;

  if (topScore < UNDEFINED_MAX_TOP) {
    signalType = 'undefined_identity';
    summary =
      'No CliftonStrengths themes emerge strongly from the content. Organizational personality is unclear from page copy alone.';
  } else if (spread <= GENERIC_SPREAD_MAX && topScore < 0.65) {
    signalType = 'generic_messaging';
    summary =
      'Theme scores sit in a flat middle range without signature strengths. Content may not express a recognizable operating personality.';
  } else if (tensions.length >= 2) {
    signalType = 'conflicting_signals';
    summary = `Competing theme signals (${tensions
      .slice(0, 2)
      .map((t) => `${t.labelA} vs ${t.labelB}`)
      .join('; ')}). Copy may sound authoritative on one page and consensus-driven on another.`;
  } else if (domainsWithSignature.length >= 2) {
    signalType = 'multi_dominant';
    summary = `Signature strengths span multiple domains (${domainsWithSignature
      .map((d) => d.domainLabel)
      .join(', ')}). The site projects a multi-faceted personality — ${joinLabels(dominantLabels)} lead with ${ranking.dominantDomain?.domainLabel ?? 'mixed'} domain emphasis.`;
  } else if (ranking.signatureThemes.length > 1) {
    signalType = 'coherent_blend';
    summary = `Signature theme blend (${joinLabels(dominantLabels)}) within a ${ranking.dominantDomain?.domainLabel ?? 'primary'} domain voice.`;
  } else {
    signalType = 'coherent_single';
    summary = `A ${dominantLabels[0] ?? 'signature'} personality leads${
      ranking.dominantDomain
        ? ` through ${ranking.dominantDomain.domainLabel}`
        : ''
    }${
      supportingLabels.length > 0
        ? `, with supporting ${supportingLabels.join(', ')} themes`
        : ''
    }.`;
  }

  const headline =
    signalType === 'undefined_identity' || signalType === 'generic_messaging'
      ? 'Undefined content personality'
      : `${joinLabels(dominantLabels.slice(0, 2))} voice${
          ranking.dominantDomain ? ` (${ranking.dominantDomain.domainLabel})` : ''
        }`;

  return {
    framework: 'clifton-strengths',
    headline,
    summary,
    signalType,
    dominantLabels,
    supportingLabels,
    tensions,
    coherenceScore: computeCoherenceScore(signalType, tensions.length),
  };
}

export function getPersonalitySignalLabel(
  signalType: PersonalitySignalType
): string {
  const labels: Record<PersonalitySignalType, string> = {
    coherent_single: 'Clear personality',
    coherent_blend: 'Intentional blend',
    multi_dominant: 'Multiple personalities',
    conflicting_signals: 'Conflicting signals',
    undefined_identity: 'Undefined identity',
    generic_messaging: 'Generic messaging',
  };
  return labels[signalType];
}

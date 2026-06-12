'use client';

import { Badge } from '@/components/ui/badge';
import { BrandPersonalityPanel } from '@/components/analysis/BrandPersonalityPanel';
import {
  deriveArchetypePersonality,
  type PersonalityProfile,
} from '@/lib/framework/brand-personality';
import {
  rankArchetypesFromAnalysis,
  type ArchetypeRankingSummary,
  type RankedArchetype,
} from '@/lib/framework/archetype-ranking';
import { useMemo } from 'react';

interface BrandArchetypeResultsPanelProps {
  analysis: Record<string, unknown> | null | undefined;
}

interface ArchetypeSummaryCardProps {
  item: ArchetypeRankingSummary | RankedArchetype;
  variant: 'top' | 'not';
  rank?: number;
}

function ArchetypeSummaryCard({ item, variant, rank }: ArchetypeSummaryCardProps) {
  const name = 'displayName' in item ? item.displayName : item.name;
  const strength = 'strengthLabel' in item ? item.strengthLabel : item.strength;
  const group = item.group;
  const evidence = item.evidence;

  const cardClass =
    variant === 'top'
      ? 'rounded-md border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/40'
      : 'rounded-md border border-muted bg-muted/30 p-3';

  return (
    <div className={cardClass}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        {variant === 'top' && rank ? (
          <span className="text-xs font-medium text-muted-foreground">#{rank}</span>
        ) : null}
        <span className="font-medium">{name}</span>
        <Badge variant={variant === 'not' ? 'outline' : 'default'}>
          {item.score.toFixed(2)}
        </Badge>
        <Badge variant="outline">{strength}</Badge>
        <Badge variant="secondary">{group}</Badge>
      </div>
      {evidence ? (
        <p className="text-xs text-muted-foreground">{evidence}</p>
      ) : null}
    </div>
  );
}

export function BrandArchetypeResultsPanel({
  analysis,
}: BrandArchetypeResultsPanelProps) {
  const archetypeRanking = useMemo(
    () =>
      analysis && typeof analysis === 'object'
        ? rankArchetypesFromAnalysis(analysis)
        : null,
    [analysis]
  );

  const topThreeFromApi = useMemo((): ArchetypeRankingSummary[] => {
    if (!analysis || typeof analysis !== 'object') {
      return [];
    }
    const raw = analysis.top_three_archetypes;
    return Array.isArray(raw) ? (raw as ArchetypeRankingSummary[]) : [];
  }, [analysis]);

  const notArchetypesFromApi = useMemo((): ArchetypeRankingSummary[] => {
    if (!analysis || typeof analysis !== 'object') {
      return [];
    }
    const raw = analysis.not_archetypes;
    return Array.isArray(raw) ? (raw as ArchetypeRankingSummary[]) : [];
  }, [analysis]);

  const personalityProfile = useMemo((): PersonalityProfile | null => {
    if (!analysis || typeof analysis !== 'object') {
      return null;
    }
    const fromApi = analysis.personality_profile as PersonalityProfile | undefined;
    if (fromApi?.headline) {
      return fromApi;
    }
    return archetypeRanking ? deriveArchetypePersonality(archetypeRanking) : null;
  }, [analysis, archetypeRanking]);

  if (!archetypeRanking) {
    return null;
  }

  return (
    <div className="space-y-4">
      <BrandPersonalityPanel profile={personalityProfile} />

      <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Overall score</span>
          <Badge variant="secondary">
            {(
              archetypeRanking.overallScore ??
              (typeof analysis?.overallScore === 'number' ? analysis.overallScore : 0)
            ).toFixed(3)}
          </Badge>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Top 3 archetypes</h4>
          <div className="space-y-2">
            {(topThreeFromApi.length > 0
              ? topThreeFromApi
              : archetypeRanking.topThree
            ).map((item, index) => (
              <ArchetypeSummaryCard
                key={'slug' in item ? item.slug : (item as RankedArchetype).slug}
                item={item}
                variant="top"
                rank={index + 1}
              />
            ))}
          </div>
        </div>

        {(notArchetypesFromApi.length > 0 ||
          archetypeRanking.notArchetypes.length > 0) && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">What you&apos;re not</h4>
            <div className="space-y-2">
              {(notArchetypesFromApi.length > 0
                ? notArchetypesFromApi
                : archetypeRanking.notArchetypes
              ).map((item) => (
                <ArchetypeSummaryCard
                  key={'slug' in item ? item.slug : (item as RankedArchetype).slug}
                  item={item}
                  variant="not"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

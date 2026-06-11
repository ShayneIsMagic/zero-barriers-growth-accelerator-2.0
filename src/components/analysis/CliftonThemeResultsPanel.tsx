'use client';

import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { BrandPersonalityPanel } from '@/components/analysis/BrandPersonalityPanel';
import {
  deriveCliftonPersonality,
  type PersonalityProfile,
} from '@/lib/framework/brand-personality';
import {
  formatFractionalScoreDecimal,
  getFractionalScoreBadgeVariant,
  getFractionalScoreTextClass,
  normalizeFractionalScore,
} from '@/lib/framework/elements-value-display';
import {
  rankCliftonThemesFromAnalysis,
  type RankedCliftonTheme,
} from '@/lib/framework/clifton-theme-ranking';
import { useMemo } from 'react';

interface CliftonThemeResultsPanelProps {
  analysis: Record<string, unknown> | null | undefined;
}

export function CliftonThemeResultsPanel({
  analysis,
}: CliftonThemeResultsPanelProps) {
  const ranking = useMemo(
    () =>
      analysis && typeof analysis === 'object'
        ? rankCliftonThemesFromAnalysis(analysis)
        : null,
    [analysis]
  );

  const personalityProfile = useMemo((): PersonalityProfile | null => {
    if (!analysis || typeof analysis !== 'object') {
      return null;
    }
    const fromApi = analysis.personality_profile as PersonalityProfile | undefined;
    if (fromApi?.headline) {
      return fromApi;
    }
    return ranking ? deriveCliftonPersonality(ranking) : null;
  }, [analysis, ranking]);

  if (!ranking) {
    return null;
  }

  return (
    <div className="space-y-6">
      <BrandPersonalityPanel profile={personalityProfile} />

      <div className="rounded-lg border bg-muted/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Overall theme score</span>
          <Badge variant="secondary">
            {formatFractionalScoreDecimal(ranking.overallScore)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {ranking.allRanked.length} themes analyzed
          </span>
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall</span>
            <span className={getFractionalScoreTextClass(ranking.overallScore)}>
              {Math.round(normalizeFractionalScore(ranking.overallScore) * 100)}%
            </span>
          </div>
          <Progress
            value={Math.round(normalizeFractionalScore(ranking.overallScore) * 100)}
            className="h-2"
          />
        </div>
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Rankings by domain</h4>
        <p className="text-xs text-muted-foreground">
          Each CliftonStrengths domain with themes ranked within the category.
        </p>
        <Accordion
          type="multiple"
          defaultValue={ranking.domainSummaries.map((domain) => domain.domainKey)}
          className="rounded-lg border px-4"
        >
          {ranking.domainSummaries.map((domain) => (
            <AccordionItem key={domain.domainKey} value={domain.domainKey}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 items-center justify-between gap-3 pr-2 text-left">
                  <span className="font-medium">{domain.domainLabel}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${getFractionalScoreTextClass(domain.domainScore)}`}
                    >
                      {formatFractionalScoreDecimal(domain.domainScore)}
                    </span>
                    <Badge variant="outline">{domain.themeCount} themes</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pb-4">
                {domain.themes.map((theme, index) => (
                  <ThemeRow key={theme.slug} theme={theme} rank={index + 1} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Top 5 strengths (all 34 themes)</h4>
        <div className="space-y-2">
          {ranking.topFiveStrengths.map((theme, index) => (
            <ThemeCard key={theme.slug} theme={theme} rank={index + 1} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">
          Full theme listing ({ranking.allRanked.length})
        </h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {ranking.allRanked.map((theme, index) => (
            <div
              key={theme.slug}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>
                {index + 1}. {theme.displayName}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({theme.domainLabel})
                </span>
              </span>
              <Badge variant={getFractionalScoreBadgeVariant(theme.score)}>
                {formatFractionalScoreDecimal(theme.score)}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface ThemeCardProps {
  theme: RankedCliftonTheme;
  rank: number;
}

function ThemeCard({ theme, rank }: ThemeCardProps) {
  return (
    <div className="rounded-md border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/40">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">#{rank}</span>
        <span className="font-medium">{theme.displayName}</span>
        <Badge variant={getFractionalScoreBadgeVariant(theme.score)}>
          {formatFractionalScoreDecimal(theme.score)}
        </Badge>
        <Badge variant="outline">{theme.domainLabel}</Badge>
        <Badge variant="secondary">{theme.strengthLabel}</Badge>
      </div>
      {theme.evidence ? (
        <p className="text-xs text-muted-foreground">{theme.evidence}</p>
      ) : null}
    </div>
  );
}

interface ThemeRowProps {
  theme: RankedCliftonTheme;
  rank: number;
}

function ThemeRow({ theme, rank }: ThemeRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-background p-2 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">#{rank}</span>
          <span className="font-medium">{theme.displayName}</span>
          <Badge variant="secondary">{theme.strengthLabel}</Badge>
        </div>
        {theme.evidence ? (
          <p className="mt-1 text-xs text-muted-foreground">{theme.evidence}</p>
        ) : null}
      </div>
      <Badge variant={getFractionalScoreBadgeVariant(theme.score)}>
        {formatFractionalScoreDecimal(theme.score)}
      </Badge>
    </div>
  );
}

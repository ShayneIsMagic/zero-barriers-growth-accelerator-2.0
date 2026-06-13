'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownFallbackViewer } from '@/components/analysis/MarkdownFallbackViewer';
import {
  AssessmentWorkflowSteps,
  resolveAssessmentWorkflowStep,
} from '@/components/analysis/AssessmentWorkflowSteps';
import { FrameworkCollectEvaluatePanel } from '@/components/analysis/FrameworkCollectEvaluatePanel';
import { useFrameworkCollectEvaluateWorkflow } from '@/hooks/useFrameworkCollectEvaluateWorkflow';
import { CheckCircle2, Copy, Download, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { WorkflowTraceabilityPanel } from '@/components/analysis/WorkflowTraceabilityPanel';
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

export function BrandArchetypesPage() {
  const [url, setUrl] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [scrapedContent, setScrapedContent] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    isAnalyzing,
    isCollecting,
    isEvaluating,
    isFlaskRunning,
    isFromCache,
    collectedData,
    rawCollectionData,
    collectionMode,
    percent,
    currentCategory,
    completedCategories,
    result,
    error: streamError,
    analysisMethod,
    handleCollect,
    handleRefreshCollection,
    runEvaluationAi,
    runEvaluationFlask,
    hasCollectedContent,
  } = useFrameworkCollectEvaluateWorkflow({
    endpoint: '/api/analyze/brand-archetypes-standalone',
    url,
    proposedContent,
    scrapedContent,
    setLocalError: (message) => {
      if (message === 'Invalid JSON in scraped content field') {
        setLocalError(
          'Scraped content JSON is invalid. Paste valid JSON from Content-Comparison.'
        );
        return;
      }
      setLocalError(message);
    },
  });

  const isBusy = isAnalyzing || isCollecting;

  const error = streamError || localError;
  const analysisPayload = result?.analysis || result?.comparison || result?.data;

  const archetypeRanking = useMemo(() => {
    if (!analysisPayload || typeof analysisPayload !== 'object') {
      return null;
    }
    return rankArchetypesFromAnalysis(
      analysisPayload as Record<string, unknown>
    );
  }, [analysisPayload]);

  const topThreeFromApi = useMemo((): ArchetypeRankingSummary[] => {
    if (!analysisPayload || typeof analysisPayload !== 'object') {
      return [];
    }
    const raw = (analysisPayload as Record<string, unknown>).top_three_archetypes;
    return Array.isArray(raw) ? (raw as ArchetypeRankingSummary[]) : [];
  }, [analysisPayload]);

  const notArchetypesFromApi = useMemo((): ArchetypeRankingSummary[] => {
    if (!analysisPayload || typeof analysisPayload !== 'object') {
      return [];
    }
    const raw = (analysisPayload as Record<string, unknown>).not_archetypes;
    return Array.isArray(raw) ? (raw as ArchetypeRankingSummary[]) : [];
  }, [analysisPayload]);

  const personalityProfile = useMemo((): PersonalityProfile | null => {
    if (!analysisPayload || typeof analysisPayload !== 'object') {
      return null;
    }
    const fromApi = (analysisPayload as Record<string, unknown>)
      .personality_profile as PersonalityProfile | undefined;
    if (fromApi?.headline) {
      return fromApi;
    }
    const ranking = rankArchetypesFromAnalysis(
      analysisPayload as Record<string, unknown>
    );
    return ranking ? deriveArchetypePersonality(ranking) : null;
  }, [analysisPayload]);

  const runAnalysis = async () => {
    setLocalError(null);
    await runEvaluationAi();
  };

  const runDeterministic = async () => {
    setLocalError(null);
    await runEvaluationFlask();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const markdown = generateBrandArchetypesMarkdown(result);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `brand-archetypes-analysis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className='mx-auto max-w-7xl space-y-6 p-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-purple-600' />
            Brand Archetypes Assessment
          </CardTitle>
          <CardDescription>
            Evaluate all 12 Jambojon brand archetypes with flat scoring and full
            element coverage verification.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <AssessmentWorkflowSteps
            currentStep={resolveAssessmentWorkflowStep({
              hasResult: Boolean(result),
              isAnalyzing: isEvaluating,
              isCollecting,
              hasCollectedContent,
              isFlaskRunning,
            })}
          />
          <div>
            <label htmlFor='brand-archetypes-url' className='mb-2 block text-sm font-medium'>
              Website URL
            </label>
            <Input
              id='brand-archetypes-url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='https://example.com'
              disabled={isBusy}
            />
          </div>

          <div>
            <label
              htmlFor='brand-archetypes-proposed-content'
              className='mb-2 block text-sm font-medium'
            >
              Proposed Content (Optional)
            </label>
            <Textarea
              id='brand-archetypes-proposed-content'
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              placeholder='Paste your proposed homepage or marketing content here...'
              disabled={isBusy}
              className='min-h-[140px]'
            />
          </div>

          <div>
            <label
              htmlFor='brand-archetypes-scraped-content'
              className='mb-2 block text-sm font-medium'
            >
              Paste Scraped Content (Optional - from Content-Comparison)
            </label>
            <Textarea
              id='brand-archetypes-scraped-content'
              value={scrapedContent}
              onChange={(e) => setScrapedContent(e.target.value)}
              placeholder='Paste the "Copy Scraped Data" JSON from the Content-Comparison page to skip re-scraping...'
              disabled={isBusy}
              className='min-h-[100px] font-mono text-xs'
            />
            <p className='mt-2 text-xs text-muted-foreground'>
              Reusing scraped content reduces 403/timeouts and keeps runs consistent.
            </p>
          </div>

          <FrameworkCollectEvaluatePanel
            endpoint='/api/analyze/brand-archetypes-standalone'
            url={url}
            proposedContent={proposedContent}
            scrapedContent={scrapedContent}
            setLocalError={setLocalError}
            analyzeIcon={<Sparkles className='mr-2 h-4 w-4' />}
            analysisMethod={analysisMethod}
            collectedData={collectedData}
            rawCollectionData={rawCollectionData}
            collectionMode={collectionMode}
            isFromCache={isFromCache}
            isCollecting={isCollecting}
            isEvaluating={isEvaluating}
            isFlaskRunning={isFlaskRunning}
            isBusy={isBusy}
            hasUrl={Boolean(url.trim())}
            percent={percent}
            currentCategory={currentCategory}
            completedCategories={completedCategories}
            onCollect={handleCollect}
            onRefreshCollection={handleRefreshCollection}
            onRunAnalysis={runAnalysis}
            onRunDeterministic={runDeterministic}
          />
        </CardContent>
      </Card>

      <WorkflowTraceabilityPanel
        featureName='Brand Archetypes'
        collectionPrompts={[
          'Collect archetype cues from headlines and story framing',
          'Collect CTA intent and emotional language',
          'Collect testimonials and trust narrative',
          'Collect mission/belief statements and promise language',
          'Collect navigation labels and image alt text cues',
        ]}
        executionSteps={[
          'Parse raw scraped payload and evidence streams',
          'Score all 12 archetypes in block mode',
          'Merge archetype chunks and generate one unified report',
          'Store reports to show both chunked and unified outputs',
        ]}
        rawData={result?.puppeteerEvidence || result?.existing || scrapedContent || null}
        analyzedData={analysisPayload || null}
        traceabilityData={result?.traceability || null}
        versionInfo={{
          assessmentType: 'brand-archetypes-standalone',
          hasReadableReport: Boolean(result?.readableMarkdown),
        }}
      />

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisPayload && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              Brand Archetypes Results
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <BrandPersonalityPanel profile={personalityProfile} />

            {archetypeRanking && (
              <div className='space-y-4 rounded-lg border bg-muted/40 p-4'>
                <div className='flex flex-wrap items-center gap-3'>
                  <span className='text-sm font-medium'>Overall score</span>
                  <Badge variant='secondary'>
                    {(
                      archetypeRanking.overallScore ??
                      (analysisPayload as { overallScore?: number })?.overallScore ??
                      0
                    ).toFixed(3)}
                  </Badge>
                </div>

                <div>
                  <h4 className='mb-2 text-sm font-semibold'>Top 3 archetypes</h4>
                  <p className='mb-3 text-xs text-muted-foreground'>
                    The three strongest brand voices in the content.
                  </p>
                  <div className='space-y-2'>
                    {(topThreeFromApi.length > 0
                      ? topThreeFromApi
                      : archetypeRanking.topThree
                    ).map((item, index) => (
                      <ArchetypeSummaryCard
                        key={'slug' in item ? item.slug : (item as RankedArchetype).slug}
                        item={item}
                        variant='top'
                        rank={index + 1}
                      />
                    ))}
                  </div>
                </div>

                {(notArchetypesFromApi.length > 0 ||
                  archetypeRanking.notArchetypes.length > 0) && (
                  <div>
                    <h4 className='mb-2 text-sm font-semibold'>
                      What you&apos;re not
                    </h4>
                    <p className='mb-3 text-xs text-muted-foreground'>
                      Weak or absent archetypes (score &lt; 0.4) — narratives the site does not project.
                    </p>
                    <div className='space-y-2'>
                      {(notArchetypesFromApi.length > 0
                        ? notArchetypesFromApi
                        : archetypeRanking.notArchetypes
                      ).map((item) => (
                        <ArchetypeSummaryCard
                          key={'slug' in item ? item.slug : (item as RankedArchetype).slug}
                          item={item}
                          variant='not'
                        />
                      ))}
                    </div>
                  </div>
                )}

                <details className='rounded-lg border bg-background'>
                  <summary className='cursor-pointer px-4 py-3 text-sm font-medium'>
                    All 12 archetypes (ranked)
                  </summary>
                  <div className='grid gap-2 border-t p-4 sm:grid-cols-2'>
                    {archetypeRanking.allRanked.map((item, index) => (
                      <div
                        key={item.slug}
                        className='flex items-center justify-between rounded-md border px-3 py-2 text-sm'
                      >
                        <span>
                          {index + 1}. {item.displayName}
                        </span>
                        <Badge variant='outline'>{item.score.toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            <details className='rounded-lg border'>
              <summary className='cursor-pointer px-4 py-3 text-sm font-medium'>
                Raw JSON response
              </summary>
              <div className='border-t bg-green-50 p-4 dark:bg-green-950'>
                <pre className='overflow-x-auto whitespace-pre-wrap text-xs'>
                  {JSON.stringify(analysisPayload, null, 2)}
                </pre>
              </div>
            </details>

            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                onClick={() =>
                  copyToClipboard(JSON.stringify(analysisPayload, null, 2))
                }
              >
                <Copy className='mr-2 h-4 w-4' />
                Copy Analysis
              </Button>
              <Button variant='outline' onClick={downloadMarkdown}>
                <Download className='mr-2 h-4 w-4' />
                Download Markdown
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result?.analysis?._isFallback && (
        <MarkdownFallbackViewer
          frameworkName='Brand Archetypes'
          markdownContent={result.analysis.fallbackMarkdown}
          errorMessage={result.analysis.error}
        />
      )}
    </div>
  );
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
      <div className='mb-1 flex flex-wrap items-center gap-2'>
        {variant === 'top' && rank ? (
          <span className='text-xs font-medium text-muted-foreground'>#{rank}</span>
        ) : null}
        <span className='font-medium'>{name}</span>
        <Badge variant={variant === 'not' ? 'outline' : 'default'}>
          {item.score.toFixed(2)}
        </Badge>
        <Badge variant='outline'>{strength}</Badge>
        <Badge variant='secondary'>{group}</Badge>
      </div>
      {evidence ? (
        <p className='text-xs text-muted-foreground'>{evidence}</p>
      ) : null}
    </div>
  );
}

function generateBrandArchetypesMarkdown(result: Record<string, unknown>): string {
  const resultObj = result as {
    existing?: { title?: string; url?: string };
    analysis?: unknown;
    comparison?: unknown;
    data?: unknown;
    message?: string;
  };

  const analysisData =
    resultObj.analysis || resultObj.comparison || resultObj.data || {};
  const title = resultObj.existing?.title || 'Untitled';
  const sourceUrl = resultObj.existing?.url || '';

  return `# Brand Archetypes Analysis

## Source
- URL: ${sourceUrl}
- Title: ${title}

## Results
\`\`\`json
${JSON.stringify(analysisData, null, 2)}
\`\`\`

## Notes
- ${resultObj.message || 'Brand Archetypes analysis completed'}
`;
}

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownFallbackViewer } from '@/components/analysis/MarkdownFallbackViewer';
import { useChunkedAnalysis } from '@/hooks/useChunkedAnalysis';
import { CheckCircle2, Copy, Download, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { WorkflowTraceabilityPanel } from '@/components/analysis/WorkflowTraceabilityPanel';

export function BrandArchetypesPage() {
  const [url, setUrl] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [scrapedContent, setScrapedContent] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    isAnalyzing,
    percent,
    currentCategory,
    completedCategories,
    result,
    error: streamError,
    runAnalysis: runStreamingAnalysis,
  } = useChunkedAnalysis('/api/analyze/brand-archetypes-standalone');

  const error = streamError || localError;
  const analysisPayload = result?.analysis || result?.comparison || result?.data;

  const runAnalysis = async () => {
    if (!url.trim()) return;
    setLocalError(null);

    let existingContent = null;
    if (scrapedContent.trim()) {
      try {
        existingContent = JSON.parse(scrapedContent.trim());
      } catch {
        setLocalError(
          'Scraped content JSON is invalid. Paste valid JSON from Content-Comparison.'
        );
        return;
      }
    }

    await runStreamingAnalysis({
      url: url.trim(),
      proposedContent: proposedContent.trim(),
      existingContent,
      analysisType: 'full',
      stream: true,
    });
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
          <div>
            <label htmlFor='brand-archetypes-url' className='mb-2 block text-sm font-medium'>
              Website URL
            </label>
            <Input
              id='brand-archetypes-url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='https://example.com'
              disabled={isAnalyzing}
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
              disabled={isAnalyzing}
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
              disabled={isAnalyzing}
              className='min-h-[100px] font-mono text-xs'
            />
            <p className='mt-2 text-xs text-muted-foreground'>
              Reusing scraped content reduces 403/timeouts and keeps runs consistent.
            </p>
          </div>

          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || !url.trim()}
            className='w-full'
          >
            {isAnalyzing ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Running Brand Archetypes Analysis...
              </>
            ) : (
              <>
                <Sparkles className='mr-2 h-4 w-4' />
                Analyze Brand Archetypes
              </>
            )}
          </Button>
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

      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Analysis Progress</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Progress value={percent} className='h-2' />
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>{percent}% complete</span>
              <span>{currentCategory || 'Preparing analysis...'}</span>
            </div>
            {completedCategories.length > 0 && (
              <div className='text-xs text-muted-foreground'>
                Completed: {completedCategories.join(', ')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            <div className='rounded-lg border bg-green-50 p-4 dark:bg-green-950'>
              <h4 className='mb-2 font-semibold'>Assessment Results</h4>
              <div className='whitespace-pre-wrap text-sm'>
                {JSON.stringify(analysisPayload, null, 2)}
              </div>
            </div>

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

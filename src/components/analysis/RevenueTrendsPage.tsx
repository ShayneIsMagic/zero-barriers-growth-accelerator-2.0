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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AssessmentWorkflowSteps,
  resolveAssessmentWorkflowStep,
} from '@/components/analysis/AssessmentWorkflowSteps';
import { RevenueTrendsResultsPanel } from '@/components/analysis/RevenueTrendsResultsPanel';
import { WorkflowTraceabilityPanel } from '@/components/analysis/WorkflowTraceabilityPanel';
import { FrameworkAnalyzeActions } from '@/components/analysis/FrameworkAnalyzeActions';
import { useFrameworkPageAnalysis } from '@/hooks/useFrameworkPageAnalysis';
import { generateRevenueTrendsMarkdown as buildRevenueTrendsMarkdown } from '@/lib/framework/revenue-trends-display';
import { buildFrameworkPageRunParams } from '@/lib/framework/framework-page-run-params';
import { CheckCircle2, Copy, Download, Loader2, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export function RevenueTrendsPage() {
  const [url, setUrl] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [scrapedContent, setScrapedContent] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    isAnalyzing,
    isCollecting,
    percent,
    currentCategory,
    completedCategories,
    result,
    error: streamError,
    runAnalysis: runFrameworkAnalysis,
    runDeterministicAnalysis,
    isFlaskRunning,
    analysisMethod,
  } = useFrameworkPageAnalysis('/api/analyze/revenue-trends');

  const isBusy = isAnalyzing || isCollecting;
  const error = streamError || localError;
  const analysisPayload =
    result?.analysis || result?.comparison || result?.data;

  const pageRunInput = {
    url,
    proposedContent,
    scrapedContent,
    setLocalError: (message: string | null) => {
      if (message === 'Invalid JSON in scraped content field') {
        setLocalError(
          'Scraped content JSON is invalid. Paste valid JSON from Content-Comparison.'
        );
        return;
      }
      setLocalError(message);
    },
  };

  const runAnalysis = async () => {
    if (!url.trim()) {
      setLocalError('Please enter a URL');
      return;
    }
    setLocalError(null);
    const params = buildFrameworkPageRunParams(pageRunInput);
    if (!params) return;
    await runFrameworkAnalysis(params);
  };

  const runDeterministic = async () => {
    if (!url.trim()) {
      setLocalError('Please enter a URL');
      return;
    }
    setLocalError(null);
    const params = buildFrameworkPageRunParams(pageRunInput);
    if (!params) return;
    await runDeterministicAnalysis(params);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadMarkdown = () => {
    if (!result) return;

    const markdown = buildRevenueTrendsMarkdown(result as Record<string, unknown>);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-trends-analysis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6" />
            Revenue-Focused Market Analysis
          </CardTitle>
          <CardDescription>
            Identify underserved market demand and emerging revenue
            opportunities through AI-powered content strategy analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AssessmentWorkflowSteps
            currentStep={resolveAssessmentWorkflowStep({
              hasResult: Boolean(result),
              isAnalyzing,
              isCollecting,
            })}
          />
          {/* URL Input */}
          <div>
            <label
              htmlFor="website-url"
              className="mb-2 block text-sm font-medium"
            >
              Website URL
            </label>
            <Input
              id="website-url"
              name="website-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isBusy}
              aria-label="Enter website URL to analyze"
              aria-describedby="url-help"
              autoComplete="url"
              required
            />
            <p id="url-help" className="mt-1 text-xs text-muted-foreground">
              We&apos;ll analyze your website to identify market gaps and revenue
              opportunities
            </p>
          </div>

          {/* Proposed Content */}
          <div>
            <label
              htmlFor="proposed-content"
              className="mb-2 block text-sm font-medium"
            >
              Proposed New Content (Optional)
            </label>
            <Textarea
              id="proposed-content"
              name="proposed-content"
              placeholder="Paste your proposed new content here for revenue analysis...

Example:
# Revenue Growth Strategy

## Market Opportunities
- Underserved segments in the B2B space
- Emerging trends in digital transformation
- New pricing models and value propositions

## Revenue Streams
- Subscription-based services
- Consulting and implementation
- Training and certification programs

[Your content here...]"
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              disabled={isBusy}
              className="min-h-[200px] font-mono text-sm"
              aria-label="Enter proposed new content for revenue analysis"
              aria-describedby="content-help"
            />
            <p id="content-help" className="mt-2 text-xs text-muted-foreground">
              💡 Leave empty to just analyze existing content. Add proposed
              content to see side-by-side comparison.
            </p>
          </div>

          {/* Paste Scraped Content (from Content-Comparison) */}
          <div>
            <label
              htmlFor="scraped-content"
              className="mb-2 block text-sm font-medium"
            >
              Paste Scraped Content (Optional - from Content-Comparison)
            </label>
            <Textarea
              id="scraped-content"
              name="scraped-content"
              placeholder='Paste the "Copy Scraped Data" JSON from the Content-Comparison page here to reuse already-scraped content...

Example: {"title":"...","metaDescription":"...","wordCount":...}'
              value={scrapedContent}
              onChange={(e) => setScrapedContent(e.target.value)}
              disabled={isBusy}
              className="min-h-[100px] font-mono text-xs"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              💡 Reusing scraped content prevents re-scraping and reduces 403/timeouts.
            </p>
          </div>

          {/* What You Get */}
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
            <h4 className="mb-2 font-semibold text-green-900 dark:text-green-100">
              What You Get:
            </h4>
            <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-green-600 dark:text-green-400">
                  •
                </span>
                <span>Market gap identification and revenue opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-green-600 dark:text-green-400">
                  •
                </span>
                <span>Underserved customer segments analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-green-600 dark:text-green-400">
                  •
                </span>
                <span>Pricing strategy recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-green-600 dark:text-green-400">
                  •
                </span>
                <span>Competitive positioning insights</span>
              </li>
            </ul>
            <div className="mt-3 flex gap-4 text-xs text-green-700 dark:text-green-300">
              <span>⏱️ 2-3 minutes</span>
              <span>📊 Intermediate</span>
              <span>✅ None - just enter your website URL</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FrameworkAnalyzeActions
            endpoint="/api/analyze/revenue-trends"
            isBusy={isBusy}
            isFlaskRunning={isFlaskRunning}
            hasUrl={Boolean(url.trim())}
            onRunAnalysis={runAnalysis}
            onRunDeterministic={runDeterministic}
            analysisMethod={analysisMethod}
            hasProposedContent={Boolean(proposedContent.trim())}
            analyzeIcon={<TrendingUp className="mr-2 h-4 w-4" />}
          />

          {(isAnalyzing || isCollecting) && (
            <div className="space-y-2">
              <Progress value={percent} className="h-3" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {currentCategory
                    ? `Evaluating ${currentCategory}...`
                    : 'Starting analysis...'}
                </span>
                <span>{percent}%</span>
              </div>
              {completedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {completedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <WorkflowTraceabilityPanel
        featureName='Revenue-Focused Market Analysis'
        collectionPrompts={[
          'Collect market-demand and opportunity language from key pages',
          'Collect offer/pricing/benefit claims and proof points',
          'Collect audience intent cues from CTAs and navigation',
          'Collect testimonial and result-oriented language',
          'Collect purpose and positioning statements',
        ]}
        executionSteps={[
          'Use provided scraped dataset if available',
          'Run revenue trends analysis with category chunking',
          'Generate merged plus unified narrative report',
          'Review raw vs analyzed outputs for each run',
        ]}
        rawData={result?.puppeteerEvidence || result?.existing || scrapedContent || null}
        analyzedData={analysisPayload || null}
        traceabilityData={result?.traceability || null}
        versionInfo={{
          assessmentType: 'revenue-trends',
          hasReadableReport: Boolean(result?.readableMarkdown),
        }}
      />

      {/* Results */}
      {result && (
        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
            <TabsTrigger value="existing">Existing Content</TabsTrigger>
            {result.proposed && (
              <TabsTrigger value="proposed">Proposed Content</TabsTrigger>
            )}
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenue Trends Analysis</CardTitle>
                    <CardDescription>
                      Market opportunities and revenue potential analysis
                    </CardDescription>
                  </div>
                  <Button onClick={downloadMarkdown} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                    {analysisPayload && (
                      <>
                        {result.proposed && (
                          <div className="mb-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border p-4">
                              <h3 className="mb-3 flex items-center justify-between text-lg font-semibold">
                                Existing Content Analysis
                                <Badge variant="outline">Current</Badge>
                              </h3>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <strong>Title:</strong> {result.existing.title}
                                </div>
                                <div>
                                  <strong>Meta Description:</strong>{' '}
                                  {result.existing.metaDescription}
                                </div>
                                <div>
                                  <strong>Word Count:</strong>{' '}
                                  {result.existing.wordCount}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950">
                              <h3 className="mb-3 flex items-center justify-between text-lg font-semibold text-green-900 dark:text-green-100">
                                Proposed Content Analysis
                                <Badge variant="default" className="bg-green-600">
                                  New
                                </Badge>
                              </h3>
                              <div className="space-y-3 text-sm text-green-900 dark:text-green-100">
                                <div>
                                  <strong>Title:</strong> {result.proposed.title}
                                </div>
                                <div>
                                  <strong>Meta Description:</strong>{' '}
                                  {result.proposed.metaDescription}
                                </div>
                                <div>
                                  <strong>Word Count:</strong>{' '}
                                  {result.proposed.wordCount}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <RevenueTrendsResultsPanel
                          analysis={analysisPayload as Record<string, unknown>}
                        />

                        <Button
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(analysisPayload, null, 2)
                            )
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy JSON
                        </Button>
                      </>
                    )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Existing Content Tab */}
          <TabsContent value="existing">
            <Card>
              <CardHeader>
                <CardTitle>Existing Website Content</CardTitle>
                <CardDescription>
                  Current live content from {url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-semibold">Meta Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Title:</strong>{' '}
                        {result.existing?.title || 'N/A'}
                      </div>
                      <div>
                        <strong>Description:</strong>{' '}
                        {result.existing?.metaDescription || 'N/A'}
                      </div>
                      <div>
                        <strong>Keywords:</strong>{' '}
                        {result.existing?.metaKeywords?.join(', ') || 'None'}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-semibold">Content Preview</h4>
                    <div className="max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs dark:bg-gray-900">
                        {result.existing?.cleanText || 'No content available'}
                      </pre>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      📊 Total content length:{' '}
                      {result.existing?.cleanText?.length?.toLocaleString() ||
                        0}{' '}
                      characters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proposed Content Tab */}
          {result.proposed && (
            <TabsContent value="proposed">
              <Card>
                <CardHeader>
                  <CardTitle>Proposed New Content</CardTitle>
                  <CardDescription>
                    Your suggested content changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-3">
                      <h4 className="mb-2 font-semibold">
                        Proposed Meta Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Title:</strong> {result.proposed.title}
                        </div>
                        <div>
                          <strong>Description:</strong>{' '}
                          {result.proposed.metaDescription}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3">
                      <h4 className="mb-2 font-semibold">Proposed Content</h4>
                      <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs dark:bg-gray-900">
                        {result.proposed.cleanText}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

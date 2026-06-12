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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  CheckCircle2,
  Copy,
  Download,
  History,
  Loader2,
  Plus,
  Save,
} from 'lucide-react';
import { useState } from 'react';
import { MarkdownFallbackViewer } from '@/components/analysis/MarkdownFallbackViewer';
import {
  AssessmentWorkflowSteps,
  resolveAssessmentWorkflowStep,
} from '@/components/analysis/AssessmentWorkflowSteps';
import { Progress } from '@/components/ui/progress';
import { useFrameworkPageAnalysis } from '@/hooks/useFrameworkPageAnalysis';
import {
  createProposedContent as postProposedContent,
  createVersionComparison as postVersionComparison,
  saveContentSnapshot,
} from '@/services/content-api';
import { WorkflowTraceabilityPanel } from '@/components/analysis/WorkflowTraceabilityPanel';
import { CliftonThemeResultsPanel } from '@/components/analysis/CliftonThemeResultsPanel';
import { FrameworkAnalyzeActions } from '@/components/analysis/FrameworkAnalyzeActions';
import { buildFrameworkPageRunParams } from '@/lib/framework/framework-page-run-params';

export function CliftonStrengthsPage() {
  const [url, setUrl] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [scrapedContent, setScrapedContent] = useState('');

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
  } = useFrameworkPageAnalysis('/api/analyze/clifton-strengths-standalone');

  const isBusy = isAnalyzing || isCollecting;

  const [localError, setLocalError] = useState<string | null>(null);
  const error = streamError || localError;

  // Version control state
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [proposedContentId, setProposedContentId] = useState<string | null>(
    null
  );
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [isCreatingProposed, setIsCreatingProposed] = useState(false);

  const pageRunInput = {
    url,
    proposedContent,
    scrapedContent,
    setLocalError,
  };

  const runAnalysis = async () => {
    const params = buildFrameworkPageRunParams(pageRunInput);
    if (!params) return;
    await runFrameworkAnalysis(params);
  };

  const runDeterministic = async () => {
    const params = buildFrameworkPageRunParams(pageRunInput);
    if (!params) return;
    await runDeterministicAnalysis(params);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const _copyAnalysis = () => {
    if (!result) return;
    const analysisText =
      typeof result.analysis === 'string'
        ? result.analysis
        : JSON.stringify(result.analysis, null, 2);
    copyToClipboard(analysisText);
  };

  const downloadMarkdown = () => {
    if (!result) return;

    const markdown = generateCliftonStrengthsMarkdown(result);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clifton-strengths-analysis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Version control functions
  const saveSnapshot = async () => {
    if (!url.trim() || !result?.existingData) {
      setLocalError('Please run analysis first to save snapshot');
      return;
    }

    setIsSavingSnapshot(true);
    setLocalError(null);

    try {
      const data = await saveContentSnapshot({
        url: url.trim(),
        title: result.existingData.title || 'Untitled',
        content: result.existingData.cleanText || '',
        metadata: {
          wordCount: result.existingData.wordCount,
          keywords: result.existingData.extractedKeywords,
          headings: result.existingData.headings,
        },
      });

      if (data.success) {
        setSnapshotId(data.snapshot.id);
        setLocalError(null);
      } else {
        setLocalError(data.error || 'Failed to save snapshot');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save snapshot');
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  const createProposedVersion = async () => {
    if (!snapshotId || !proposedContent.trim()) {
      setLocalError('Please save a snapshot first and enter proposed content');
      return;
    }

    setIsCreatingProposed(true);
    setLocalError(null);

    try {
      const data = await postProposedContent({
        snapshotId,
        content: proposedContent.trim(),
      });

      if (data.success) {
        setProposedContentId(data.proposedContent.id);
        setLocalError(null);
      } else {
        setLocalError(data.error || 'Failed to create proposed version');
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Failed to create proposed version'
      );
    } finally {
      setIsCreatingProposed(false);
    }
  };

  const createVersionComparison = async () => {
    if (!snapshotId || !proposedContentId) {
      setLocalError('Please save snapshot and create proposed version first');
      return;
    }

    try {
      const data = await postVersionComparison({
        existingId: snapshotId,
        proposedId: proposedContentId,
        analysisResults: result?.comparison || null,
        similarityScore: result?.similarityScore || null,
      });

      if (data.success) {
        setLocalError(null);
      } else {
        setLocalError(data.error || 'Failed to create version comparison');
      }
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? err.message
          : 'Failed to create version comparison'
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6" />
            CliftonStrengths Analysis
          </CardTitle>
          <CardDescription>
            Analyze your website using CliftonStrengths framework - discover
            your natural talents and strengths
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
              Enter the URL of the website you want to analyze
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
              placeholder="Paste your proposed new content here for CliftonStrengths analysis...

Example:
# Our Team's Strengths

We leverage our natural talents to deliver exceptional results.

## Key Strengths
- Strategic Thinking
- Relationship Building
- Execution Excellence
- Innovation Leadership

[Your content here...]"
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              disabled={isBusy}
              className="min-h-[200px] font-mono text-sm"
              aria-label="Enter proposed new content for CliftonStrengths analysis"
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
              placeholder='Paste the "Copy Scraped Data" JSON from the Content-Comparison page here to reuse the scraped content...

Example: {"title":"...","metaDescription":"...","wordCount":...}'
              value={scrapedContent}
              onChange={(e) => setScrapedContent(e.target.value)}
              disabled={isBusy}
              className="min-h-[100px] font-mono text-xs"
              aria-label="Paste scraped content from content-comparison"
              aria-describedby="scraped-help"
            />
            <p id="scraped-help" className="mt-2 text-xs text-muted-foreground">
              💡 Paste the &quot;Copy Scraped Data&quot; JSON from Content-Comparison page
              to reuse already-scraped content. This prevents re-scraping.
            </p>
          </div>

          {/* What You Get */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
              What You Get:
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>34 CliftonStrengths themes analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>Natural talent identification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>Team dynamics optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>Leadership development insights</span>
              </li>
            </ul>
            <div className="mt-3 flex gap-4 text-xs text-blue-700 dark:text-blue-300">
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
            endpoint="/api/analyze/clifton-strengths-standalone"
            isBusy={isBusy}
            isFlaskRunning={isFlaskRunning}
            hasUrl={Boolean(url.trim())}
            onRunAnalysis={runAnalysis}
            onRunDeterministic={runDeterministic}
            analysisMethod={analysisMethod}
            hasProposedContent={Boolean(proposedContent.trim())}
            analyzeIcon={<Brain className="mr-2 h-4 w-4" />}
          />

          {/* Chunk Progress Bar */}
          {(isAnalyzing || isCollecting) && (
            <div className="space-y-2">
              <Progress value={percent} className="h-3" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {currentCategory ? `Evaluating ${currentCategory}...` : 'Starting analysis...'}
                </span>
                <span>{percent}%</span>
              </div>
              {completedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {completedCategories.map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Version Control Buttons */}
          {result && (
            <div className="flex gap-2 border-t pt-4">
              <Button
                onClick={saveSnapshot}
                disabled={isSavingSnapshot || !!snapshotId}
                variant="outline"
                size="sm"
              >
                {isSavingSnapshot ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {snapshotId ? 'Snapshot Saved' : 'Save Snapshot'}
                  </>
                )}
              </Button>

              <Button
                onClick={createProposedVersion}
                disabled={
                  isCreatingProposed ||
                  !snapshotId ||
                  !proposedContent.trim() ||
                  !!proposedContentId
                }
                variant="outline"
                size="sm"
              >
                {isCreatingProposed ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {proposedContentId
                      ? 'Version Created'
                      : 'Create Proposed Version'}
                  </>
                )}
              </Button>

              <Button
                onClick={createVersionComparison}
                disabled={!snapshotId || !proposedContentId}
                variant="outline"
                size="sm"
              >
                <History className="mr-2 h-4 w-4" />
                Save Comparison
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <WorkflowTraceabilityPanel
        featureName='CliftonStrengths'
        collectionPrompts={[
          'Collect language signals showing strategic thinking patterns',
          'Collect execution/process discipline evidence',
          'Collect influencing and persuasion language',
          'Collect relationship-building and empathy signals',
          'Collect CTA, headlines, testimonials, and purpose language',
        ]}
        executionSteps={[
          'Validate and parse raw scraped content payload',
          'Run chunked theme analysis by strengths domain',
          'Merge domain outputs and build unified strategic summary',
          'Store outputs for replay and report comparison',
        ]}
        rawData={result?.puppeteerEvidence || result?.existing || scrapedContent || null}
        analyzedData={result?.analysis || result?.comparison || null}
        traceabilityData={result?.traceability || null}
        versionInfo={{
          assessmentType: 'clifton-strengths-standalone',
          snapshotId,
          proposedContentId,
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
                    <CardTitle>CliftonStrengths Analysis</CardTitle>
                    <CardDescription>
                      34 CliftonStrengths themes framework analysis
                    </CardDescription>
                  </div>
                  <Button onClick={downloadMarkdown} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fallback: Show Markdown prompt when AI is unavailable */}
                {result.analysis?._isFallback && result.analysis?.fallbackMarkdown && (
                  <MarkdownFallbackViewer
                    markdownContent={result.analysis.fallbackMarkdown}
                    frameworkName="CliftonStrengths"
                    errorMessage={result.analysis.error || 'AI analysis unavailable'}
                  />
                )}

                {result.analysis && !result.analysis._isFallback && (
                  <CliftonThemeResultsPanel analysis={result.analysis} />
                )}

                {result.analysis && !result.analysis._isFallback && (
                  <details className="rounded-lg border">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                      Raw JSON response
                    </summary>
                    <div className="border-t bg-muted/50 p-4">
                      <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs">
                        {JSON.stringify(result.analysis, null, 2)}
                      </pre>
                      <Button
                        className="mt-3"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(result.analysis, null, 2)
                          )
                        }
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Analysis
                      </Button>
                    </div>
                  </details>
                )}

                {/* Complete Analysis Data */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Analysis Data</CardTitle>
                    <CardDescription>
                      Full analysis results including existing and proposed
                      content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <h4 className="mb-2 font-semibold">
                          Full Analysis Results
                        </h4>
                        <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                      <Button
                        onClick={() =>
                          copyToClipboard(JSON.stringify(result, null, 2))
                        }
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Complete Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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

function generateCliftonStrengthsMarkdown(result: any): string {
  return `# CliftonStrengths Analysis

**URL:** ${result.url || 'N/A'}
**Date:** ${new Date().toLocaleString()}
**Analysis Type:** CliftonStrengths

---

## Existing Content

**Title:** ${result.existing?.title || 'N/A'}
**Meta Description:** ${result.existing?.metaDescription || 'N/A'}
**Word Count:** ${result.existing?.wordCount || 'N/A'}
**Keywords:** ${result.existing?.extractedKeywords?.slice(0, 10).join(', ') || 'None'}

${
  result.proposed
    ? `
## Proposed Content

**Title:** ${result.proposed.title}
**Meta Description:** ${result.proposed.metaDescription}
**Word Count:** ${result.proposed.wordCount}
**Keywords:** ${result.proposed.extractedKeywords?.slice(0, 10).join(', ') || 'None'}

---

## CliftonStrengths Analysis Results

${JSON.stringify(result.data, null, 2)}
`
    : ''
}

---

Generated by Zero Barriers Growth Accelerator
`;
}

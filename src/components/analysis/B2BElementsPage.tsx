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
  BarChart3,
  Brain,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  History,
  Loader2,
  Plus,
  Save,
  Target,
  TrendingUp,
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
import { FrameworkAnalyzeActions } from '@/components/analysis/FrameworkAnalyzeActions';
import { ElementsValueResultsPanel } from '@/components/analysis/ElementsValueResultsPanel';
import { generateElementsValueMarkdown } from '@/lib/framework/elements-value-display';
import { buildFrameworkPageRunParams } from '@/lib/framework/framework-page-run-params';

export function B2BElementsPage() {
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
  } = useFrameworkPageAnalysis('/api/analyze/elements-value-b2b-standalone');

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

  const copyAnalysis = () => {
    if (!result) return;
    const analysisText =
      typeof result.comparison === 'string'
        ? result.comparison
        : JSON.stringify(result.comparison, null, 2);
    copyToClipboard(analysisText);
  };

  const downloadMarkdown = () => {
    if (!result) return;

    const markdown = generateB2BMarkdown(result);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `b2b-elements-analysis-${new Date().toISOString().split('T')[0]}.md`;
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
            <BarChart3 className="h-6 w-6" />
            B2B Elements of Value Analysis
          </CardTitle>
          <CardDescription>
            Analyze your website using B2B Elements of Value framework - perfect
            for enterprise and B2B businesses
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
              placeholder="Paste your proposed new content here for B2B Elements analysis...

Example:
# Enterprise Solutions

Comprehensive B2B solutions that drive business growth and operational efficiency.

## Key Benefits
- Cost Reduction
- Scalability
- Integration
- Support

[Your content here...]"
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              disabled={isBusy}
              className="min-h-[200px] font-mono text-sm"
              aria-label="Enter proposed new content for B2B Elements analysis"
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
                <span>40 B2B Elements of Value analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>Enterprise value proposition optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>Sales enablement recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>Customer retention strategy insights</span>
              </li>
            </ul>
            <div className="mt-3 flex gap-4 text-xs text-blue-700 dark:text-blue-300">
              <span>⏱️ 2-3 minutes</span>
              <span>📊 Beginner</span>
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
            endpoint="/api/analyze/elements-value-b2b-standalone"
            isBusy={isBusy}
            isFlaskRunning={isFlaskRunning}
            hasUrl={Boolean(url.trim())}
            onRunAnalysis={runAnalysis}
            onRunDeterministic={runDeterministic}
            analysisMethod={analysisMethod}
            hasProposedContent={Boolean(proposedContent.trim())}
            analyzeIcon={<BarChart3 className="mr-2 h-4 w-4" />}
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
        featureName='B2B Elements of Value'
        collectionPrompts={[
          'Collect enterprise claims and value proposition statements',
          'Collect CTA language and conversion intent text',
          'Collect trust proof: clients, certifications, compliance language',
          'Collect process/method descriptions and integration claims',
          'Collect nav labels, headings, and image alt text',
        ]}
        executionSteps={[
          'Use provided scraped content when available, else scrape source',
          'Run block-based B2B category scoring with complete coverage',
          'Generate merged chunk output and unified narrative report',
          'Persist raw, chunked, and unified artifacts for reuse',
        ]}
        rawData={result?.puppeteerEvidence || result?.existing || scrapedContent || null}
        analyzedData={result?.analysis || result?.comparison || null}
        traceabilityData={result?.traceability || null}
        versionInfo={{
          assessmentType: 'elements-value-b2b-standalone',
          snapshotId,
          proposedContentId,
          hasReadableReport: Boolean(result?.readableMarkdown),
        }}
      />

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Header with Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-green-600" />
                    B2B Elements of Value Analysis
                  </CardTitle>
                  <CardDescription>
                    40 B2B Elements framework analysis results
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyAnalysis} variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Analysis
                  </Button>
                  <Button
                    onClick={downloadMarkdown}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Side-by-Side Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column - Existing Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Existing Content
                </CardTitle>
                <CardDescription>Content scraped from {url}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 font-semibold">Content Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {result.existing?.wordCount
                        ? `${result.existing.wordCount} words`
                        : 'Content analysis available'}
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">
                      {result.existing?.cleanText?.substring(0, 2000) ||
                        'No existing content data available'}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Proposed Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Proposed Content
                </CardTitle>
                <CardDescription>
                  {proposedContent
                    ? 'Your proposed new content'
                    : 'No proposed content provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 font-semibold">Content Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {proposedContent
                        ? `${proposedContent.length} characters`
                        : 'No proposed content provided'}
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">
                      {proposedContent || 'No proposed content provided'}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                AI Analysis Results
              </CardTitle>
              <CardDescription>
                B2B Elements of Value framework analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  {/* Fallback: Show Markdown prompt when AI is unavailable */}
                  {result.comparison?._isFallback && result.comparison?.fallbackMarkdown && (
                    <MarkdownFallbackViewer
                      markdownContent={result.comparison.fallbackMarkdown}
                      frameworkName="B2B Elements of Value"
                      errorMessage={result.comparison.error || 'AI analysis unavailable'}
                    />
                  )}

                  {result.comparison && !result.comparison._isFallback && (
                    <ElementsValueResultsPanel
                      framework="b2b"
                      analysis={result.comparison}
                    />
                  )}
                </TabsContent>

                {/* Detailed Analysis Tab */}
                <TabsContent value="detailed" className="space-y-4">
                  {result.comparison && !result.comparison._isFallback && (
                    <ElementsValueResultsPanel
                      framework="b2b"
                      analysis={result.comparison}
                      defaultExpanded
                    />
                  )}
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Recommendations
                      </CardTitle>
                      <CardDescription>
                        Actionable insights and improvements based on B2B
                        Elements of Value analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {result.comparison && !result.comparison._isFallback ? (
                        <ElementsValueResultsPanel
                          framework="b2b"
                          analysis={result.comparison}
                          variant="recommendations"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Run an analysis to see element recommendations.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Raw Data Tab */}
                <TabsContent value="raw" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Raw Analysis Data</CardTitle>
                      <CardDescription>
                        Complete raw data from the analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border bg-muted/50 p-4">
                          <h4 className="mb-2 font-semibold">
                            Complete Raw Data
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
                          Copy Raw Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function generateB2BMarkdown(result: {
  existing?: {
    url?: string;
    title?: string;
    metaDescription?: string;
    wordCount?: number;
    extractedKeywords?: string[];
  };
  proposed?: {
    title?: string;
    metaDescription?: string;
    wordCount?: number;
    extractedKeywords?: string[];
  };
  comparison?: Record<string, unknown>;
}): string {
  const analysisMarkdown =
    result.comparison && typeof result.comparison === 'object'
      ? generateElementsValueMarkdown('b2b', result.comparison, {
          url: result.existing?.url,
          title: result.existing?.title,
        })
      : 'No structured analysis available.';

  return `${analysisMarkdown}

---

## Existing Content

**Title:** ${result.existing?.title || 'N/A'}
**Meta Description:** ${result.existing?.metaDescription || 'N/A'}
**Word Count:** ${result.existing?.wordCount || 0}
**Keywords:** ${result.existing?.extractedKeywords?.slice(0, 10).join(', ') || 'None'}

${
  result.proposed
    ? `## Proposed Content

**Title:** ${result.proposed.title || 'N/A'}
**Meta Description:** ${result.proposed.metaDescription || 'N/A'}
**Word Count:** ${result.proposed.wordCount || 0}
**Keywords:** ${result.proposed.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
`
    : ''
}

---

Generated by Zero Barriers Growth Accelerator
`;
}

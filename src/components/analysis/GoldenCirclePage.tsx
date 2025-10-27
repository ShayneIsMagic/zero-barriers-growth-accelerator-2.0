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
  Copy,
  Download,
  History,
  Loader2,
  Plus,
  Save,
  Target,
} from 'lucide-react';
import { useState } from 'react';

export function GoldenCirclePage() {
  const [url, setUrl] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [scrapedContent, setScrapedContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Version control state
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [proposedContentId, setProposedContentId] = useState<string | null>(
    null
  );
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [isCreatingProposed, setIsCreatingProposed] = useState(false);

  const runAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Parse scraped content if provided
      let existingContent = null;
      if (scrapedContent.trim()) {
        try {
          existingContent = JSON.parse(scrapedContent.trim());
        } catch (e) {
          setError('Invalid JSON in scraped content field');
          return;
        }
      }

      const response = await fetch('/api/analyze/golden-circle-standalone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          proposedContent: proposedContent.trim(),
          existingContent: existingContent, // Pass scraped content from content-comparison
          analysisType: 'full',
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        setError(`Server error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Golden Circle analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAnalysis = () => {
    if (!result) return;
    const analysisText =
      typeof result.analysis === 'string'
        ? result.analysis
        : JSON.stringify(result.analysis, null, 2);
    copyToClipboard(analysisText);
  };

  const downloadMarkdown = () => {
    if (!result) return;

    const markdown = generateGoldenCircleMarkdown(result);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golden-circle-analysis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Version control functions
  const saveSnapshot = async () => {
    if (!url.trim() || !result?.existingData) {
      setError('Please run analysis first to save snapshot');
      return;
    }

    setIsSavingSnapshot(true);
    setError(null);

    try {
      const response = await fetch('/api/content/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          title: result.existingData.title || 'Untitled',
          content: result.existingData.cleanText || '',
          metadata: {
            wordCount: result.existingData.wordCount,
            keywords: result.existingData.extractedKeywords,
            headings: result.existingData.headings,
          },
          userId: 'current-user',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSnapshotId(data.snapshot.id);
        setError(null);
      } else {
        setError(data.error || 'Failed to save snapshot');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save snapshot');
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  const createProposedVersion = async () => {
    if (!snapshotId || !proposedContent.trim()) {
      setError('Please save a snapshot first and enter proposed content');
      return;
    }

    setIsCreatingProposed(true);
    setError(null);

    try {
      const response = await fetch('/api/content/proposed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshotId,
          content: proposedContent.trim(),
          createdBy: 'current-user',
          status: 'draft',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProposedContentId(data.proposedContent.id);
        setError(null);
      } else {
        setError(data.error || 'Failed to create proposed version');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create proposed version'
      );
    } finally {
      setIsCreatingProposed(false);
    }
  };

  const createVersionComparison = async () => {
    if (!snapshotId || !proposedContentId) {
      setError('Please save snapshot and create proposed version first');
      return;
    }

    try {
      const response = await fetch('/api/content/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          existingId: snapshotId,
          proposedId: proposedContentId,
          analysisResults: result?.comparison || null,
          similarityScore: result?.similarityScore || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setError(null);
      } else {
        setError(data.error || 'Failed to create version comparison');
      }
    } catch (err) {
      setError(
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
            <Target className="h-6 w-6" />
            Golden Circle Analysis
          </CardTitle>
          <CardDescription>
            Analyze your website using Simon Sinek's Golden Circle framework -
            discover your WHY, HOW, and WHAT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              disabled={isAnalyzing}
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
              placeholder="Paste your proposed new content here for Golden Circle analysis...

Example:
# Our Mission

We believe in empowering businesses to reach their full potential.

## Why We Exist
To break down barriers and accelerate growth for every organization.

## How We Do It
Through AI-powered analysis and strategic frameworks.

## What We Offer
Comprehensive marketing optimization tools and insights.

[Your content here...]"
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              disabled={isAnalyzing}
              className="min-h-[200px] font-mono text-sm"
              aria-label="Enter proposed new content for Golden Circle analysis"
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
              disabled={isAnalyzing}
              className="min-h-[100px] font-mono text-xs"
              aria-label="Paste scraped content from content-comparison"
              aria-describedby="scraped-help"
            />
            <p id="scraped-help" className="mt-2 text-xs text-muted-foreground">
              💡 Paste the "Copy Scraped Data" JSON from Content-Comparison page
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
                <span>WHY analysis - your core purpose and beliefs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>HOW analysis - your unique processes and methods</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>WHAT analysis - your products and services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>WHO analysis - your target audience identification</span>
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

          {/* Analyze Button */}
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || !url.trim()}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                {proposedContent
                  ? 'Compare Existing vs. Proposed'
                  : 'Analyze Existing Content'}
              </>
            )}
          </Button>

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
                    <CardTitle>Golden Circle Analysis</CardTitle>
                    <CardDescription>
                      Simon Sinek's Golden Circle framework analysis
                    </CardDescription>
                  </div>
                  <Button onClick={downloadMarkdown} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Analysis Results */}
                {result.analysis && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-semibold">
                      AI Analysis Results
                    </h3>

                    {/* Show analysis data */}
                    <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
                      <h4 className="mb-2 font-semibold">
                        Golden Circle Analysis
                      </h4>
                      <div className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(result.analysis, null, 2)}
                      </div>
                    </div>

                    <Button
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
                )}

                {/* Why/How/What Analysis */}
                {result.why && result.how && result.what && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Golden Circle Framework Analysis</CardTitle>
                      <CardDescription>
                        Simon Sinek's Why/How/What framework breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* WHY */}
                        <div className="rounded-lg border bg-orange-50 p-4 dark:bg-orange-950">
                          <h4 className="mb-2 text-lg font-semibold text-orange-900 dark:text-orange-100">
                            WHY - Your Purpose
                          </h4>
                          <div className="text-sm text-orange-800 dark:text-orange-200">
                            {result.why.evidence ||
                              result.why.description ||
                              'No clear WHY identified'}
                          </div>
                          {result.why.recommendations && (
                            <div className="mt-2 text-xs text-orange-700 dark:text-orange-300">
                              <strong>Recommendations:</strong>{' '}
                              {result.why.recommendations}
                            </div>
                          )}
                        </div>

                        {/* HOW */}
                        <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
                          <h4 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
                            HOW - Your Process
                          </h4>
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            {result.how.evidence ||
                              result.how.description ||
                              'No clear HOW identified'}
                          </div>
                          {result.how.recommendations && (
                            <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                              <strong>Recommendations:</strong>{' '}
                              {result.how.recommendations}
                            </div>
                          )}
                        </div>

                        {/* WHAT */}
                        <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950">
                          <h4 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-100">
                            WHAT - Your Product/Service
                          </h4>
                          <div className="text-sm text-green-800 dark:text-green-200">
                            {result.what.evidence ||
                              result.what.description ||
                              'No clear WHAT identified'}
                          </div>
                          {result.what.recommendations && (
                            <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                              <strong>Recommendations:</strong>{' '}
                              {result.what.recommendations}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Raw Analysis Data */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Details</CardTitle>
                    <CardDescription>
                      Complete analysis results and metadata
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <h4 className="mb-2 font-semibold">Analysis Results</h4>
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
                        Copy Full Analysis
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

function generateGoldenCircleMarkdown(result: any): string {
  return `# Golden Circle Analysis

**URL:** ${result.url || 'N/A'}
**Date:** ${new Date().toLocaleString()}
**Analysis Type:** Golden Circle

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

## Golden Circle Analysis Results

${JSON.stringify(result.data, null, 2)}
`
    : ''
}

---

Generated by Zero Barriers Growth Accelerator
`;
}

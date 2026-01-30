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
  Copy,
  Download,
  FileText,
  History,
  Loader2,
  Plus,
  Save,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

export function B2CElementsPage() {
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

      const response = await fetch(
        '/api/analyze/elements-value-b2c-standalone',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url.trim(),
            proposedContent: proposedContent.trim(),
            existingContent: existingContent, // Pass scraped content from content-comparison
            analysisType: 'full',
          }),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        await response.text(); // Read response to clear buffer
        setError(`Server error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'B2C Elements analysis failed');
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
      typeof result.comparison === 'string'
        ? result.comparison
        : JSON.stringify(result.comparison, null, 2);
    copyToClipboard(analysisText);
  };

  const downloadMarkdown = () => {
    if (!result) return;

    const markdown = generateB2CMarkdown(result);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `b2c-elements-analysis-${new Date().toISOString().split('T')[0]}.md`;
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
            <Users className="h-6 w-6" />
            B2C Elements of Value Analysis
          </CardTitle>
          <CardDescription>
            Analyze your website using B2C Elements of Value framework - perfect
            for consumer-focused businesses
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
              placeholder="Paste your proposed new content here for B2C Elements analysis...

Example:
# New Page Title

New compelling description that highlights our unique value proposition.

## Key Benefits
- Benefit 1
- Benefit 2
- Benefit 3

[Your content here...]"
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              disabled={isAnalyzing}
              className="min-h-[200px] font-mono text-sm"
              aria-label="Enter proposed new content for B2C Elements analysis"
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
                <span>30 B2C Elements of Value analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>Revenue opportunity identification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>Premium pricing strategy recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <span>Customer satisfaction optimization insights</span>
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
                <Users className="mr-2 h-4 w-4" />
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
        <div className="space-y-6">
          {/* Header with Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-blue-600" />
                    B2C Elements of Value Analysis
                  </CardTitle>
                  <CardDescription>
                    30 B2C Elements framework analysis results
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
                <BarChart3 className="h-6 w-6 text-blue-600" />
                AI Analysis Results
              </CardTitle>
              <CardDescription>
                B2C Elements of Value framework analysis
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
                  {result.comparison && (
                    <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950 dark:to-indigo-950">
                      <div className="text-center">
                        <h3 className="mb-2 text-2xl font-bold text-blue-900 dark:text-blue-100">
                          B2C Elements of Value Analysis
                        </h3>
                        <div className="mb-4 text-lg text-blue-700 dark:text-blue-300">
                          Analysis completed successfully
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Results */}
                  {result.comparison && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-xl font-semibold">
                        AI Analysis Results
                      </h3>

                      {/* Show analysis data */}
                      <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
                        <h4 className="mb-2 font-semibold">
                          B2C Elements of Value Analysis
                        </h4>
                        <div className="max-h-96 overflow-auto whitespace-pre-wrap text-sm">
                          {typeof result.comparison === 'string'
                            ? result.comparison
                            : JSON.stringify(result.comparison, null, 2)}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Detailed Analysis Tab */}
                <TabsContent value="detailed" className="space-y-4">
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
                            {typeof result.comparison === 'string'
                              ? result.comparison
                              : JSON.stringify(result.comparison, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Recommendations
                      </CardTitle>
                      <CardDescription>
                        Actionable insights and improvements based on B2C
                        Elements of Value analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Review the analysis results in the Overview tab for
                          specific recommendations and improvements.
                        </p>
                      </div>
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

function generateB2CMarkdown(result: any): string {
  return `# B2C Elements of Value Analysis

**URL:** ${result.existing?.url || 'N/A'}
**Date:** ${new Date().toLocaleString()}
**Analysis Type:** B2C Elements of Value

---

## Existing Content

**Title:** ${result.existing?.title || 'N/A'}
**Meta Description:** ${result.existing?.metaDescription || 'N/A'}
**Word Count:** ${result.existing?.wordCount || 0}
**Keywords:** ${result.existing?.extractedKeywords?.slice(0, 10).join(', ') || 'None'}

${
  result.proposed
    ? `
## Proposed Content

**Title:** ${result.proposed?.title || 'N/A'}
**Meta Description:** ${result.proposed?.metaDescription || 'N/A'}
**Word Count:** ${result.proposed?.wordCount || 0}
**Keywords:** ${result.proposed?.extractedKeywords?.slice(0, 10).join(', ') || 'None'}

---

## B2C Elements Analysis Results

${typeof result.comparison === 'string' ? result.comparison : JSON.stringify(result.comparison, null, 2)}
`
    : ''
}

---

Generated by Zero Barriers Growth Accelerator
`;
}

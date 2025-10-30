'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ClientStorage, ScrapeBundle, ScrapedContent, ScrapedMetadata } from '@/lib/shared/client-storage';
import { buildComprehensiveReport } from '@/lib/shared/report-aggregator';
import { Copy, Download, GitCompare, History, Loader2, Plus, Save } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export function ContentComparisonPage() {
  const [url, setUrl] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Version control state
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [proposedContentId, setProposedContentId] = useState<string | null>(null);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [isCreatingProposed, setIsCreatingProposed] = useState(false);

  // Framework selection and reuse of the same scrape
  const [selectedFramework, setSelectedFramework] = useState<
    'b2c' | 'b2b' | 'golden_circle' | 'clifton_strengths' | 'unified'
  >('b2c');
  const [isRunningFramework, setIsRunningFramework] = useState(false);

  const scrapeId = useMemo(() => {
    const safeUrl = url.trim();
    return safeUrl ? `${safeUrl}::${new Date().toISOString()}` : '';
  }, [url]);

  const runComparison = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          proposedContent: proposedContent.trim(),
          analysisType: 'full'
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        // Separate metadata from content and persist locally
        const nowIso = new Date().toISOString();
        const existingMeta: ScrapedMetadata = {
          url: data.existing.url,
          title: data.existing.title,
          metaDescription: data.existing.metaDescription,
          wordCount: data.existing.wordCount,
          extractedKeywords: data.existing.extractedKeywords,
          headings: data.existing.headings,
          timestampIso: nowIso,
        };
        const existingContent: ScrapedContent = { cleanText: data.existing.cleanText };
        const proposedMeta: ScrapedMetadata | null = data.proposed
          ? {
              url: data.existing.url,
              title: data.proposed.title,
              metaDescription: data.proposed.metaDescription,
              wordCount: data.proposed.wordCount,
              extractedKeywords: data.proposed.extractedKeywords,
              headings: data.proposed.headings,
              timestampIso: nowIso,
            }
          : null;
        const proposedContent: ScrapedContent | null = data.proposed
          ? { cleanText: data.proposed.cleanText }
          : null;

        const id = `${data.existing.url}::${nowIso}`;
        const bundle: ScrapeBundle = {
          id,
          url: data.existing.url,
          metadata: { existing: existingMeta, proposed: proposedMeta },
          content: { existing: existingContent, proposed: proposedContent },
        };
        await ClientStorage.saveScrapeBundle(bundle);
      } else {
        setError(data.error || 'Comparison failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runFramework = async () => {
    if (!result) {
      setError('Please run the comparison first');
      return;
    }
    setIsRunningFramework(true);
    setError(null);
    try {
      const nowIso = new Date().toISOString();
      const assessmentType = selectedFramework;
      const payload = {
        _url: result.existing.url,
        scrapedData: {
          existing: {
            cleanText: result.existing.cleanText,
            title: result.existing.title,
            metaDescription: result.existing.metaDescription,
            headings: result.existing.headings,
            extractedKeywords: result.existing.extractedKeywords,
          },
          proposed: result.proposed
            ? {
                cleanText: result.proposed.cleanText,
                title: result.proposed.title,
                metaDescription: result.proposed.metaDescription,
                headings: result.proposed.headings,
                extractedKeywords: result.proposed.extractedKeywords,
              }
            : null,
        },
        assessmentType,
      };

      const res = await fetch('/api/analyze/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const scrapeKey = `${result.existing.url}::${nowIso}`;
        await ClientStorage.addFrameworkResult(scrapeKey, {
          assessmentType,
          createdAtIso: nowIso,
          data: data,
        });

        const all = (await ClientStorage.getFrameworkResults(scrapeKey)) || [];
        const report = buildComprehensiveReport(scrapeKey, result.existing.url, all);
        await ClientStorage.saveComprehensiveReport(scrapeKey, report);
      } else {
        setError(data.error || 'Framework analysis failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Framework analysis failed');
    } finally {
      setIsRunningFramework(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadMarkdown = () => {
    if (!result) return;

    const markdown = generateComparisonMarkdown(result);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-comparison-${new Date().toISOString().split('T')[0]}.md`;
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
            headings: result.existingData.headings
          },
          userId: 'current-user' // TODO: Get from auth context
        })
      });

      const data = await response.json();

      if (data.success) {
        setSnapshotId(data.snapshot.id);
        setError(null);
        // Show success message
        console.log('✅ Snapshot saved successfully');
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
          createdBy: 'current-user', // TODO: Get from auth context
          status: 'draft'
        })
      });

      const data = await response.json();

      if (data.success) {
        setProposedContentId(data.proposedContent.id);
        setError(null);
        // Show success message
        console.log('✅ Proposed version created successfully');
      } else {
        setError(data.error || 'Failed to create proposed version');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create proposed version');
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
          similarityScore: result?.similarityScore || null
        })
      });

      const data = await response.json();

      if (data.success) {
        setError(null);
        // Show success message
        console.log('✅ Version comparison created successfully');
      } else {
        setError(data.error || 'Failed to create version comparison');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version comparison');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <GitCompare className="h-6 w-6" />
            Content Comparison Analysis
          </CardTitle>
          <CardDescription>
            Compare existing website content against proposed new content. Get AI-powered side-by-side analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Input */}
          <div>
            <label htmlFor="website-url" className="text-sm font-medium mb-2 block">
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
            <p id="url-help" className="text-xs text-muted-foreground mt-1">
              Enter the URL of the website you want to analyze
            </p>
          </div>

          {/* Proposed Content */}
          <div>
            <label htmlFor="proposed-content" className="text-sm font-medium mb-2 block">
              Proposed New Content (Optional)
            </label>
            <Textarea
              id="proposed-content"
              name="proposed-content"
              placeholder="Paste your proposed new content here...

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
              aria-label="Enter proposed new content for comparison"
              aria-describedby="content-help"
            />
            <p id="content-help" className="text-xs text-muted-foreground mt-2">
              💡 Leave empty to just analyze existing content. Add proposed content to see side-by-side comparison.
            </p>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Analyze Button */}
          <Button
            onClick={runComparison}
            disabled={isAnalyzing || !url.trim()}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing & Comparing...
              </>
            ) : (
              <>
                <GitCompare className="mr-2 h-4 w-4" />
                {proposedContent ? 'Compare Existing vs. Proposed' : 'Analyze Existing Content'}
              </>
            )}
          </Button>

          {/* Framework Dropdown and Run */}
          {result && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="framework-select" className="text-sm font-medium mb-2 block">
                  Analyze with Framework
                </label>
                <select
                  id="framework-select"
                  className="w-full border rounded h-10 px-3 bg-background"
                  value={selectedFramework}
                  onChange={(e) =>
                    setSelectedFramework(
                      e.target.value as 'b2c' | 'b2b' | 'golden_circle' | 'clifton_strengths' | 'unified'
                    )
                  }
                >
                  <option value="b2c">B2C Elements of Value</option>
                  <option value="b2b">B2B Elements of Value</option>
                  <option value="golden_circle">Golden Circle</option>
                  <option value="clifton_strengths">CliftonStrengths</option>
                  <option value="unified">Unified (All Frameworks)</option>
                </select>
              </div>
              <div className="pt-6">
                <Button onClick={runFramework} disabled={isRunningFramework} variant="secondary">
                  {isRunningFramework ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...
                    </>
                  ) : (
                    <>Run Framework</>
                  )}
                </Button>
              </div>
              <div className="pt-6">
                <Link href="/dashboard/reports" className="inline-flex items-center h-10 px-4 border rounded">
                  View Reports
                </Link>
              </div>
            </div>
          )}

          {/* Version Control Buttons */}
          {result && (
            <div className="flex gap-2 pt-4 border-t">
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
                disabled={isCreatingProposed || !snapshotId || !proposedContent.trim() || !!proposedContentId}
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
                    {proposedContentId ? 'Version Created' : 'Create Proposed Version'}
                  </>
                )}
              </Button>

              <Button
                onClick={createVersionComparison}
                disabled={!snapshotId || !proposedContentId || !!proposedContentId === false}
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
        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>
            <TabsTrigger value="existing">Existing Content</TabsTrigger>
            {result.proposed && <TabsTrigger value="proposed">Proposed Content</TabsTrigger>}
          </TabsList>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Comparison Analysis</CardTitle>
                    <CardDescription>Side-by-side evaluation of content effectiveness</CardDescription>
                  </div>
                  <Button onClick={downloadMarkdown} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.comparison && (
                  <div className="prose dark:prose-invert max-w-none">
                    {/* Will render AI comparison */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Existing Column */}
                      <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                          Existing Content
                          <Badge variant="outline">Current</Badge>
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <strong>Title:</strong> {result.existing.title}
                          </div>
                          <div>
                            <strong>Meta Description:</strong> {result.existing.metaDescription}
                          </div>
                          <div>
                            <strong>Word Count:</strong> {result.existing.wordCount}
                          </div>
                          <div>
                            <strong>Top Keywords:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.existing.extractedKeywords.slice(0, 10).map((kw: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Proposed Column */}
                      {result.proposed && (
                        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-500">
                          <h3 className="text-lg font-semibold mb-3 flex items-center justify-between text-green-900 dark:text-green-100">
                            Proposed Content
                            <Badge variant="default" className="bg-green-600">New</Badge>
                          </h3>
                          <div className="space-y-3 text-sm text-green-900 dark:text-green-100">
                            <div>
                              <strong>Title:</strong> {result.proposed.title}
                            </div>
                            <div>
                              <strong>Meta Description:</strong> {result.proposed.metaDescription}
                            </div>
                            <div>
                              <strong>Word Count:</strong> {result.proposed.wordCount}
                            </div>
                            <div>
                              <strong>Top Keywords:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.proposed.extractedKeywords.slice(0, 10).map((kw: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Comparison Results */}
                    {result.comparison && (
                      <div className="mt-6 space-y-4">
                        <h3 className="text-xl font-semibold">AI Analysis Results</h3>

                        {/* Show comparison data */}
                        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                          <h4 className="font-semibold mb-2">Overall Recommendation</h4>
                          <div className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(result.comparison, null, 2)}
                          </div>
                        </div>

                        <Button onClick={() => copyToClipboard(JSON.stringify(result.comparison, null, 2))}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Analysis
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Existing Content Tab */}
          <TabsContent value="existing">
            <Card>
              <CardHeader>
                <CardTitle>Existing Website Content</CardTitle>
                <CardDescription>Current live content from {url}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Meta Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Title:</strong> {result.existing.title}</div>
                      <div><strong>Description:</strong> {result.existing.metaDescription}</div>
                      <div><strong>Keywords:</strong> {result.existing.metaKeywords?.join(', ') || 'None'}</div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Content Preview</h4>
                    <div className="max-h-96 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded">
                        {result.existing.cleanText}
                      </pre>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      📊 Total content length: {result.existing.cleanText.length.toLocaleString()} characters
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
                  <CardDescription>Your suggested content changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-2">Proposed Meta Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Title:</strong> {result.proposed.title}</div>
                        <div><strong>Description:</strong> {result.proposed.metaDescription}</div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-2">Proposed Content</h4>
                      <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded">
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

function generateComparisonMarkdown(result: any): string {
  return `# Content Comparison Analysis

**URL:** ${result.existing.url || 'N/A'}
**Date:** ${new Date().toLocaleString()}

---

## Existing Content

**Title:** ${result.existing.title}
**Meta Description:** ${result.existing.metaDescription}
**Word Count:** ${result.existing.wordCount}
**Keywords:** ${result.existing.extractedKeywords.slice(0, 10).join(', ')}

${result.proposed ? `
## Proposed Content

**Title:** ${result.proposed.title}
**Meta Description:** ${result.proposed.metaDescription}
**Word Count:** ${result.proposed.wordCount}
**Keywords:** ${result.proposed.extractedKeywords.slice(0, 10).join(', ')}

---

## AI Comparison Analysis

${JSON.stringify(result.comparison, null, 2)}
` : ''}

---

Generated by Zero Barriers Growth Accelerator
`;
}


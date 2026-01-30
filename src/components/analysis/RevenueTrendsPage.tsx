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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Loader2, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export function RevenueTrendsPage() {
  const [url, setUrl] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/revenue-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          proposedContent: proposedContent.trim(),
          analysisType: 'full',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Revenue trends analysis failed');
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

  const downloadMarkdown = () => {
    if (!result) return;

    const markdown = generateRevenueTrendsMarkdown(result);
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
              disabled={isAnalyzing}
              className="min-h-[200px] font-mono text-sm"
              aria-label="Enter proposed new content for revenue analysis"
              aria-describedby="content-help"
            />
            <p id="content-help" className="mt-2 text-xs text-muted-foreground">
              💡 Leave empty to just analyze existing content. Add proposed
              content to see side-by-side comparison.
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
                <TrendingUp className="mr-2 h-4 w-4" />
                {proposedContent
                  ? 'Compare Existing vs. Proposed'
                  : 'Find Revenue Opportunities'}
              </>
            )}
          </Button>
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
                {result.data && (
                  <div className="prose dark:prose-invert max-w-none">
                    {/* Side-by-side comparison if proposed content exists */}
                    {result.proposed && (
                      <div className="mb-6 grid gap-4 md:grid-cols-2">
                        {/* Existing Column */}
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
                            <div>
                              <strong>Top Keywords:</strong>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {result.existing.extractedKeywords
                                  ?.slice(0, 10)
                                  .map((kw: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {kw}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Proposed Column */}
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
                            <div>
                              <strong>Top Keywords:</strong>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {result.proposed.extractedKeywords
                                  ?.slice(0, 10)
                                  .map((kw: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {kw}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analysis Results */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">
                        Revenue Trends Analysis Results
                      </h3>

                      {/* Show analysis data */}
                      <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950">
                        <h4 className="mb-2 font-semibold">
                          Assessment Results
                        </h4>
                        <div className="whitespace-pre-wrap text-sm">
                          {JSON.stringify(result.data, null, 2)}
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          copyToClipboard(JSON.stringify(result.data, null, 2))
                        }
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Analysis
                      </Button>
                    </div>
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

function generateRevenueTrendsMarkdown(result: any): string {
  return `# Revenue Trends Analysis

**URL:** ${result.url || 'N/A'}
**Date:** ${new Date().toLocaleString()}
**Analysis Type:** Revenue-Focused Market Analysis

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

## Revenue Trends Analysis Results

${JSON.stringify(result.data, null, 2)}
`
    : ''
}

---

Generated by Zero Barriers Growth Accelerator
`;
}

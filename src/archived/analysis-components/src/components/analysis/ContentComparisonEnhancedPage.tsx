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
import {
  BarChart3,
  Brain,
  Copy,
  Download,
  GitCompare,
  Loader2,
  Target,
  Users,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Enhanced Content Comparison Page
 * Uses Content-Comparison functionality with latest framework structures
 * Does NOT change or delete the original ContentComparisonPage.tsx
 */
export function ContentComparisonEnhancedPage() {
  const [url, setUrl] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Framework-specific results
  const [frameworkResults, setFrameworkResults] = useState<{
    b2c?: any;
    b2b?: any;
    cliftonStrengths?: any;
    goldenCircle?: any;
  }>({});

  // Track which frameworks are still loading
  const [loadingFrameworks, setLoadingFrameworks] = useState({
    general: false,
    b2c: false,
    b2b: false,
    clifton: false,
    golden: false,
  });

  const runComparison = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setFrameworkResults({});

    // Set all frameworks as loading
    setLoadingFrameworks({
      general: true,
      b2c: true,
      b2b: true,
      clifton: true,
      golden: true,
    });

    try {
      // Create promises for each framework with individual error handling
      const generalPromise = fetch('/api/analyze/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          proposedContent: proposedContent.trim(),
          analysisType: 'full',
        }),
      })
        .then((r) => {
          setLoadingFrameworks((prev) => ({ ...prev, general: false }));
          return r.json();
        })
        .catch((err) => {
          setLoadingFrameworks((prev) => ({ ...prev, general: false }));
          return { success: false, error: err.message };
        });

      const b2cPromise = fetch('/api/analyze/elements-value-b2c-standalone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          proposedContent: proposedContent.trim(),
          analysisType: 'full',
        }),
      })
        .then((r) => {
          setLoadingFrameworks((prev) => ({ ...prev, b2c: false }));
          return r.json();
        })
        .catch((err) => {
          setLoadingFrameworks((prev) => ({ ...prev, b2c: false }));
          return { success: false, error: err.message };
        });

      const b2bPromise = fetch('/api/analyze/elements-value-b2b-standalone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          proposedContent: proposedContent.trim(),
          analysisType: 'full',
        }),
      })
        .then((r) => {
          setLoadingFrameworks((prev) => ({ ...prev, b2b: false }));
          return r.json();
        })
        .catch((err) => {
          setLoadingFrameworks((prev) => ({ ...prev, b2b: false }));
          return { success: false, error: err.message };
        });

      const cliftonPromise = fetch(
        '/api/analyze/clifton-strengths-standalone',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url.trim(),
            proposedContent: proposedContent.trim(),
            analysisType: 'full',
          }),
        }
      )
        .then((r) => {
          setLoadingFrameworks((prev) => ({ ...prev, clifton: false }));
          return r.json();
        })
        .catch((err) => {
          setLoadingFrameworks((prev) => ({ ...prev, clifton: false }));
          return { success: false, error: err.message };
        });

      const goldenPromise = fetch('/api/analyze/golden-circle-standalone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          proposedContent: proposedContent.trim(),
          analysisType: 'full',
        }),
      })
        .then((r) => {
          setLoadingFrameworks((prev) => ({ ...prev, golden: false }));
          return r.json();
        })
        .catch((err) => {
          setLoadingFrameworks((prev) => ({ ...prev, golden: false }));
          return { success: false, error: err.message };
        });

      // Run all framework analyses in parallel - each completes independently
      const [general, b2cResult, b2bResult, cliftonResult, goldenResult] =
        await Promise.allSettled([
          generalPromise,
          b2cPromise,
          b2bPromise,
          cliftonPromise,
          goldenPromise,
        ]);

      // Extract values from settled promises
      const generalData = general.status === 'fulfilled' ? general.value : null;
      const b2cData = b2cResult.status === 'fulfilled' ? b2cResult.value : null;
      const b2bData = b2bResult.status === 'fulfilled' ? b2bResult.value : null;
      const cliftonData =
        cliftonResult.status === 'fulfilled' ? cliftonResult.value : null;
      const goldenData =
        goldenResult.status === 'fulfilled' ? goldenResult.value : null;

      // Set general comparison result
      if (generalData && generalData.success) {
        setResult(generalData);
      }

      // Set framework results (null if failed, data if success)
      setFrameworkResults({
        b2c: b2cData?.success ? b2cData : null,
        b2b: b2bData?.success ? b2bData : null,
        cliftonStrengths: cliftonData?.success ? cliftonData : null,
        goldenCircle: goldenData?.success ? goldenData : null,
      });

      if (generalData && !generalData.success) {
        setError(generalData.error || 'Comparison failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare');
    } finally {
      setIsAnalyzing(false);
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <GitCompare className="h-6 w-6" />
            Content Comparison Analysis (Enhanced)
          </CardTitle>
          <CardDescription>
            Compare existing website content against proposed new content. Get
            AI-powered side-by-side analysis with latest framework structures.
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
            <p id="content-help" className="mt-2 text-xs text-muted-foreground">
              💡 Leave empty to just analyze existing content. Add proposed
              content to see side-by-side comparison.
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
                {proposedContent
                  ? 'Compare Existing vs. Proposed'
                  : 'Analyze Existing Content'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="comparison">General</TabsTrigger>
            <TabsTrigger value="b2c">B2C Elements</TabsTrigger>
            <TabsTrigger value="b2b">B2B Elements</TabsTrigger>
            <TabsTrigger value="clifton">Strengths</TabsTrigger>
            <TabsTrigger value="golden">Golden Circle</TabsTrigger>
            <TabsTrigger value="existing">Existing</TabsTrigger>
            {result.proposed && (
              <TabsTrigger value="proposed">Proposed</TabsTrigger>
            )}
            <TabsTrigger value="all-frameworks">All Frameworks</TabsTrigger>
          </TabsList>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Comparison Analysis</CardTitle>
                    <CardDescription>
                      Side-by-side evaluation of content effectiveness
                    </CardDescription>
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
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Existing Column */}
                      <div className="rounded-lg border p-4">
                        <h3 className="mb-3 flex items-center justify-between text-lg font-semibold">
                          Existing Content
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
                                .slice(0, 10)
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
                      {result.proposed && (
                        <div className="rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950">
                          <h3 className="mb-3 flex items-center justify-between text-lg font-semibold text-green-900 dark:text-green-100">
                            Proposed Content
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
                                  .slice(0, 10)
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
                      )}
                    </div>

                    {/* AI Comparison Results */}
                    {result.comparison && (
                      <div className="mt-6 space-y-4">
                        <h3 className="text-xl font-semibold">
                          AI Analysis Results
                        </h3>

                        {/* Show comparison data */}
                        <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
                          <h4 className="mb-2 font-semibold">
                            Overall Recommendation
                          </h4>
                          <div className="whitespace-pre-wrap text-sm">
                            {JSON.stringify(result.comparison, null, 2)}
                          </div>
                        </div>

                        <Button
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(result.comparison, null, 2)
                            )
                          }
                        >
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
                        <strong>Title:</strong> {result.existing.title}
                      </div>
                      <div>
                        <strong>Description:</strong>{' '}
                        {result.existing.metaDescription}
                      </div>
                      <div>
                        <strong>Keywords:</strong>{' '}
                        {result.existing.metaKeywords?.join(', ') || 'None'}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-semibold">Content Preview</h4>
                    <div className="max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs dark:bg-gray-900">
                        {result.existing.cleanText}
                      </pre>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      📊 Total content length:{' '}
                      {result.existing.cleanText.length.toLocaleString()}{' '}
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

          {/* B2C Elements Tab */}
          <TabsContent value="b2c">
            {loadingFrameworks.b2c ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-blue-600">
                    Analyzing B2C Elements...
                  </span>
                </CardContent>
              </Card>
            ) : frameworkResults.b2c ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    B2C Elements of Value Analysis
                  </CardTitle>
                  <CardDescription>
                    30 B2C Elements framework results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
                    <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs">
                      {typeof frameworkResults.b2c.comparison === 'string'
                        ? frameworkResults.b2c.comparison
                        : JSON.stringify(
                            frameworkResults.b2c.comparison,
                            null,
                            2
                          )}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  B2C Elements analysis failed or not yet started
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* B2B Elements Tab */}
          <TabsContent value="b2b">
            {loadingFrameworks.b2b ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  <span className="ml-3 text-green-600">
                    Analyzing B2B Elements...
                  </span>
                </CardContent>
              </Card>
            ) : frameworkResults.b2b ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    B2B Elements of Value Analysis
                  </CardTitle>
                  <CardDescription>
                    40 B2B Elements framework results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950">
                    <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs">
                      {typeof frameworkResults.b2b.comparison === 'string'
                        ? frameworkResults.b2b.comparison
                        : JSON.stringify(
                            frameworkResults.b2b.comparison,
                            null,
                            2
                          )}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  B2B Elements analysis failed or not yet started
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CliftonStrengths Tab */}
          {frameworkResults.cliftonStrengths && (
            <TabsContent value="clifton">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    CliftonStrengths Analysis
                  </CardTitle>
                  <CardDescription>
                    34 CliftonStrengths themes results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-purple-50 p-4 dark:bg-purple-950">
                    <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs">
                      {typeof frameworkResults.cliftonStrengths.comparison ===
                      'string'
                        ? frameworkResults.cliftonStrengths.comparison
                        : JSON.stringify(
                            frameworkResults.cliftonStrengths.comparison,
                            null,
                            2
                          )}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Golden Circle Tab */}
          {frameworkResults.goldenCircle && (
            <TabsContent value="golden">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Golden Circle Analysis
                  </CardTitle>
                  <CardDescription>
                    Why, How, What, WHO framework results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-orange-50 p-4 dark:bg-orange-950">
                    <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs">
                      {typeof frameworkResults.goldenCircle.comparison ===
                      'string'
                        ? frameworkResults.goldenCircle.comparison
                        : JSON.stringify(
                            frameworkResults.goldenCircle.comparison,
                            null,
                            2
                          )}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* All Frameworks Tab */}
          <TabsContent value="all-frameworks">
            <div className="space-y-4">
              {frameworkResults.b2c && (
                <Card>
                  <CardHeader>
                    <CardTitle>B2C Elements of Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs">
                      {typeof frameworkResults.b2c.comparison === 'string'
                        ? frameworkResults.b2c.comparison
                        : JSON.stringify(
                            frameworkResults.b2c.comparison,
                            null,
                            2
                          )}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {frameworkResults.b2b && (
                <Card>
                  <CardHeader>
                    <CardTitle>B2B Elements of Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs">
                      {typeof frameworkResults.b2b.comparison === 'string'
                        ? frameworkResults.b2b.comparison
                        : JSON.stringify(
                            frameworkResults.b2b.comparison,
                            null,
                            2
                          )}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {frameworkResults.cliftonStrengths && (
                <Card>
                  <CardHeader>
                    <CardTitle>CliftonStrengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs">
                      {typeof frameworkResults.cliftonStrengths.comparison ===
                      'string'
                        ? frameworkResults.cliftonStrengths.comparison
                        : JSON.stringify(
                            frameworkResults.cliftonStrengths.comparison,
                            null,
                            2
                          )}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {frameworkResults.goldenCircle && (
                <Card>
                  <CardHeader>
                    <CardTitle>Golden Circle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs">
                      {typeof frameworkResults.goldenCircle.comparison ===
                      'string'
                        ? frameworkResults.goldenCircle.comparison
                        : JSON.stringify(
                            frameworkResults.goldenCircle.comparison,
                            null,
                            2
                          )}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function generateComparisonMarkdown(result: any): string {
  return `# Content Comparison Analysis (Enhanced)

**URL:** ${result.existing.url || 'N/A'}
**Date:** ${new Date().toLocaleString()}

---

## Existing Content

**Title:** ${result.existing.title}
**Meta Description:** ${result.existing.metaDescription}
**Word Count:** ${result.existing.wordCount}
**Keywords:** ${result.existing.extractedKeywords.slice(0, 10).join(', ')}

${
  result.proposed
    ? `
## Proposed Content

**Title:** ${result.proposed.title}
**Meta Description:** ${result.proposed.metaDescription}
**Word Count:** ${result.proposed.wordCount}
**Keywords:** ${result.proposed.extractedKeywords.slice(0, 10).join(', ')}

---

## AI Comparison Analysis

${JSON.stringify(result.comparison, null, 2)}
`
    : ''
}

---

Generated by Zero Barriers Growth Accelerator (Enhanced Version)
`;
}

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ClientContentStorageService } from '@/lib/services/client-content-storage.service';
import { Copy, Download, GitCompare, History, Loader2, Plus, Save, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  
  // Cache state
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{ urlCount: number; totalSize: number } | null>(null);

  // Load cache info on mount
  useEffect(() => {
    const loadCacheInfo = async () => {
      const info = await ClientContentStorageService.getCacheInfo();
      setCacheInfo(info);
    };
    loadCacheInfo();
  }, []);

  const runComparison = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setIsFromCache(false);

    try {
      // Step 1: Check Local Forage cache first
      const cached = await ClientContentStorageService.getComprehensiveData(url.trim());
      
      if (cached) {
        console.log('📦 Using cached data from Local Forage');
        setIsFromCache(true);
        
        // Check if we have a cached analysis result too
        const cachedAnalysis = await ClientContentStorageService.getAnalysisResult(url.trim());
        
        if (cachedAnalysis && proposedContent.trim() === '') {
          // Use cached analysis if no proposed content
          setResult(cachedAnalysis.result);
          setIsAnalyzing(false);
          return;
        }
        
        // Use cached comprehensive data, but still run analysis if proposed content exists
        const response = await fetch('/api/analyze/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url.trim(),
            proposedContent: proposedContent.trim(),
            analysisType: 'full',
            useStored: false, // Don't check server cache, we already have local cache
          })
        });

        const data = await response.json();

        if (data.success) {
          setResult(data);
          
          // Store in Local Forage
          if (data.comprehensive) {
            await ClientContentStorageService.storeComprehensiveData(
              url.trim(),
              data.comprehensive,
              data.existing,
              data.storedSnapshotId
            );
          }
          
          // Store analysis result
          await ClientContentStorageService.storeAnalysisResult(url.trim(), data);
        } else {
          setError(data.error || 'Comparison failed');
        }
      } else {
        // No cache, fetch from API
        console.log('🔍 No cached data, fetching from API...');
        setIsFromCache(false);
        
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
          
          // Store in Local Forage for future use
          if (data.comprehensive) {
            await ClientContentStorageService.storeComprehensiveData(
              url.trim(),
              data.comprehensive,
              data.existing,
              data.storedSnapshotId
            );
          }
          
          // Store analysis result
          await ClientContentStorageService.storeAnalysisResult(url.trim(), data);
          
          // Update cache info
          const info = await ClientContentStorageService.getCacheInfo();
          setCacheInfo(info);
        } else {
          setError(data.error || 'Comparison failed');
        }
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

  const clearCache = async () => {
    if (url.trim()) {
      await ClientContentStorageService.clearCache(url.trim());
      const info = await ClientContentStorageService.getCacheInfo();
      setCacheInfo(info);
    }
  };

  const clearAllCache = async () => {
    if (confirm('Clear all cached content? This cannot be undone.')) {
      await ClientContentStorageService.clearAllCache();
      const info = await ClientContentStorageService.getCacheInfo();
      setCacheInfo(info);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <GitCompare className="h-6 w-6" />
                Content Comparison Analysis
              </CardTitle>
              <CardDescription>
                Compare existing website content against proposed new content. Get AI-powered side-by-side analysis.
              </CardDescription>
            </div>
            {cacheInfo && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {cacheInfo.urlCount} cached
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllCache}
                  title="Clear all cached content"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
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
          <div className="space-y-2">
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
            {isFromCache && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-3 w-3" />
                <span>Using cached data from Local Forage</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCache}
                  className="h-auto p-1 text-xs"
                >
                  Clear cache
                </Button>
              </div>
            )}
          </div>

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


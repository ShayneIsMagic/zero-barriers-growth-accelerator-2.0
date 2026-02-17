'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ClientContentStorageService } from '@/lib/services/client-content-storage.service';
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';
import { UnifiedReportGenerator } from '@/lib/services/unified-report-generator.service';
import { FileUploadInput } from '@/components/shared/FileUploadInput';
import { useAnalysisData } from '@/hooks/useAnalysisData';
// ElementUsageTable imported but not used in this component
import { ContentExporter } from '@/components/shared/ContentExporter';
import { PageMetadataDisplay } from '@/components/analysis/PageMetadataDisplay';
import { DataSaveSelector } from '@/components/shared/DataSaveSelector';
import { DataLoader } from '@/components/shared/DataLoader';
import { FrameworkAnalysisRunner } from '@/components/analysis/FrameworkAnalysisRunner';
import dynamic from 'next/dynamic';
import { Copy, Download, GitCompare, History, Loader2, Plus, Save, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

// Dynamically import ReportsViewer to prevent SSR hydration issues
const ReportsViewer = dynamic(
  () => import('@/components/shared/ReportsViewer'),
  { ssr: false }
);

export function ContentComparisonPage() {
  const [url, setUrl] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [inputMethod, setInputMethod] = useState<'url' | 'file'>('url');
  const [uploadedContent, setUploadedContent] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  
  // Use unified analysis hook (for URL-based analysis)
  const {
    data: hookResult,
    isLoading: isAnalyzingFromHook,
    error: hookError,
    isFromCache,
    cacheInfo: hookCacheInfo,
    runAnalysis,
    clearCache: clearHookCache,
  } = useAnalysisData('compare');
  
  // Keep local state for file uploads and compatibility
  // const [isAnalyzing, setIsAnalyzing] = useState(false); // Using hook's isAnalyzing instead
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Version control state
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [proposedContentId, setProposedContentId] = useState<string | null>(null);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [isCreatingProposed, setIsCreatingProposed] = useState(false);
  
  // Cache state (merge hook cache info with local)
  const cacheInfo = hookCacheInfo || null;
  
  // Use result from hook if available, otherwise use local result
  const displayResult = hookResult || result;
  const displayError = hookError || error;
  const displayIsAnalyzing = isAnalyzingFromHook;

  // Cache info is now managed by hook

  const handleFileLoaded = (content: string, fileName: string, fileType: 'json' | 'markdown' | 'text') => {
    setUploadedContent(content);
    setUploadedFileName(fileName);
    
    // If it's JSON, try to parse and use as existing content
    if (fileType === 'json') {
      try {
        // const parsed = JSON.parse(content); // Could use parsed content if needed
        // Don't set filename as URL - files should be used as content, not URLs
        // setUrl(fileName); // REMOVED: This was causing filenames to be treated as URLs
      } catch {
        // Not valid JSON, treat as text
      }
    } else {
      // For markdown/text, use as proposed content
      setProposedContent(content);
    }
  };

  // Helper function to validate URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const runComparison = async () => {
    if (inputMethod === 'url') {
      if (!url.trim()) {
        setError('Please enter a URL');
        return;
      }
      
      // Validate URL format
      if (!isValidUrl(url.trim())) {
        setError('Please enter a valid URL (must start with http:// or https://)');
        return;
      }
    }
    
    if (inputMethod === 'file' && !uploadedContent.trim()) {
      setError('Please upload a file or enter content');
      return;
    }

    // Clear previous errors
    setError(null);

    // For file uploads, don't pass URL to runAnalysis
    if (inputMethod === 'file') {
      // File uploads should be handled differently - they don't need scraping
      setError('File uploads are not yet supported for full analysis. Please use URL input method.');
      return;
    }

    // Use the unified hook for analysis (only for URL-based analysis)
    const analysisResult = await runAnalysis(url.trim(), {
      proposedContent: proposedContent.trim() || uploadedContent.trim(),
      analysisType: 'full',
    });

    if (analysisResult) {
      setResult(analysisResult);
      
      // Also store markdown report if comparison exists
      if (analysisResult.comparison) {
        const markdownReport = generateComparisonMarkdown(analysisResult);
        await UnifiedLocalForageStorage.storeReport(
          url.trim(),
          markdownReport,
          'markdown',
          'content-comparison'
        );
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadMarkdown = () => {
    if (!displayResult) return;

    const markdown = generateComparisonMarkdown(displayResult);
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
    if (!url.trim() || !displayResult?.existingData) {
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
          title: displayResult.existingData.title || 'Untitled',
          content: displayResult.existingData.cleanText || '',
          metadata: {
            wordCount: displayResult.existingData.wordCount,
            keywords: displayResult.existingData.extractedKeywords,
            headings: displayResult.existingData.headings
          },
          userId: 'current-user' // TODO: Get from auth context
        })
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
          createdBy: 'current-user', // TODO: Get from auth context
          status: 'draft'
        })
      });

      const data = await response.json();

      if (data.success) {
        setProposedContentId(data.proposedContent.id);
        setError(null);
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
          analysisResults: displayResult?.comparison || null,
          similarityScore: displayResult?.similarityScore || null
        })
      });

      const data = await response.json();

      if (data.success) {
        setError(null);
      } else {
        setError(data.error || 'Failed to create version comparison');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version comparison');
    }
  };

  const clearCache = async () => {
    if (url.trim()) {
      await clearHookCache(url.trim());
      await ClientContentStorageService.clearCache(url.trim());
    }
  };

  const clearAllCache = async () => {
    if (confirm('Clear all cached content? This cannot be undone.')) {
      await clearHookCache();
      await ClientContentStorageService.clearAllCache();
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
                  {cacheInfo.puppeteerUrls || 0} cached
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await clearHookCache();
                    await ClientContentStorageService.clearAllCache();
                  }}
                  title="Clear all cached content"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Method Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Data Source</label>
            <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'url' | 'file')}>
              <TabsList>
                <TabsTrigger value="url">Website URL</TabsTrigger>
                <TabsTrigger value="file">Upload File</TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="space-y-4 mt-4">
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
                    disabled={displayIsAnalyzing}
                    aria-label="Enter website URL to analyze"
                    aria-describedby="url-help"
                    autoComplete="url"
                    required
                  />
                  <p id="url-help" className="text-xs text-muted-foreground mt-1">
                    Enter the URL of the website you want to analyze
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-4 mt-4">
                <FileUploadInput
                  onFileLoaded={handleFileLoaded}
                  label="Upload Content File"
                  description="Upload JSON, Markdown, or Text files. JSON files will be used as existing content, Markdown/Text as proposed content."
                />
                {uploadedFileName && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <strong>Uploaded:</strong> {uploadedFileName}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
              disabled={displayIsAnalyzing}
              className="min-h-[200px] font-mono text-sm"
              aria-label="Enter proposed new content for comparison"
              aria-describedby="content-help"
            />
            <p id="content-help" className="text-xs text-muted-foreground mt-2">
              💡 Leave empty to just analyze existing content. Add proposed content to see side-by-side comparison.
            </p>
          </div>

          {/* Error */}
          {displayError && (
            <Alert variant="destructive">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          {/* Analyze Button */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <DataLoader
                currentUrl={url.trim()}
                allowPageSelection={true}
                showPageSelector={true}
                onDataLoaded={(loadedData) => {
                  if (loadedData.puppeteerData) {
                    // If a specific page was selected, use that page's data
                    const pageData = loadedData.selectedPage || loadedData.puppeteerData.pages?.[0];
                    const targetUrl = loadedData.selectedPage?.url || loadedData.url || url.trim();
                    
                    setUrl(targetUrl); // Update URL to the selected page
                    setResult({
                      existing: {
                        url: targetUrl,
                        cleanText: loadedData.content || pageData?.content?.text || '',
                        title: pageData?.title || loadedData.metadata?.titles?.[0]?.title || '',
                        metaDescription: pageData?.metaDescription || loadedData.metadata?.descriptions?.[0]?.metaDescription || '',
                      },
                      comprehensive: loadedData.puppeteerData,
                      metadata: loadedData.metadata,
                    });
                  }
                }}
              />
              <Button
                onClick={runComparison}
                disabled={displayIsAnalyzing || (inputMethod === 'url' && !url.trim()) || (inputMethod === 'file' && !uploadedContent.trim())}
                className="flex-1"
                size="lg"
              >
              {displayIsAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing & Comparing...
                </>
              ) : (
                <>
                  <GitCompare className="mr-2 h-4 w-4" />
                  {proposedContent || uploadedContent ? 'Compare Existing vs. Proposed' : 'Analyze Existing Content'}
                </>
              )}
              </Button>
            </div>
            {isFromCache && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-3 w-3" />
                <span>Using cached data from Local Forage</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await clearHookCache(url.trim());
                  }}
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
      {displayResult && (
        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>
            <TabsTrigger value="framework-analysis">Framework Analysis</TabsTrigger>
            <TabsTrigger value="existing">Existing Content</TabsTrigger>
            {displayResult.proposed && <TabsTrigger value="proposed">Proposed Content</TabsTrigger>}
          </TabsList>

          {/* Framework Analysis Tab */}
          <TabsContent value="framework-analysis">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Framework Analysis Runner</CardTitle>
                <CardDescription>
                  Select pages and assessments to evaluate with Google Analytics/GA4 best practices and conversion flow optimization.
                  {displayResult?.comprehensive && (
                    <span className="block mt-2 text-sm text-green-600 dark:text-green-400">
                      ✅ Content collected! Pages are automatically loaded below.
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FrameworkAnalysisRunner
                  url={url.trim()}
                  initialCollectedData={
                    displayResult?.comprehensive 
                      ? { pages: displayResult.comprehensive.pages || [], ...displayResult.comprehensive }
                      : displayResult?.existingData
                        ? { pages: [displayResult.existingData], url: url.trim() }
                        : undefined
                  }
                  onReportsGenerated={(reports) => {
                    console.log('Reports generated:', reports);
                    // Could store reports or update UI
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Comparison Analysis</CardTitle>
                    <CardDescription>Side-by-side evaluation of content effectiveness</CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <ReportsViewer />
                    <DataSaveSelector
                      url={url.trim()}
                      puppeteerData={displayResult.comprehensive}
                      metadata={displayResult.metadata}
                      content={displayResult.existing?.cleanText}
                      analysisResult={displayResult.comparison}
                      report={displayResult.comparison ? generateComparisonMarkdown(displayResult) : undefined}
                      assessmentType="content-comparison"
                      onSaved={() => {
                        // Data saved successfully
                      }}
                    />
                    <DataLoader
                      currentUrl={url.trim()}
                      onDataLoaded={(loadedData) => {
                        if (loadedData.puppeteerData) {
                          // Update the result with loaded data
                          setResult({
                            ...displayResult,
                            comprehensive: loadedData.puppeteerData,
                            metadata: loadedData.metadata,
                            existing: {
                              ...displayResult?.existing,
                              cleanText: loadedData.content || displayResult?.existing?.cleanText,
                            },
                          });
                        }
                      }}
                    />
                    <ContentExporter
                      data={displayResult}
                      url={url.trim()}
                      format="both"
                      filename={`content-comparison-${url.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`}
                    />
                    <Button onClick={downloadMarkdown} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Markdown
                    </Button>
                    <Button
                      onClick={async () => {
                        if (displayResult && url.trim()) {
                          try {
                            const printableReport = await UnifiedReportGenerator.generateFromPuppeteerData(
                              url.trim(),
                              'content-comparison'
                            );
                            UnifiedReportGenerator.printReport(printableReport);
                          } catch (error) {
                            setError('Failed to generate printable report. Make sure data is stored.');
                          }
                        }
                      }}
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Print Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {displayResult.comparison ? (
                  typeof displayResult.comparison === 'string' ? (
                    // If comparison is a string, try to parse it
                    <div className="prose dark:prose-invert max-w-none">
                      <Alert>
                        <AlertDescription>
                          <p className="font-semibold mb-2">Raw AI Response (String Format):</p>
                          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
                            {displayResult.comparison}
                          </pre>
                          <p className="text-xs mt-2 text-muted-foreground">
                            The AI returned a text response instead of structured JSON. This may indicate a prompt formatting issue.
                          </p>
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : displayResult.comparison.error ? (
                    // Error state
                    <Alert variant="destructive">
                      <AlertDescription>
                        <p className="font-semibold">AI Comparison Error:</p>
                        <p>{displayResult.comparison.error}</p>
                        {displayResult.comparison.details && (
                          <p className="text-xs mt-2">{displayResult.comparison.details}</p>
                        )}
                        {displayResult.comparison.raw && (
                          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96 mt-2">
                            {typeof displayResult.comparison.raw === 'string' 
                              ? displayResult.comparison.raw 
                              : JSON.stringify(displayResult.comparison.raw, null, 2)}
                          </pre>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    // Normal structured comparison
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Existing Column */}
                      <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                          Existing Content
                          <Badge variant="outline">Current</Badge>
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <strong>Title:</strong> {displayResult.existing.title}
                          </div>
                          <div>
                            <strong>Meta Description:</strong> {displayResult.existing.metaDescription}
                          </div>
                          <div>
                            <strong>Word Count:</strong> {displayResult.existing.wordCount}
                          </div>
                          <div>
                            <strong>Top Keywords:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {displayResult.existing.extractedKeywords.slice(0, 10).map((kw: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Proposed Column */}
                      {displayResult.proposed && (
                        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-500">
                          <h3 className="text-lg font-semibold mb-3 flex items-center justify-between text-green-900 dark:text-green-100">
                            Proposed Content
                            <Badge variant="default" className="bg-green-600">New</Badge>
                          </h3>
                          <div className="space-y-3 text-sm text-green-900 dark:text-green-100">
                            <div>
                              <strong>Title:</strong> {displayResult.proposed.title}
                            </div>
                            <div>
                              <strong>Meta Description:</strong> {displayResult.proposed.metaDescription}
                            </div>
                            <div>
                              <strong>Word Count:</strong> {displayResult.proposed.wordCount}
                            </div>
                            <div>
                              <strong>Top Keywords:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {displayResult.proposed.extractedKeywords.slice(0, 10).map((kw: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SEO Comparison Results */}
                    {displayResult.comparison && (
                      <div className="mt-6 space-y-6">
                        <h3 className="text-xl font-semibold">SEO Comparison Analysis</h3>

                        {/* SEO Metadata Comparison */}
                        {displayResult.comparison.seoComparison && (
                          <div className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">SEO Metadata Comparison</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Title Comparison */}
                                {displayResult.comparison.seoComparison.title && (
                                  <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-3">Title</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <Badge variant="outline" className="mb-2">Existing</Badge>
                                        <p className="text-sm">{displayResult.comparison.seoComparison.title.existing}</p>
                                      </div>
                                      {displayResult.comparison.seoComparison.title.proposed && (
                                        <div>
                                          <Badge variant="default" className="mb-2">Proposed</Badge>
                                          <p className="text-sm">{displayResult.comparison.seoComparison.title.proposed}</p>
                                        </div>
                                      )}
                                    </div>
                                    {displayResult.comparison.seoComparison.title.recommendation && (
                                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                                        <p className="text-sm"><strong>Recommendation:</strong> {displayResult.comparison.seoComparison.title.recommendation}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Meta Description Comparison */}
                                {displayResult.comparison.seoComparison.metaDescription && (
                                  <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-3">Meta Description</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <Badge variant="outline" className="mb-2">Existing</Badge>
                                        <p className="text-sm">{displayResult.comparison.seoComparison.metaDescription.existing}</p>
                                      </div>
                                      {displayResult.comparison.seoComparison.metaDescription.proposed && (
                                        <div>
                                          <Badge variant="default" className="mb-2">Proposed</Badge>
                                          <p className="text-sm">{displayResult.comparison.seoComparison.metaDescription.proposed}</p>
                                        </div>
                                      )}
                                    </div>
                                    {displayResult.comparison.seoComparison.metaDescription.recommendation && (
                                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                                        <p className="text-sm"><strong>Recommendation:</strong> {displayResult.comparison.seoComparison.metaDescription.recommendation}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Keyword Stuffing Detection */}
                                {displayResult.comparison.seoComparison.keywordStuffing && (
                                  <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-3">Keyword Stuffing Risk Assessment</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <Badge variant={displayResult.comparison.seoComparison.keywordStuffing.existing?.risk >= 7 ? "destructive" : displayResult.comparison.seoComparison.keywordStuffing.existing?.risk >= 4 ? "default" : "secondary"} className="mb-2">
                                          Existing Risk: {displayResult.comparison.seoComparison.keywordStuffing.existing?.risk || 0}/10
                                        </Badge>
                                        {displayResult.comparison.seoComparison.keywordStuffing.existing?.issues && displayResult.comparison.seoComparison.keywordStuffing.existing.issues.length > 0 && (
                                          <ul className="text-sm list-disc list-inside mt-2">
                                            {displayResult.comparison.seoComparison.keywordStuffing.existing.issues.map((issue: string, i: number) => (
                                              <li key={i}>{issue}</li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                      {displayResult.comparison.seoComparison.keywordStuffing.proposed && (
                                        <div>
                                          <Badge variant={displayResult.comparison.seoComparison.keywordStuffing.proposed?.risk >= 7 ? "destructive" : displayResult.comparison.seoComparison.keywordStuffing.proposed?.risk >= 4 ? "default" : "secondary"} className="mb-2">
                                            Proposed Risk: {displayResult.comparison.seoComparison.keywordStuffing.proposed?.risk || 0}/10
                                          </Badge>
                                          {displayResult.comparison.seoComparison.keywordStuffing.proposed?.issues && displayResult.comparison.seoComparison.keywordStuffing.proposed.issues.length > 0 && (
                                            <ul className="text-sm list-disc list-inside mt-2">
                                              {displayResult.comparison.seoComparison.keywordStuffing.proposed.issues.map((issue: string, i: number) => (
                                                <li key={i}>{issue}</li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Recommendations */}
                        {displayResult.comparison.recommendations && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {displayResult.comparison.recommendations.priorityActions && displayResult.comparison.recommendations.priorityActions.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Priority Actions</h4>
                                  <ol className="list-decimal list-inside space-y-2">
                                    {displayResult.comparison.recommendations.priorityActions.map((action: string, i: number) => (
                                      <li key={i} className="text-sm">{action}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              {displayResult.comparison.recommendations.keepExisting && (
                                <div className="p-3 border rounded-lg">
                                  <p className="text-sm"><strong>Keep Existing:</strong> {displayResult.comparison.recommendations.keepExisting.yes ? 'Yes' : 'No'}</p>
                                  {displayResult.comparison.recommendations.keepExisting.reason && (
                                    <p className="text-sm mt-1">{displayResult.comparison.recommendations.keepExisting.reason}</p>
                                  )}
                                </div>
                              )}
                              {displayResult.comparison.recommendations.useProposed && (
                                <div className="p-3 border rounded-lg">
                                  <p className="text-sm"><strong>Use Proposed:</strong> {displayResult.comparison.recommendations.useProposed.yes ? 'Yes' : 'No'}</p>
                                  {displayResult.comparison.recommendations.useProposed.reason && (
                                    <p className="text-sm mt-1">{displayResult.comparison.recommendations.useProposed.reason}</p>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Raw JSON for debugging */}
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm text-muted-foreground">View Raw Analysis Data</summary>
                          <div className="mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(displayResult.comparison, null, 2)}
                            </pre>
                          </div>
                        </details>

                        <Button onClick={() => copyToClipboard(JSON.stringify(displayResult.comparison, null, 2))}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Analysis JSON
                        </Button>
                      </div>
                    )}
                  </div>
                  )
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Existing Content Tab */}
          <TabsContent value="existing">
            <div className="space-y-6">
              {/* Page Metadata Display - Organized by Page */}
              {displayResult.metadata && (
                <PageMetadataDisplay
                  metadata={displayResult.metadata}
                  comprehensiveData={displayResult.comprehensive}
                />
              )}

              {/* Raw Content Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Text Preview</CardTitle>
                  <CardDescription>
                    Clean extracted text from all pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayResult.comprehensive?.pages?.map((page: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">
                            {page.pageLabel || `Page ${index + 1}`}
                          </h4>
                          <Badge variant="outline">{page.pageType || 'page'}</Badge>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded">
                            {page.content?.text || displayResult.existing.cleanText}
                          </pre>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          📊 {page.content?.wordCount || 0} words • {page.content?.text?.length || 0} characters
                        </p>
                      </div>
                    )) || (
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-semibold mb-2">Content Preview</h4>
                        <div className="max-h-96 overflow-y-auto">
                          <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded">
                            {displayResult.existing.cleanText}
                          </pre>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          📊 Total content length: {displayResult.existing.cleanText.length.toLocaleString()} characters
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Proposed Content Tab */}
          {displayResult.proposed && (
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
                        <div><strong>Title:</strong> {displayResult.proposed.title}</div>
                        <div><strong>Description:</strong> {displayResult.proposed.metaDescription}</div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-2">Proposed Content</h4>
                      <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded">
                        {displayResult.proposed.cleanText}
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

**URL:** ${result?.existing?.url || 'N/A'}
**Date:** ${new Date().toLocaleString()}

---

## Existing Content

**Title:** ${result?.existing?.title || 'N/A'}
**Meta Description:** ${result?.existing?.metaDescription || 'N/A'}
**Word Count:** ${result?.existing?.wordCount || 0}
**Keywords:** ${result?.existing?.extractedKeywords?.slice(0, 10).join(', ') || 'N/A'}

${result?.proposed ? `
## Proposed Content

**Title:** ${result.proposed.title || 'N/A'}
**Meta Description:** ${result.proposed.metaDescription || 'N/A'}
**Word Count:** ${result.proposed.wordCount || 0}
**Keywords:** ${result.proposed.extractedKeywords?.slice(0, 10).join(', ') || 'N/A'}

---

## AI Comparison Analysis

${JSON.stringify(result.comparison || {}, null, 2)}
` : ''}

---

Generated by Zero Barriers Growth Accelerator
`;
}


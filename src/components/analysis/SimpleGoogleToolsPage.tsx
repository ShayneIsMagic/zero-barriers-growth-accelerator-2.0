/**
 * Simple Google Tools Page
 * Follows the Content-Comparison pattern: URL input → Scrape → Analyze
 * No complex authentication, just direct scraping and AI analysis
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    BarChart3,
    Bot,
    CheckCircle,
    Download,
    ExternalLink,
    Loader2,
    Search,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useState } from 'react';

interface ScrapedGoogleData {
  trends?: {
    relatedQueries: Array<{ query: string; value: number; type: string }>;
    relatedTopics: Array<{ topic: string; value: number; type: string }>;
  };
  pageSpeed?: {
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    seoScore: number;
    coreWebVitals: { lcp: number; fid: number; cls: number };
    opportunities: Array<{ title: string; description: string; impact: string; savings: string }>;
  };
  analysis?: string;
}

export function SimpleGoogleToolsPage() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedGoogleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrapeData = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsScraping(true);
    setError(null);
    setScrapedData(null);

    try {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

      const response = await fetch('/api/scrape-google-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _url,
          keywords: keywordArray
        }),
      });

      const result = await response.json();

      if (result.success) {
        setScrapedData(result.data);
        console.log('✅ Google Tools data scraped successfully:', result.data);
      } else {
        throw new Error(result.error || 'Failed to scrape Google Tools data');
      }
    } catch (error) {
      console.error('❌ Google Tools scraping failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to scrape Google Tools data');
    } finally {
      setIsScraping(false);
    }
  };

  const handleAnalyzeData = async () => {
    if (!scrapedData) {
      setError('Please scrape data first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/google-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _url,
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
          scrapedData
        }),
      });

      const result = await response.json();

      if (result.success) {
        setScrapedData(prev => prev ? { ...prev, analysis: result.analysis } : null);
        console.log('✅ Google Tools analysis completed');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ Google Tools analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadData = () => {
    if (!scrapedData) return;

    const dataStr = JSON.stringify(scrapedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `google-tools-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getToolLinks = () => {
    if (!url.trim()) return [];

    const domain = new URL(url).hostname;
    const keywordString = keywords || domain.replace(/\.(com|org|net|co|io)$/, '');

    return [
      {
        name: 'Google Trends',
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(keywordString)}&geo=US&date=today%2012-m`,
        icon: TrendingUp,
        color: 'blue'
      },
      {
        name: 'PageSpeed Insights',
        url: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=desktop`,
        icon: Zap,
        color: 'green'
      },
      {
        name: 'Search Console',
        url: `https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain:${domain}`,
        icon: Search,
        color: 'purple'
      },
      {
        name: 'Google Analytics',
        url: `https://analytics.google.com/analytics/web/`,
        icon: BarChart3,
        color: 'orange'
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Google Tools Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Automatically scrape Google Tools data and get AI-powered insights
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-6 w-6 text-blue-600" />
              Enter Website Details
            </CardTitle>
            <CardDescription>
              Enter your website URL and keywords to analyze with Google Tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website-url">Website URL</Label>
              <Input
                id="website-url"
                name="website-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScraping || isAnalyzing}
                aria-label="Enter website URL to analyze"
                aria-describedby="url-help"
                required
              />
              <p id="url-help" className="text-xs text-muted-foreground mt-1">
                Enter the URL of the website you want to analyze
              </p>
            </div>

            <div>
              <Label htmlFor="keywords">Keywords (Optional)</Label>
              <Input
                id="keywords"
                name="keywords"
                type="text"
                placeholder="custom homes, home builders, construction"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={isScraping || isAnalyzing}
                aria-label="Enter keywords for analysis"
                aria-describedby="keywords-help"
              />
              <p id="keywords-help" className="text-xs text-muted-foreground mt-1">
                💡 Leave empty to auto-extract keywords from your website URL
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleScrapeData}
                disabled={isScraping || isAnalyzing || !url.trim()}
                className="flex-1"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping Google Tools Data...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Step 1: Scrape Data
                  </>
                )}
              </Button>

              <Button
                onClick={handleAnalyzeData}
                disabled={isAnalyzing || !scrapedData || isScraping}
                className="flex-1"
                variant="outline"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Step 2: Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Scraped Data Preview */}
        {scrapedData && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Scraped Google Tools Data</CardTitle>
                    <CardDescription>
                      Data successfully scraped from Google Tools for {url}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={downloadData}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Trends Data */}
                {scrapedData.trends && (
                  <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                      Google Trends Data
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Related Queries ({scrapedData.trends.relatedQueries?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {scrapedData.trends.relatedQueries?.slice(0, 5).map((query, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {query.query}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Related Topics ({scrapedData.trends.relatedTopics?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {scrapedData.trends.relatedTopics?.slice(0, 5).map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic.topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PageSpeed Data */}
                {scrapedData.pageSpeed && (
                  <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Zap className="mr-2 h-5 w-5 text-green-600" />
                      PageSpeed Insights Data
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{scrapedData.pageSpeed.performanceScore}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Performance</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{scrapedData.pageSpeed.accessibilityScore}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Accessibility</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{scrapedData.pageSpeed.bestPracticesScore}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Best Practices</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{scrapedData.pageSpeed.seoScore}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">SEO</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Opportunities ({scrapedData.pageSpeed.opportunities?.length || 0})
                      </p>
                      <div className="space-y-1">
                        {scrapedData.pageSpeed.opportunities?.slice(0, 3).map((opp, index) => (
                          <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                            • {opp.title}: {opp.savings}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Tool Links */}
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <ExternalLink className="mr-2 h-5 w-5 text-gray-600" />
                    Direct Tool Access
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {getToolLinks().map((tool, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(tool.url, '_blank')}
                        className="justify-start"
                      >
                        <tool.icon className="mr-2 h-4 w-4" />
                        {tool.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {scrapedData?.analysis && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                AI Analysis Results
              </CardTitle>
              <CardDescription>
                AI-powered insights based on your Google Tools data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {scrapedData.analysis}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

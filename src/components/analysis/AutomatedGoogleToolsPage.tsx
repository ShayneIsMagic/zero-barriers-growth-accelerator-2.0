/**
 * Automated Google Tools Page
 * Combines direct tool links with automated Puppeteer data extraction
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GoogleToolsDirectService } from '@/lib/services/google-tools-direct.service';
import {
    BarChart3,
    Bot,
    CheckCircle,
    Copy,
    Download,
    ExternalLink,
    Loader2,
    RefreshCw,
    Search,
    TrendingUp,
    X,
    Zap
} from 'lucide-react';
import { useState } from 'react';

interface GoogleToolLink {
  name: string;
  url: string;
  description: string;
  icon: string;
}

interface ScrapedData {
  trends?: any;
  pageSpeed?: any;
  searchConsole?: any;
  analytics?: any;
}

export function AutomatedGoogleToolsPage() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [toolLinks, setToolLinks] = useState<GoogleToolLink[]>([]);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [manualData, setManualData] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copiedTool, setCopiedTool] = useState<string | null>(null);

  // Clear previous searches when URL changes
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl !== url) {
      setToolLinks([]);
      setScrapedData(null);
      setSelectedTool(null);
      setManualData('');
      setAnalysisResult(null);
      setCopiedTool(null);
    }
  };

  const handleGenerateLinks = () => {
    if (!url.trim()) return;

    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    const links = GoogleToolsDirectService.getToolLinks(url, keywordArray);
    setToolLinks(links);
  };

  const handleScrapeData = async () => {
    if (!url.trim()) return;

    setIsScraping(true);
    try {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

      const response = await fetch('/api/scrape-google-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          keywords: keywordArray
        }),
      });

      const result = await response.json();

      if (result.success) {
        setScrapedData(result.data);
        console.log('Scraped data:', result.data);
      } else {
        console.error('Scraping failed:', result.error);
        // Still show the tool links even if scraping fails
        handleGenerateLinks();
      }
    } catch (error) {
      console.error('Scraping error:', error);
      // Fallback to manual links
      handleGenerateLinks();
    } finally {
      setIsScraping(false);
    }
  };

  const handleCopyLink = (toolName: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedTool(toolName);
    setTimeout(() => setCopiedTool(null), 2000);
  };

  const handleClearAll = () => {
    setUrl('');
    setKeywords('');
    setToolLinks([]);
    setScrapedData(null);
    setSelectedTool(null);
    setManualData('');
    setAnalysisResult(null);
    setCopiedTool(null);
  };

  const handleAnalyzeData = async () => {
    if (!selectedTool || !manualData.trim()) return;

    try {
      const prompts = GoogleToolsDirectService.getPTCFPrompts();
      const prompt = prompts[selectedTool];

      if (!prompt) return;

      const fullPrompt = `${prompt.persona}

${prompt.task}

${prompt.context.replace('[PASTE', manualData)}

${prompt.format}`;

      // For now, just display the prompt - in production, this would send to Gemini
      setAnalysisResult(fullPrompt);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'Google Trends': return <TrendingUp className="h-6 w-6" />;
      case 'PageSpeed Insights': return <Zap className="h-6 w-6" />;
      case 'Google Search Console': return <Search className="h-6 w-6" />;
      case 'Google Analytics': return <BarChart3 className="h-6 w-6" />;
      case 'Lighthouse Audit': return <Zap className="h-6 w-6" />;
      case 'GTmetrix Analysis': return <BarChart3 className="h-6 w-6" />;
      default: return <ExternalLink className="h-6 w-6" />;
    }
  };

  const downloadScrapedData = () => {
    if (!scrapedData) return;

    const dataStr = JSON.stringify(scrapedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `google-tools-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Automated Google Tools Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get direct access to Google Tools AND automatically scrape data for AI analysis
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-6 w-6 text-blue-600" />
              Automated Data Collection
            </CardTitle>
            <CardDescription>
              Enter your website URL and keywords to get both direct tool links and automated data extraction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  type="text"
                  placeholder="custom homes, home builders, construction"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleScrapeData}
                  disabled={!url.trim() || isScraping}
                  className="flex-1"
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scraping Data...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Auto-Scrape All Data
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGenerateLinks}
                  disabled={!url.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Manual Links Only
                </Button>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  disabled={!url.trim() && !keywords.trim() && toolLinks.length === 0}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scraped Data Results */}
        {scrapedData && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle>Automatically Scraped Data</CardTitle>
                    <CardDescription>
                      Data successfully extracted from Google Tools using Puppeteer
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={downloadScrapedData}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {scrapedData.trends && (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        <h3 className="font-semibold text-lg">Google Trends</h3>
                        <Badge variant="secondary">Auto-Scraped</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Related queries: {scrapedData.trends.relatedQueries?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Related topics: {scrapedData.trends.relatedTopics?.length || 0}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {scrapedData.pageSpeed && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="h-6 w-6 text-green-600" />
                        <h3 className="font-semibold text-lg">PageSpeed Insights</h3>
                        <Badge variant="secondary">Auto-Scraped</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Performance: {scrapedData.pageSpeed.performanceScore || 0}/100
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Opportunities: {scrapedData.pageSpeed.opportunities?.length || 0}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {scrapedData.searchConsole && (
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="h-6 w-6 text-purple-600" />
                        <h3 className="font-semibold text-lg">Search Console</h3>
                        <Badge variant="outline">Auth Required</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Requires Google Search Console authentication
                      </p>
                    </CardContent>
                  </Card>
                )}

                {scrapedData.analytics && (
                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="h-6 w-6 text-orange-600" />
                        <h3 className="font-semibold text-lg">Google Analytics</h3>
                        <Badge variant="outline">Auth Required</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Requires Google Analytics authentication
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Google Tools Links */}
        {toolLinks.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle>Google Tools Access</CardTitle>
                    <CardDescription>
                      Click on any tool to open it in a new tab, or copy the link to share
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateLinks}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Links
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {toolLinks.map((tool, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getToolIcon(tool.name)}
                          <h3 className="font-semibold text-lg">{tool.name}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(tool.name, tool.url)}
                          >
                            {copiedTool === tool.name ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => window.open(tool.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {tool.description}
                      </p>
                      <div className="text-xs text-gray-500 font-mono break-all">
                        {tool.url}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Data Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-6 w-6 text-purple-600" />
              Analyze Google Tools Data
            </CardTitle>
            <CardDescription>
              Paste data from any Google Tool to get AI-powered analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tool-select">Select Tool</Label>
                <select
                  id="tool-select"
                  value={selectedTool || ''}
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a tool...</option>
                  <option value="trends">Google Trends</option>
                  <option value="analytics">Google Analytics</option>
                  <option value="searchConsole">Google Search Console</option>
                  <option value="pageSpeed">PageSpeed Insights</option>
                </select>
              </div>

              {selectedTool && (
                <div>
                  <Label htmlFor="manual-data">Paste Data from {selectedTool}</Label>
                  <Textarea
                    id="manual-data"
                    placeholder={GoogleToolsDirectService.getDataInputPrompts()[selectedTool]}
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value)}
                    className="mt-1 min-h-[200px]"
                  />
                </div>
              )}

              <Button
                onClick={handleAnalyzeData}
                disabled={!selectedTool || !manualData.trim()}
                className="w-full"
              >
                Analyze Data with AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                Analysis Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {analysisResult}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Standalone B2C Elements of Value Analysis Page
 * Focuses on consumer value elements and revenue opportunities
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, DollarSign, Download, Loader2, Target, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ContentPreviewBox } from './ContentPreviewBox';

interface B2CValueElement {
  element: string;
  current_strength: number;
  revenue_potential: string;
  implementation_effort: string;
  estimated_roi: string;
  target_audience: string;
}

interface B2CRecommendation {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  expected_revenue_impact: string;
  implementation_cost: string;
  timeline: string;
  roi_estimate: string;
}

interface B2CAnalysisData {
  overall_score: number;
  functional_score: number;
  emotional_score: number;
  life_changing_score: number;
  social_impact_score: number;
  revenue_opportunities: B2CValueElement[];
  recommendations: B2CRecommendation[];
}

export function StandaloneElementsOfValueB2CPage() {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<any>(null);
  const [result, setResult] = useState<B2CAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleScrapeContent = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsScraping(true);
    setError(null);
    setScrapedContent(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Content scraping failed');
      }

      if (data.success) {
        setScrapedContent(data.scrapedData || data.data);
      } else {
        throw new Error(data.error || 'Content scraping failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Content scraping failed');
    } finally {
      setIsScraping(false);
    }
  };

  const handleAnalyze = async () => {
    if (!scrapedContent) {
      setError('Please scrape content first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/elements-value-b2c-standalone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          scrapedContent: scrapedContent
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getEffortBadgeColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const downloadReport = async () => {
    if (!result) return;

    setIsDownloading(true);
    try {
      const markdownReport = generateMarkdownReport(result, url);
      const blob = new Blob([markdownReport], { type: 'text/markdown' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `b2c-elements-analysis-${url.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success('Report downloaded successfully!', {
        description: 'Your B2C Elements of Value analysis report has been saved.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Download failed', {
        description: 'There was an error downloading the report. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async (text: string, itemName: string) => {
    setIsCopying(true);
    setCopiedItem(itemName);
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!', {
        description: `${itemName} has been copied to your clipboard.`,
        duration: 2000,
      });
    } catch (error) {
      toast.error('Copy failed', {
        description: 'Unable to copy to clipboard. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsCopying(false);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const generateMarkdownReport = (analysisResult: B2CAnalysisData, websiteUrl: string) => {
    const timestamp = new Date().toISOString();
    const domain = new URL(websiteUrl).hostname;

    return `# B2C Elements of Value Analysis Report

**Website:** ${websiteUrl}
**Domain:** ${domain}
**Analysis Date:** ${new Date(timestamp).toLocaleDateString()}
**Analysis Type:** B2C Elements of Value Framework

---

## Executive Summary

This analysis evaluates the website's performance across the 30 B2C Elements of Value framework, identifying revenue opportunities and optimization strategies.

**Overall B2C Value Score: ${analysisResult.overall_score}%**

### Score Breakdown
- **Functional Elements:** ${analysisResult.functional_score}%
- **Emotional Elements:** ${analysisResult.emotional_score}%
- **Life-Changing Elements:** ${analysisResult.life_changing_score}%
- **Social Impact Elements:** ${analysisResult.social_impact_score}%

---

## Revenue Opportunities

${analysisResult.revenue_opportunities.map((opportunity, index) => `
### ${index + 1}. ${opportunity.element}

- **Current Strength:** ${opportunity.current_strength}/10
- **Revenue Potential:** ${opportunity.revenue_potential}
- **Implementation Effort:** ${opportunity.implementation_effort}
- **Estimated ROI:** ${opportunity.estimated_roi}
- **Target Audience:** ${opportunity.target_audience}
`).join('')}

---

## Strategic Recommendations

${analysisResult.recommendations.map((recommendation, index) => `
### ${index + 1}. ${recommendation.action} (${recommendation.priority} Priority)

- **Expected Revenue Impact:** ${recommendation.expected_revenue_impact}
- **Implementation Cost:** ${recommendation.implementation_cost}
- **Timeline:** ${recommendation.timeline}
- **ROI Estimate:** ${recommendation.roi_estimate}
`).join('')}

---

## Next Steps

1. **Immediate Actions (0-3 months):** Focus on high-priority recommendations with low implementation effort
2. **Medium-term Goals (3-6 months):** Implement medium-priority recommendations with significant revenue potential
3. **Long-term Strategy (6+ months):** Develop comprehensive value proposition enhancements

---

## Framework Details

This analysis is based on the Harvard Business Review's 30 B2C Elements of Value framework:

- **Functional (14 elements):** Saves time, Simplifies, Makes money, Reduces risk, Organizes, Integrates, Connects, Reduces effort, Avoids hassles, Reduces cost, Quality, Variety, Sensory appeal, Informs
- **Emotional (10 elements):** Reduces anxiety, Rewards me, Nostalgia, Design/aesthetics, Badge value, Wellness, Therapeutic value, Fun/entertainment, Attractiveness, Provides access
- **Life-Changing (5 elements):** Provides hope, Self-actualization, Motivation, Heirloom, Affiliation and belonging
- **Social Impact (1 element):** Self-transcendence

---

*Report generated by Zero Barriers Growth Accelerator*
*For questions or support, contact: hello@zerobarriers.com*
`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            B2C Elements of Value Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Analyze your website using the 30 B2C Elements of Value framework to identify revenue opportunities and optimize customer satisfaction
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-6 w-6 text-blue-600" />
              Enter Website URL
            </CardTitle>
            <CardDescription>
              We'll analyze your website against the 30 B2C Elements of Value to identify revenue opportunities
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
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleScrapeContent}
                  disabled={isScraping || !url.trim()}
                  className="w-full"
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scraping Website Content...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Step 1: Scrape Content
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !scrapedContent}
                  className="w-full"
                  variant="outline"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing B2C Value Elements...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Step 2: Analyze B2C Value Elements
                    </>
                  )}
                </Button>
              </div>
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

        {/* Two-Column Layout: Collected Data + Analysis Results */}
        {(scrapedContent || result) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column: Collected Data */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Target className="mr-2 h-5 w-5" />
                  Collected Data
                </CardTitle>
                <CardDescription>
                  Raw data collected from {url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scrapedContent ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-900">Title</div>
                        <div className="text-blue-700 truncate">{scrapedContent.title || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-900">Word Count</div>
                        <div className="text-blue-700">{scrapedContent.wordCount || 0}</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-900">Keywords</div>
                        <div className="text-blue-700">{scrapedContent.seo?.extractedKeywords?.length || 0}</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-900">Images</div>
                        <div className="text-blue-700">{scrapedContent.seo?.images?.length || 0}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Content Preview:</strong> {scrapedContent.cleanText?.substring(0, 200) || 'No content available'}...
                    </div>
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(scrapedContent, null, 2), 'Scraped Data')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={isCopying}
                    >
                      {copiedItem === 'Scraped Data' ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {copiedItem === 'Scraped Data' ? 'Copied!' : 'Copy Raw Data'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No data collected yet</p>
                    <p className="text-sm">Click "Scrape Content" to collect website data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column: Analysis Results */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <DollarSign className="mr-2 h-5 w-5" />
                  B2C Analysis Results
                </CardTitle>
                <CardDescription>
                  AI-powered B2C Elements of Value analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {result.overall_score}%
                      </div>
                      <p className="text-sm text-gray-600">Overall B2C Value Score</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-900">Functional</div>
                        <div className="text-green-700">{result.functional_score}%</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-900">Emotional</div>
                        <div className="text-green-700">{result.emotional_score}%</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-900">Life-Changing</div>
                        <div className="text-green-700">{result.life_changing_score}%</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-900">Social Impact</div>
                        <div className="text-green-700">{result.social_impact_score}%</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Revenue Opportunities:</strong> {result.revenue_opportunities?.length || 0} identified
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'Analysis Results')}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isCopying}
                      >
                        {copiedItem === 'Analysis Results' ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        Copy
                      </Button>
                      <Button
                        onClick={downloadReport}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No analysis completed yet</p>
                    <p className="text-sm">Click "Analyze B2C Value Elements" to run analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Results */}
        {result && (
          <div className="space-y-8">
            {/* Analysis Report Header */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <DollarSign className="mr-2 h-6 w-6 text-green-600" />
                      B2C Elements of Value Analysis Report
                    </CardTitle>
                    <CardDescription>
                      Analysis completed for: {url}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'Analysis Results')}
                      variant="outline"
                      size="sm"
                      disabled={isCopying}
                    >
                      {copiedItem === 'Analysis Results' ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {copiedItem === 'Analysis Results' ? 'Copied!' : 'Copy Data'}
                    </Button>
                    <Button
                      onClick={downloadReport}
                      variant="outline"
                      size="sm"
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {isDownloading ? 'Downloading...' : 'Download Report'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-6 w-6 text-green-600" />
                  B2C Value Analysis Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-2">
                    {result.overall_score}%
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    B2C Value Elements Performance
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-6 w-6 text-blue-600" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.functional_score}%</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Functional</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.emotional_score}%</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Emotional</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{result.life_changing_score}%</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Life Changing</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.social_impact_score}%</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Social Impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-6 w-6 text-purple-600" />
                  Revenue Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.revenue_opportunities.map((opportunity, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-lg">{opportunity.element}</h5>
                          <Button
                            onClick={() => copyToClipboard(
                              `${opportunity.element}\nStrength: ${opportunity.current_strength}/10\nRevenue: ${opportunity.revenue_potential}\nEffort: ${opportunity.implementation_effort}\nROI: ${opportunity.estimated_roi}\nTarget: ${opportunity.target_audience}`,
                              opportunity.element
                            )}
                            variant="ghost"
                            size="sm"
                            disabled={isCopying}
                          >
                            {copiedItem === opportunity.element ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Strength:</span>
                            <p className="text-gray-600 dark:text-gray-400">{opportunity.current_strength}/10</p>
                          </div>
                          <div>
                            <span className="font-medium">Revenue:</span>
                            <p className="text-green-600 font-semibold">{opportunity.revenue_potential}</p>
                          </div>
                          <div>
                            <span className="font-medium">Effort:</span>
                            <Badge className={getEffortBadgeColor(opportunity.implementation_effort)}>
                              {opportunity.implementation_effort}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">ROI:</span>
                            <p className="text-blue-600 font-semibold">{opportunity.estimated_roi}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Target:</span> {opportunity.target_audience}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-6 w-6 text-green-600" />
                  Revenue Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.recommendations.map((recommendation, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-lg">{recommendation.action}</h5>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityBadgeColor(recommendation.priority)}>
                              {recommendation.priority} Priority
                            </Badge>
                            <Button
                              onClick={() => copyToClipboard(
                                `${recommendation.action} (${recommendation.priority} Priority)\nRevenue Impact: ${recommendation.expected_revenue_impact}\nCost: ${recommendation.implementation_cost}\nTimeline: ${recommendation.timeline}\nROI: ${recommendation.roi_estimate}`,
                                recommendation.action
                              )}
                              variant="ghost"
                              size="sm"
                              disabled={isCopying}
                            >
                              {copiedItem === recommendation.action ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Revenue Impact:</span>
                            <p className="text-green-600 font-semibold">{recommendation.expected_revenue_impact}</p>
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span>
                            <p className="text-gray-600 dark:text-gray-400">{recommendation.implementation_cost}</p>
                          </div>
                          <div>
                            <span className="font-medium">Timeline:</span>
                            <p className="text-gray-600 dark:text-gray-400">{recommendation.timeline}</p>
                          </div>
                          <div>
                            <span className="font-medium">ROI:</span>
                            <p className="text-blue-600 font-semibold">{recommendation.roi_estimate}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

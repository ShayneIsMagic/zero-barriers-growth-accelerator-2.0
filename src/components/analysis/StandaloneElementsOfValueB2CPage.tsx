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
import { DollarSign, Loader2, Target, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

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
        setScrapedContent(data.data);
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

        {/* Scraped Content Preview */}
        {scrapedContent && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-6 w-6 text-blue-600" />
                Scraped Content Preview
              </CardTitle>
              <CardDescription>
                Content successfully scraped from {url}. Review the data before analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Title:</h4>
                  <p className="text-gray-700 dark:text-gray-300">{scrapedContent.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Meta Description:</h4>
                  <p className="text-gray-700 dark:text-gray-300">{scrapedContent.metaDescription}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Content Preview:</h4>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {scrapedContent.cleanText.substring(0, 500)}...
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Headings Found:</h4>
                  <div className="flex flex-wrap gap-2">
                    {scrapedContent.headings?.slice(0, 10).map((heading: string, index: number) => (
                      <Badge key={index} variant="outline">{heading}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
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
                        <h5 className="font-semibold text-lg mb-2">{opportunity.element}</h5>
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
                          <Badge className={getPriorityBadgeColor(recommendation.priority)}>
                            {recommendation.priority} Priority
                          </Badge>
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

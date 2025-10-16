/**
 * Revenue-Focused Google Trends Analysis Page
 * Identifies underserved market demand and emerging revenue opportunities
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Target, TrendingUp, DollarSign, Users, Clock, BarChart3 } from 'lucide-react';

interface RevenueOpportunity {
  content_title: string;
  target_audience: string;
  search_volume_estimate: string;
  revenue_potential: string;
  implementation_effort: string;
  timeline_to_revenue: string;
  estimated_roi: string;
}

interface MarketGap {
  gap: string;
  search_intent: string;
  current_competition: string;
  opportunity_size: string;
  content_angle: string;
  revenue_potential: string;
}

interface ContentSuggestion {
  content_type: string;
  topic: string;
  target_audience: string;
  expected_traffic: string;
  revenue_impact: string;
}

interface RevenueTrendsData {
  market_opportunity_score: number;
  underserved_demand_identified: boolean;
  revenue_opportunity_brief: {
    subject: string;
    identified_topic: string;
    market_size_estimate: string;
    competition_level: string;
    growth_potential: string;
    revenue_opportunities: RevenueOpportunity[];
  };
  market_gaps: MarketGap[];
  content_strategy: {
    primary_focus: string;
    secondary_opportunities: string[];
    content_calendar_suggestions: ContentSuggestion[];
  };
  competitive_analysis: {
    market_leaders: string[];
    content_gaps: string[];
    differentiation_opportunities: string[];
    pricing_opportunities: string[];
  };
}

export function RevenueTrendsPage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RevenueTrendsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/revenue-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
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

  const getCompetitionBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGrowthBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEffortBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Revenue-Focused Market Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Identify underserved market demand and emerging revenue opportunities through AI-powered content strategy analysis
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-6 w-6 text-blue-600" />
              Enter Website URL
            </CardTitle>
            <CardDescription>
              We'll analyze your website to identify market gaps and revenue opportunities
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
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !url.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Market Opportunities...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Find Revenue Opportunities
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

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Market Opportunity Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-6 w-6 text-green-600" />
                  Market Opportunity Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-2">
                    {result.market_opportunity_score}%
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {result.underserved_demand_identified 
                      ? 'Underserved demand identified!' 
                      : 'Market analysis complete'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Opportunity Brief */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-6 w-6 text-blue-600" />
                  Revenue Opportunity Brief
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{result.revenue_opportunity_brief.subject}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Topic:</strong> {result.revenue_opportunity_brief.identified_topic}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Market Size:</strong> {result.revenue_opportunity_brief.market_size_estimate}
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Badge className={getCompetitionBadgeColor(result.revenue_opportunity_brief.competition_level)}>
                      Competition: {result.revenue_opportunity_brief.competition_level}
                    </Badge>
                    <Badge className={getGrowthBadgeColor(result.revenue_opportunity_brief.growth_potential)}>
                      Growth: {result.revenue_opportunity_brief.growth_potential}
                    </Badge>
                  </div>

                  {/* Revenue Opportunities */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Revenue Opportunities</h4>
                    <div className="space-y-4">
                      {result.revenue_opportunity_brief.revenue_opportunities.map((opportunity, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <h5 className="font-semibold text-lg mb-2">{opportunity.content_title}</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Target:</span>
                                <p className="text-gray-600 dark:text-gray-400">{opportunity.target_audience}</p>
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
                              <span className="font-medium">Timeline:</span> {opportunity.timeline_to_revenue}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Gaps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-6 w-6 text-purple-600" />
                  Market Gaps Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.market_gaps.map((gap, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <h5 className="font-semibold text-lg mb-2">{gap.gap}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Search Intent:</span>
                            <p className="text-gray-600 dark:text-gray-400">{gap.search_intent}</p>
                          </div>
                          <div>
                            <span className="font-medium">Current Competition:</span>
                            <p className="text-gray-600 dark:text-gray-400">{gap.current_competition}</p>
                          </div>
                          <div>
                            <span className="font-medium">Opportunity Size:</span>
                            <p className="text-green-600 font-semibold">{gap.opportunity_size}</p>
                          </div>
                          <div>
                            <span className="font-medium">Revenue Potential:</span>
                            <p className="text-blue-600 font-semibold">{gap.revenue_potential}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Content Angle:</span>
                          <p className="text-gray-600 dark:text-gray-400">{gap.content_angle}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-6 w-6 text-orange-600" />
                  Content Strategy Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Primary Focus</h4>
                    <p className="text-gray-600 dark:text-gray-400">{result.content_strategy.primary_focus}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Secondary Opportunities</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.content_strategy.secondary_opportunities.map((opportunity, index) => (
                        <Badge key={index} variant="outline">{opportunity}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3">Content Calendar Suggestions</h4>
                    <div className="space-y-3">
                      {result.content_strategy.content_calendar_suggestions.map((suggestion, index) => (
                        <Card key={index} className="border-l-4 border-l-orange-500">
                          <CardContent className="pt-4">
                            <h5 className="font-semibold text-lg mb-2">{suggestion.topic}</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Type:</span>
                                <p className="text-gray-600 dark:text-gray-400">{suggestion.content_type}</p>
                              </div>
                              <div>
                                <span className="font-medium">Audience:</span>
                                <p className="text-gray-600 dark:text-gray-400">{suggestion.target_audience}</p>
                              </div>
                              <div>
                                <span className="font-medium">Traffic:</span>
                                <Badge className={getGrowthBadgeColor(suggestion.expected_traffic)}>
                                  {suggestion.expected_traffic}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium">Revenue Impact:</span>
                                <p className="text-green-600 font-semibold">{suggestion.revenue_impact}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competitive Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-6 w-6 text-red-600" />
                  Competitive Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Market Leaders</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.competitive_analysis.market_leaders.map((leader, index) => (
                        <Badge key={index} variant="outline">{leader}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Content Gaps</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.competitive_analysis.content_gaps.map((gap, index) => (
                        <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Differentiation Opportunities</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.competitive_analysis.differentiation_opportunities.map((opp, index) => (
                        <Badge key={index} variant="outline" className="bg-green-100 text-green-800">
                          {opp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Pricing Opportunities</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.competitive_analysis.pricing_opportunities.map((opp, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800">
                          {opp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

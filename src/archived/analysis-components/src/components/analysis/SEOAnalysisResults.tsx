'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEOAnalysis } from '@/types/analysis';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Lightbulb,
  Minus,
  Search,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface SEOAnalysisResultsProps {
  analysis: SEOAnalysis;
  url: string;
  timestamp: string;
}

export default function SEOAnalysisResults({
  analysis,
  url,
  timestamp,
}: SEOAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const downloadReport = () => {
    const reportData = {
      url,
      timestamp,
      analysis,
      generatedBy: 'Zero Barriers Growth Accelerator SEO Analysis',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url_blob = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_blob;
    link.download = `seo-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url_blob);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Up':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'Down':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-600 font-bold';
    if (position <= 10) return 'text-yellow-600 font-semibold';
    if (position <= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            SEO Analysis Results
          </h2>
          <p className="mt-1 text-gray-600">
            Analysis for <span className="font-medium">{url}</span>
          </p>
          <p className="text-sm text-gray-500">
            Generated: {new Date(timestamp).toLocaleString()}
          </p>
        </div>
        <Button onClick={downloadReport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search-console">Search Console</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Current Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.searchConsole.currentRankings.length}
                </div>
                <p className="text-xs text-gray-500">Keywords tracked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Content Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.keywordResearch.contentGaps.length}
                </div>
                <p className="text-xs text-gray-500">
                  Opportunities identified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Trending Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.keywordResearch.trendingKeywords.length}
                </div>
                <p className="text-xs text-gray-500">Keywords analyzed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Key Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Immediate Actions
                  </h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.immediateActions.map(
                      (action, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="mt-1 text-green-600">•</span>
                          {action}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-800">
                    <Target className="h-4 w-4" />
                    Content Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.contentOpportunities.map(
                      (opportunity, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="mt-1 text-blue-600">•</span>
                          {opportunity}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search-console" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Current Keyword Rankings
              </CardTitle>
              <CardDescription>
                Keywords you currently rank for in Google Search Console
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Keyword</th>
                      <th className="p-3 text-left">Position</th>
                      <th className="p-3 text-left">Impressions</th>
                      <th className="p-3 text-left">Clicks</th>
                      <th className="p-3 text-left">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.searchConsole.currentRankings.map(
                      (ranking, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{ranking.keyword}</td>
                          <td
                            className={`p-3 ${getPositionColor(ranking.position)}`}
                          >
                            #{ranking.position}
                          </td>
                          <td className="p-3">
                            {ranking.impressions.toLocaleString()}
                          </td>
                          <td className="p-3">
                            {ranking.clicks.toLocaleString()}
                          </td>
                          <td className="p-3">{ranking.ctr.toFixed(1)}%</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Performing Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.searchConsole.topPerformingPages.map(
                  (page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{page.page}</p>
                        <p className="text-sm text-gray-500">
                          Position: #{page.position}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {page.clicks.toLocaleString()} clicks
                        </p>
                        <p className="text-sm text-gray-500">
                          {page.impressions.toLocaleString()} impressions
                        </p>
                        <p className="text-sm text-gray-500">
                          {page.ctr.toFixed(1)}% CTR
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Target Keywords
              </CardTitle>
              <CardDescription>
                Keyword research with search volume and opportunity analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.keywordResearch.targetKeywords.map(
                  (keyword, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold">{keyword.keyword}</h4>
                        <div className="flex gap-2">
                          <Badge
                            className={getCompetitionColor(keyword.competition)}
                          >
                            {keyword.competition} Competition
                          </Badge>
                          {keyword.currentPosition && (
                            <Badge variant="outline">
                              Position #{keyword.currentPosition}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <p className="text-gray-500">Search Volume</p>
                          <p className="font-semibold">
                            {keyword.searchVolume.toLocaleString()}/month
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Opportunity</p>
                          <p className="font-semibold">
                            {keyword.opportunity}/10
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Competition</p>
                          <p className="font-semibold">{keyword.competition}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Current Position</p>
                          <p className="font-semibold">
                            {keyword.currentPosition
                              ? `#${keyword.currentPosition}`
                              : 'Not ranking'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Content Gaps & Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.keywordResearch.contentGaps.map((gap, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-orange-200 bg-orange-50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-orange-900">
                        {gap.keyword}
                      </h4>
                      <Badge className="bg-orange-100 text-orange-800">
                        {gap.searchVolume.toLocaleString()}/month
                      </Badge>
                    </div>
                    <p className="mb-2 text-sm text-orange-800">
                      <strong>Competition:</strong> {gap.competition}
                    </p>
                    <p className="text-sm text-orange-700">{gap.opportunity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Trending Keywords
              </CardTitle>
              <CardDescription>
                Keywords trending up or down in your industry (Google Trends
                data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.keywordResearch.trendingKeywords.map(
                  (trend, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold">{trend.keyword}</h4>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend.trend)}
                          <Badge
                            className={
                              trend.trend === 'Up'
                                ? 'bg-green-100 text-green-800'
                                : trend.trend === 'Down'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {trend.trend} {trend.changePercentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Search Volume</p>
                          <p className="font-semibold">
                            {trend.searchVolume.toLocaleString()}/month
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Trend Change</p>
                          <p className="font-semibold">
                            {trend.changePercentage > 0 ? '+' : ''}
                            {trend.changePercentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                Competitive Analysis
              </CardTitle>
              <CardDescription>
                How you compare against reference sites and competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysis.competitiveAnalysis.competitors.map(
                  (competitor, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="flex items-center gap-2 font-semibold">
                          <ExternalLink className="h-4 w-4" />
                          {competitor.domain}
                        </h4>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            Score: {competitor.overallScore}/100
                          </Badge>
                          <Badge variant="outline">
                            {competitor.keywordOverlap}% overlap
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <h5 className="mb-2 font-medium text-red-800">
                            Content Gaps
                          </h5>
                          <ul className="space-y-1">
                            {competitor.contentGaps.map((gap, gapIndex) => (
                              <li
                                key={gapIndex}
                                className="flex items-start gap-2 text-sm text-red-700"
                              >
                                <span className="mt-1 text-red-600">•</span>
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="mb-2 font-medium text-green-800">
                            Opportunities
                          </h5>
                          <ul className="space-y-1">
                            {competitor.opportunities.map(
                              (opportunity, oppIndex) => (
                                <li
                                  key={oppIndex}
                                  className="flex items-start gap-2 text-sm text-green-700"
                                >
                                  <span className="mt-1 text-green-600">•</span>
                                  {opportunity}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Keyword Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.competitiveAnalysis.keywordComparison.map(
                  (comparison, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <h4 className="mb-3 font-semibold">
                        {comparison.keyword}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded bg-blue-50 p-2">
                          <span className="font-medium">Your Site</span>
                          <Badge
                            className={getPositionColor(
                              comparison.targetSite.position
                            )}
                          >
                            Position #{comparison.targetSite.position}
                          </Badge>
                        </div>
                        {comparison.competitors.map((comp, compIndex) => (
                          <div
                            key={compIndex}
                            className="flex items-center justify-between rounded bg-gray-50 p-2"
                          >
                            <span className="text-sm">{comp.domain}</span>
                            <Badge variant="outline">
                              Position #{comp.position}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

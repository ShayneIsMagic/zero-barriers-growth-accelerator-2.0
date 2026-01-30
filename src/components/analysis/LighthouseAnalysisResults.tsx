'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LighthouseAnalysis } from '@/types/analysis';
import {
  Zap,
  Eye,
  Shield,
  Search,
  Clock,
  Gauge,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface LighthouseAnalysisResultsProps {
  analysis: LighthouseAnalysis;
}

export function LighthouseAnalysisResults({
  analysis,
}: LighthouseAnalysisResultsProps) {
  const _getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (
    score: number
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    if (score >= 50) return 'outline';
    return 'destructive';
  };

  const formatMetric = (value: number, unit: string = 'ms') => {
    if (unit === 'ms') {
      return value > 1000
        ? `${(value / 1000).toFixed(1)}s`
        : `${Math.round(value)}ms`;
    }
    return `${value.toFixed(2)}${unit}`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Lighthouse Performance Score
          </CardTitle>
          <CardDescription>
            Technical performance analysis and optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <div className="text-6xl font-bold text-blue-600">
              {analysis.overallScore}
            </div>
            <div className="space-y-2">
              <Progress value={analysis.overallScore} className="h-3" />
              <p className="text-sm text-gray-600">
                {analysis.overallScore >= 90
                  ? 'Excellent'
                  : analysis.overallScore >= 70
                    ? 'Good'
                    : analysis.overallScore >= 50
                      ? 'Needs Improvement'
                      : 'Poor'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score</span>
              <Badge variant={getScoreBadgeVariant(analysis.performance.score)}>
                {analysis.performance.score}
              </Badge>
            </div>
            <Progress value={analysis.performance.score} className="h-2" />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Core Metrics</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>FCP:</span>
                  <span>
                    {formatMetric(
                      analysis.performance.metrics.firstContentfulPaint
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>LCP:</span>
                  <span>
                    {formatMetric(
                      analysis.performance.metrics.largestContentfulPaint
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TBT:</span>
                  <span>
                    {formatMetric(
                      analysis.performance.metrics.totalBlockingTime
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CLS:</span>
                  <span>
                    {formatMetric(
                      analysis.performance.metrics.cumulativeLayoutShift,
                      ''
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-4 w-4" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score</span>
              <Badge
                variant={getScoreBadgeVariant(analysis.accessibility.score)}
              >
                {analysis.accessibility.score}
              </Badge>
            </div>
            <Progress value={analysis.accessibility.score} className="h-2" />

            {analysis.accessibility.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">
                  Issues Found
                </h4>
                <ul className="space-y-1 text-xs">
                  {analysis.accessibility.issues
                    .slice(0, 3)
                    .map((issue, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />
                        <span>{issue}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-4 w-4" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score</span>
              <Badge
                variant={getScoreBadgeVariant(analysis.bestPractices.score)}
              >
                {analysis.bestPractices.score}
              </Badge>
            </div>
            <Progress value={analysis.bestPractices.score} className="h-2" />

            {analysis.bestPractices.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-orange-600">
                  Issues Found
                </h4>
                <ul className="space-y-1 text-xs">
                  {analysis.bestPractices.issues
                    .slice(0, 2)
                    .map((issue, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-orange-500" />
                        <span>{issue}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-4 w-4" />
              SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score</span>
              <Badge variant={getScoreBadgeVariant(analysis.seo.score)}>
                {analysis.seo.score}
              </Badge>
            </div>
            <Progress value={analysis.seo.score} className="h-2" />

            {analysis.seo.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-600">
                  Issues Found
                </h4>
                <ul className="space-y-1 text-xs">
                  {analysis.seo.issues.slice(0, 2).map((issue, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-yellow-500" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Opportunities */}
      {analysis.performance.opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Opportunities
            </CardTitle>
            <CardDescription>
              Specific actions to improve your website&apos;s performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.performance.opportunities.map((opportunity, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span className="text-sm">{opportunity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Action Items
          </CardTitle>
          <CardDescription>
            Priority recommendations for immediate improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {analysis.accessibility.recommendations.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Accessibility</h4>
                <ul className="space-y-1 text-xs">
                  {analysis.accessibility.recommendations
                    .slice(0, 2)
                    .map((rec, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-blue-500" />
                        <span>{rec}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {analysis.seo.recommendations.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">SEO</h4>
                <ul className="space-y-1 text-xs">
                  {analysis.seo.recommendations
                    .slice(0, 2)
                    .map((rec, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-green-500" />
                        <span>{rec}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Page Comparison View Component
 * Displays side-by-side comparison of assessment results for multiple pages
 * Allows comparing scores, findings, and recommendations across pages
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Copy,
  Eye,
} from 'lucide-react';

interface PageReport {
  pageUrl: string;
  pageLabel: string;
  assessmentId: string;
  assessmentName: string;
  assessmentType: string;
  analysis: any;
  frameworkUsed?: string;
  validation?: {
    isValid: boolean;
    score: number;
    missingElements: string[];
    recommendations: string[];
  };
  timestamp: string;
}

interface PageComparisonViewProps {
  reports: PageReport[];
  selectedArchetype?: string;
  selectedAudience?: string;
}

export function PageComparisonView({
  reports,
  selectedArchetype,
  selectedAudience,
}: PageComparisonViewProps) {
  const [selectedTab, setSelectedTab] = useState<string>('overview');

  // Group reports by assessment type
  const reportsByAssessment = reports.reduce((acc, report) => {
    if (!acc[report.assessmentType]) {
      acc[report.assessmentType] = [];
    }
    acc[report.assessmentType].push(report);
    return acc;
  }, {} as Record<string, PageReport[]>);

  const assessmentTypes = Object.keys(reportsByAssessment);

  const getScore = (report: PageReport): number => {
    if (report.validation?.score !== undefined) {
      return report.validation.score;
    }
    if (report.analysis?.overall_score !== undefined) {
      return report.analysis.overall_score;
    }
    if (report.analysis?.score !== undefined) {
      return report.analysis.score;
    }
    return 0;
  };

  const _getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const compareScores = (reports: PageReport[]): Array<{
    pageLabel: string;
    score: number;
    trend?: 'up' | 'down' | 'same';
  }> => {
    const scores = reports.map((r) => ({
      pageLabel: r.pageLabel,
      score: getScore(r),
    }));

    // Sort by score descending
    const sorted = [...scores].sort((a, b) => b.score - a.score);

    return sorted.map((item, index) => {
      if (index === 0) {
        return { ...item, trend: 'up' as const };
      }
      const prevScore = sorted[index - 1].score;
      if (item.score > prevScore) {
        return { ...item, trend: 'up' as const };
      }
      if (item.score < prevScore) {
        return { ...item, trend: 'down' as const };
      }
      return { ...item, trend: 'same' as const };
    });
  };

  const downloadComparison = () => {
    const comparisonData = {
      metadata: {
        archetype: selectedArchetype || 'Auto-detect',
        audience: selectedAudience || 'Auto-detect',
        comparisonDate: new Date().toISOString(),
        totalPages: reports.length,
        assessments: assessmentTypes,
      },
      reports: reports.map((r) => ({
        pageLabel: r.pageLabel,
        pageUrl: r.pageUrl,
        assessmentName: r.assessmentName,
        score: getScore(r),
        analysis: r.analysis,
        validation: r.validation,
      })),
    };

    const blob = new Blob([JSON.stringify(comparisonData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-comparison-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyComparison = async () => {
    const comparisonText = reports
      .map((r) => {
        return `${r.pageLabel} (${r.pageUrl}):\nScore: ${getScore(r)}\nAssessment: ${r.assessmentName}\n\n`;
      })
      .join('\n---\n\n');

    await navigator.clipboard.writeText(comparisonText);
    alert('Comparison copied to clipboard!');
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No reports to compare</p>
          <p className="text-xs mt-2">Run assessments on multiple pages to see comparisons</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Page Comparison
              </CardTitle>
              <CardDescription>
                Comparing {reports.length} page{reports.length !== 1 ? 's' : ''} across{' '}
                {assessmentTypes.length} assessment{assessmentTypes.length !== 1 ? 's' : ''}
                {(selectedArchetype || selectedAudience) && (
                  <>
                    {' '}
                    • Archetype: {selectedArchetype || 'Auto-detect'} • Audience:{' '}
                    {selectedAudience || 'Auto-detect'}
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyComparison}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadComparison}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Comparison Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {assessmentTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {reportsByAssessment[type][0]?.assessmentName || type}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {assessmentTypes.map((assessmentType) => {
            const assessmentReports = reportsByAssessment[assessmentType];
            const scores = compareScores(assessmentReports);

            return (
              <Card key={assessmentType}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {assessmentReports[0]?.assessmentName || assessmentType}
                  </CardTitle>
                  <CardDescription>
                    {assessmentReports.length} page
                    {assessmentReports.length !== 1 ? 's' : ''} compared
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Score Comparison */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Score Comparison</h4>
                      <div className="space-y-2">
                        {scores.map((item, index) => (
                          <div
                            key={item.pageLabel}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium w-6">
                                  #{index + 1}
                                </span>
                                {item.trend === 'up' && (
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                )}
                                {item.trend === 'down' && (
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                {item.trend === 'same' && (
                                  <Minus className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <span className="font-medium">{item.pageLabel}</span>
                            </div>
                            <Badge
                              variant={getScoreBadgeVariant(item.score)}
                              className="text-sm"
                            >
                              {item.score.toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Average Score</p>
                        <p className="text-lg font-semibold">
                          {(
                            scores.reduce((sum, s) => sum + s.score, 0) / scores.length
                          ).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Highest</p>
                        <p className="text-lg font-semibold text-green-600">
                          {scores[0]?.score.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lowest</p>
                        <p className="text-lg font-semibold text-red-600">
                          {scores[scores.length - 1]?.score.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Individual Assessment Tabs */}
        {assessmentTypes.map((assessmentType) => {
          const assessmentReports = reportsByAssessment[assessmentType];

          return (
            <TabsContent key={assessmentType} value={assessmentType}>
              <div className="space-y-4">
                {assessmentReports.map((report) => (
                  <Card key={report.pageUrl}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{report.pageLabel}</CardTitle>
                          <CardDescription>{report.pageUrl}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getScoreBadgeVariant(getScore(report))}
                            className="text-sm"
                          >
                            Score: {getScore(report).toFixed(1)}%
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Validation Summary */}
                        {report.validation && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Validation</h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                Status:{' '}
                                <Badge
                                  variant={report.validation.isValid ? 'default' : 'destructive'}
                                  className="ml-2"
                                >
                                  {report.validation.isValid ? 'Valid' : 'Invalid'}
                                </Badge>
                              </p>
                              {report.validation.missingElements.length > 0 && (
                                <div>
                                  <p className="text-muted-foreground">Missing Elements:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {report.validation.missingElements.map((elem, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {elem}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Key Findings */}
                        {report.analysis && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Key Findings</h4>
                            <div className="text-sm text-muted-foreground">
                              <pre className="whitespace-pre-wrap bg-muted p-3 rounded-lg text-xs max-h-64 overflow-y-auto">
                                {JSON.stringify(report.analysis, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {report.validation?.recommendations &&
                          report.validation.recommendations.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
                              <ul className="space-y-1 text-sm">
                                {report.validation.recommendations.map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}



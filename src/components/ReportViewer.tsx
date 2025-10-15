'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    Clock,
    Download,
    ExternalLink,
    Eye,
    FileText,
    Share2,
    Target,
    TrendingUp,
    Users,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReportViewerProps {
  analysisId: string;
  url?: string;
}

interface AnalysisReport {
  id: string;
  url: string;
  createdAt: string;
  status: string;
  goldenCircle?: any;
  elementsOfValueB2C?: any;
  elementsOfValueB2B?: any;
  cliftonStrengths?: any;
  lighthouse?: any;
  seo?: any;
}

export default function ReportViewer({ analysisId, url }: ReportViewerProps) {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (analysisId) {
      fetchReport();
    }
  }, [analysisId]);

  const fetchReport = async () => {
    try {
      setLoading(true);

      // Fetch main analysis
      const analysisResponse = await fetch(`/api/analysis/${analysisId}`);
      if (!analysisResponse.ok) throw new Error('Analysis not found');
      const analysis = await analysisResponse.json();

      // Fetch all sub-analyses in parallel
      const [goldenCircle, eovB2C, eovB2B, cliftonStrengths, lighthouse, seo] = await Promise.all([
        fetch(`/api/analysis/golden-circle/${analysisId}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/analysis/elements-value-b2c/${analysisId}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/analysis/elements-value-b2b/${analysisId}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/analysis/clifton-strengths/${analysisId}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/analysis/lighthouse/${analysisId}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/analysis/seo/${analysisId}`).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      setReport({
        id: analysisId,
        url: analysis.url || url || '',
        createdAt: analysis.createdAt,
        status: analysis.status,
        goldenCircle,
        elementsOfValueB2C: eovB2C,
        elementsOfValueB2B: eovB2B,
        cliftonStrengths,
        lighthouse,
        seo
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const downloadReport = () => {
    // Create a comprehensive report document
    const reportData = {
      analysisId: report?.id,
      url: report?.url,
      createdAt: report?.createdAt,
      goldenCircle: report?.goldenCircle,
      elementsOfValueB2C: report?.elementsOfValueB2C,
      elementsOfValueB2B: report?.elementsOfValueB2B,
      cliftonStrengths: report?.cliftonStrengths,
      lighthouse: report?.lighthouse,
      seo: report?.seo
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${analysisId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Clock className="animate-spin mr-2" />
          <p>Loading report...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !report) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Failed to load report'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Analysis Report
              </CardTitle>
              <CardDescription>
                {report.url} • {new Date(report.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={downloadReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Tab */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="golden-circle">Golden Circle</TabsTrigger>
          <TabsTrigger value="elements">Elements of Value</TabsTrigger>
          <TabsTrigger value="clifton">CliftonStrengths</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Golden Circle Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Golden Circle
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.goldenCircle ? (
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(report.goldenCircle.overall_score)}`}>
                      {report.goldenCircle.overall_score.toFixed(1)}
                    </div>
                    <Badge className={getScoreBadge(report.goldenCircle.overall_score)}>
                      {report.goldenCircle.overall_score >= 80 ? 'Excellent' :
                       report.goldenCircle.overall_score >= 60 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-gray-500">Not available</div>
                )}
              </CardContent>
            </Card>

            {/* Elements of Value Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Elements of Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.elementsOfValueB2C ? (
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(report.elementsOfValueB2C.overall_score)}`}>
                      {report.elementsOfValueB2C.overall_score.toFixed(1)}
                    </div>
                    <Badge className={getScoreBadge(report.elementsOfValueB2C.overall_score)}>
                      {report.elementsOfValueB2C.overall_score >= 80 ? 'Excellent' :
                       report.elementsOfValueB2C.overall_score >= 60 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-gray-500">Not available</div>
                )}
              </CardContent>
            </Card>

            {/* CliftonStrengths Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  CliftonStrengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.cliftonStrengths ? (
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(report.cliftonStrengths.overall_score)}`}>
                      {report.cliftonStrengths.overall_score.toFixed(1)}
                    </div>
                    <Badge className={getScoreBadge(report.cliftonStrengths.overall_score)}>
                      {report.cliftonStrengths.overall_score >= 80 ? 'Excellent' :
                       report.cliftonStrengths.overall_score >= 60 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-gray-500">Not available</div>
                )}
              </CardContent>
            </Card>

            {/* Lighthouse Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.lighthouse ? (
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(report.lighthouse.overall_score)}`}>
                      {report.lighthouse.overall_score.toFixed(1)}
                    </div>
                    <Badge className={getScoreBadge(report.lighthouse.overall_score)}>
                      {report.lighthouse.overall_score >= 80 ? 'Excellent' :
                       report.lighthouse.overall_score >= 60 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-gray-500">Not available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Report
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Website
                </Button>
                <Button variant="outline" size="sm" onClick={downloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="golden-circle">
          {report.goldenCircle ? (
            <Card>
              <CardHeader>
                <CardTitle>Golden Circle Analysis</CardTitle>
                <CardDescription>
                  Overall Score: {report.goldenCircle.overall_score.toFixed(1)}/100
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">WHY - Purpose & Belief</h4>
                      <p className="text-sm text-gray-600 mb-2">{report.goldenCircle.why?.statement}</p>
                      <div className="text-sm">
                        <span className="font-medium">Clarity:</span> {report.goldenCircle.why?.clarity_rating}/10
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">HOW - Unique Process</h4>
                      <p className="text-sm text-gray-600 mb-2">{report.goldenCircle.how?.statement}</p>
                      <div className="text-sm">
                        <span className="font-medium">Uniqueness:</span> {report.goldenCircle.how?.uniqueness_rating}/10
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">WHAT - Products/Services</h4>
                      <p className="text-sm text-gray-600 mb-2">{report.goldenCircle.what?.statement}</p>
                      <div className="text-sm">
                        <span className="font-medium">Clarity:</span> {report.goldenCircle.what?.clarity_rating}/10
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">WHO - Target Audience</h4>
                      <p className="text-sm text-gray-600 mb-2">{report.goldenCircle.who?.statement}</p>
                      <div className="text-sm">
                        <span className="font-medium">Specificity:</span> {report.goldenCircle.who?.specificity_rating}/10
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Golden Circle analysis not available for this report.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="elements">
          {report.elementsOfValueB2C ? (
            <Card>
              <CardHeader>
                <CardTitle>Elements of Value Analysis</CardTitle>
                <CardDescription>
                  B2C Score: {report.elementsOfValueB2C.overall_score.toFixed(1)}/100
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {report.elementsOfValueB2C.elements?.slice(0, 6).map((element: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">
                            {element.element_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <Badge className={getScoreBadge(element.score)}>
                            {element.score.toFixed(0)}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Category: {element.element_category.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Elements of Value analysis not available for this report.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="clifton">
          {report.cliftonStrengths ? (
            <Card>
              <CardHeader>
                <CardTitle>CliftonStrengths Analysis</CardTitle>
                <CardDescription>
                  Overall Score: {report.cliftonStrengths.overall_score.toFixed(1)}/100
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {report.cliftonStrengths.themes?.slice(0, 6).map((theme: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">{theme.theme_name}</h4>
                          <Badge className={getScoreBadge(theme.score)}>
                            {theme.score.toFixed(0)}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Domain: {theme.domain}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                CliftonStrengths analysis not available for this report.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="technical">
          {report.lighthouse ? (
            <Card>
              <CardHeader>
                <CardTitle>Technical Performance</CardTitle>
                <CardDescription>
                  Lighthouse Score: {report.lighthouse.overall_score.toFixed(1)}/100
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(report.lighthouse.performance_score)}`}>
                        {report.lighthouse.performance_score?.toFixed(0) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(report.lighthouse.accessibility_score)}`}>
                        {report.lighthouse.accessibility_score?.toFixed(0) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Accessibility</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(report.lighthouse.seo_score)}`}>
                        {report.lighthouse.seo_score?.toFixed(0) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">SEO</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(report.lighthouse.best_practices_score)}`}>
                        {report.lighthouse.best_practices_score?.toFixed(0) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Best Practices</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Technical performance data not available for this report.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useParams } from 'next/navigation';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisClient, AnalysisResult } from '@/lib/analysis-client';
import { ArrowLeft, Download, Share2, BarChart3, Target, Users, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function AnalysisDetailPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const analyses = AnalysisClient.getAnalyses();
        const foundAnalysis = analyses.find(a => a.id === params.id);
        
        if (foundAnalysis) {
          setAnalysis(foundAnalysis);
        } else {
          setError('Analysis not found');
        }
      } catch (err) {
        setError('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [params.id]);

  const downloadAnalysis = () => {
    if (!analysis) return;
    
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analysis-${analysis.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-growth-600"></div>
          <p className="mt-4 text-growth-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Analysis Not Found</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link href="/dashboard/analyze">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Analysis
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-growth-50 to-growth-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard/analyze">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Analysis
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-growth-900">Analysis Report</h1>
              <p className="text-growth-600">{analysis.url}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadAnalysis} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download JSON
              </Button>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-growth-600 mb-2">
                {analysis.overallScore}/100
              </div>
              <Progress value={analysis.overallScore} className="h-3 mb-4" />
              <p className="text-growth-600">{analysis.summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Tabs defaultValue="golden-circle" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="golden-circle">Golden Circle</TabsTrigger>
            <TabsTrigger value="elements">Elements of Value</TabsTrigger>
            <TabsTrigger value="clifton">CliftonStrengths</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Golden Circle */}
          <TabsContent value="golden-circle">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Golden Circle Analysis
                </CardTitle>
                <CardDescription>Simon Sinek&apos;s framework: Why, How, What</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-growth-600 mb-2">
                    {analysis.goldenCircle.overallScore}/100
                  </div>
                  <Progress value={analysis.goldenCircle.overallScore} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-growth-900">WHY</h3>
                    <p className="text-sm text-gray-600">{analysis.goldenCircle.why}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-growth-900">HOW</h3>
                    <p className="text-sm text-gray-600">{analysis.goldenCircle.how}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-growth-900">WHAT</h3>
                    <p className="text-sm text-gray-600">{analysis.goldenCircle.what}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <ul className="space-y-1">
                    {analysis.goldenCircle.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-growth-600 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Elements of Value */}
          <TabsContent value="elements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Elements of Value Analysis
                </CardTitle>
                <CardDescription>Bain&apos;s 30 Elements of Value scoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-growth-600 mb-2">
                    {analysis.elementsOfValue.overallScore}/100
                  </div>
                  <Progress value={analysis.elementsOfValue.overallScore} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Functional Elements</h4>
                    <div className="space-y-2">
                      {Object.entries(analysis.elementsOfValue.functional)
                        .filter(([_, score]) => score >= 7)
                        .sort(([_, a], [__, b]) => b - a)
                        .slice(0, 6)
                        .map(([element, score]) => (
                          <div key={element} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{element.replace(/([A-Z])/g, ' $1')}</span>
                            <Badge variant="secondary">{score}/10</Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Emotional Elements</h4>
                    <div className="space-y-2">
                      {Object.entries(analysis.elementsOfValue.emotional)
                        .filter(([_, score]) => score >= 7)
                        .sort(([_, a], [__, b]) => b - a)
                        .slice(0, 6)
                        .map(([element, score]) => (
                          <div key={element} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{element.replace(/([A-Z])/g, ' $1')}</span>
                            <Badge variant="secondary">{score}/10</Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Life-Changing Elements</h4>
                    <div className="space-y-2">
                      {Object.entries(analysis.elementsOfValue.lifeChanging)
                        .filter(([_, score]) => score >= 7)
                        .sort(([_, a], [__, b]) => b - a)
                        .slice(0, 6)
                        .map(([element, score]) => (
                          <div key={element} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{element.replace(/([A-Z])/g, ' $1')}</span>
                            <Badge variant="secondary">{score}/10</Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Social Impact Elements</h4>
                    <div className="space-y-2">
                      {Object.entries(analysis.elementsOfValue.socialImpact)
                        .filter(([_, score]) => score >= 7)
                        .sort(([_, a], [__, b]) => b - a)
                        .slice(0, 6)
                        .map(([element, score]) => (
                          <div key={element} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{element.replace(/([A-Z])/g, ' $1')}</span>
                            <Badge variant="secondary">{score}/10</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <ul className="space-y-1">
                    {analysis.elementsOfValue.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-growth-600 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CliftonStrengths */}
          <TabsContent value="clifton">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  CliftonStrengths Analysis
                </CardTitle>
                <CardDescription>Gallup&apos;s 34 themes across 4 domains</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-growth-600 mb-2">
                    {analysis.cliftonStrengths.overallScore}/100
                  </div>
                  <Progress value={analysis.cliftonStrengths.overallScore} className="h-2" />
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Top Themes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(analysis.cliftonStrengths.themes)
                      .sort(([_, a], [__, b]) => Number(b) - Number(a))
                      .slice(0, 10)
                      .map(([theme, score]) => (
                        <div key={theme} className="text-center p-3 border rounded-lg">
                          <div className="font-semibold text-sm">{theme}</div>
                          <Badge variant="outline" className="mt-1">{score}/10</Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {analysis.cliftonStrengths.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-growth-600 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <ul className="space-y-1">
                    {analysis.cliftonStrengths.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-growth-600 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Actionable Recommendations</CardTitle>
                <CardDescription>Prioritized steps to improve your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{rec.category}</h4>
                          <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Action Items:</h5>
                            <ul className="space-y-1">
                              {rec.actionItems.map((item, itemIndex) => (
                                <li key={itemIndex} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-growth-600 mt-1">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Raw Data */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Raw Analysis Data</CardTitle>
            <CardDescription>Complete JSON data for this analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

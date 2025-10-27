/* eslint-disable no-console */
'use client';

import GoldenCircleAssessment from '@/components/assessments/GoldenCircleAssessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    BarChart3,
    Building2,
    CheckCircle,
    Download,
    FileText,
    Loader2,
    Target,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalysisData {
  url: string;
  content: any;
  goldenCircle?: any;
  elementsOfValue?: any;
  cliftonStrengths?: any;
  b2bElements?: any;
  comprehensive?: any;
}

export default function AnalysisPage() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('analysisData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAnalysisData(parsed);
        setUrl(parsed.url || '');
        setContent(parsed.content || null);
      } catch (err) {
        console.error('Failed to parse saved analysis data:', err);
      }
    }
  }, []);

  const runPhase1 = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/phase1-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setContent(data.data);
        setAnalysisData(prev => ({
          ...prev,
          url,
          content: data.data
        }));

        // Save to localStorage
        const newData = { url, content: data.data };
        localStorage.setItem('analysisData', JSON.stringify(newData));
      } else {
        setError(data.error || 'Phase 1 failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const runComprehensiveAnalysis = async () => {
    if (!content) {
      setError('Please run Phase 1 first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/comprehensive-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, content }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisData(prev => ({
          ...prev,
          ...data.data
        }));

        // Save to localStorage
        localStorage.setItem('analysisData', JSON.stringify(data.data));
      } else {
        setError(data.error || 'Comprehensive analysis failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!analysisData) return;

    const reportData = {
      url: analysisData.url,
      timestamp: new Date().toISOString(),
      assessments: analysisData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${analysisData.url.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getAssessmentStatus = (assessment: any) => {
    if (!assessment) return { status: 'pending', icon: AlertCircle, color: 'text-gray-500' };
    if (assessment.success) return { status: 'completed', icon: CheckCircle, color: 'text-green-500' };
    return { status: 'failed', icon: AlertCircle, color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Website Analysis Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive business framework analysis with separate assessment views
          </p>
        </div>

        {/* URL Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analysis Setup</CardTitle>
            <CardDescription>
              Enter a website URL to begin the analysis process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                id="analysis-url"
                name="analysis-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Enter website URL for analysis"
              />
              <Button
                onClick={runPhase1}
                disabled={isLoading || !url}
                className="px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Run Phase 1'
                )}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Preview */}
        {content && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Preview
              </CardTitle>
              <CardDescription>
                Scraped content from {url}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto bg-gray-50 p-4 rounded">
                <pre className="text-sm whitespace-pre-wrap">
                  {content.cleanText || content.content || 'No content available'}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment Tabs */}
        {content && (
          <Tabs defaultValue="golden-circle" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="golden-circle" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Golden Circle
                {(() => {
                  const status = getAssessmentStatus(analysisData?.goldenCircle);
                  return <status.icon className={`h-3 w-3 ${status.color}`} />;
                })()}
              </TabsTrigger>
              <TabsTrigger value="elements-of-value" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Elements of Value
                {(() => {
                  const status = getAssessmentStatus(analysisData?.elementsOfValue);
                  return <status.icon className={`h-3 w-3 ${status.color}`} />;
                })()}
              </TabsTrigger>
              <TabsTrigger value="clifton-strengths" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                CliftonStrengths
                {(() => {
                  const status = getAssessmentStatus(analysisData?.cliftonStrengths);
                  return <status.icon className={`h-3 w-3 ${status.color}`} />;
                })()}
              </TabsTrigger>
              <TabsTrigger value="b2b-elements" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                B2B Elements
                {(() => {
                  const status = getAssessmentStatus(analysisData?.b2bElements);
                  return <status.icon className={`h-3 w-3 ${status.color}`} />;
                })()}
              </TabsTrigger>
              <TabsTrigger value="comprehensive" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Comprehensive
                {(() => {
                  const status = getAssessmentStatus(analysisData?.comprehensive);
                  return <status.icon className={`h-3 w-3 ${status.color}`} />;
                })()}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="golden-circle" className="mt-6">
              <GoldenCircleAssessment
                url={url}
                content={content}
                onComplete={(data) => {
                  setAnalysisData(prev => ({
                    ...prev,
                    goldenCircle: { success: true, data, assessment: 'Golden Circle' }
                  }));
                }}
              />
            </TabsContent>

            <TabsContent value="elements-of-value" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Elements of Value Assessment</CardTitle>
                  <CardDescription>
                    Coming Soon - Individual assessment component
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button disabled className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Elements of Value Analysis
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clifton-strengths" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>CliftonStrengths Assessment</CardTitle>
                  <CardDescription>
                    Coming Soon - Individual assessment component
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button disabled className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    CliftonStrengths Analysis
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="b2b-elements" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>B2B Elements Assessment</CardTitle>
                  <CardDescription>
                    Coming Soon - Individual assessment component
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button disabled className="w-full">
                    <Building2 className="mr-2 h-4 w-4" />
                    B2B Elements Analysis
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comprehensive" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comprehensive Report</CardTitle>
                  <CardDescription>
                    Combined analysis from all frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={runComprehensiveAnalysis}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Comprehensive Report...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Comprehensive Report
                      </>
                    )}
                  </Button>

                  {analysisData?.comprehensive && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <h3 className="font-semibold text-green-800 mb-2">Report Generated Successfully</h3>
                        <p className="text-sm text-green-700">
                          Overall Score: {analysisData.comprehensive.overallScore}/10
                        </p>
                      </div>

                      <Button onClick={downloadReport} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, Clock, Download, FileText, Loader2, Play, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { generateMarkdownReport } from '@/lib/markdown-report-generator';
import { IndividualReportsView } from './IndividualReportsView';

interface StepStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  data?: any;
}

interface AnalysisStatus {
  analysisId: string;
  url: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  score: number;
  currentStep: number;
  totalSteps: number;
  steps: StepStatus[];
  result?: any;
  completed: boolean;
}

export function ProgressiveAnalysisPage() {
  const [url, setUrl] = useState('');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for status updates
  useEffect(() => {
    if (!analysisId) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/analyze/progressive/status?id=${analysisId}`);
        const data = await response.json();

        if (data.success) {
          setStatus(data);

          // Stop polling if completed or failed
          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }
      } catch (err) {
        console.error('Failed to poll status:', err);
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 2 seconds
    pollIntervalRef.current = setInterval(pollStatus, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [analysisId]);

  const startAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsStarting(true);
    setError(null);
    setStatus(null);
    setAnalysisId(null);

    try {
      const response = await fetch('/api/analyze/progressive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisId(data.analysisId);
        console.log(`✅ Analysis started: ${data.analysisId}`);
      } else {
        setError(data.error || 'Failed to start analysis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
    } finally {
      setIsStarting(false);
    }
  };

  const downloadMarkdown = () => {
    if (!status?.result) return;

    const markdown = generateMarkdownReport(status.result, status.url);
    const blob = new Blob([markdown], {
      type: 'text/markdown'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${status.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!status?.result) return;

    const blob = new Blob([JSON.stringify(status.result, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${status.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Running...</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Waiting</Badge>;
    }
  };

  const progressPercentage = status
    ? Math.round((status.currentStep / status.totalSteps) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Progressive Website Analysis</CardTitle>
            <CardDescription>
              Watch your analysis complete step-by-step in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={!!analysisId && status?.status !== 'COMPLETED' && status?.status !== 'FAILED'}
                className="flex-1"
              />
              <Button
                onClick={startAnalysis}
                disabled={isStarting || (!!analysisId && status?.status !== 'COMPLETED' && status?.status !== 'FAILED')}
                className="min-w-[120px]"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {status && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analysis Progress</CardTitle>
                  <CardDescription className="mt-1">
                    {status.url}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {progressPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Step {status.currentStep} of {status.totalSteps}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {status.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                      step.status === 'running'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : step.status === 'completed'
                        ? 'border-green-200 bg-green-50 dark:bg-green-950'
                        : step.status === 'failed'
                        ? 'border-red-200 bg-red-50 dark:bg-red-950'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getStepIcon(step.status)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {index + 1}. {step.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {step.status === 'running' && 'Processing...'}
                          {step.status === 'completed' && 'Completed'}
                          {step.status === 'failed' && 'Failed'}
                          {step.status === 'pending' && 'Waiting...'}
                        </div>
                      </div>
                    </div>
                    {getStepBadge(step.status)}
                  </div>
                ))}
              </div>

              {/* Completion Actions */}
              {status.completed && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="font-medium text-green-900 dark:text-green-100">
                          Analysis Complete!
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Overall Score: {status.score}/100 • {(status as any).individualReports?.length || 0} Individual Reports Generated
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={downloadMarkdown} variant="default">
                          <FileText className="mr-2 h-4 w-4" />
                          Download Full Report
                        </Button>
                        <Button onClick={downloadJSON} variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download JSON
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Individual Reports View */}
                  {(status as any).individualReports && (status as any).individualReports.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Individual Assessment Reports</CardTitle>
                        <CardDescription>
                          View each assessment separately with its AI prompt
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <IndividualReportsView 
                          reports={(status as any).individualReports} 
                          url={status.url}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Error State */}
              {status.status === 'FAILED' && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-900 dark:text-red-100">
                    Analysis Failed
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Please try again or contact support if the issue persists.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions (shown when no analysis running) */}
        {!status && !isStarting && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                ✅ <strong>Real-Time Updates:</strong> Watch each assessment complete as it happens
              </p>
              <p>
                ✅ <strong>No Frozen Screen:</strong> See exactly which step is running
              </p>
              <p>
                ✅ <strong>Database Saved:</strong> Reports stored permanently, no 404 errors
              </p>
              <p>
                ✅ <strong>Progressive Results:</strong> View completed sections while others run
              </p>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded">
                <strong className="text-blue-900 dark:text-blue-100">Analysis includes:</strong>
                <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
                  <li>• Content & SEO Scraping</li>
                  <li>• PageAudit Technical Analysis</li>
                  <li>• Lighthouse Performance</li>
                  <li>• Golden Circle Framework</li>
                  <li>• Elements of Value (B2C)</li>
                  <li>• B2B Elements Analysis</li>
                  <li>• CliftonStrengths Mapping</li>
                  <li>• AI Deep Insights</li>
                  <li>• Comprehensive Report Generation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


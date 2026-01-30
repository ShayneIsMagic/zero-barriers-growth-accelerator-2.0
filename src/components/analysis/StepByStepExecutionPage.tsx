'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  Clock,
  XCircle,
  Play,
  Loader2,
  FileText,
  Download,
} from 'lucide-react';
import { RawAnalysisReport } from '@/lib/comprehensive-scraper';

interface StepStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  startTime?: string;
  endTime?: string;
}

interface StepByStepExecutionResponse {
  success: boolean;
  data?: RawAnalysisReport;
  error?: string;
  message?: string;
  finalProgress?: {
    currentStep: string;
    progress: number;
    timestamp: string;
  };
}

export function StepByStepExecutionPage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [steps, setSteps] = useState<StepStatus[]>([]);
  const [result, setResult] = useState<RawAnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultSteps: StepStatus[] = [
    // Phase 1: Data Collection Foundation
    { id: 'scrape_content', name: 'Content & SEO Scraping', status: 'pending' },
    { id: 'pageaudit', name: 'PageAudit Analysis', status: 'pending' },
    { id: 'lighthouse', name: 'Lighthouse Performance', status: 'pending' },
    // Phase 2: AI Framework Analysis (using collected data)
    { id: 'golden_circle', name: 'Golden Circle Analysis', status: 'pending' },
    {
      id: 'elements_of_value',
      name: 'Elements of Value Analysis',
      status: 'pending',
    },
    { id: 'b2b_elements', name: 'B2B Elements Analysis', status: 'pending' },
    {
      id: 'clifton_strengths',
      name: 'CliftonStrengths Analysis',
      status: 'pending',
    },
    // Phase 3: Strategic Analysis
    { id: 'gemini_insights', name: 'Gemini Deep Analysis', status: 'pending' },
    { id: 'generate_report', name: 'Generate Raw Report', status: 'pending' },
  ];

  const executeAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep('Initializing...');
    setSteps(defaultSteps);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/analyze/step-by-step-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data: StepByStepExecutionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (data.success && data.data) {
        setResult(data.data);
        setProgress(100);
        setCurrentStep('Analysis Complete');

        // Update all steps to completed
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({ ...step, status: 'completed' as const }))
        );

        // Step-by-step analysis completed successfully
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setCurrentStep('Failed');

      // Update steps to show failure
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status: step.status === 'running' ? ('failed' as const) : step.status,
        }))
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper variables for data access
  const goldenCircleAnalysis = result?.goldenCircleAnalysis;
  const elementsOfValueAnalysis = result?.elementsOfValueAnalysis;
  const b2bElementsAnalysis = result?.b2bElementsAnalysis;
  const cliftonStrengthsAnalysis = result?.cliftonStrengthsAnalysis;
  const lighthouseAnalysis = result?.lighthouseAnalysis;
  const pageAuditAnalysis = result?.pageAuditAnalysis;
  const scrapedContent = result?.scrapedContent;
  const geminiInsights = result?.geminiInsights;

  const downloadReport = () => {
    if (!result) return;

    const reportData = {
      url: result?.url || '',
      timestamp: new Date().toISOString(),
      totalAnalysisTime: result?.totalAnalysisTime || 0,
      scrapedContent,
      goldenCircleAnalysis,
      elementsOfValueAnalysis,
      b2bElementsAnalysis,
      cliftonStrengthsAnalysis,
      lighthouseAnalysis,
      pageAuditAnalysis,
      geminiInsights,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepIcon = (status: StepStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepBadge = (status: StepStatus['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Running
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          Step-by-Step Analysis Execution
        </h1>
        <p className="text-muted-foreground">
          Execute comprehensive website analysis step by step with real-time
          progress tracking
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Start Analysis
          </CardTitle>
          <CardDescription>
            Enter a website URL to begin the comprehensive analysis pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button
              onClick={executeAnalysis}
              disabled={isAnalyzing || !url.trim()}
              className="min-w-[120px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {(isAnalyzing || progress > 0) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analysis Progress</CardTitle>
            <CardDescription>{currentStep}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="w-full" />

              <div className="mt-6 grid gap-3">
                {steps.map((step, index) => (
                  <div key={step.id}>
                    {/* Phase Headers */}
                    {index === 0 && (
                      <div className="mb-3 mt-2">
                        <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
                          Phase 1: Data Collection Foundation
                        </div>
                      </div>
                    )}
                    {index === 3 && (
                      <div className="mb-3 mt-4">
                        <div className="inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-600">
                          Phase 2: AI Framework Analysis
                        </div>
                      </div>
                    )}
                    {index === 7 && (
                      <div className="mb-3 mt-4">
                        <div className="inline-block rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-600">
                          Phase 3: Strategic Analysis
                        </div>
                      </div>
                    )}

                    {/* Step */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        {getStepIcon(step.status)}
                        <div>
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {step.status === 'running' && 'In progress...'}
                            {step.status === 'completed' && 'Completed'}
                            {step.status === 'failed' && 'Failed'}
                            {step.status === 'pending' && 'Waiting...'}
                          </div>
                        </div>
                      </div>
                      {getStepBadge(step.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-8">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analysis Results
              </span>
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis completed for{' '}
              {result?.url || 'Unknown URL'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Analysis Summary */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {scrapedContent?.wordCount || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Words Scraped
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {result?.totalAnalysisTime
                      ? Math.round(result.totalAnalysisTime / 1000)
                      : 'N/A'}
                    s
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Analysis Time
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {lighthouseAnalysis?.scores?.overall || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lighthouse Score
                  </div>
                </div>
              </div>

              {/* Enhanced Golden Circle Analysis */}
              {goldenCircleAnalysis && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    🎯 Golden Circle Analysis - Website Content Extraction
                  </h3>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* WHY */}
                    <div className="rounded-lg bg-yellow-50 p-4">
                      <h4 className="mb-3 font-medium text-yellow-800">
                        WHY (Dominant Purpose) - Value-Centric Language
                      </h4>
                      {goldenCircleAnalysis.why ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Dominant Purpose:</strong>
                            <p className="mt-1 text-yellow-700">
                              {goldenCircleAnalysis.why.dominantPurpose ||
                                'Not explicitly stated on website'}
                            </p>
                          </div>
                          <div>
                            <strong>Driving Belief:</strong>
                            <p className="mt-1 text-yellow-700">
                              {goldenCircleAnalysis.why.drivingBelief ||
                                'Not explicitly stated on website'}
                            </p>
                          </div>
                          {goldenCircleAnalysis.why.missionStatement && (
                            <div>
                              <strong>Mission Statement:</strong>
                              <p className="mt-1 text-yellow-700">
                                {goldenCircleAnalysis.why.missionStatement}
                              </p>
                            </div>
                          )}
                          {goldenCircleAnalysis.why.valueCentricLanguage &&
                            goldenCircleAnalysis.why.valueCentricLanguage
                              .length > 0 && (
                              <div>
                                <strong>Value-Centric Language:</strong>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {goldenCircleAnalysis.why.valueCentricLanguage.map(
                                    (word: string, index: number) => (
                                      <span
                                        key={index}
                                        className="rounded bg-yellow-200 px-2 py-1 text-xs text-yellow-800"
                                      >
                                        {word}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          {goldenCircleAnalysis.why.evidence &&
                            goldenCircleAnalysis.why.evidence.length > 0 && (
                              <div>
                                <strong>Evidence:</strong>
                                <ul className="mt-1 text-yellow-600">
                                  {goldenCircleAnalysis.why.evidence.map(
                                    (evidence: string, index: number) => (
                                      <li key={index}>• {evidence}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      ) : (
                        <p className="text-yellow-600">
                          No WHY analysis available
                        </p>
                      )}
                    </div>

                    {/* HOW */}
                    <div className="rounded-lg bg-blue-50 p-4">
                      <h4 className="mb-3 font-medium text-blue-800">
                        HOW (How Are They Unique?)
                      </h4>
                      {goldenCircleAnalysis.how ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Unique Methodology:</strong>
                            <p className="mt-1 text-blue-700">
                              {goldenCircleAnalysis.how.uniqueMethodology ||
                                'Not explicitly stated on website'}
                            </p>
                          </div>
                          <div>
                            <strong>Differentiator:</strong>
                            <p className="mt-1 text-blue-700">
                              {goldenCircleAnalysis.how.differentiator ||
                                'Not explicitly stated on website'}
                            </p>
                          </div>
                          <div>
                            <strong>Unique Value:</strong>
                            <p className="mt-1 text-blue-700">
                              {goldenCircleAnalysis.how.uniqueValue ||
                                'Not explicitly stated on website'}
                            </p>
                          </div>
                          {goldenCircleAnalysis.how.evidence &&
                            goldenCircleAnalysis.how.evidence.length > 0 && (
                              <div>
                                <strong>Evidence:</strong>
                                <ul className="mt-1 text-blue-600">
                                  {goldenCircleAnalysis.how.evidence.map(
                                    (evidence: string, index: number) => (
                                      <li key={index}>• {evidence}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      ) : (
                        <p className="text-blue-600">
                          No HOW analysis available
                        </p>
                      )}
                    </div>

                    {/* WHAT */}
                    <div className="rounded-lg bg-green-50 p-4">
                      <h4 className="mb-3 font-medium text-green-800">
                        WHAT (Products & Client Actions)
                      </h4>
                      {goldenCircleAnalysis.what ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Products/Services:</strong>
                            {goldenCircleAnalysis.what.productsServices &&
                            goldenCircleAnalysis.what.productsServices.length >
                              0 ? (
                              <ul className="mt-1 text-green-700">
                                {goldenCircleAnalysis.what.productsServices.map(
                                  (service: string, index: number) => (
                                    <li key={index}>• {service}</li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="mt-1 text-green-700">
                                Not explicitly stated on website
                              </p>
                            )}
                          </div>
                          <div>
                            <strong>Client Actions (CTAs):</strong>
                            {goldenCircleAnalysis.what.clientActions &&
                            goldenCircleAnalysis.what.clientActions.length >
                              0 ? (
                              <ul className="mt-1 text-green-700">
                                {goldenCircleAnalysis.what.clientActions.map(
                                  (action: string, index: number) => (
                                    <li key={index}>• {action}</li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="mt-1 text-green-700">
                                Not explicitly stated on website
                              </p>
                            )}
                          </div>
                          {goldenCircleAnalysis.what.evidence &&
                            goldenCircleAnalysis.what.evidence.length > 0 && (
                              <div>
                                <strong>Evidence:</strong>
                                <ul className="mt-1 text-green-600">
                                  {goldenCircleAnalysis.what.evidence.map(
                                    (evidence: string, index: number) => (
                                      <li key={index}>• {evidence}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      ) : (
                        <p className="text-green-600">
                          No WHAT analysis available
                        </p>
                      )}
                    </div>

                    {/* WHO */}
                    <div className="rounded-lg bg-purple-50 p-4">
                      <h4 className="mb-3 font-medium text-purple-800">
                        WHO (Target Market)
                      </h4>
                      {goldenCircleAnalysis.who ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Target Market:</strong>
                            <p className="mt-1 text-purple-700">
                              {goldenCircleAnalysis.who.targetMarket ||
                                'Not explicitly stated on website'}
                            </p>
                          </div>
                          <div>
                            <strong>Client Types:</strong>
                            {goldenCircleAnalysis.who.clientTypes &&
                            goldenCircleAnalysis.who.clientTypes.length > 0 ? (
                              <ul className="mt-1 text-purple-700">
                                {goldenCircleAnalysis.who.clientTypes.map(
                                  (type: string, index: number) => (
                                    <li key={index}>• {type}</li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="mt-1 text-purple-700">
                                Not explicitly stated on website
                              </p>
                            )}
                          </div>
                          <div>
                            <strong>Testimonials:</strong>
                            {goldenCircleAnalysis.who.testimonials &&
                            goldenCircleAnalysis.who.testimonials.length > 0 ? (
                              <ul className="mt-1 text-purple-700">
                                {goldenCircleAnalysis.who.testimonials.map(
                                  (testimonial: string, index: number) => (
                                    <li key={index}>• {testimonial}</li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="mt-1 text-purple-700">
                                No testimonials found on website
                              </p>
                            )}
                          </div>
                          {goldenCircleAnalysis.who.evidence &&
                            goldenCircleAnalysis.who.evidence.length > 0 && (
                              <div>
                                <strong>Evidence:</strong>
                                <ul className="mt-1 text-purple-600">
                                  {goldenCircleAnalysis.who.evidence.map(
                                    (evidence: string, index: number) => (
                                      <li key={index}>• {evidence}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      ) : (
                        <p className="text-purple-600">
                          No WHO analysis available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Value Language Analysis */}
                  {goldenCircleAnalysis.valueLanguageAnalysis && (
                    <div className="mt-6 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-4">
                      <h4 className="mb-3 font-medium text-purple-800">
                        🎯 Value Language Analysis - WHY vs WHAT Space
                      </h4>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="mb-2 font-medium text-purple-700">
                            WHY Space Indicator
                          </h5>
                          <p className="text-sm text-purple-600">
                            {
                              goldenCircleAnalysis.valueLanguageAnalysis
                                .whySpaceIndicator
                            }
                          </p>
                        </div>

                        <div>
                          <h5 className="mb-2 font-medium text-purple-700">
                            Elements of Value Alignment
                          </h5>
                          <div className="space-y-1 text-sm">
                            {goldenCircleAnalysis.valueLanguageAnalysis
                              .elementsOfValueAlignment?.functionalElements && (
                              <div>
                                <strong className="text-purple-700">
                                  Functional:
                                </strong>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {goldenCircleAnalysis.valueLanguageAnalysis.elementsOfValueAlignment.functionalElements.map(
                                    (element: string, index: number) => (
                                      <span
                                        key={index}
                                        className="rounded bg-blue-200 px-2 py-1 text-xs text-blue-800"
                                      >
                                        {element}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {goldenCircleAnalysis.valueLanguageAnalysis
                              .elementsOfValueAlignment?.emotionalElements && (
                              <div>
                                <strong className="text-purple-700">
                                  Emotional:
                                </strong>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {goldenCircleAnalysis.valueLanguageAnalysis.elementsOfValueAlignment.emotionalElements.map(
                                    (element: string, index: number) => (
                                      <span
                                        key={index}
                                        className="rounded bg-green-200 px-2 py-1 text-xs text-green-800"
                                      >
                                        {element}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {goldenCircleAnalysis.valueLanguageAnalysis
                              .elementsOfValueAlignment
                              ?.lifeChangingElements && (
                              <div>
                                <strong className="text-purple-700">
                                  Life-Changing:
                                </strong>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {goldenCircleAnalysis.valueLanguageAnalysis.elementsOfValueAlignment.lifeChangingElements.map(
                                    (element: string, index: number) => (
                                      <span
                                        key={index}
                                        className="rounded bg-yellow-200 px-2 py-1 text-xs text-yellow-800"
                                      >
                                        {element}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {goldenCircleAnalysis.valueLanguageAnalysis
                              .elementsOfValueAlignment
                              ?.socialImpactElements && (
                              <div>
                                <strong className="text-purple-700">
                                  Social Impact:
                                </strong>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {goldenCircleAnalysis.valueLanguageAnalysis.elementsOfValueAlignment.socialImpactElements.map(
                                    (element: string, index: number) => (
                                      <span
                                        key={index}
                                        className="rounded bg-red-200 px-2 py-1 text-xs text-red-800"
                                      >
                                        {element}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {goldenCircleAnalysis.valueLanguageAnalysis
                        .competitiveAdvantageLanguage && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-purple-700">
                            Competitive Advantage Language
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {goldenCircleAnalysis.valueLanguageAnalysis.competitiveAdvantageLanguage.map(
                              (phrase: string, index: number) => (
                                <span
                                  key={index}
                                  className="rounded bg-purple-200 px-2 py-1 text-xs text-purple-800"
                                >
                                  {phrase}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {goldenCircleAnalysis.valueLanguageAnalysis
                        .specializationLanguage && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-purple-700">
                            Specialization Language
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {goldenCircleAnalysis.valueLanguageAnalysis.specializationLanguage.map(
                              (phrase: string, index: number) => (
                                <span
                                  key={index}
                                  className="rounded bg-indigo-200 px-2 py-1 text-xs text-indigo-800"
                                >
                                  {phrase}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Gemini Insights */}
              {result.geminiInsights && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    🤖 AI Pattern Analysis & Recommendations
                  </h3>

                  {/* Pattern Analysis */}
                  {result.geminiInsights.patternAnalysis && (
                    <div className="rounded-lg bg-blue-50 p-4">
                      <h4 className="mb-3 font-medium text-blue-800">
                        🔍 Pattern Analysis
                      </h4>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                          <h5 className="mb-2 font-medium text-blue-700">
                            Cross-Tool Correlations
                          </h5>
                          <ul className="space-y-1">
                            {result.geminiInsights.patternAnalysis.crossToolCorrelations?.map(
                              (correlation: string, index: number) => (
                                <li key={index} className="text-blue-600">
                                  • {correlation}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h5 className="mb-2 font-medium text-blue-700">
                            Performance Gaps
                          </h5>
                          <ul className="space-y-1">
                            {result.geminiInsights.patternAnalysis.performanceGaps?.map(
                              (gap: string, index: number) => (
                                <li key={index} className="text-blue-600">
                                  • {gap}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* What's Working */}
                  {result.geminiInsights.whatIsWorking && (
                    <div className="rounded-lg bg-green-50 p-4">
                      <h4 className="mb-3 font-medium text-green-800">
                        ✅ What&apos;s Working
                      </h4>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                          <h5 className="mb-2 font-medium text-green-700">
                            Technical Strengths
                          </h5>
                          <ul className="space-y-1">
                            {result.geminiInsights.whatIsWorking.technicalStrengths?.map(
                              (strength: string, index: number) => (
                                <li key={index} className="text-green-600">
                                  • {strength}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h5 className="mb-2 font-medium text-green-700">
                            Content Strengths
                          </h5>
                          <ul className="space-y-1">
                            {result.geminiInsights.whatIsWorking.contentStrengths?.map(
                              (strength: string, index: number) => (
                                <li key={index} className="text-green-600">
                                  • {strength}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* What's Not Working */}
                  {result.geminiInsights.whatIsNotWorking && (
                    <div className="rounded-lg bg-red-50 p-4">
                      <h4 className="mb-3 font-medium text-red-800">
                        ❌ What&apos;s Not Working
                      </h4>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                          <h5 className="mb-2 font-medium text-red-700">
                            Technical Issues
                          </h5>
                          <ul className="space-y-1">
                            {result.geminiInsights.whatIsNotWorking.technicalIssues?.map(
                              (issue: string, index: number) => (
                                <li key={index} className="text-red-600">
                                  • {issue}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h5 className="mb-2 font-medium text-red-700">
                            Critical Failures
                          </h5>
                          <ul className="space-y-1">
                            {result.geminiInsights.whatIsNotWorking.criticalFailures?.map(
                              (failure: string, index: number) => (
                                <li key={index} className="text-red-600">
                                  • {failure}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data-Driven Recommendations */}
                  {result.geminiInsights.dataDrivenRecommendations && (
                    <div className="rounded-lg bg-purple-50 p-4">
                      <h4 className="mb-3 font-medium text-purple-800">
                        🎯 Data-Driven Recommendations
                      </h4>

                      {/* Immediate Actions */}
                      {result.geminiInsights.dataDrivenRecommendations
                        .immediateActions && (
                        <div className="mb-4">
                          <h5 className="mb-2 font-medium text-purple-700">
                            🚨 Immediate Actions
                          </h5>
                          <div className="space-y-2">
                            {result.geminiInsights.dataDrivenRecommendations.immediateActions.map(
                              (action: any, index: number) => (
                                <div
                                  key={index}
                                  className="rounded border-l-4 border-red-400 bg-white p-3"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {action.action}
                                      </p>
                                      <p className="mt-1 text-xs text-gray-600">
                                        {action.expectedImpact}
                                      </p>
                                    </div>
                                    <span
                                      className={`rounded px-2 py-1 text-xs ${
                                        action.priority === 'high'
                                          ? 'bg-red-100 text-red-800'
                                          : action.priority === 'medium'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                      }`}
                                    >
                                      {action.priority}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Source: {action.dataSource}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quick Wins */}
                      {result.geminiInsights.dataDrivenRecommendations
                        .quickWins && (
                        <div className="mb-4">
                          <h5 className="mb-2 font-medium text-purple-700">
                            ⚡ Quick Wins
                          </h5>
                          <div className="space-y-2">
                            {result.geminiInsights.dataDrivenRecommendations.quickWins.map(
                              (win: any, index: number) => (
                                <div
                                  key={index}
                                  className="rounded border-l-4 border-green-400 bg-white p-3"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {win.action}
                                      </p>
                                      <p className="mt-1 text-xs text-gray-600">
                                        Track: {win.metric}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <span
                                        className={`rounded px-2 py-1 text-xs ${
                                          win.effort === 'low'
                                            ? 'bg-green-100 text-green-800'
                                            : win.effort === 'medium'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {win.effort} effort
                                      </span>
                                      <span
                                        className={`rounded px-2 py-1 text-xs ${
                                          win.impact === 'high'
                                            ? 'bg-green-100 text-green-800'
                                            : win.impact === 'medium'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {win.impact} impact
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Long-term Improvements */}
                      {result.geminiInsights.dataDrivenRecommendations
                        .longTermImprovements && (
                        <div>
                          <h5 className="mb-2 font-medium text-purple-700">
                            📈 Long-term Improvements
                          </h5>
                          <div className="space-y-2">
                            {result.geminiInsights.dataDrivenRecommendations.longTermImprovements.map(
                              (improvement: any, index: number) => (
                                <div
                                  key={index}
                                  className="rounded border-l-4 border-blue-400 bg-white p-3"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {improvement.action}
                                      </p>
                                      <p className="mt-1 text-xs text-gray-600">
                                        ROI: {improvement.roi}
                                      </p>
                                    </div>
                                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                      {improvement.timeline}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Investment: {improvement.investment}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Success Metrics */}
                  {result.geminiInsights.successMetrics && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-3 font-medium text-gray-800">
                        📊 Success Metrics
                      </h4>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                          <h5 className="mb-2 font-medium text-gray-700">
                            Current Baseline
                          </h5>
                          <p className="text-gray-600">
                            {
                              result.geminiInsights.successMetrics
                                .currentBaseline
                            }
                          </p>
                        </div>
                        <div>
                          <h5 className="mb-2 font-medium text-gray-700">
                            Success Criteria
                          </h5>
                          <p className="text-gray-600">
                            {
                              result.geminiInsights.successMetrics
                                .successCriteria
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Raw Data Preview */}
              <details className="space-y-2">
                <summary className="cursor-pointer font-medium">
                  View Raw Analysis Data
                </summary>
                <pre className="max-h-96 overflow-auto rounded-lg bg-gray-100 p-4 text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Loader2, Target } from 'lucide-react';
import { useState } from 'react';

interface GoldenCircleData {
  why: {
    statement: string;
    source: string;
    score: number;
    evidence: string;
    insights: string[];
    recommendations: string[];
  };
  how: {
    methodology: string;
    framework: string;
    score: number;
    evidence: string;
    insights: string[];
    recommendations: string[];
  };
  what: {
    offerings: string[];
    categories: string[];
    score: number;
    evidence: string;
    insights: string[];
    recommendations: string[];
  };
  who: {
    testimonials: Array<{
      client: string;
      company: string;
      title: string;
      quote: string;
      results: string;
    }>;
    targetAudience: string;
    score: number;
    evidence: string;
    insights: string[];
    recommendations: string[];
  };
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  priorityActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
}

interface GoldenCircleAssessmentProps {
  url: string;
  content: any;
  onComplete?: (data: GoldenCircleData) => void;
}

export default function GoldenCircleAssessment({
  url,
  content,
  onComplete,
}: GoldenCircleAssessmentProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GoldenCircleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/golden-circle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, content }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        onComplete?.(data.data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return 'bg-gray-500';
    if (score <= 3) return 'bg-red-500';
    if (score <= 6) return 'bg-yellow-500';
    if (score <= 8) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getScoreLabel = (score: number) => {
    if (score === 0) return 'Not Present';
    if (score <= 3) return 'Poor';
    if (score <= 6) return 'Fair';
    if (score <= 8) return 'Good';
    return 'Excellent';
  };

  if (result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Golden Circle Analysis
            <Badge className={getScoreColor(result.overallScore)}>
              {result.overallScore}/10
            </Badge>
          </CardTitle>
          <CardDescription>
            Simon Sinek's Golden Circle Framework Analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Score</span>
              <span>
                {result.overallScore}/10 - {getScoreLabel(result.overallScore)}
              </span>
            </div>
            <Progress value={result.overallScore * 10} className="h-2" />
          </div>

          {/* Individual Dimensions */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* WHY */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  WHY (Purpose)
                  <Badge className={getScoreColor(result.why.score)}>
                    {result.why.score}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600">
                    Statement:
                  </h4>
                  <p className="text-sm">
                    {result.why.statement || 'Not identified'}
                  </p>
                </div>
                {result.why.evidence && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">
                      Evidence:
                    </h4>
                    <p className="text-sm italic">"{result.why.evidence}"</p>
                  </div>
                )}
                {result.why.insights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">
                      Insights:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {result.why.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* HOW */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  HOW (Methodology)
                  <Badge className={getScoreColor(result.how.score)}>
                    {result.how.score}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600">
                    Methodology:
                  </h4>
                  <p className="text-sm">
                    {result.how.methodology || 'Not identified'}
                  </p>
                </div>
                {result.how.framework && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">
                      Framework:
                    </h4>
                    <p className="text-sm">{result.how.framework}</p>
                  </div>
                )}
                {result.how.evidence && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">
                      Evidence:
                    </h4>
                    <p className="text-sm italic">"{result.how.evidence}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* WHAT */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  WHAT (Offerings)
                  <Badge className={getScoreColor(result.what.score)}>
                    {result.what.score}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600">
                    Offerings:
                  </h4>
                  <ul className="list-inside list-disc text-sm">
                    {result.what.offerings.map((offering, index) => (
                      <li key={index}>{offering}</li>
                    ))}
                  </ul>
                </div>
                {result.what.categories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">
                      Categories:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {result.what.categories.map((category, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* WHO */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  WHO (Testimonials)
                  <Badge className={getScoreColor(result.who.score)}>
                    {result.who.score}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600">
                    Target Audience:
                  </h4>
                  <p className="text-sm">
                    {result.who.targetAudience || 'Not identified'}
                  </p>
                </div>
                {result.who.testimonials.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600">
                      Testimonials:
                    </h4>
                    <div className="space-y-2">
                      {result.who.testimonials.map((testimonial, index) => (
                        <div
                          key={index}
                          className="rounded bg-gray-50 p-2 text-sm"
                        >
                          <p className="italic">"{testimonial.quote}"</p>
                          <p className="mt-1 text-xs text-gray-600">
                            - {testimonial.client}, {testimonial.title} at{' '}
                            {testimonial.company}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{result.summary}</p>

              {result.strengths.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-green-600">
                    Strengths:
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {result.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.weaknesses.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-red-600">
                    Areas for Improvement:
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {result.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.priorityActions.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-blue-600">
                    Priority Actions:
                  </h4>
                  <div className="space-y-2">
                    {result.priorityActions.map((action, index) => (
                      <div key={index} className="rounded border p-2">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {action.action}
                          </span>
                          <Badge
                            variant={
                              action.priority === 'high'
                                ? 'destructive'
                                : action.priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{action.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Golden Circle Analysis
        </CardTitle>
        <CardDescription>
          Analyze your WHY, HOW, WHAT, and WHO using Simon Sinek's framework
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <Button onClick={runAnalysis} disabled={isAnalyzing} className="w-full">
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              Run Golden Circle Analysis
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

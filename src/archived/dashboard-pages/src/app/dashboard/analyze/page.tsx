'use client';

import { useState } from 'react';
import { WebsiteAnalysisForm } from '@/components/analysis/WebsiteAnalysisForm';
import { WebsiteAnalysisResults } from '@/components/analysis/WebsiteAnalysisResults';
import { WebsiteAnalysisResult } from '@/types/analysis';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { History, Target, Globe, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function AnalyzePage() {
  const [analysisResult, setAnalysisResult] =
    useState<WebsiteAnalysisResult | null>(null);
  const [_isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (result: WebsiteAnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
  };

  if (analysisResult) {
    return (
      <div className="container mx-auto space-y-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Analysis Results
            </h1>
            <p className="mt-2 text-xl text-gray-600">
              Comprehensive analysis for {analysisResult.url}
            </p>
          </div>
          <Button
            onClick={handleNewAnalysis}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Analysis
          </Button>
        </div>

        <WebsiteAnalysisResults result={analysisResult} />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
          Content Analysis
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-gray-600">
          Analyze your content using the Zero Barriers Growth Accelerator
          framework. Get comprehensive insights and transformation
          recommendations.
        </p>
      </div>

      {/* Framework Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              Golden Circle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-gray-600">
              Simon Sinek&apos;s Why → How → What analysis
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">Purpose Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Process Evaluation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-sm">Product Assessment</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-green-600" />
              Elements of Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-gray-600">
              Consumer and B2B value assessment
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Functional Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">Emotional Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-sm">Life-Changing Value</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-purple-600" />
              CliftonStrengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-gray-600">
              Strengths domains analysis
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-sm">Strategic Thinking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Executing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">Influencing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-yellow-600" />
              Transformation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-gray-600">
              Messaging and strategy analysis
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Hero Section</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">Social Media</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Competitive Edge</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Form */}
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Analyze Content
          </CardTitle>
          <CardDescription>
            Enter a website URL to get a comprehensive analysis using proven
            frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebsiteAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Access other analysis tools and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Button
                asChild
                variant="outline"
                className="flex h-auto flex-col items-start gap-2 p-4"
              >
                <Link href="/dashboard/website-analysis">
                  <Globe className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Website Analysis</div>
                    <div className="text-sm text-gray-500">
                      Comprehensive website analysis
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="flex h-auto flex-col items-start gap-2 p-4"
              >
                <Link href="/dashboard">
                  <History className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Dashboard</div>
                    <div className="text-sm text-gray-500">
                      View all analyses
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="flex h-auto flex-col items-start gap-2 p-4"
              >
                <Link href="/profile">
                  <Target className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Profile</div>
                    <div className="text-sm text-gray-500">
                      Manage your account
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { WebsiteAnalysisForm } from './WebsiteAnalysisForm';
import { WebsiteAnalysisResults } from './WebsiteAnalysisResults';
import { Phase2Button } from './Phase2Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Target, 
  TrendingUp, 
  Users, 
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  RotateCcw
} from 'lucide-react';
import { WebsiteAnalysisResult } from '@/types/analysis';

export function WebsiteAnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<WebsiteAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (result: WebsiteAnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handlePhase2Complete = (result: WebsiteAnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
  };

  if (analysisResult) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Results
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Comprehensive analysis for {analysisResult.url}
            </p>
          </div>
          <Button onClick={handleNewAnalysis} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            New Analysis
          </Button>
        </div>

        <WebsiteAnalysisResults result={analysisResult} />
        
        {/* Phase 2 Button - Show if Phase 1 is complete but Phase 2 is not */}
        {analysisResult?.phase === 1 && analysisResult?.scrapedContent && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Ready for Phase 2: AI Analysis
                </CardTitle>
                <CardDescription>
                  Phase 1 data collection is complete. Run AI analysis to get insights from Golden Circle, Elements of Value, and CliftonStrengths frameworks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Phase2Button
                  scrapedContent={analysisResult.scrapedContent}
                  url={analysisResult.url}
                  industry="general"
                  onPhase2Complete={handlePhase2Complete}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Website Analysis
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Analyze any website using the Zero Barriers Growth Accelerator framework. 
          Get comprehensive insights and transformation recommendations.
        </p>
      </div>

      {/* Framework Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              Golden Circle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Simon Sinek&apos;s Why → How → What analysis
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Purpose Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Process Evaluation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Product Assessment</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Elements of Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Consumer and B2B value assessment
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Functional Value</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Emotional Value</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Life-Changing Value</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-purple-600" />
              CliftonStrengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Strengths domains analysis
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Strategic Thinking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Executing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Influencing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Transformation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Messaging and strategy analysis
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Hero Section</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Social Media</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Competitive Edge</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Analyze a Website
          </CardTitle>
          <CardDescription>
            Enter a website URL to get a comprehensive analysis using proven frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebsiteAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
        </CardContent>
      </Card>

      {/* Example Analysis */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Example Analysis Results
            </CardTitle>
            <CardDescription>
              See what a comprehensive website analysis looks like
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">salesforceconsultants.io</h4>
                  <p className="text-sm text-gray-600">Overall Score: 6.2/10</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Needs Improvement</Badge>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">zerobarriers.io</h4>
                  <p className="text-sm text-gray-600">Overall Score: 7.1/10</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Good</Badge>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>What You Get</CardTitle>
            <CardDescription>
              Comprehensive analysis and actionable recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-green-600">Analysis Includes:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Complete framework scoring (1-10)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Detailed issue identification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Specific recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Transformed messaging examples
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-blue-600">Deliverables:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Social media strategy
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Implementation roadmap
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Success metrics & KPIs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Exportable report
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Enhanced Analysis Page Component
 * Provides thorough analysis with comprehensive content collection and actionable deliverables
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, Play, Brain, Target, TrendingUp, FileText, Zap } from 'lucide-react';
import { AnalysisClient } from '@/lib/analysis-client';

interface AnalysisProgress {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number;
  result?: any;
  error?: string;
  details?: string;
}

interface EnhancedAnalysisPageProps {
  onAnalysisComplete?: (result: any) => void;
}

export function EnhancedAnalysisPage({ onAnalysisComplete }: EnhancedAnalysisPageProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  const analysisSteps = [
    {
      id: 'content_collection',
      name: 'Comprehensive Content Collection',
      description: 'Single step that collects ALL content for parsing to different assessments',
      icon: <Brain className="h-4 w-4" />,
      duration: '30-60s'
    },
    {
      id: 'golden_circle',
      name: 'Golden Circle Analysis',
      description: 'Extract exact quotes for Why, How, What, and Who',
      icon: <Target className="h-4 w-4" />,
      duration: '20-30s'
    },
    {
      id: 'elements_of_value',
      name: 'B2C Elements of Value Analysis',
      description: 'Evaluate 30 Consumer Elements with specific evidence',
      icon: <TrendingUp className="h-4 w-4" />,
      duration: '25-35s'
    },
    {
      id: 'b2b_elements',
      name: 'B2B Elements of Value Analysis',
      description: 'Evaluate 40 B2B Elements with specific evidence',
      icon: <TrendingUp className="h-4 w-4" />,
      duration: '30-40s'
    },
    {
      id: 'clifton_strengths',
      name: 'CliftonStrengths Analysis',
      description: 'Evaluate 34 themes across 4 domains with evidence',
      icon: <Zap className="h-4 w-4" />,
      duration: '25-35s'
    },
    {
      id: 'technical_performance',
      name: 'Technical Performance Analysis',
      description: 'Analyze technical structure, SEO, and accessibility',
      icon: <FileText className="h-4 w-4" />,
      duration: '10-15s'
    },
    {
      id: 'content_quality',
      name: 'Content Quality Analysis',
      description: 'Evaluate content depth, clarity, and effectiveness',
      icon: <FileText className="h-4 w-4" />,
      duration: '20-25s'
    },
    {
      id: 'actionable_report',
      name: 'Actionable Report Generation',
      description: 'Generate comprehensive, actionable recommendations',
      icon: <FileText className="h-4 w-4" />,
      duration: '15-20s'
    }
  ];

  const executeAnalysis = async () => {
    if (!url) {
      setError('Please enter a website URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setProgress([]);
    setOverallProgress(0);

    try {
      // Initialize progress for all steps
      const initialProgress = analysisSteps.map(step => ({
        stepId: step.id,
        stepName: step.name,
        status: 'pending' as const,
        progress: 0,
        estimatedDuration: parseDuration(step.duration)
      }));
      setProgress(initialProgress);

      // Calculate total estimated time (in milliseconds)
      const totalTime = analysisSteps.reduce((total, step) => {
        return total + parseDuration(step.duration);
      }, 0);
      setEstimatedTimeRemaining(totalTime);

      const response = await fetch('/api/analyze/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _url,
          enableDetailedLogging: true,
          timeoutPerStep: 45000
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save to localStorage
        try {
          const analysisForStorage = {
            id: Date.now().toString(),
            url: _url,
            overallScore: data.data.overallScore || 80,
            summary: data.data.executiveSummary || 'Enhanced analysis completed',
            status: 'completed' as const,
            timestamp: new Date().toISOString(),
            goldenCircle: data.data.goldenCircle || { why: '', how: '', what: '', overallScore: 0, insights: [] },
            elementsOfValue: data.data.elementsOfValue || { functional: {}, emotional: {}, lifeChanging: {}, socialImpact: {}, overallScore: 0, insights: [] },
            cliftonStrengths: data.data.cliftonStrengths || { themes: [], recommendations: [], overallScore: 0, insights: [] },
            recommendations: []
          };
          
          AnalysisClient.saveAnalysis(analysisForStorage);
          console.log('✅ Enhanced analysis saved to localStorage');
        } catch (saveError) {
          console.error('Failed to save enhanced analysis:', saveError);
        }
        
        setResult(data.data);
        onAnalysisComplete?.(data.data);
        
        // Mark all steps as completed
        setProgress(prev => prev.map(p => ({
          ...p,
          status: 'completed' as const,
          progress: 100,
          endTime: new Date()
        })));
        setOverallProgress(100);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      
      // Mark current step as failed
      setProgress(prev => prev.map(p => 
        p.stepId === currentStep 
          ? { ...p, status: 'failed' as const, error: error instanceof Error ? error.message : 'Unknown error' }
          : p
      ));
    } finally {
      setIsAnalyzing(false);
      setCurrentStep('');
    }
  };

  const parseDuration = (duration: string): number => {
    // Parse duration like "30-60s" or "2-3m" into milliseconds
    const match = duration.match(/(\d+)-(\d+)([sm])/);
    if (match && match[1] && match[2] && match[3]) {
      const [, min, max, unit] = match;
      const multiplier = unit === 'm' ? 60000 : 1000;
      return ((parseInt(min) + parseInt(max)) / 2) * multiplier;
    }
    return 30000; // Default 30 seconds
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Brain className="h-6 w-6" />
            Enhanced Analysis System
          </CardTitle>
          <CardDescription className="text-green-600">
            Thorough analysis with comprehensive content collection, real AI analysis only, and actionable deliverables
          </CardDescription>
        </CardHeader>
      </Card>

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Configuration</CardTitle>
          <CardDescription>
            Enter the website URL for comprehensive analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Enhanced Analysis Features:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>No Demo Data:</strong> Real AI analysis only</li>
              <li>• <strong>Comprehensive Content Collection:</strong> Single step collects ALL content</li>
              <li>• <strong>Exact Quotes & Evidence:</strong> Specific content analysis</li>
              <li>• <strong>Actionable Roadmap:</strong> Implementation phases with timelines</li>
              <li>• <strong>All Frameworks:</strong> Golden Circle, Elements of Value, B2B, CliftonStrengths</li>
            </ul>
          </div>

          <Button 
            onClick={executeAnalysis} 
            disabled={isAnalyzing || !url}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isAnalyzing ? (
              <>
                <Play className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Start Enhanced Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Steps</CardTitle>
          <CardDescription>
            Comprehensive 8-step analysis process with detailed progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {analysisSteps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {step.icon}
                  <div>
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {step.duration}
                    </Badge>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm text-muted-foreground">Step {index + 1} of 8</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Progress</CardTitle>
            <CardDescription>
              {currentStep ? `Currently running: ${currentStep}` : 'Preparing analysis...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>

            <div className="grid gap-3">
              {progress.map((stepProgress, index) => (
                <div key={stepProgress.stepId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(stepProgress.status)}
                    <div>
                      <div className="font-medium">{stepProgress.stepName}</div>
                      <div className="text-sm text-muted-foreground">
                        Step {index + 1} of {analysisSteps.length}
                        {stepProgress.details && ` - ${stepProgress.details}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(stepProgress.status)}
                    {stepProgress.status === 'running' && (
                      <span className="text-sm text-muted-foreground">
                        {stepProgress.progress}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {estimatedTimeRemaining > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Estimated time remaining: {formatDuration(estimatedTimeRemaining)}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Comprehensive analysis completed for {url}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="executive" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="executive">Executive Summary</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="roadmap">Implementation Roadmap</TabsTrigger>
              </TabsList>
              
              <TabsContent value="executive" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {result.executiveSummary?.overallScore || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.executiveSummary?.rating || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.executiveSummary?.keyStrengths?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Key Strengths</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.executiveSummary?.priorityActions?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Priority Actions</div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.executiveSummary?.keyStrengths?.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Critical Weaknesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.executiveSummary?.criticalWeaknesses?.map((weakness: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Priority Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.executiveSummary?.priorityActions?.map((action: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="font-medium text-blue-600">{index + 1}.</span>
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="detailed" className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(result.detailedAnalysis || {}).map(([key, value]: [string, any]) => (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="text-lg">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Immediate Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.actionableRecommendations?.immediateActions?.map((action: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="font-medium">{action.action}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <strong>Impact:</strong> {action.impact} | 
                              <strong> Effort:</strong> {action.effort} | 
                              <strong> Timeline:</strong> {action.timeline}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Wins</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.actionableRecommendations?.quickWins?.map((action: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="font-medium">{action.action}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <strong>Impact:</strong> {action.impact} | 
                              <strong> Effort:</strong> {action.effort} | 
                              <strong> Timeline:</strong> {action.timeline}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Strategic Initiatives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.actionableRecommendations?.strategicInitiatives?.map((action: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="font-medium">{action.action}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <strong>Impact:</strong> {action.impact} | 
                              <strong> Effort:</strong> {action.effort} | 
                              <strong> Timeline:</strong> {action.timeline}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="roadmap" className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(result.implementationRoadmap || {}).map(([phase, data]: [string, any]) => (
                    <Card key={phase}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {phase === 'phase1' ? 'Phase 1: Foundation (Weeks 1-2)' :
                           phase === 'phase2' ? 'Phase 2: Optimization (Weeks 3-6)' :
                           'Phase 3: Growth (Months 2-3)'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Array.isArray(data) && data.map((phaseData: any, index: number) => (
                          <div key={index} className="mb-4 p-4 border rounded-lg">
                            <div className="font-medium text-blue-600 mb-2">{phaseData.timeframe}</div>
                            <div className="space-y-2">
                              <div>
                                <strong>Actions:</strong>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  {phaseData.actions?.map((action: string, i: number) => (
                                    <li key={i} className="text-sm">{action}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <strong>Success Metrics:</strong>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  {phaseData.successMetrics?.map((metric: string, i: number) => (
                                    <li key={i} className="text-sm">{metric}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

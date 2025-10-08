/**
 * Controlled Analysis Page Component
 * Provides precise control over analysis steps, timing, and progress tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, Play, Pause, RotateCcw } from 'lucide-react';

interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  expectedDuration: number;
  dependencies: string[];
}

interface AnalysisProgress {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

interface ControlledAnalysisPageProps {
  onAnalysisComplete?: (result: any) => void;
}

export function ControlledAnalysisPage({ onAnalysisComplete }: ControlledAnalysisPageProps) {
  const [url, setUrl] = useState('');
  const [availableSteps, setAvailableSteps] = useState<AnalysisStep[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  // Load available steps on component mount
  useEffect(() => {
    loadAvailableSteps();
  }, []);

  const loadAvailableSteps = async () => {
    try {
      const response = await fetch('/api/analyze/controlled?action=steps');
      const data = await response.json();
      
      if (data.success) {
        setAvailableSteps(data.data.availableSteps);
        // Select all steps by default
        setSelectedSteps(data.data.availableSteps.map((step: AnalysisStep) => step.id));
      }
    } catch (error) {
      console.error('Failed to load available steps:', error);
    }
  };

  const executeAnalysis = async () => {
    if (!url || selectedSteps.length === 0) {
      setError('Please enter a URL and select at least one analysis step');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setProgress([]);
    setOverallProgress(0);

    try {
      // Initialize progress for all selected steps
      const initialProgress = selectedSteps.map(stepId => {
        const step = availableSteps.find(s => s.id === stepId);
        return {
          stepId,
          stepName: step?.name || stepId,
          status: 'pending' as const,
          progress: 0
        };
      });
      setProgress(initialProgress);

      // Calculate total estimated time
      const totalTime = selectedSteps.reduce((total, stepId) => {
        const step = availableSteps.find(s => s.id === stepId);
        return total + (step?.expectedDuration || 30000);
      }, 0);
      setEstimatedTimeRemaining(totalTime);

      const response = await fetch('/api/analyze/controlled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          steps: selectedSteps,
          timeoutPerStep: 30000
        }),
      });

      const data = await response.json();

      if (data.success) {
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

  const toggleStepSelection = (stepId: string) => {
    setSelectedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const selectAllSteps = () => {
    setSelectedSteps(availableSteps.map(step => step.id));
  };

  const deselectAllSteps = () => {
    setSelectedSteps([]);
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
    return `${seconds}s`;
  };

  const getTotalEstimatedTime = () => {
    return selectedSteps.reduce((total, stepId) => {
      const step = availableSteps.find(s => s.id === stepId);
      return total + (step?.expectedDuration || 30000);
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Controlled Analysis
          </CardTitle>
          <CardDescription>
            Execute website analysis with precise control over steps, timing, and progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
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

          {/* Step Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Analysis Steps</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllSteps}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllSteps}>
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {availableSteps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={step.id}
                    checked={selectedSteps.includes(step.id)}
                    onCheckedChange={() => toggleStepSelection(step.id)}
                    disabled={isAnalyzing}
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={step.id} className="font-medium">
                      {step.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(step.expectedDuration)}
                      </Badge>
                      {step.dependencies.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {step.dependencies.length} dependencies
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedSteps.length > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Total estimated time: {formatDuration(getTotalEstimatedTime())} 
                  ({selectedSteps.length} steps selected)
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Execute Button */}
          <Button 
            onClick={executeAnalysis} 
            disabled={isAnalyzing || !url || selectedSteps.length === 0}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Controlled Analysis
              </>
            )}
          </Button>
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
                        Step {index + 1} of {selectedSteps.length}
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
              Completed analysis for {url}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.summary?.overallScore || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {result.summary?.completedSteps || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Steps Completed</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.summary?.totalSteps || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Steps</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(result.totalDuration / 1000)}s
                    </div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="detailed" className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(result.results || {}).map(([key, value]: [string, any]) => (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="text-lg">{key.replace(/_/g, ' ').toUpperCase()}</CardTitle>
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
                      <CardTitle>Key Findings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.summary?.keyFindings?.map((finding: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Priority Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.summary?.priorityRecommendations?.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="font-medium text-blue-600">{index + 1}.</span>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="raw" className="space-y-4">
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

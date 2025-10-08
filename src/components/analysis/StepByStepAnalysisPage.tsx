'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Search, 
  Target, 
  TrendingUp, 
  Zap, 
  Shield, 
  Users, 
  Brain,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Star,
  ArrowRight,
  ExternalLink,
  Download,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import SimpleProgressTracker from './SimpleProgressTracker';

interface StepResult {
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  timestamp?: string;
  url?: string;
  data?: any;
}

interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  required: boolean;
  dependencies?: string[];
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'base-analysis',
    name: 'Base AI Analysis',
    description: 'Golden Circle, Elements of Value, B2B Elements, CliftonStrengths',
    icon: <Brain className="h-5 w-5" />,
    color: 'blue',
    required: true,
  },
  {
    id: 'pageaudit',
    name: 'PageAudit Analysis',
    description: 'SEO, Technical, Content, and Accessibility analysis',
    icon: <Search className="h-5 w-5" />,
    color: 'orange',
    required: false,
    dependencies: ['base-analysis'],
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse Analysis',
    description: 'Performance, accessibility, best practices, SEO metrics',
    icon: <Zap className="h-5 w-5" />,
    color: 'purple',
    required: false,
    dependencies: ['base-analysis'],
  },
  {
    id: 'gemini-insights',
    name: 'Gemini AI Insights',
    description: 'Strategic analysis combining all data sources',
    icon: <Star className="h-5 w-5" />,
    color: 'green',
    required: false,
    dependencies: ['base-analysis', 'pageaudit', 'lighthouse'],
  },
];

export default function StepByStepAnalysisPage() {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [includeAllPages, setIncludeAllPages] = useState(false);
  const [analysisType, setAnalysisType] = useState('full');
  
  const [steps, setSteps] = useState<Record<string, StepResult>>({});
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  // Initialize steps
  const initializeSteps = () => {
    const initialSteps: Record<string, StepResult> = {};
    ANALYSIS_STEPS.forEach(step => {
      initialSteps[step.id] = {
        type: step.id,
        status: 'pending',
      };
    });
    setSteps(initialSteps);
  };

  const executeStep = async (stepId: string) => {
    if (!url.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    setCurrentStep(stepId);
    setIsRunning(true);

    // Update step status to running
    setSteps(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], status: 'running', type: stepId }
    }));

    try {
      let requestData: any = {};

      switch (stepId) {
        case 'base-analysis':
          requestData = {
            url: url.trim(),
            analysisType,
          };
          break;
        case 'pageaudit':
          requestData = {
            url: url.trim(),
            keyword: keyword.trim() || undefined,
          };
          break;
        case 'lighthouse':
          requestData = {
            url: url.trim(),
            includeAllPages,
          };
          break;
        case 'gemini-insights':
          requestData = {
            baseAnalysis: steps['base-analysis']?.result,
            pageAuditData: steps['pageaudit']?.result,
            lighthouseData: steps['lighthouse']?.result,
            allPagesLighthouse: steps['lighthouse']?.result?.allPagesLighthouse,
          };
          break;
      }

      const response = await fetch('/api/analyze/step-by-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: stepId,
          data: requestData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Step execution failed');
      }

      // Update step result
      setSteps(prev => ({
        ...prev,
        [stepId]: {
          type: stepId,
          status: result.success ? 'completed' : 'failed',
          result: result.data,
          error: result.error?.message,
          timestamp: result.timestamp,
          url: url.trim(),
          data: requestData,
        }
      }));

      // Auto-run next step if enabled
      if (autoRun && result.success) {
        const currentIndex = ANALYSIS_STEPS.findIndex(step => step.id === stepId);
        if (currentIndex < ANALYSIS_STEPS.length - 1) {
          const nextStep = ANALYSIS_STEPS[currentIndex + 1];
          // Check if dependencies are met
          const dependenciesMet = nextStep?.dependencies?.every(depId =>
            steps[depId]?.status === 'completed'
          ) ?? true;
          
          if (dependenciesMet && nextStep) {
            setTimeout(() => executeStep(nextStep.id), 1000);
            return;
          }
        }
      }

    } catch (error) {
      setSteps(prev => ({
        ...prev,
        [stepId]: {
          type: stepId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          url: url.trim(),
        }
      }));
    } finally {
      setCurrentStep(null);
      setIsRunning(false);
    }
  };

  const retryStep = async (stepId: string) => {
    await executeStep(stepId);
  };

  const skipStep = (stepId: string) => {
    setSteps(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], status: 'skipped', type: stepId }
    }));
  };

  const resetStep = (stepId: string) => {
    setSteps(prev => ({
      ...prev,
      [stepId]: {
        type: stepId,
        status: 'pending',
      }
    }));
  };

  const resetAllSteps = () => {
    initializeSteps();
    setCurrentStep(null);
    setIsRunning(false);
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      case 'running': return 'text-blue-600 dark:text-blue-400';
      case 'skipped': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStepStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'running': return <Badge variant="secondary" className="bg-blue-600 text-white">Running</Badge>;
      case 'skipped': return <Badge variant="outline">Skipped</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const canExecuteStep = (stepId: string) => {
    const step = ANALYSIS_STEPS.find(s => s.id === stepId);
    if (!step) return false;
    
    // Check dependencies
    if (step.dependencies) {
      return step.dependencies.every(depId => steps[depId]?.status === 'completed');
    }
    
    return true;
  };

  const toggleDetails = (stepId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const getOverallProgress = () => {
    const completed = Object.values(steps).filter(step => step.status === 'completed').length;
    const total = ANALYSIS_STEPS.length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Step-by-Step Analysis
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Execute analysis steps individually with full control and troubleshooting
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Analysis Configuration
          </CardTitle>
          <CardDescription>
            Configure your analysis parameters and execute steps individually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL *</Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isRunning}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyword">Target Keyword (Optional)</Label>
              <Input
                id="keyword"
                name="keyword"
                type="text"
                placeholder="e.g., marketing automation"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="analysisType">Analysis Type</Label>
              <select
                id="analysisType"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                disabled={isRunning}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">Full Analysis</option>
                <option value="golden-circle">Golden Circle Only</option>
                <option value="elements-of-value">Elements of Value Only</option>
                <option value="b2b-elements">B2B Elements Only</option>
                <option value="clifton-strengths">CliftonStrengths Only</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeAllPages"
                checked={includeAllPages}
                onChange={(e) => setIncludeAllPages(e.target.checked)}
                disabled={isRunning}
                className="rounded border-gray-300"
              />
              <Label htmlFor="includeAllPages">Include All Pages (Lighthouse)</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRun"
                  checked={autoRun}
                  onChange={(e) => setAutoRun(e.target.checked)}
                  disabled={isRunning}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="autoRun">Auto-run next step on completion</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={initializeSteps}
                variant="outline"
                disabled={isRunning}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
              <Button 
                onClick={resetAllSteps}
                variant="outline"
                disabled={isRunning}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Analysis Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleProgressTracker 
            steps={ANALYSIS_STEPS.map(step => ({
              id: step.id,
              name: step.name,
              status: steps[step.id]?.status || 'pending'
            }))}
            currentStep={currentStep || undefined}
          />
        </CardContent>
      </Card>

      {/* Analysis Steps */}
      <div className="space-y-4">
        {ANALYSIS_STEPS.map((step, index) => {
          const stepResult = steps[step.id];
          const isCurrentStep = currentStep === step.id;
          const canExecute = canExecuteStep(step.id);
          const isExecutable = !isRunning && canExecute && url.trim();

          return (
            <Card key={step.id} className={`transition-all duration-200 ${
              isCurrentStep ? 'ring-2 ring-blue-500 shadow-lg' : ''
            } ${stepResult?.status === 'completed' ? 'border-green-200 dark:border-green-800' : 
              stepResult?.status === 'failed' ? 'border-red-200 dark:border-red-800' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      step.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                      step.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900' :
                      step.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                      'bg-green-100 dark:bg-green-900'
                    }`}>
                      <div className={getStepStatusColor(stepResult?.status || 'pending')}>
                        {step.icon}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.name}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStepStatusBadge(stepResult?.status || 'pending')}
                    {step.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Dependencies */}
                  {step.dependencies && step.dependencies.length > 0 && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>Dependencies:</strong> {step.dependencies.join(', ')}
                    </div>
                  )}

                  {/* Error Display */}
                  {stepResult?.status === 'failed' && stepResult.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{stepResult.error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Success Display */}
                  {stepResult?.status === 'completed' && stepResult.result && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          ✅ Step completed successfully
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDetails(step.id)}
                        >
                          {showDetails[step.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {showDetails[step.id] && (
                        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <pre className="text-xs overflow-auto max-h-40">
                            {JSON.stringify(stepResult.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => executeStep(step.id)}
                      disabled={!isExecutable}
                      className="flex-1"
                      variant={stepResult?.status === 'completed' ? 'outline' : 'default'}
                    >
                      {isCurrentStep ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : stepResult?.status === 'completed' ? (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Re-run
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Execute
                        </>
                      )}
                    </Button>

                    {stepResult?.status === 'failed' && (
                      <Button
                        onClick={() => retryStep(step.id)}
                        disabled={isRunning}
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    )}

                    {!step.required && stepResult?.status === 'pending' && (
                      <Button
                        onClick={() => skipStep(step.id)}
                        disabled={isRunning}
                        variant="outline"
                      >
                        Skip
                      </Button>
                    )}

                    {stepResult?.status && stepResult.status !== 'pending' && (
                      <Button
                        onClick={() => resetStep(step.id)}
                        disabled={isRunning}
                        variant="outline"
                        size="sm"
                      >
                        Reset
                      </Button>
                    )}
                  </div>

                  {/* Timestamp */}
                  {stepResult?.timestamp && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Last executed: {new Date(stepResult.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Final Results Summary */}
      {Object.values(steps).some(step => step.status === 'completed') && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ANALYSIS_STEPS.map(step => {
                const stepResult = steps[step.id];
                if (stepResult?.status !== 'completed') return null;

                return (
                  <div key={step.id} className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {step.icon}
                    </div>
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {stepResult.timestamp && new Date(stepResult.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

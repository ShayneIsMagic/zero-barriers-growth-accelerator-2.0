'use client';

import { useState } from 'react';
import { UnifiedDataCollection } from './UnifiedDataCollection';
import { AssessmentResultsView } from './AssessmentResultsView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  Target, 
  Brain, 
  BarChart3,
  Play,
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
  Download,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface CollectedData {
  url: string;
  title: string;
  metaDescription: string;
  cleanText: string;
  headings: string[];
  images: Array<{ src: string; alt: string }>;
  links: Array<{ href: string; text: string }>;
  metadata: any;
  technical: any;
  scrapedAt: string;
}

interface AssessmentResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  data: any;
  error: string | null;
  startTime?: number;
  endTime?: number;
}

const ASSESSMENTS = [
  {
    id: 'b2c-elements',
    name: 'B2C Elements of Value',
    description: '30 consumer value elements analysis',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    apiEndpoint: '/api/analyze/elements-value-b2c-standalone',
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'b2b-elements',
    name: 'B2B Elements of Value',
    description: '40 business value elements analysis',
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    apiEndpoint: '/api/analyze/elements-value-b2b-standalone',
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'golden-circle',
    name: 'Golden Circle',
    description: 'WHY/HOW/WHAT/WHO framework analysis',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    apiEndpoint: '/api/analyze/golden-circle-standalone',
    estimatedTime: '1-2 minutes'
  },
  {
    id: 'clifton-strengths',
    name: 'CliftonStrengths',
    description: '34 strengths-based analysis',
    icon: Brain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    apiEndpoint: '/api/analyze/clifton-strengths-standalone',
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'content-comparison',
    name: 'Content Comparison',
    description: 'Compare existing vs proposed content',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    apiEndpoint: '/api/analyze/compare',
    estimatedTime: '1-2 minutes'
  }
];

export function ComprehensiveAssessmentDashboard() {
  const [collectedData, setCollectedData] = useState<CollectedData | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [isRunningComprehensive, setIsRunningComprehensive] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'comprehensive'>('individual');
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);

  const handleDataCollected = (data: CollectedData | null) => {
    setCollectedData(data);
    if (data) {
      // Reset assessment results when new data is collected
      setAssessmentResults([]);
      setActiveAssessment(null);
    }
  };

  const runIndividualAssessment = async (assessmentId: string) => {
    if (!collectedData) return;

    const assessment = ASSESSMENTS.find(a => a.id === assessmentId);
    if (!assessment) return;

    // Update status to running
    setAssessmentResults(prev => prev.map(r => 
      r.id === assessmentId 
        ? { ...r, status: 'running', startTime: Date.now(), error: null }
        : r
    ));

    try {
      const response = await fetch(assessment.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: collectedData.url,
          scrapedContent: collectedData
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAssessmentResults(prev => prev.map(r => 
          r.id === assessmentId 
            ? { 
                ...r, 
                status: 'completed', 
                data: data.data, 
                endTime: Date.now(),
                error: null
              }
            : r
        ));
        toast.success(`${assessment.name} analysis completed`);
      } else {
        throw new Error(data.error || `${assessment.name} analysis failed`);
      }
    } catch (error) {
      setAssessmentResults(prev => prev.map(r => 
        r.id === assessmentId 
          ? { 
              ...r, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error',
              endTime: Date.now()
            }
          : r
      ));
      toast.error(`${assessment.name} analysis failed`);
    }
  };

  const runComprehensiveAnalysis = async () => {
    if (!collectedData) return;

    setIsRunningComprehensive(true);
    setViewMode('comprehensive');

    // Initialize all assessments as pending
    const initialResults = ASSESSMENTS.map(assessment => ({
      id: assessment.id,
      name: assessment.name,
      status: 'pending' as const,
      data: null,
      error: null
    }));
    setAssessmentResults(initialResults);

    // Run assessments sequentially to avoid overwhelming the system
    for (const assessment of ASSESSMENTS) {
      await runIndividualAssessment(assessment.id);
      // Small delay between assessments
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunningComprehensive(false);
    toast.success('Comprehensive analysis completed');
  };

  const getAssessmentStatus = (assessmentId: string) => {
    const result = assessmentResults.find(r => r.id === assessmentId);
    return result?.status || 'pending';
  };

  const getOverallProgress = () => {
    const completed = assessmentResults.filter(r => r.status === 'completed').length;
    const total = ASSESSMENTS.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const handleDownloadComprehensiveReport = async () => {
    if (!collectedData) return;

    try {
      const response = await fetch('/api/generate-comprehensive-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: collectedData.url,
          assessmentResults: assessmentResults.filter(r => r.status === 'completed')
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Download the markdown report
        const blob = new Blob([data.markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprehensive-analysis-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Comprehensive report downloaded');
      } else {
        throw new Error(data.error || 'Failed to generate comprehensive report');
      }
    } catch (error) {
      toast.error('Failed to download comprehensive report');
    }
  };

  const resetAnalysis = () => {
    setCollectedData(null);
    setAssessmentResults([]);
    setActiveAssessment(null);
    setIsRunningComprehensive(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            Comprehensive Assessment Dashboard
          </CardTitle>
          <CardDescription>
            Run individual assessments or comprehensive analysis across all frameworks
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Data Collection */}
      <UnifiedDataCollection
        onDataCollected={handleDataCollected}
        showDataPreview={true}
      />

      {/* Assessment Controls */}
      {collectedData && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Options</CardTitle>
            <CardDescription>
              Choose to run individual assessments or comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Button
                onClick={runComprehensiveAnalysis}
                disabled={isRunningComprehensive}
                className="flex-1"
              >
                {isRunningComprehensive ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running All Assessments...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Comprehensive Analysis
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetAnalysis}>
                Start Over
              </Button>
            </div>

            {isRunningComprehensive && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {getOverallProgress().completed}/{getOverallProgress().total} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getOverallProgress().percentage}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Mode Toggle */}
      {collectedData && assessmentResults.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="individual">Individual Assessments</TabsTrigger>
                <TabsTrigger value="comprehensive">Comprehensive View</TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ASSESSMENTS.map((assessment) => {
                    const IconComponent = assessment.icon;
                    const status = getAssessmentStatus(assessment.id);
                    const result = assessmentResults.find(r => r.id === assessment.id);

                    return (
                      <Card 
                        key={assessment.id} 
                        className={`${assessment.borderColor} ${assessment.bgColor} cursor-pointer transition-all hover:shadow-md`}
                        onClick={() => setActiveAssessment(assessment.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconComponent className={`h-5 w-5 ${assessment.color}`} />
                              <CardTitle className={`text-sm ${assessment.color}`}>
                                {assessment.name}
                              </CardTitle>
                            </div>
                            <Badge variant={
                              status === 'completed' ? 'default' :
                              status === 'running' ? 'secondary' :
                              status === 'error' ? 'destructive' : 'outline'
                            }>
                              {status === 'running' ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : status === 'completed' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : status === 'error' ? (
                                'Error'
                              ) : (
                                'Pending'
                              )}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {assessment.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              {assessment.estimatedTime}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                runIndividualAssessment(assessment.id);
                              }}
                              disabled={status === 'running'}
                            >
                              {status === 'running' ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="comprehensive" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Comprehensive Analysis Results</h3>
                  <Button onClick={handleDownloadComprehensiveReport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>

                <div className="space-y-4">
                  {assessmentResults
                    .filter(r => r.status === 'completed')
                    .map((result) => {
                      const assessment = ASSESSMENTS.find(a => a.id === result.id);
                      if (!assessment) return null;

                      return (
                        <AssessmentResultsView
                          key={result.id}
                          assessmentType={result.id as any}
                          data={result.data}
                          isLoading={false}
                          error={result.error}
                          showRawData={false}
                        />
                      );
                    })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Individual Assessment Detail View */}
      {activeAssessment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {ASSESSMENTS.find(a => a.id === activeAssessment)?.name} Analysis
              </CardTitle>
              <Button variant="outline" onClick={() => setActiveAssessment(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const result = assessmentResults.find(r => r.id === activeAssessment);
              const assessment = ASSESSMENTS.find(a => a.id === activeAssessment);
              
              if (!result || !assessment) return null;

              return (
                <AssessmentResultsView
                  assessmentType={activeAssessment as any}
                  data={result.data}
                  isLoading={result.status === 'running'}
                  error={result.error}
                  onRetry={() => runIndividualAssessment(activeAssessment)}
                  showRawData={true}
                />
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

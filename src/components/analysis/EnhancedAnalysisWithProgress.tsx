/**
 * Enhanced Analysis Page with Comprehensive Progress Tracking
 * Provides real-time progress updates, mini deliverables, and cohesive reporting
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, Play, Brain, Target, TrendingUp, FileText, Zap, Download, Eye } from 'lucide-react';
import { ProgressTracker, AnalysisProgress } from './ProgressTracker';
import { ProgressManager, createProgressManager } from '@/lib/progress-manager';
import { CohesiveReportBuilder, CohesiveReport } from '@/lib/cohesive-report-builder';

interface AnalysisResult {
  id: string;
  url: string;
  status: 'completed' | 'failed';
  report?: CohesiveReport;
  error?: string;
  timestamp: string;
}

export default function EnhancedAnalysisWithProgress() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressManager, setProgressManager] = useState<ProgressManager | null>(null);

  // Initialize progress manager when URL changes
  useEffect(() => {
    if (url && !isAnalyzing) {
      const manager = createProgressManager(url);
      manager.onUpdate(setProgress);
      setProgressManager(manager);
    }
  }, [url, isAnalyzing]);

  const startAnalysis = useCallback(async () => {
    if (!url.trim() || !progressManager) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      // Start the analysis
      progressManager.start();
      
      // Execute the enhanced analysis with progress tracking
      const analysisResult = await executeEnhancedAnalysisWithProgress(progressManager, url);
      
      setResult(analysisResult);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      progressManager.failPhase('phase1_data_collection', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [url, progressManager]);

  const downloadReport = useCallback(() => {
    if (!result?.report) return;

    const reportData = JSON.stringify(result.report, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${result.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Enhanced Analysis with Progress Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Comprehensive website analysis with real-time progress updates, mini deliverables, and cohesive reporting
        </p>
      </div>

      {/* Input Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Analysis Configuration</span>
          </CardTitle>
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
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={startAnalysis} 
            disabled={!url.trim() || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analysis in Progress...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Enhanced Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress Tracker */}
      {progress && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Analysis Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTracker 
              progress={progress}
              onPhaseClick={(phaseId) => console.log('Phase clicked:', phaseId)}
              onDeliverableClick={(phaseId, deliverableId) => console.log('Deliverable clicked:', phaseId, deliverableId)}
              showDetails={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Analysis Complete</span>
                </CardTitle>
                <CardDescription>
                  Analysis completed successfully for {result.url}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={downloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="phases">Phases</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                {result.report?.executiveSummary && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-blue-600">
                            {result.report.executiveSummary.overallScore}
                          </div>
                          <Badge variant="outline" className="mt-2">
                            {result.report.executiveSummary.rating}
                          </Badge>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Key Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600">
                            {result.report.executiveSummary.keyStrengths.length} identified
                          </div>
                          <ul className="mt-2 space-y-1">
                            {result.report.executiveSummary.keyStrengths.slice(0, 3).map((strength, index) => (
                              <li key={index} className="text-xs text-gray-500">• {strength}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Critical Issues</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600">
                            {result.report.executiveSummary.criticalIssues.length} identified
                          </div>
                          <ul className="mt-2 space-y-1">
                            {result.report.executiveSummary.criticalIssues.slice(0, 3).map((issue, index) => (
                              <li key={index} className="text-xs text-gray-500">• {issue}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="phases" className="space-y-4">
                {result.report?.phaseReports.map((phaseReport) => (
                  <Card key={phaseReport.phaseId}>
                    <CardHeader>
                      <CardTitle className="text-lg">{phaseReport.phaseName}</CardTitle>
                      <CardDescription>
                        Status: {phaseReport.status} • Duration: {phaseReport.duration}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {phaseReport.deliverables.map((deliverable) => (
                          <div key={deliverable.deliverableId} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{deliverable.title}</h4>
                              <Badge variant="outline">{deliverable.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{deliverable.description}</p>
                            {deliverable.insights.length > 0 && (
                              <div className="text-sm">
                                <strong>Insights:</strong>
                                <ul className="mt-1 space-y-1">
                                  {deliverable.insights.map((insight, index) => (
                                    <li key={index} className="text-gray-600">• {insight}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Technical Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>SEO Score</span>
                          <span className="font-medium">{result.report?.technicalMetrics.seo.score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Performance Score</span>
                          <span className="font-medium">{result.report?.technicalMetrics.performance.score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accessibility Score</span>
                          <span className="font-medium">{result.report?.technicalMetrics.accessibility.score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security Score</span>
                          <span className="font-medium">{result.report?.technicalMetrics.security.score}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Business Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <strong>Golden Circle Alignment:</strong>
                          <div className="text-lg font-medium">{result.report?.businessInsights.goldenCircle.alignment}%</div>
                        </div>
                        <div>
                          <strong>Strongest Value Elements:</strong>
                          <ul className="mt-1 space-y-1">
                            {result.report?.businessInsights.elementsOfValue.strongestElements.slice(0, 3).map((element, index) => (
                              <li key={index} className="text-sm text-gray-600">• {element}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="roadmap" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600">Immediate Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.report?.implementationRoadmap.immediate.map((action, index) => (
                          <div key={index} className="border-l-4 border-red-500 pl-3">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-gray-600">{action.description}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-yellow-600">Short Term</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.report?.implementationRoadmap.shortTerm.map((action, index) => (
                          <div key={index} className="border-l-4 border-yellow-500 pl-3">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-gray-600">{action.description}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-600">Long Term</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.report?.implementationRoadmap.longTerm.map((action, index) => (
                          <div key={index} className="border-l-4 border-green-500 pl-3">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-gray-600">{action.description}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Execute enhanced analysis with progress tracking
 */
async function executeEnhancedAnalysisWithProgress(
  progressManager: ProgressManager,
  url: string
): Promise<AnalysisResult> {
  console.log('🚀 Starting enhanced analysis with progress tracking...');

  try {
    // Phase 1: Data Collection
    progressManager.startPhase('phase1_data_collection');
    
    // Content Scraping
    progressManager.startDeliverable('phase1_data_collection', 'content_scraping');
    const contentData = await performContentScraping(url);
    progressManager.updateDeliverableProgress('phase1_data_collection', 'content_scraping', 100);
    progressManager.completeDeliverable('phase1_data_collection', 'content_scraping', contentData);
    
    // PageAudit Analysis
    progressManager.startDeliverable('phase1_data_collection', 'pageaudit_analysis');
    const pageAuditData = await performPageAuditAnalysis(url);
    progressManager.updateDeliverableProgress('phase1_data_collection', 'pageaudit_analysis', 100);
    progressManager.completeDeliverable('phase1_data_collection', 'pageaudit_analysis', pageAuditData);
    
    // Lighthouse Performance
    progressManager.startDeliverable('phase1_data_collection', 'lighthouse_performance');
    const lighthouseData = await performLighthouseAnalysis(url);
    progressManager.updateDeliverableProgress('phase1_data_collection', 'lighthouse_performance', 100);
    progressManager.completeDeliverable('phase1_data_collection', 'lighthouse_performance', lighthouseData);
    
    // Google Trends
    progressManager.startDeliverable('phase1_data_collection', 'google_trends');
    const trendsData = await performGoogleTrendsAnalysis(url);
    progressManager.updateDeliverableProgress('phase1_data_collection', 'google_trends', 100);
    progressManager.completeDeliverable('phase1_data_collection', 'google_trends', trendsData);
    
    progressManager.completePhase('phase1_data_collection', {
      content_scraping: contentData,
      pageaudit_analysis: pageAuditData,
      lighthouse_performance: lighthouseData,
      google_trends: trendsData
    });

    // Phase 2: AI Framework Analysis
    progressManager.startPhase('phase2_ai_frameworks');
    
    // Golden Circle Analysis
    progressManager.startDeliverable('phase2_ai_frameworks', 'golden_circle');
    const goldenCircleData = await performGoldenCircleAnalysis(contentData);
    progressManager.updateDeliverableProgress('phase2_ai_frameworks', 'golden_circle', 100);
    progressManager.completeDeliverable('phase2_ai_frameworks', 'golden_circle', goldenCircleData);
    
    // B2C Elements of Value
    progressManager.startDeliverable('phase2_ai_frameworks', 'b2c_elements');
    const b2cElementsData = await performB2CElementsAnalysis(contentData);
    progressManager.updateDeliverableProgress('phase2_ai_frameworks', 'b2c_elements', 100);
    progressManager.completeDeliverable('phase2_ai_frameworks', 'b2c_elements', b2cElementsData);
    
    // B2B Elements of Value
    progressManager.startDeliverable('phase2_ai_frameworks', 'b2b_elements');
    const b2bElementsData = await performB2BElementsAnalysis(contentData);
    progressManager.updateDeliverableProgress('phase2_ai_frameworks', 'b2b_elements', 100);
    progressManager.completeDeliverable('phase2_ai_frameworks', 'b2b_elements', b2bElementsData);
    
    // CliftonStrengths Analysis
    progressManager.startDeliverable('phase2_ai_frameworks', 'clifton_strengths');
    const cliftonStrengthsData = await performCliftonStrengthsAnalysis(contentData);
    progressManager.updateDeliverableProgress('phase2_ai_frameworks', 'clifton_strengths', 100);
    progressManager.completeDeliverable('phase2_ai_frameworks', 'clifton_strengths', cliftonStrengthsData);
    
    progressManager.completePhase('phase2_ai_frameworks', {
      golden_circle: goldenCircleData,
      b2c_elements: b2cElementsData,
      b2b_elements: b2bElementsData,
      clifton_strengths: cliftonStrengthsData
    });

    // Phase 3: Strategic Analysis
    progressManager.startPhase('phase3_strategic_analysis');
    
    // Competitive Analysis
    progressManager.startDeliverable('phase3_strategic_analysis', 'competitive_analysis');
    const competitiveData = await performCompetitiveAnalysis(contentData, url);
    progressManager.updateDeliverableProgress('phase3_strategic_analysis', 'competitive_analysis', 100);
    progressManager.completeDeliverable('phase3_strategic_analysis', 'competitive_analysis', competitiveData);
    
    // Content Quality Assessment
    progressManager.startDeliverable('phase3_strategic_analysis', 'content_quality');
    const contentQualityData = await performContentQualityAssessment(contentData);
    progressManager.updateDeliverableProgress('phase3_strategic_analysis', 'content_quality', 100);
    progressManager.completeDeliverable('phase3_strategic_analysis', 'content_quality', contentQualityData);
    
    // Actionable Recommendations
    progressManager.startDeliverable('phase3_strategic_analysis', 'actionable_recommendations');
    const recommendationsData = await generateActionableRecommendations({
      contentData,
      pageAuditData,
      lighthouseData,
      trendsData,
      goldenCircleData,
      b2cElementsData,
      b2bElementsData,
      cliftonStrengthsData,
      competitiveData,
      contentQualityData
    });
    progressManager.updateDeliverableProgress('phase3_strategic_analysis', 'actionable_recommendations', 100);
    progressManager.completeDeliverable('phase3_strategic_analysis', 'actionable_recommendations', recommendationsData);
    
    progressManager.completePhase('phase3_strategic_analysis', {
      competitive_analysis: competitiveData,
      content_quality: contentQualityData,
      actionable_recommendations: recommendationsData
    });

    // Complete analysis
    progressManager.complete();
    
    // Build cohesive report
    const progressData = progressManager.getProgress();
    const reportBuilder = new CohesiveReportBuilder(progressData);
    const cohesiveReport = await reportBuilder.buildReport();
    
    return {
      id: `analysis_${Date.now()}`,
      url,
      status: 'completed',
      report: cohesiveReport,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Enhanced analysis failed:', error);
    throw error;
  }
}

// Placeholder functions for analysis steps
async function performContentScraping(url: string): Promise<any> {
  // Simulate content scraping
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { content: 'Scraped content', wordCount: 1500, title: 'Page Title' };
}

async function performPageAuditAnalysis(url: string): Promise<any> {
  // Simulate PageAudit analysis
  await new Promise(resolve => setTimeout(resolve, 3000));
  return { seoScore: 85, technicalScore: 90, issues: ['Missing meta description'] };
}

async function performLighthouseAnalysis(url: string): Promise<any> {
  // Simulate Lighthouse analysis
  await new Promise(resolve => setTimeout(resolve, 4000));
  return { performance: 75, accessibility: 88, bestPractices: 92, seo: 85 };
}

async function performGoogleTrendsAnalysis(url: string): Promise<any> {
  // Simulate Google Trends analysis
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { trendingKeywords: ['digital marketing', 'SEO'], interestOverTime: [] };
}

async function performGoldenCircleAnalysis(contentData: any): Promise<any> {
  // Simulate Golden Circle analysis
  await new Promise(resolve => setTimeout(resolve, 5000));
  return { why: { score: 80 }, how: { score: 75 }, what: { score: 90 }, who: { score: 85 } };
}

async function performB2CElementsAnalysis(contentData: any): Promise<any> {
  // Simulate B2C Elements analysis
  await new Promise(resolve => setTimeout(resolve, 6000));
  return { elements: {}, strongestElements: ['Quality', 'Convenience'], weakestElements: ['Innovation'] };
}

async function performB2BElementsAnalysis(contentData: any): Promise<any> {
  // Simulate B2B Elements analysis
  await new Promise(resolve => setTimeout(resolve, 6000));
  return { elements: {}, strongestElements: ['Expertise', 'Support'], weakestElements: ['Innovation'] };
}

async function performCliftonStrengthsAnalysis(contentData: any): Promise<any> {
  // Simulate CliftonStrengths analysis
  await new Promise(resolve => setTimeout(resolve, 6000));
  return { dominantThemes: ['Strategic Thinking', 'Executing'], strengths: ['Analytical', 'Achiever'] };
}

async function performCompetitiveAnalysis(contentData: any, url: string): Promise<any> {
  // Simulate competitive analysis
  await new Promise(resolve => setTimeout(resolve, 4000));
  return { advantages: ['Unique positioning'], gaps: ['Market reach'], opportunities: ['Content marketing'] };
}

async function performContentQualityAssessment(contentData: any): Promise<any> {
  // Simulate content quality assessment
  await new Promise(resolve => setTimeout(resolve, 3000));
  return { readability: 75, engagement: 80, clarity: 85 };
}

async function generateActionableRecommendations(allData: any): Promise<any> {
  // Simulate actionable recommendations generation
  await new Promise(resolve => setTimeout(resolve, 3000));
  return {
    immediate: [
      { title: 'Fix missing meta descriptions', priority: 'High', effort: 'Low' },
      { title: 'Optimize page speed', priority: 'Critical', effort: 'Medium' }
    ],
    shortTerm: [
      { title: 'Implement schema markup', priority: 'Medium', effort: 'Medium' },
      { title: 'Add accessibility features', priority: 'High', effort: 'High' }
    ],
    longTerm: [
      { title: 'Develop content strategy', priority: 'Medium', effort: 'High' },
      { title: 'Build thought leadership', priority: 'Low', effort: 'High' }
    ]
  };
}

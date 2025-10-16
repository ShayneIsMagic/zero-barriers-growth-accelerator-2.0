'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Target, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Zap, Clock } from 'lucide-react';

interface Phase3Data {
  comprehensiveAnalysis: any;
  summary: any;
}

export default function Phase3Page() {
  const [url, setUrl] = useState('');
  const [phase1Data, setPhase1Data] = useState<any>(null);
  const [phase2Data, setPhase2Data] = useState<any>(null);
  const [phase3Data, setPhase3Data] = useState<Phase3Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPhase3Analysis = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First run Phase 1 if not already done
      if (!phase1Data) {
        console.log('Running Phase 1 first...');
        const phase1Response = await fetch('/api/analyze/phase1-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        
        if (!phase1Response.ok) {
          throw new Error('Phase 1 analysis failed');
        }
        
        const phase1Result = await phase1Response.json();
        setPhase1Data(phase1Result.data);
      }

      // Run Phase 2 if not already done
      if (!phase2Data) {
        console.log('Running Phase 2...');
        const phase2Response = await fetch('/api/analyze/phase2-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url, 
            content: phase1Data?.scrapedContent,
            phase1Data 
          }),
        });

        if (!phase2Response.ok) {
          throw new Error('Phase 2 analysis failed');
        }

        const phase2Result = await phase2Response.json();
        setPhase2Data(phase2Result.data);
      }

      // Run Phase 3 analysis
      console.log('Running Phase 3 analysis...');
      const phase3Response = await fetch('/api/analyze/phase3-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          phase1Data, 
          phase2Data 
        }),
      });

      if (!phase3Response.ok) {
        throw new Error('Phase 3 analysis failed');
      }

      const phase3Result = await phase3Response.json();
      setPhase3Data(phase3Result.data);

    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const renderPriority = (priority: string) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
    if (priority === 'high') variant = 'destructive';
    else if (priority === 'medium') variant = 'secondary';
    else variant = 'outline';

    return (
      <Badge variant={variant} className="ml-2">
        {priority}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phase 3: Comprehensive Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Strategic insights, recommendations, and implementation roadmap
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Strategic Analysis
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-500" />
            Start Phase 3 Analysis
          </CardTitle>
          <CardDescription>
            Generate comprehensive research, recommendations, and strategic roadmap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="url"
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow"
            />
            <Button 
              onClick={runPhase3Analysis} 
              disabled={loading || !url}
              className="min-w-[200px]"
            >
              {loading ? 'Analyzing...' : 'Run Phase 3 Analysis'}
            </Button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            {phase1Data && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-700 text-sm">Phase 1 ✓</span>
              </div>
            )}
            {phase2Data && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-700 text-sm">Phase 2 ✓</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {phase3Data && (
        <Tabs defaultValue="executive-summary" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
            <TabsTrigger value="what-works">What Works</TabsTrigger>
            <TabsTrigger value="what-doesnt">What Doesn't Work</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="executive-summary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {phase3Data.comprehensiveAnalysis?.executiveSummary ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Overall Assessment</h4>
                      <p className="text-sm">{phase3Data.comprehensiveAnalysis.executiveSummary.overallAssessment}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Key Strengths</h4>
                        <ul className="text-sm space-y-1">
                          {phase3Data.comprehensiveAnalysis.executiveSummary.keyStrengths?.map((strength: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Critical Gaps</h4>
                        <ul className="text-sm space-y-1">
                          {phase3Data.comprehensiveAnalysis.executiveSummary.criticalGaps?.map((gap: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No executive summary available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="what-works">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  What Is Working
                </CardTitle>
              </CardHeader>
              <CardContent>
                {phase3Data.comprehensiveAnalysis?.whatIsWorking ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Content Strengths</h4>
                        <div className="space-y-2">
                          {phase3Data.comprehensiveAnalysis.whatIsWorking.contentStrengths?.map((strength: any, i: number) => (
                            <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <h5 className="font-medium text-sm">{strength.area}</h5>
                              <p className="text-sm text-muted-foreground">{strength.strength}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Technical Strengths</h4>
                        <div className="space-y-2">
                          {phase3Data.comprehensiveAnalysis.whatIsWorking.technicalStrengths?.map((strength: any, i: number) => (
                            <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <h5 className="font-medium text-sm">{strength.area}</h5>
                              <p className="text-sm text-muted-foreground">{strength.strength}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No strengths analysis available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="what-doesnt">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  What Is Not Working
                </CardTitle>
              </CardHeader>
              <CardContent>
                {phase3Data.comprehensiveAnalysis?.whatIsNotWorking ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Content Gaps</h4>
                        <div className="space-y-2">
                          {phase3Data.comprehensiveAnalysis.whatIsNotWorking.contentGaps?.map((gap: any, i: number) => (
                            <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-sm">{gap.area}</h5>
                                <Badge variant={gap.severity === 'high' ? 'destructive' : gap.severity === 'medium' ? 'secondary' : 'outline'}>
                                  {gap.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{gap.gap}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Technical Issues</h4>
                        <div className="space-y-2">
                          {phase3Data.comprehensiveAnalysis.whatIsNotWorking.technicalIssues?.map((issue: any, i: number) => (
                            <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-sm">{issue.area}</h5>
                                <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'}>
                                  {issue.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{issue.issue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No issues analysis available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                  Recommended Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {phase3Data.comprehensiveAnalysis?.recommendedChanges ? (
                  <div className="space-y-4">
                    {phase3Data.comprehensiveAnalysis.recommendedChanges.map((rec: any, i: number) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{rec.title}</h5>
                          <div className="flex gap-2">
                            {renderPriority(rec.priority)}
                            <Badge variant="outline">
                              {rec.timeline}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Effort: </span>
                            {rec.effort}/10
                          </div>
                          <div>
                            <span className="font-medium">Impact: </span>
                            {rec.impact}/10
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recommendations available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quick-wins">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-orange-500" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {phase3Data.comprehensiveAnalysis?.quickWins ? (
                  <div className="space-y-4">
                    {phase3Data.comprehensiveAnalysis.quickWins.map((win: any, i: number) => (
                      <div key={i} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{win.title}</h5>
                          <Badge variant="outline">
                            {win.timeline}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{win.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Effort: </span>
                            {win.effort}/10
                          </div>
                          <div>
                            <span className="font-medium">Impact: </span>
                            {win.impact}/10
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No quick wins available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-purple-500" />
                  Implementation Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                {phase3Data.comprehensiveAnalysis?.implementationRoadmap ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Immediate (Next 2 weeks)</h4>
                        <ul className="text-sm space-y-1">
                          {phase3Data.comprehensiveAnalysis.implementationRoadmap.immediate?.map((action: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Short-term (Next month)</h4>
                        <ul className="text-sm space-y-1">
                          {phase3Data.comprehensiveAnalysis.implementationRoadmap.shortTerm?.map((action: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Medium-term (Next 3 months)</h4>
                        <ul className="text-sm space-y-1">
                          {phase3Data.comprehensiveAnalysis.implementationRoadmap.mediumTerm?.map((action: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Long-term (Next 6-12 months)</h4>
                        <ul className="text-sm space-y-1">
                          {phase3Data.comprehensiveAnalysis.implementationRoadmap.longTerm?.map((action: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No roadmap available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

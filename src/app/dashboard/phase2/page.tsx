/* eslint-disable no-console */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Target, Layers, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface Phase2Data {
  goldenCircle: any;
  elementsOfValue: any;
  b2bElements: any;
  cliftonStrengths: any;
  contentComparison: any;
}

export default function Phase2Page() {
  const [url, setUrl] = useState('');
  const [phase1Data, setPhase1Data] = useState<any>(null);
  const [phase2Data, setPhase2Data] = useState<Phase2Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPhase2Analysis = async () => {
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

      // Run Phase 2 analysis
      console.log('Running Phase 2 analysis...');
      const phase2Response = await fetch('/api/analyze/phase2-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          _url, 
          content: phase1Data?.scrapedContent,
          phase1Data 
        }),
      });

      if (!phase2Response.ok) {
        throw new Error('Phase 2 analysis failed');
      }

      const phase2Result = await phase2Response.json();
      setPhase2Data(phase2Result.data);

    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const renderScore = (score: number) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
    if (score >= 8) variant = 'default';
    else if (score >= 5) variant = 'secondary';
    else if (score > 0) variant = 'destructive';

    return (
      <Badge variant={variant} className="ml-2">
        {score.toFixed(1)}/10
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phase 2: Framework Analysis</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered analysis using proven business frameworks
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Framework Analysis
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-500" />
            Start Phase 2 Analysis
          </CardTitle>
          <CardDescription>
            Run comprehensive framework analysis using Golden Circle, Elements of Value, CliftonStrengths, and more.
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
              onClick={runPhase2Analysis} 
              disabled={loading || !url}
              className="min-w-[200px]"
            >
              {loading ? 'Analyzing...' : 'Run Phase 2 Analysis'}
            </Button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {phase1Data && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700">Phase 1 completed - {phase1Data.scrapedContent.wordCount} words extracted</span>
            </div>
          )}
        </CardContent>
      </Card>

      {phase2Data && (
        <Tabs defaultValue="golden-circle" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="golden-circle">Golden Circle</TabsTrigger>
            <TabsTrigger value="elements-value">Elements of Value</TabsTrigger>
            <TabsTrigger value="b2b-elements">B2B Elements</TabsTrigger>
            <TabsTrigger value="clifton-strengths">CliftonStrengths</TabsTrigger>
            <TabsTrigger value="content-comparison">Content Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="golden-circle">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  Golden Circle Analysis
                  {phase2Data.goldenCircle?.overallScore && renderScore(phase2Data.goldenCircle.overallScore)}
                </CardTitle>
                <CardDescription>
                  Simon Sinek&apos;s framework: Why, How, What, Who
                </CardDescription>
              </CardHeader>
              <CardContent>
                {phase2Data.goldenCircle ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">WHY (Purpose)</h4>
                        <p className="text-sm">{phase2Data.goldenCircle.why?.statement || 'Not analyzed'}</p>
                        {phase2Data.goldenCircle.why?.score && renderScore(phase2Data.goldenCircle.why.score)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">HOW (Methodology)</h4>
                        <p className="text-sm">{phase2Data.goldenCircle.how?.methodology || 'Not analyzed'}</p>
                        {phase2Data.goldenCircle.how?.score && renderScore(phase2Data.goldenCircle.how.score)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">WHAT (Offerings)</h4>
                        <p className="text-sm">{phase2Data.goldenCircle.what?.offerings?.join(', ') || 'Not analyzed'}</p>
                        {phase2Data.goldenCircle.what?.score && renderScore(phase2Data.goldenCircle.what.score)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">WHO (Audience)</h4>
                        <p className="text-sm">{phase2Data.goldenCircle.who?.targetAudience || 'Not analyzed'}</p>
                        {phase2Data.goldenCircle.who?.score && renderScore(phase2Data.goldenCircle.who.score)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No Golden Circle data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elements-value">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-6 w-6 text-green-500" />
                  Elements of Value (B2C)
                  {phase2Data.elementsOfValue?.overallScore && renderScore(phase2Data.elementsOfValue.overallScore)}
                </CardTitle>
                <CardDescription>
                  Harvard Business Review&apos;s 30 B2C value elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {phase2Data.elementsOfValue ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Functional Elements</h4>
                        <p className="text-sm">Score: {phase2Data.elementsOfValue.functional?.overallScore || 0}/10</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Emotional Elements</h4>
                        <p className="text-sm">Score: {phase2Data.elementsOfValue.emotional?.overallScore || 0}/10</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Life-Changing Elements</h4>
                        <p className="text-sm">Score: {phase2Data.elementsOfValue.lifeChanging?.overallScore || 0}/10</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No Elements of Value data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="b2b-elements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-500" />
                  B2B Elements of Value
                  {phase2Data.b2bElements?.overallScore && renderScore(phase2Data.b2bElements.overallScore)}
                </CardTitle>
                <CardDescription>
                  Harvard Business Review's 40 B2B value elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {phase2Data.b2bElements ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Table Stakes</h4>
                        <p className="text-sm">Score: {phase2Data.b2bElements.tableStakes?.overallScore || 0}/10</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Functional</h4>
                        <p className="text-sm">Score: {phase2Data.b2bElements.functional?.overallScore || 0}/10</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Ease of Business</h4>
                        <p className="text-sm">Score: {phase2Data.b2bElements.easeOfDoingBusiness?.overallScore || 0}/10</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Individual</h4>
                        <p className="text-sm">Score: {phase2Data.b2bElements.individual?.overallScore || 0}/10</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No B2B Elements data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clifton-strengths">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                  CliftonStrengths Analysis
                  {phase2Data.cliftonStrengths?.overallScore && renderScore(phase2Data.cliftonStrengths.overallScore)}
                </CardTitle>
                <CardDescription>
                  Gallup's 34-theme strengths assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {phase2Data.cliftonStrengths ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Strategic Thinking</h4>
                        <p className="text-sm">Score: {phase2Data.cliftonStrengths.strategicThinking?.overallScore || 0}/10</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Executing</h4>
                        <p className="text-sm">Score: {phase2Data.cliftonStrengths.executing?.overallScore || 0}/10</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Influencing</h4>
                        <p className="text-sm">Score: {phase2Data.cliftonStrengths.influencing?.overallScore || 0}/10</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Relationship Building</h4>
                        <p className="text-sm">Score: {phase2Data.cliftonStrengths.relationshipBuilding?.overallScore || 0}/10</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No CliftonStrengths data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content-comparison">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-6 w-6 text-indigo-500" />
                  Content Comparison Analysis
                  {phase2Data.contentComparison?.overallScore && renderScore(phase2Data.contentComparison.overallScore)}
                </CardTitle>
                <CardDescription>
                  Content quality and competitive positioning analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {phase2Data.contentComparison ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Content Quality</h4>
                        <p className="text-sm">Score: {phase2Data.contentComparison.contentQuality?.overallScore || 0}/10</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Competitive Positioning</h4>
                        <p className="text-sm">Score: {phase2Data.contentComparison.competitivePositioning?.overallScore || 0}/10</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No Content Comparison data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

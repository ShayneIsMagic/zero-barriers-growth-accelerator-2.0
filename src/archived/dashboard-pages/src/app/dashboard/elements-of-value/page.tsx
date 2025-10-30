/**
 * Elements of Value Analysis Page
 * Individual page for Elements of Value analysis (B2C & B2B)
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Clock,
  Download,
  ExternalLink,
  Target,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ElementScore {
  element_name: string;
  element_category: string;
  pyramid_level: number;
  score: number;
  evidence: {
    patterns: string[];
    citations: string[];
    confidence: number;
  };
}

interface ElementsAnalysis {
  overall_score: number;
  functional_score: number;
  emotional_score: number;
  life_changing_score: number;
  social_impact_score: number;
  elements: ElementScore[];
}

export default function ElementsOfValuePage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [b2cAnalysis, setB2cAnalysis] = useState<ElementsAnalysis | null>(null);
  const [b2bAnalysis, setB2bAnalysis] = useState<ElementsAnalysis | null>(null);
  const [_analysisId, _setAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b'>('b2c');

  const runAnalysis = async () => {
    if (!url) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Run Phase 1: Data Collection
      const phase1Response = await fetch('/api/analyze/phase-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, phase: 1 }),
      });

      if (!phase1Response.ok) {
        throw new Error('Phase 1 failed');
      }

      const phase1Data = await phase1Response.json();
      const newAnalysisId = phase1Data.analysisId;
      // setAnalysisId(newAnalysisId);

      // Run Phase 2: Framework Analysis (includes Elements of Value)
      const phase2Response = await fetch('/api/analyze/phase-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, phase: 2, analysisId: newAnalysisId }),
      });

      if (!phase2Response.ok) {
        throw new Error('Phase 2 failed');
      }

      // Fetch B2C Elements of Value analysis
      const b2cResponse = await fetch(
        `/api/analysis/elements-value-b2c/${newAnalysisId}`
      );
      if (b2cResponse.ok) {
        const b2cData = await b2cResponse.json();
        setB2cAnalysis(b2cData);
      }

      // Fetch B2B Elements of Value analysis
      const b2bResponse = await fetch(
        `/api/analysis/elements-value-b2b/${newAnalysisId}`
      );
      if (b2bResponse.ok) {
        const b2bData = await b2bResponse.json();
        setB2bAnalysis(b2bData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80)
      return <Badge className="bg-green-100 text-green-800">Strong</Badge>;
    if (score >= 60)
      return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>;
    return <Badge className="bg-red-100 text-red-800">Weak</Badge>;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'functional':
        return 'bg-blue-100 text-blue-800';
      case 'emotional':
        return 'bg-purple-100 text-purple-800';
      case 'life_changing':
        return 'bg-green-100 text-green-800';
      case 'social_impact':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderElementsTable = (analysis: ElementsAnalysis) => {
    const categories = {
      functional: analysis.elements.filter(
        (e) => e.element_category === 'functional'
      ),
      emotional: analysis.elements.filter(
        (e) => e.element_category === 'emotional'
      ),
      life_changing: analysis.elements.filter(
        (e) => e.element_category === 'life_changing'
      ),
      social_impact: analysis.elements.filter(
        (e) => e.element_category === 'social_impact'
      ),
    };

    return (
      <div className="space-y-6">
        {Object.entries(categories).map(([category, elements]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">
                  {category.replace('_', ' ')} Elements
                </span>
                <Badge className={getCategoryColor(category)}>
                  {elements.length} elements
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {elements.map((element, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium capitalize">
                        {element.element_name.replace(/_/g, ' ')}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(element.score)}`}
                        >
                          {element.score}
                        </span>
                        {getScoreBadge(element.score)}
                      </div>
                    </div>

                    <div className="mb-2 text-sm text-gray-600">
                      Pyramid Level {element.pyramid_level} • Confidence:{' '}
                      {(element.evidence.confidence * 100).toFixed(0)}%
                    </div>

                    {element.evidence.patterns.length > 0 && (
                      <div className="mb-2">
                        <div className="mb-1 text-sm font-medium">
                          Detected Patterns:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {element.evidence.patterns.map((pattern, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {element.evidence.citations.length > 0 && (
                      <div>
                        <div className="mb-1 text-sm font-medium">
                          Evidence:
                        </div>
                        <ul className="list-inside list-disc text-xs text-gray-600">
                          {element.evidence.citations.map((citation, i) => (
                            <li key={i}>{citation}</li>
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
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Elements of Value Analysis</h1>
        <p className="text-gray-600">
          Analyze your website&apos;s value proposition using Bain &
          Company&apos;s 30 B2C and 40 B2B value elements
        </p>
      </div>

      {!b2cAnalysis && !b2bAnalysis ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Start Elements of Value Analysis
            </CardTitle>
            <CardDescription>
              Enter your website URL to analyze your value proposition across
              all elements
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
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={runAnalysis}
              disabled={!url || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Elements of Value
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overall Scores */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {b2cAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>B2C Elements Score</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-3xl font-bold ${getScoreColor(b2cAnalysis.overall_score)}`}
                      >
                        {b2cAnalysis.overall_score}
                      </span>
                      {getScoreBadge(b2cAnalysis.overall_score)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {b2cAnalysis.functional_score}
                      </div>
                      <div className="text-sm text-gray-600">Functional</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {b2cAnalysis.emotional_score}
                      </div>
                      <div className="text-sm text-gray-600">Emotional</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {b2cAnalysis.life_changing_score}
                      </div>
                      <div className="text-sm text-gray-600">Life Changing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">
                        {b2cAnalysis.social_impact_score}
                      </div>
                      <div className="text-sm text-gray-600">Social Impact</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {b2bAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>B2B Elements Score</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-3xl font-bold ${getScoreColor(b2bAnalysis.overall_score)}`}
                      >
                        {b2bAnalysis.overall_score}
                      </span>
                      {getScoreBadge(b2bAnalysis.overall_score)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {b2bAnalysis.functional_score}
                      </div>
                      <div className="text-sm text-gray-600">Functional</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {b2bAnalysis.emotional_score}
                      </div>
                      <div className="text-sm text-gray-600">Emotional</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {b2bAnalysis.life_changing_score}
                      </div>
                      <div className="text-sm text-gray-600">Life Changing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">
                        {b2bAnalysis.social_impact_score}
                      </div>
                      <div className="text-sm text-gray-600">Social Impact</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Analysis Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'b2c' | 'b2b')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="b2c">B2C Elements (30)</TabsTrigger>
              <TabsTrigger value="b2b">B2B Elements (40)</TabsTrigger>
            </TabsList>

            <TabsContent value="b2c">
              {b2cAnalysis ? (
                renderElementsTable(b2cAnalysis)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">B2C analysis not available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="b2b">
              {b2bAnalysis ? (
                renderElementsTable(b2bAnalysis)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">B2B analysis not available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setB2cAnalysis(null);
                setB2bAnalysis(null);
              }}
              variant="outline"
            >
              Analyze Another Website
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Link href="/dashboard/analysis">
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                View All Analyses
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

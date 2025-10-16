/**
 * Golden Circle Analysis Page
 * Individual page for Golden Circle analysis with report viewing
 */

'use client';

import GoogleToolsPanel from '@/components/GoogleToolsPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Brain,
    Clock,
    Download,
    ExternalLink,
    Target,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface GoldenCircleAnalysis {
  overall_score: number;
  alignment_score: number;
  clarity_score: number;
  why: {
    statement: string;
    clarity_rating: number;
    authenticity_rating: number;
    emotional_resonance_rating: number;
    differentiation_rating: number;
    evidence: {
      citations: string[];
      key_phrases: string[];
    };
    recommendations: string[];
  };
  how: {
    statement: string;
    uniqueness_rating: number;
    clarity_rating: number;
    credibility_rating: number;
    specificity_rating: number;
    evidence: {
      citations: string[];
      key_phrases: string[];
    };
    recommendations: string[];
  };
  what: {
    statement: string;
    clarity_rating: number;
    completeness_rating: number;
    value_articulation_rating: number;
    cta_clarity_rating: number;
    evidence: {
      citations: string[];
      key_phrases: string[];
    };
    recommendations: string[];
  };
  who: {
    statement: string;
    target_personas: string[];
    specificity_rating: number;
    resonance_rating: number;
    accessibility_rating: number;
    conversion_path_rating: number;
    evidence: {
      citations: string[];
      key_phrases: string[];
    };
    recommendations: string[];
  };
}

export default function GoldenCirclePage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GoldenCircleAnalysis | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!url) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Run Phase 1: Data Collection
      const phase1Response = await fetch('/api/analyze/phase-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, phase: 1 })
      });

      if (!phase1Response.ok) {
        throw new Error('Phase 1 failed');
      }

      const phase1Data = await phase1Response.json();
      const newAnalysisId = phase1Data.analysisId;
      setAnalysisId(newAnalysisId);

      // Run Phase 2: Framework Analysis (includes Golden Circle)
      const phase2Response = await fetch('/api/analyze/phase-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, phase: 2, analysisId: newAnalysisId })
      });

      if (!phase2Response.ok) {
        throw new Error('Phase 2 failed');
      }

      // Fetch Golden Circle analysis
      const goldenCircleResponse = await fetch(`/api/analysis/golden-circle/${newAnalysisId}`);
      if (goldenCircleResponse.ok) {
        const goldenCircleData = await goldenCircleResponse.json();
        setAnalysis(goldenCircleData);
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
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Work</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Golden Circle Analysis</h1>
        <p className="text-gray-600">
          Analyze your website's WHY, HOW, WHAT, and WHO using Simon Sinek's framework
        </p>
      </div>

      {!analysis ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Start Golden Circle Analysis
            </CardTitle>
            <CardDescription>
              Enter your website URL to analyze your purpose, process, products, and people
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
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Golden Circle
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Golden Circle Score</span>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score}
                  </span>
                  {getScoreBadge(analysis.overall_score)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.alignment_score}</div>
                  <div className="text-sm text-gray-600">Alignment Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.clarity_score}</div>
                  <div className="text-sm text-gray-600">Clarity Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysis.overall_score}</div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Four Dimensions */}
          <Tabs defaultValue="why" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="why">WHY</TabsTrigger>
              <TabsTrigger value="how">HOW</TabsTrigger>
              <TabsTrigger value="what">WHAT</TabsTrigger>
              <TabsTrigger value="who">WHO</TabsTrigger>
            </TabsList>

            <TabsContent value="why">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>WHY - Purpose & Belief</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${getScoreColor(analysis.why.clarity_rating * 10)}`}>
                        {analysis.why.clarity_rating}
                      </span>
                      {getScoreBadge(analysis.why.clarity_rating * 10)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Statement:</h4>
                    <p className="text-gray-700">{analysis.why.statement}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Clarity</div>
                      <div className="font-bold">{analysis.why.clarity_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Authenticity</div>
                      <div className="font-bold">{analysis.why.authenticity_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Emotional Resonance</div>
                      <div className="font-bold">{analysis.why.emotional_resonance_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Differentiation</div>
                      <div className="font-bold">{analysis.why.differentiation_rating}/10</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Evidence:</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium">Key Phrases:</div>
                        <div className="flex flex-wrap gap-1">
                          {analysis.why.evidence.key_phrases.map((phrase, i) => (
                            <Badge key={i} variant="outline">{phrase}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Citations:</div>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {analysis.why.evidence.citations.map((citation, i) => (
                            <li key={i}>{citation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {analysis.why.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="how">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>HOW - Unique Process/Approach</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${getScoreColor(analysis.how.clarity_rating * 10)}`}>
                        {analysis.how.clarity_rating}
                      </span>
                      {getScoreBadge(analysis.how.clarity_rating * 10)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Statement:</h4>
                    <p className="text-gray-700">{analysis.how.statement}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Uniqueness</div>
                      <div className="font-bold">{analysis.how.uniqueness_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Clarity</div>
                      <div className="font-bold">{analysis.how.clarity_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Credibility</div>
                      <div className="font-bold">{analysis.how.credibility_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Specificity</div>
                      <div className="font-bold">{analysis.how.specificity_rating}/10</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Evidence:</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium">Key Phrases:</div>
                        <div className="flex flex-wrap gap-1">
                          {analysis.how.evidence.key_phrases.map((phrase, i) => (
                            <Badge key={i} variant="outline">{phrase}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Citations:</div>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {analysis.how.evidence.citations.map((citation, i) => (
                            <li key={i}>{citation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {analysis.how.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="what">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>WHAT - Products/Services</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${getScoreColor(analysis.what.clarity_rating * 10)}`}>
                        {analysis.what.clarity_rating}
                      </span>
                      {getScoreBadge(analysis.what.clarity_rating * 10)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Statement:</h4>
                    <p className="text-gray-700">{analysis.what.statement}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Clarity</div>
                      <div className="font-bold">{analysis.what.clarity_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Completeness</div>
                      <div className="font-bold">{analysis.what.completeness_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Value Articulation</div>
                      <div className="font-bold">{analysis.what.value_articulation_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">CTA Clarity</div>
                      <div className="font-bold">{analysis.what.cta_clarity_rating}/10</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Evidence:</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium">Key Phrases:</div>
                        <div className="flex flex-wrap gap-1">
                          {analysis.what.evidence.key_phrases.map((phrase, i) => (
                            <Badge key={i} variant="outline">{phrase}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Citations:</div>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {analysis.what.evidence.citations.map((citation, i) => (
                            <li key={i}>{citation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {analysis.what.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="who">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>WHO - Target Audience</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${getScoreColor(analysis.who.specificity_rating * 10)}`}>
                        {analysis.who.specificity_rating}
                      </span>
                      {getScoreBadge(analysis.who.specificity_rating * 10)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Statement:</h4>
                    <p className="text-gray-700">{analysis.who.statement}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Target Personas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.who.target_personas.map((persona, i) => (
                        <Badge key={i} variant="secondary">{persona}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Specificity</div>
                      <div className="font-bold">{analysis.who.specificity_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Resonance</div>
                      <div className="font-bold">{analysis.who.resonance_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Accessibility</div>
                      <div className="font-bold">{analysis.who.accessibility_rating}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Conversion Path</div>
                      <div className="font-bold">{analysis.who.conversion_path_rating}/10</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Evidence:</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium">Key Phrases:</div>
                        <div className="flex flex-wrap gap-1">
                          {analysis.who.evidence.key_phrases.map((phrase, i) => (
                            <Badge key={i} variant="outline">{phrase}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Citations:</div>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {analysis.who.evidence.citations.map((citation, i) => (
                            <li key={i}>{citation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {analysis.who.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => setAnalysis(null)} variant="outline">
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

      {/* Google Tools Panel */}
      <div className="mt-8">
        <GoogleToolsPanel url={url} />
      </div>
    </div>
  );
}

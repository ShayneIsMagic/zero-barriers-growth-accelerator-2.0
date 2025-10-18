/**
 * CliftonStrengths Analysis Page
 * Individual page for CliftonStrengths analysis with report viewing
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Brain,
    Clock,
    Download,
    ExternalLink,
    Users,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ThemeScore {
  theme_name: string;
  domain: string;
  score: number;
  evidence: {
    patterns: string[];
    citations: string[];
    confidence: number;
  };
  manifestation_description: string;
}

interface CliftonStrengthsAnalysis {
  overall_score: number;
  strategic_thinking_score: number;
  relationship_building_score: number;
  influencing_score: number;
  executing_score: number;
  themes: ThemeScore[];
}

export default function CliftonStrengthsPage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CliftonStrengthsAnalysis | null>(null);
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
        body: JSON.stringify({ _url, phase: 1 })
      });

      if (!phase1Response.ok) {
        throw new Error('Phase 1 failed');
      }

      const phase1Data = await phase1Response.json();
      const newAnalysisId = phase1Data.analysisId;
      setAnalysisId(newAnalysisId);

      // Run Phase 2: Framework Analysis (includes CliftonStrengths)
      const phase2Response = await fetch('/api/analyze/phase-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _url, phase: 2, analysisId: newAnalysisId })
      });

      if (!phase2Response.ok) {
        throw new Error('Phase 2 failed');
      }

      // Fetch CliftonStrengths analysis
      const cliftonResponse = await fetch(`/api/analysis/clifton-strengths/${newAnalysisId}`);
      if (cliftonResponse.ok) {
        const cliftonData = await cliftonResponse.json();
        setAnalysis(cliftonData);
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
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Strong</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>;
    return <Badge className="bg-red-100 text-red-800">Weak</Badge>;
  };

  const getDomainColor = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'strategic thinking': return 'bg-blue-100 text-blue-800';
      case 'relationship building': return 'bg-purple-100 text-purple-800';
      case 'influencing': return 'bg-orange-100 text-orange-800';
      case 'executing': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderThemesByDomain = (themes: ThemeScore[]) => {
    const domains = {
      'Strategic Thinking': themes.filter(t => t.domain === 'Strategic Thinking'),
      'Relationship Building': themes.filter(t => t.domain === 'Relationship Building'),
      'Influencing': themes.filter(t => t.domain === 'Influencing'),
      'Executing': themes.filter(t => t.domain === 'Executing')
    };

    return (
      <div className="space-y-6">
        {Object.entries(domains).map(([domain, domainThemes]) => (
          <Card key={domain}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{domain}</span>
                <Badge className={getDomainColor(domain)}>
                  {domainThemes.length} themes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {domainThemes
                  .sort((a, b) => b.score - a.score)
                  .map((theme, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">
                        {theme.theme_name.replace(/_/g, ' ')}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getScoreColor(theme.score)}`}>
                          {theme.score}
                        </span>
                        {getScoreBadge(theme.score)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      Confidence: {(theme.evidence.confidence * 100).toFixed(0)}%
                    </div>

                    <div className="text-sm text-gray-700 mb-3">
                      {theme.manifestation_description}
                    </div>

                    {theme.evidence.patterns.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm font-medium mb-1">Detected Patterns:</div>
                        <div className="flex flex-wrap gap-1">
                          {theme.evidence.patterns.map((pattern, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {theme.evidence.citations.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-1">Evidence:</div>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {theme.evidence.citations.map((citation, i) => (
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CliftonStrengths Analysis</h1>
        <p className="text-gray-600">
          Analyze your website&apos;s organizational strengths using Gallup&apos;s 34-theme framework
        </p>
      </div>

      {!analysis ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Start CliftonStrengths Analysis
            </CardTitle>
            <CardDescription>
              Enter your website URL to analyze your organizational strengths and themes
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
                  Analyze CliftonStrengths
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
                <span>Overall CliftonStrengths Score</span>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score}
                  </span>
                  {getScoreBadge(analysis.overall_score)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.strategic_thinking_score}</div>
                  <div className="text-sm text-gray-600">Strategic Thinking</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysis.relationship_building_score}</div>
                  <div className="text-sm text-gray-600">Relationship Building</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analysis.influencing_score}</div>
                  <div className="text-sm text-gray-600">Influencing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.executing_score}</div>
                  <div className="text-sm text-gray-600">Executing</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top 10 Strengths */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Strengths</CardTitle>
              <CardDescription>
                Your strongest themes based on website content analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.themes
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 10)
                  .map((theme, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium capitalize">
                          {theme.theme_name.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm text-gray-600">{theme.domain}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getScoreColor(theme.score)}`}>
                        {theme.score}
                      </span>
                      {getScoreBadge(theme.score)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis by Domain */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis by Domain</CardTitle>
              <CardDescription>
                Complete breakdown of all 34 themes across the four domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderThemesByDomain(analysis.themes)}
            </CardContent>
          </Card>

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
    </div>
  );
}

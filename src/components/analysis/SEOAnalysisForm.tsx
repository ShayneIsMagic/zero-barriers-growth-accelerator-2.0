'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AnalysisClient } from '@/lib/analysis-client';
import { SEOAnalysis } from '@/types/analysis';
import { AlertCircle, CheckCircle2, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import SEOAnalysisResults from './SEOAnalysisResults';

export default function SEOAnalysisForm() {
  const [url, setUrl] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [includeSearchConsole, setIncludeSearchConsole] = useState(true);
  const [includeKeywordResearch, setIncludeKeywordResearch] = useState(true);
  const [includeCompetitiveAnalysis, setIncludeCompetitiveAnalysis] =
    useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [timestamp, setTimestamp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Parse target keywords
      const keywords = targetKeywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      // Parse competitor URLs
      const _competitors = competitorUrls
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const response = await fetch('/api/analyze/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          targetKeywords: keywords.length > 0 ? keywords : undefined,
          competitorUrls: _competitors.length > 0 ? _competitors : undefined,
          includeSearchConsole,
          includeKeywordResearch,
          includeCompetitiveAnalysis,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'SEO analysis failed');
      }

      // Save to localStorage
      try {
        const analysisForStorage = {
          id: Date.now().toString(),
          url: url,
          overallScore: 75, // SEO analyses don't have overall scores, using default
          summary: 'SEO analysis completed',
          status: 'completed' as const,
          timestamp: data.timestamp || new Date().toISOString(),
          goldenCircle: {
            why: '',
            how: '',
            what: '',
            overallScore: 0,
            insights: [],
          },
          elementsOfValue: {
            functional: {},
            emotional: {},
            lifeChanging: {},
            socialImpact: {},
            overallScore: 0,
            insights: [],
          },
          cliftonStrengths: {
            themes: [],
            recommendations: [],
            overallScore: 0,
            insights: [],
          },
          recommendations: [],
        };

        AnalysisClient.saveAnalysis(analysisForStorage);
      } catch (_saveError) {
        // Failed to save SEO analysis - handled silently
      }

      setAnalysis(data.data);
      setTimestamp(data.timestamp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SEO analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAnalysis = async () => {
    if (!url) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch(
        `/api/analyze/seo?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Quick SEO analysis failed');
      }

      // Save to localStorage
      try {
        const analysisForStorage = {
          id: Date.now().toString(),
          url: url,
          overallScore: 75,
          summary: 'Quick SEO analysis completed',
          status: 'completed' as const,
          timestamp: data.timestamp || new Date().toISOString(),
          goldenCircle: {
            why: '',
            how: '',
            what: '',
            overallScore: 0,
            insights: [],
          },
          elementsOfValue: {
            functional: {},
            emotional: {},
            lifeChanging: {},
            socialImpact: {},
            overallScore: 0,
            insights: [],
          },
          cliftonStrengths: {
            themes: [],
            recommendations: [],
            overallScore: 0,
            insights: [],
          },
          recommendations: [],
        };

        AnalysisClient.saveAnalysis(analysisForStorage);
      } catch (_saveError) {
        // Failed to save quick SEO analysis - handled silently
      }

      setAnalysis(data.data);
      setTimestamp(data.timestamp);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Quick SEO analysis failed'
      );
    } finally {
      setLoading(false);
    }
  };

  if (analysis) {
    return (
      <SEOAnalysisResults analysis={analysis} url={url} timestamp={timestamp} />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-blue-600" />
            SEO Analysis Configuration
          </CardTitle>
          <CardDescription>
            Configure your SEO analysis following the practical workflow:
            <br />
            <strong>Search Console</strong> → <strong>Keyword Planner</strong> →{' '}
            <strong>Google Trends</strong> →{' '}
            <strong>Competitive Analysis</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url">Website URL *</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Enter the website URL you want to analyze for SEO performance
              </p>
            </div>

            {/* Target Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords (Optional)</Label>
              <Textarea
                id="keywords"
                value={targetKeywords}
                onChange={(e) => setTargetKeywords(e.target.value)}
                placeholder="salesforce consulting, crm implementation, business automation"
                className="w-full"
                rows={3}
              />
              <p className="text-sm text-gray-500">
                Comma-separated list of keywords you want to analyze (leave
                empty for automatic discovery)
              </p>
            </div>

            {/* Competitor URLs */}
            <div className="space-y-2">
              <Label htmlFor="competitors">Competitor URLs (Optional)</Label>
              <Textarea
                id="competitors"
                value={competitorUrls}
                onChange={(e) => setCompetitorUrls(e.target.value)}
                placeholder="https://competitor1.com, https://competitor2.com"
                className="w-full"
                rows={3}
              />
              <p className="text-sm text-gray-500">
                Comma-separated list of competitor websites to compare against
              </p>
            </div>

            {/* Analysis Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Analysis Components
              </Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="search-console"
                    checked={includeSearchConsole}
                    onCheckedChange={(checked) =>
                      setIncludeSearchConsole(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="search-console"
                    className="text-sm font-normal"
                  >
                    Search Console Analysis - Current keyword rankings and
                    performance
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="keyword-research"
                    checked={includeKeywordResearch}
                    onCheckedChange={(checked) =>
                      setIncludeKeywordResearch(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="keyword-research"
                    className="text-sm font-normal"
                  >
                    Keyword Research - Search volume and opportunity analysis
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="competitive-analysis"
                    checked={includeCompetitiveAnalysis}
                    onCheckedChange={(checked) =>
                      setIncludeCompetitiveAnalysis(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="competitive-analysis"
                    className="text-sm font-normal"
                  >
                    Competitive Analysis - Compare against reference sites
                  </Label>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading || !url}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing SEO...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Run Complete SEO Analysis
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleQuickAnalysis}
                disabled={loading || !url}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Quick Analysis
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Analysis Workflow Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            SEO Analysis Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                1
              </div>
              <h4 className="text-sm font-semibold">Search Console</h4>
              <p className="mt-1 text-xs text-gray-600">
                Analyze current keyword rankings and performance metrics
              </p>
            </div>

            <div className="rounded-lg border p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                2
              </div>
              <h4 className="text-sm font-semibold">Keyword Research</h4>
              <p className="mt-1 text-xs text-gray-600">
                Research search volume and identify new opportunities
              </p>
            </div>

            <div className="rounded-lg border p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                3
              </div>
              <h4 className="text-sm font-semibold">Google Trends</h4>
              <p className="mt-1 text-xs text-gray-600">
                Validate keyword trends and industry direction
              </p>
            </div>

            <div className="rounded-lg border p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                4
              </div>
              <h4 className="text-sm font-semibold">Competitive Analysis</h4>
              <p className="mt-1 text-xs text-gray-600">
                Compare against reference sites and identify gaps
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

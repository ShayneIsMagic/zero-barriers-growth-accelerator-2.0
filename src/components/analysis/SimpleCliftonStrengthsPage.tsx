/**
 * Simple CliftonStrengths Page
 * Follows the Content-Comparison pattern: URL input → Scrape → Analyze
 * No database dependencies, just direct AI analysis
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  CheckCircle, 
  Loader2, 
  Target, 
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { useState } from 'react';
import { ContentPreviewBox } from './ContentPreviewBox';

interface CliftonStrengthsData {
  overall_score: number;
  strategic_thinking_score: number;
  executing_score: number;
  influencing_score: number;
  relationship_building_score: number;
  dominant_domain: string;
  top_5_themes: Array<{
    theme_name: string;
    domain: string;
    score: number;
    evidence: string[];
    manifestation: string;
  }>;
  all_themes: Array<{
    theme_name: string;
    domain: string;
    score: number;
    evidence: string[];
  }>;
  recommendations: Array<{
    theme: string;
    action: string;
    impact: string;
  }>;
}

export function SimpleCliftonStrengthsPage() {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<any>(null);
  const [result, setResult] = useState<CliftonStrengthsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrapeContent = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsScraping(true);
    setError(null);
    setScrapedContent(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setScrapedContent(data.data);
        console.log('✅ Content scraped successfully');
      } else {
        throw new Error(data.error || 'Failed to scrape content');
      }
    } catch (error) {
      console.error('❌ Content scraping failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to scrape content');
    } finally {
      setIsScraping(false);
    }
  };

  const handleAnalyze = async () => {
    if (!scrapedContent) {
      setError('Please scrape content first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/clifton-strengths-standalone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          scrapedContent
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        console.log('✅ CliftonStrengths analysis completed');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ CliftonStrengths analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'Strategic Thinking': return <Brain className="h-5 w-5 text-blue-600" />;
      case 'Executing': return <Zap className="h-5 w-5 text-green-600" />;
      case 'Influencing': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case 'Relationship Building': return <Users className="h-5 w-5 text-orange-600" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'Strategic Thinking': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/10';
      case 'Executing': return 'border-green-200 bg-green-50 dark:bg-green-900/10';
      case 'Influencing': return 'border-purple-200 bg-purple-50 dark:bg-purple-900/10';
      case 'Relationship Building': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/10';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            CliftonStrengths Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover your organization's dominant strengths and cultural patterns
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-6 w-6 text-blue-600" />
              Enter Website URL
            </CardTitle>
            <CardDescription>
              Enter your website URL to analyze organizational strengths using the CliftonStrengths framework
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website-url">Website URL</Label>
              <Input
                id="website-url"
                name="website-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScraping || isAnalyzing}
                aria-label="Enter website URL to analyze"
                aria-describedby="url-help"
                required
              />
              <p id="url-help" className="text-xs text-muted-foreground mt-1">
                Enter the URL of the website you want to analyze for organizational strengths
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleScrapeContent}
                disabled={isScraping || !url.trim()}
                className="w-full"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping Website Content...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Step 1: Scrape Content
                  </>
                )}
              </Button>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !scrapedContent}
                className="w-full"
                variant="outline"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing CliftonStrengths...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Step 2: Analyze Strengths
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Scraped Content Preview */}
        {scrapedContent && (
          <ContentPreviewBox
            scrapedContent={scrapedContent}
            url={url}
            title="CliftonStrengths Analysis - Scraped Content Preview"
            description="Content successfully scraped from the website. Review the data before running CliftonStrengths analysis."
          />
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Overall Scores */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                  CliftonStrengths Analysis Results
                </CardTitle>
                <CardDescription>
                  Organizational strengths analysis for {url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <p className="text-3xl font-bold text-green-600">{result.overall_score}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <p className="text-3xl font-bold text-blue-600">{result.strategic_thinking_score}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Strategic Thinking</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <p className="text-3xl font-bold text-green-600">{result.executing_score}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Executing</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <p className="text-3xl font-bold text-purple-600">{result.influencing_score}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Influencing</p>
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <p className="text-2xl font-bold text-orange-600">{result.relationship_building_score}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Relationship Building</p>
                </div>

                <div className="mt-4 text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Dominant Domain: {result.dominant_domain}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Themes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-6 w-6 text-blue-600" />
                  Top 5 CliftonStrengths Themes
                </CardTitle>
                <CardDescription>
                  The organization's strongest themes based on content analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.top_5_themes.map((theme, index) => (
                    <Card key={index} className={`border-l-4 ${getDomainColor(theme.domain)}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getDomainIcon(theme.domain)}
                            <h3 className="font-semibold text-lg">{theme.theme_name}</h3>
                            <Badge variant="outline">{theme.domain}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{theme.score}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {theme.manifestation}
                        </p>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Evidence from content:
                          </p>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {theme.evidence.map((evidence, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{evidence}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-6 w-6 text-yellow-600" />
                    Recommendations
                  </CardTitle>
                  <CardDescription>
                    Actionable strategies to leverage your organizational strengths
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                      <Card key={index} className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                                <span className="text-yellow-600 font-bold text-sm">{index + 1}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {rec.theme}
                              </h4>
                              <p className="text-gray-700 dark:text-gray-300 mb-2">
                                {rec.action}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Impact:</strong> {rec.impact}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

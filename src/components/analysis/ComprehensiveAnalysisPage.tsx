'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
  RefreshCw
} from 'lucide-react';
import { WebsiteAnalysisForm } from './WebsiteAnalysisForm';
import { WebsiteAnalysisResults } from './WebsiteAnalysisResults';
import { LighthouseAnalysisResults } from './LighthouseAnalysisResults';
import { AnalysisClient } from '@/lib/analysis-client';

interface ComprehensiveAnalysisResult {
  // Base analysis results
  goldenCircle?: any;
  elementsOfValue?: any;
  b2bElements?: any;
  cliftonStrengths?: any;
  overallScore?: number;
  
  // Additional analysis results
  pageAuditAnalysis?: any;
  lighthouseAnalysis?: any;
  allPagesLighthouse?: any[];
  
  // Gemini insights
  geminiInsights?: {
    executiveSummary: string;
    keyStrengths: string[];
    criticalWeaknesses: string[];
    competitiveAdvantages: string[];
    transformationOpportunities: string[];
    implementationRoadmap: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    successMetrics: {
      current: string[];
      target: string[];
      measurement: string[];
    };
  };
  
  createdAt?: string;
}

export default function ComprehensiveAnalysisPage() {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComprehensiveAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          keyword: keyword.trim() || undefined,
          includePageAudit: true,
          includeLighthouse: true,
          includeAllPages: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed');
      }

      // Save to localStorage
      try {
        const analysisForStorage = {
          id: data.data.id || Date.now().toString(),
          url: _url,
          overallScore: data.data.overallScore || 0,
          summary: data.data.geminiInsights?.executiveSummary || 'Comprehensive analysis completed',
          status: 'completed' as const,
          timestamp: data.data.createdAt || new Date().toISOString(),
          goldenCircle: data.data.goldenCircle || { why: '', how: '', what: '', overallScore: 0, insights: [] },
          elementsOfValue: data.data.elementsOfValue || { functional: {}, emotional: {}, lifeChanging: {}, socialImpact: {}, overallScore: 0, insights: [] },
          cliftonStrengths: data.data.cliftonStrengths || { themes: [], recommendations: [], overallScore: 0, insights: [] },
          recommendations: []
        };
        
        AnalysisClient.saveAnalysis(analysisForStorage);
        console.log('✅ Comprehensive analysis saved to localStorage');
      } catch (saveError) {
        console.error('Failed to save comprehensive analysis:', saveError);
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Comprehensive Analysis
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Deep strategic analysis combining all frameworks and tools
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Form */}
      <Card className="mb-8 border-2 border-gradient-to-r from-blue-500/20 to-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Analysis Configuration
          </CardTitle>
          <CardDescription>
            Configure your comprehensive analysis with all available tools and frameworks
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
                disabled={isAnalyzing}
                className="w-full"
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
                disabled={isAnalyzing}
                className="w-full"
              />
            </div>
          </div>

          {/* Analysis Tools Preview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium">Golden Circle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium">Elements of Value</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium">Lighthouse</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-orange-100 dark:bg-orange-900 rounded">
                <Search className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium">PageAudit</span>
            </div>
          </div>

          <Button 
            onClick={handleAnalysis} 
            disabled={isAnalyzing || !url.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Comprehensive Analysis...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Start Comprehensive Analysis
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200 font-medium">Analysis Failed</span>
              </div>
              <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {/* Executive Summary */}
          {result.geminiInsights && (
            <Card className="border-2 border-gradient-to-r from-blue-500/20 to-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Executive Summary
                </CardTitle>
                <CardDescription>
                  AI-powered strategic insights combining all analysis frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed whitespace-pre-line">
                    {result.geminiInsights.executiveSummary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Overall Performance Scores
              </CardTitle>
              <CardDescription>
                Comprehensive scoring across all frameworks and tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Base Analysis Score */}
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(result.overallScore || 0)}`}>
                    {result.overallScore || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Base Analysis</div>
                  <Badge variant={getScoreBadgeVariant(result.overallScore || 0)} className="mt-2">
                    {result.overallScore && result.overallScore >= 80 ? 'Excellent' : 
                     result.overallScore && result.overallScore >= 60 ? 'Good' : 'Needs Work'}
                  </Badge>
                </div>

                {/* PageAudit Score */}
                {result.pageAuditAnalysis && (
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Search className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(result.pageAuditAnalysis.scores?.overall || 0)}`}>
                      {result.pageAuditAnalysis.scores?.overall || 0}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">PageAudit</div>
                    <Badge variant={getScoreBadgeVariant(result.pageAuditAnalysis.scores?.overall || 0)} className="mt-2">
                      SEO & Technical
                    </Badge>
                  </div>
                )}

                {/* Lighthouse Score */}
                {result.lighthouseAnalysis && (
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(result.lighthouseAnalysis.scores?.overall || 0)}`}>
                      {result.lighthouseAnalysis.scores?.overall || 0}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Lighthouse</div>
                    <Badge variant={getScoreBadgeVariant(result.lighthouseAnalysis.scores?.overall || 0)} className="mt-2">
                      Performance
                    </Badge>
                  </div>
                )}

                {/* Combined Score */}
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {Math.round((
                      (result.overallScore || 0) + 
                      (result.pageAuditAnalysis?.scores?.overall || 0) + 
                      (result.lighthouseAnalysis?.scores?.overall || 0)
                    ) / 3)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Combined</div>
                  <Badge variant="default" className="mt-2 bg-green-600">
                    Comprehensive
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
              <TabsTrigger value="pageaudit">PageAudit</TabsTrigger>
              <TabsTrigger value="lighthouse">Lighthouse</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {result.geminiInsights && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Key Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Key Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.geminiInsights.keyStrengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Critical Weaknesses */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Critical Weaknesses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.geminiInsights.criticalWeaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Competitive Advantages */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        Competitive Advantages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.geminiInsights.competitiveAdvantages.map((advantage, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Star className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Transformation Opportunities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        Transformation Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.geminiInsights.transformationOpportunities.map((opportunity, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Frameworks Tab */}
            <TabsContent value="frameworks">
              <WebsiteAnalysisResults result={result as any} />
            </TabsContent>

            {/* PageAudit Tab */}
            <TabsContent value="pageaudit">
              {result.pageAuditAnalysis && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-orange-600" />
                        PageAudit Analysis Results
                      </CardTitle>
                      <CardDescription>
                        Comprehensive SEO and technical analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {result.pageAuditAnalysis.scores?.seo || 0}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">SEO</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {result.pageAuditAnalysis.scores?.technical || 0}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Technical</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {result.pageAuditAnalysis.scores?.content || 0}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Content</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {result.pageAuditAnalysis.scores?.accessibility || 0}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Accessibility</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Lighthouse Tab */}
            <TabsContent value="lighthouse">
              {result.lighthouseAnalysis && (
                <LighthouseAnalysisResults analysis={result.lighthouseAnalysis} />
              )}
            </TabsContent>

            {/* Roadmap Tab */}
            <TabsContent value="roadmap">
              {result.geminiInsights && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Immediate Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-red-600" />
                          Immediate (Week 1-2)
                        </CardTitle>
                        <CardDescription>
                          Quick wins and urgent fixes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.geminiInsights.implementationRoadmap.immediate.map((action, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Short Term Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-yellow-600" />
                          Short Term (Month 1-3)
                        </CardTitle>
                        <CardDescription>
                          Strategic improvements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.geminiInsights.implementationRoadmap.shortTerm.map((action, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Long Term Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-green-600" />
                          Long Term (Month 4-12)
                        </CardTitle>
                        <CardDescription>
                          Transformation initiatives
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.geminiInsights.implementationRoadmap.longTerm.map((action, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics">
              {result.geminiInsights && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Current Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          Current Metrics
                        </CardTitle>
                        <CardDescription>
                          Baseline measurements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.geminiInsights.successMetrics.current.map((metric, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm">{metric}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Target Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-600" />
                          Target Metrics
                        </CardTitle>
                        <CardDescription>
                          Goals and objectives
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.geminiInsights.successMetrics.target.map((metric, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm">{metric}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Measurement Methods */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          Measurement Methods
                        </CardTitle>
                        <CardDescription>
                          How to track progress
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.geminiInsights.successMetrics.measurement.map((method, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm">{method}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Analysis Metadata */}
          <Card className="bg-slate-50 dark:bg-slate-900/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span>Analysis completed: {result.createdAt && formatDate(result.createdAt)}</span>
                  <span>•</span>
                  <span>URL: {url}</span>
                  {keyword && (
                    <>
                      <span>•</span>
                      <span>Keyword: {keyword}</span>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

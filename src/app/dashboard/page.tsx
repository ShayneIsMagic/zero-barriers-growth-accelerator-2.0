'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, BarChart3, Users, ArrowRight, History, Settings, ExternalLink, Calendar, Brain, Zap, Settings2, FileText, Search, Clock, Shield } from 'lucide-react';
import Link from 'next/link';
import { AnalysisClient, AnalysisResult } from '@/lib/analysis-client';
import AnalysisProgressWidget from '@/components/analysis/AnalysisProgressWidget';

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Start with false for testing

  useEffect(() => {
    // Load saved analyses from localStorage - handle client-side only
    if (typeof window !== 'undefined') {
      try {
        const savedAnalyses = AnalysisClient.getAnalyses();
        setAnalyses(savedAnalyses);
        setRecentAnalyses(savedAnalyses.slice(0, 3));
      } catch (error) {
        console.error('Error loading analyses:', error);
        setAnalyses([]);
        setRecentAnalyses([]);
      }
    }
    setIsLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Loading your dashboard...
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive website analysis and optimization platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Analyses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyses.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Analyses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyses.filter(a => a.status === 'running').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyses.filter(a => a.status === 'completed').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Reports Generated</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyses.filter(a => a.status === 'completed').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Analysis */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <Search className="h-5 w-5 text-white" />
                </div>
                Unified Analysis Center
              </CardTitle>
              <CardDescription>
                All analysis tools organized by what works best
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Golden Circle Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Elements of Value</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>CliftonStrengths</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>SEO Analysis</span>
                </div>
              </div>
              <Link href="/dashboard/analysis">
                <Button className="w-full">
                  Start Quick Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Comprehensive Analysis */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Step-by-Step Analysis
              </CardTitle>
              <CardDescription>
                Complete 3-phase analysis pipeline with all tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Phase 1</Badge>
                  <span>Data Collection & Technical Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Phase 2</Badge>
                  <span>Framework Analysis & AI Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Phase 3</Badge>
                  <span>Strategic Recommendations</span>
                </div>
              </div>
              <Link href="/dashboard/step-by-step-execution">
                <Button className="w-full" variant="outline">
                  Execute Full Pipeline
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enhanced Analysis */}
          <Card className="hover:shadow-lg transition-shadow border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Enhanced Analysis
              </CardTitle>
              <CardDescription>
                Thorough analysis with comprehensive content collection and actionable deliverables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>No demo data - Real AI analysis only</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Comprehensive content collection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Exact quotes and evidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Actionable implementation roadmap</span>
                </div>
              </div>
              <Link href="/dashboard/enhanced-analysis">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Start Enhanced Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                Lighthouse Analysis
              </CardTitle>
              <CardDescription>
                Performance, SEO, Accessibility, Best Practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/lighthouse-analysis">
                <Button variant="outline" className="w-full">
                  Run Lighthouse
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                SEO Analysis
              </CardTitle>
              <CardDescription>
                Google Search Console, Keyword Planner, Trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/seo-analysis">
                <Button variant="outline" className="w-full">
                  SEO Analysis
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                Executive Reports
              </CardTitle>
              <CardDescription>
                Generate comprehensive markdown reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/executive-reports">
                <Button variant="outline" className="w-full">
                  Generate Report
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnalyses.map((analysis, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${
                        analysis.status === 'completed' ? 'bg-green-500' :
                        analysis.status === 'running' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{analysis.url}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(analysis.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        analysis.status === 'completed' ? 'default' :
                        analysis.status === 'running' ? 'secondary' :
                        'destructive'
                      }>
                        {analysis.status}
                      </Badge>
                      {analysis.status === 'completed' && (
                        <Link href={`/dashboard/analysis/${analysis.id}`}>
                          <Button size="sm" variant="outline">
                            View Report
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Widget */}
        <AnalysisProgressWidget />
      </div>
    </div>
  );
}
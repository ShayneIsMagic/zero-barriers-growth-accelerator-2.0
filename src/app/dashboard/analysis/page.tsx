/**
 * Unified Analysis Dashboard
 * Consolidates all working analysis systems into one organized interface
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  BarChart3, 
  Users, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  ExternalLink,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function UnifiedAnalysisDashboard() {
  const [url, setUrl] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('website');

  const analysisOptions = [
    {
      id: 'website',
      title: 'Website Analysis',
      subtitle: '🎯 RECOMMENDED FIRST',
      description: 'Complete AI-powered business framework analysis - perfect for understanding your website\'s strategic positioning and value proposition',
      icon: Brain,
      status: 'working',
      route: '/dashboard/website-analysis',
      recommendedOrder: 1,
      bestFor: 'Business owners, marketers, and consultants who want to understand their website\'s strategic value',
      whatYouGet: [
        'Golden Circle Analysis - Your WHY, HOW, WHAT, and WHO',
        'Elements of Value Assessment - 30 B2C + 40 B2B value elements',
        'CliftonStrengths Analysis - 34 themes of organizational excellence',
        'Lighthouse Performance Score',
        'Actionable recommendations with evidence'
      ],
      whyChooseThis: 'This analysis reveals how well your website communicates your core business value and attracts your ideal customers.',
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL',
      outcome: 'Strategic business insights and value proposition clarity'
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Analysis',
      subtitle: '🚀 MOST THOROUGH',
      description: 'Advanced multi-tool analysis combining AI frameworks with technical SEO audits, performance analysis, and market intelligence',
      icon: Target,
      status: 'working',
      route: '/dashboard/comprehensive-analysis',
      recommendedOrder: 2,
      bestFor: 'SEO professionals, web developers, and businesses wanting complete technical + strategic analysis',
      whatYouGet: [
        'Everything from Website Analysis PLUS:',
        'PageAudit Technical SEO Audit (40+ technical checks)',
        'Lighthouse Performance Analysis (Core Web Vitals)',
        'Google Trends Market Intelligence',
        'All Pages Performance Analysis',
        'Comprehensive Technical Report'
      ],
      whyChooseThis: 'Most complete analysis available - combines strategic business insights with technical optimization recommendations.',
      estimatedTime: '5-7 minutes',
      complexity: 'Advanced',
      prerequisites: 'Complete Website Analysis first for best results',
      outcome: 'Complete technical and strategic optimization roadmap'
    },
    {
      id: 'seo',
      title: 'SEO Analysis',
      subtitle: '📈 SPECIALIZED',
      description: 'Focused SEO analysis with Google Trends integration and competitive keyword research framework',
      icon: TrendingUp,
      status: 'partial',
      route: '/dashboard/seo-analysis',
      recommendedOrder: 3,
      bestFor: 'SEO specialists and marketers focused on search visibility and keyword strategy',
      whatYouGet: [
        'Google Trends Analysis (real-time data)',
        'Technical SEO Audit Framework',
        'Keyword Research Structure',
        'Competitive Analysis Framework',
        'SEO Optimization Recommendations'
      ],
      whyChooseThis: 'Specialized tool for SEO professionals who need focused search engine optimization insights.',
      estimatedTime: '3-4 minutes',
      complexity: 'Intermediate',
      prerequisites: 'Basic understanding of SEO concepts',
      outcome: 'SEO strategy and technical optimization plan'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Working</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⚠️ Partial</Badge>;
      case 'broken':
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Broken</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getComplexityBadge = (complexity: string) => {
    const colors = {
      'Beginner': 'bg-blue-100 text-blue-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[complexity as keyof typeof colors] || 'bg-gray-100'}>{complexity}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Unified Analysis Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Choose the right analysis tool for your needs. All systems use real AI analysis with no demo data.
        </p>
      </div>

      {/* Quick URL Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Analysis</span>
          </CardTitle>
          <CardDescription>
            Enter a URL to start analyzing with the recommended tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-url">Website URL</Label>
            <Input
              id="quick-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              asChild
              disabled={!url.trim()}
              className="flex-1"
            >
              <Link href={`/dashboard/website-analysis?url=${encodeURIComponent(url)}`}>
                <Brain className="h-4 w-4 mr-2" />
                Start Website Analysis
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              disabled={!url.trim()}
              className="flex-1"
            >
              <Link href={`/dashboard/comprehensive-analysis?url=${encodeURIComponent(url)}`}>
                <Target className="h-4 w-4 mr-2" />
                Advanced Analysis
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Order Guide */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Recommended Analysis Order</span>
          </CardTitle>
          <CardDescription>
            Follow this sequence for the most comprehensive and actionable insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisOptions
              .sort((a, b) => a.recommendedOrder - b.recommendedOrder)
              .map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div key={option.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {option.recommendedOrder}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{option.title}</h3>
                        <Badge variant="outline" className="text-xs">{option.subtitle}</Badge>
                        {getStatusBadge(option.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{option.whyChooseThis}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>⏱️ {option.estimatedTime}</span>
                        <span>🎯 {option.complexity}</span>
                        <span>📋 {option.prerequisites}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button asChild size="sm">
                        <Link href={option.route}>
                          <IconComponent className="h-4 w-4 mr-1" />
                          Start
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Options */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {analysisOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Card key={option.id} className={`relative ${option.recommendedOrder === 1 ? 'ring-2 ring-green-500' : ''}`}>
              {option.recommendedOrder === 1 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  RECOMMENDED
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">{option.subtitle}</Badge>
                        {getStatusBadge(option.status)}
                        {getComplexityBadge(option.complexity)}
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {option.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Best For */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Best For:</h4>
                  <p className="text-sm text-gray-600">{option.bestFor}</p>
                </div>

                {/* What You Get */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">What You Get:</h4>
                  <ul className="space-y-1">
                    {option.whatYouGet.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Why Choose This */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-900 mb-1">Why Choose This:</h4>
                  <p className="text-sm text-blue-800">{option.whyChooseThis}</p>
                </div>

                {/* Outcome */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Outcome:</h4>
                  <p className="text-sm text-gray-600 font-medium">{option.outcome}</p>
                </div>

                {/* Timing and Prerequisites */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="font-medium">Time:</span>
                    </div>
                    <span className="text-gray-700">{option.estimatedTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="font-medium">Prerequisites:</span>
                    </div>
                    <span className="text-gray-700">{option.prerequisites}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  asChild 
                  className="w-full"
                  variant={option.status === 'working' ? 'default' : 'outline'}
                  size="lg"
                >
                  <Link href={option.route}>
                    <IconComponent className="h-4 w-4 mr-2" />
                    {option.status === 'working' ? 'Start Analysis' : 'View Details'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Journey Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Choose Your Analysis Journey</span>
          </CardTitle>
          <CardDescription>
            Select the path that best matches your role and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Business Owner Journey */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">👔</span>
                </div>
                <h3 className="font-semibold">Business Owner</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2">1</span>
                  <span>Start with <strong>Website Analysis</strong></span>
                </div>
                <div className="flex items-center text-gray-500 ml-8">
                  <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                  <span>Get strategic business insights</span>
                </div>
                <div className="flex items-center text-gray-500 ml-8">
                  <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                  <span>Understand your value proposition</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center mr-2">2</span>
                  <span>Optional: <strong>Comprehensive Analysis</strong></span>
                </div>
                <div className="flex items-center text-gray-500 ml-8">
                  <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                  <span>For technical optimization needs</span>
                </div>
              </div>
              <Button asChild className="w-full mt-3" size="sm">
                <Link href="/dashboard/website-analysis">Start Website Analysis</Link>
              </Button>
            </div>

            {/* SEO Professional Journey */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🔍</span>
                </div>
                <h3 className="font-semibold">SEO Professional</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2">1</span>
                  <span>Start with <strong>Website Analysis</strong></span>
                </div>
                <div className="flex items-center text-gray-500 ml-8">
                  <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                  <span>Understand business context</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2">2</span>
                  <span>Then <strong>Comprehensive Analysis</strong></span>
                </div>
                <div className="flex items-center text-gray-500 ml-8">
                  <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                  <span>Technical SEO + performance audit</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center mr-2">3</span>
                  <span>Optional: <strong>SEO Analysis</strong></span>
                </div>
                <div className="flex items-center text-gray-500 ml-8">
                  <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                  <span>For specialized keyword research</span>
                </div>
              </div>
              <Button asChild className="w-full mt-3" size="sm" variant="outline">
                <Link href="/dashboard/comprehensive-analysis">Start Comprehensive Analysis</Link>
              </Button>
            </div>

            {/* Web Developer Journey */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚡</span>
                </div>
                <h3 className="font-semibold">Web Developer</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2">1</span>
                  <span>Start with <strong>Comprehensive Analysis</strong></span>
                </div>
                <div className="flex items-center text-gray-500 ml-8">
                  <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                  <span>Get technical + performance insights</span>
                </div>
                <div className="flex items-center text-gray-500 ml-8">
                  <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                  <span>PageAudit + Lighthouse analysis</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center mr-2">2</span>
                  <span>Optional: <strong>Website Analysis</strong></span>
                </div>
                <div className="flex items-center text-gray-500 ml-8">
                  <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                  <span>For business context understanding</span>
                </div>
              </div>
              <Button asChild className="w-full mt-3" size="sm" variant="outline">
                <Link href="/dashboard/comprehensive-analysis">Start Comprehensive Analysis</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-600">Fully Working</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="text-sm text-gray-600">Partially Working</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">5</div>
              <div className="text-sm text-gray-600">Under Development</div>
            </div>
          </div>
          
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick Start:</strong> Most users should begin with <strong>Website Analysis</strong> for strategic insights, 
              then optionally add <strong>Comprehensive Analysis</strong> for technical optimization.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Analysis Reports</CardTitle>
          <CardDescription>
            View and download your recent analysis reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent reports found</p>
            <p className="text-sm">Start an analysis to see your reports here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

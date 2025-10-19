'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart3,
    Bot,
    Brain,
    CheckCircle,
    Clock,
    ExternalLink,
    Globe,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardPage() {
  const [_url, _setUrl] = useState('');

  const workingAssessments = [
    {
      id: 'value-centric-b2c',
      name: 'Value-Centric Analysis (B2C)',
      status: 'ready',
      description: 'Analyze your website using B2C Elements of Value framework - perfect for consumer-focused businesses',
      icon: Users,
      route: '/dashboard/elements-value-b2c',
      whatYouGet: [
        '30 B2C Elements of Value analysis',
        'Revenue opportunity identification',
        'Premium pricing strategy recommendations',
        'Customer satisfaction optimization insights'
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL'
    },
    {
      id: 'value-centric-b2b',
      name: 'Value-Centric Analysis (B2B)',
      status: 'ready',
      description: 'Analyze your website using B2B Elements of Value framework - perfect for enterprise and B2B businesses',
      icon: BarChart3,
      route: '/dashboard/elements-value-b2b',
      whatYouGet: [
        '40 B2B Elements of Value analysis',
        'Enterprise value proposition optimization',
        'Sales enablement recommendations',
        'Customer retention strategy insights'
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL'
    },
    {
      id: 'unified-analysis',
      name: 'Unified Analysis (All Frameworks)',
      status: 'ready',
      description: 'Run multiple analyses from a single website scrape - Golden Circle, B2C/B2B Elements of Value, and CliftonStrengths',
      icon: Zap,
      route: '/dashboard/unified-analysis',
      whatYouGet: [
        'Single scrape for multiple analyses',
        'Golden Circle, B2C Elements, B2B Elements, CliftonStrengths',
        'Comprehensive report combining all insights',
        'Parallel processing for faster results',
        'Choose which analyses to run'
      ],
      estimatedTime: '3-5 minutes',
      complexity: 'Intermediate',
      prerequisites: 'None - just enter your website URL'
    },
    {
      id: 'multi-page-scraping',
      name: 'Multi-Page Content Scraping',
      status: 'ready',
      description: 'Discover and scrape content from multiple pages across a website for comprehensive analysis',
      icon: Globe,
      route: '/dashboard/multi-page-scraping',
      whatYouGet: [
        'Automatic page discovery (blog, products, about, services)',
        'Comprehensive content analysis across all pages',
        'Content theme identification and categorization',
        'Enhanced keyword and heading extraction',
        'Configurable scraping options and depth control'
      ],
      estimatedTime: '5-10 minutes',
      complexity: 'Intermediate',
      prerequisites: 'None - just enter your website URL'
    },
    {
      id: 'google-tools',
      name: 'Google Tools Analysis',
      status: 'ready',
      description: 'Access Google Tools directly and analyze data using AI-powered insights - no APIs needed',
      icon: TrendingUp,
      route: '/dashboard/google-tools',
      whatYouGet: [
        'Direct links to Google Trends, Analytics, Search Console, PageSpeed',
        'PTCF framework prompts for each tool',
        'Manual data input and AI analysis',
        'Revenue-focused insights and recommendations',
        'No API setup required - just paste data'
      ],
      estimatedTime: '5-10 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL and paste data'
    },
    {
      id: 'automated-google-tools',
      name: 'Automated Google Tools Analysis',
      status: 'ready',
      description: 'Automatically scrape Google Tools data using Puppeteer and get AI analysis - fully automated!',
      icon: Bot,
      route: '/dashboard/automated-google-tools',
      whatYouGet: [
        'Automated data extraction from Google Trends, PageSpeed, Search Console',
        'Direct tool links + automated scraping in one place',
        'AI-powered analysis of scraped data',
        'Download scraped data as JSON',
        'No manual data entry required'
      ],
      estimatedTime: '3-5 minutes',
      complexity: 'Intermediate',
      prerequisites: 'None - just enter your website URL and keywords'
    },
    {
      id: 'content-comparison',
      name: 'Content Comparison Analysis',
      status: 'ready',
      description: 'Compare existing website content against proposed new content. Get AI-powered side-by-side analysis.',
      icon: Brain,
      route: '/dashboard/content-comparison',
      whatYouGet: [
        'Side-by-side content analysis and comparison',
        'AI-powered content optimization recommendations',
        'Content gap identification and improvement suggestions',
        'Performance impact analysis for content changes'
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL'
    },
    {
      id: 'clifton-strengths-simple',
      name: 'CliftonStrengths Analysis',
      status: 'ready',
      description: 'Discover your organization\'s dominant strengths and cultural patterns using the proven CliftonStrengths framework',
      icon: Brain,
      route: '/dashboard/clifton-strengths-simple',
      whatYouGet: [
        'Analysis of all 34 CliftonStrengths themes',
        'Top 5 dominant themes identification',
        'Domain scoring (Strategic Thinking, Executing, Influencing, Relationship Building)',
        'Evidence-based theme manifestations',
        'Actionable recommendations for leveraging strengths'
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL'
    },
    {
      id: 'revenue-golden-circle',
      name: 'Revenue-Focused Golden Circle',
      status: 'ready',
      description: 'Identify revenue opportunities and calculate potential ROI using the Golden Circle framework - perfect for growth-focused businesses',
      icon: Target,
      route: '/dashboard/golden-circle-standalone',
      whatYouGet: [
        'Revenue impact analysis for WHY, HOW, WHAT, and WHO',
        'Market opportunity identification with size estimates',
        'ROI calculations for each recommendation',
        'High-value target persona identification',
        'Competitive advantage scoring'
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Intermediate',
      prerequisites: 'None - just enter your website URL'
    },
    {
      id: 'revenue-elements-value',
      name: 'Revenue-Focused Elements of Value',
      status: 'ready',
      description: 'Discover which value elements drive the most revenue and identify opportunities for premium pricing and market expansion',
      icon: BarChart3,
      route: '/dashboard/elements-value-standalone',
      whatYouGet: [
        'B2C and B2B value element revenue analysis',
        'Premium pricing opportunity identification',
        'Market gap analysis with revenue potential',
        'Implementation effort vs ROI prioritization',
        'Target audience revenue value scoring'
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Intermediate',
      prerequisites: 'None - just enter your website URL'
    },
    {
      id: 'revenue-trends',
      name: 'Revenue-Focused Market Analysis',
      status: 'ready',
      description: 'Identify underserved market demand and emerging revenue opportunities through AI-powered content strategy analysis',
      icon: TrendingUp,
      route: '/dashboard/revenue-trends',
      whatYouGet: [
        'Market opportunity scoring and gap analysis',
        'Revenue opportunity briefs with ROI calculations',
        'Content strategy recommendations with revenue impact',
        'Competitive analysis and differentiation opportunities',
        'Content calendar suggestions with traffic estimates'
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Advanced',
      prerequisites: 'None - just enter your website URL'
    },
    {
      id: 'google-tools',
      name: 'Google Tools Analysis',
      status: 'ready',
      description: 'Access Google Tools directly and analyze data using AI-powered insights - no APIs needed',
      icon: BarChart3,
      route: '/dashboard/google-tools',
      whatYouGet: [
        'Direct links to Google Trends, Analytics, Search Console, PageSpeed',
        'PTCF framework prompts for each tool',
        'Manual data input and AI analysis',
        'Revenue-focused insights and recommendations',
        'No API setup required - just paste data'
      ],
      estimatedTime: '5-10 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL and paste data'
    }
  ];

  const comingSoonAssessments = [
    {
      id: 'golden-circle',
      name: 'Golden Circle Analysis',
      status: 'testing',
      description: 'Individual Golden Circle analysis for focused strategic clarity',
      eta: 'Next week',
      icon: Target
    },
    {
      id: 'elements-of-value',
      name: 'Elements of Value',
      status: 'testing',
      description: 'Individual B2C and B2B value elements analysis',
      eta: 'Next week',
      icon: BarChart3
    },
    {
      id: 'clifton-strengths',
      name: 'CliftonStrengths Analysis',
      status: 'testing',
      description: 'Individual CliftonStrengths themes analysis',
      eta: 'Next week',
      icon: Users
    },
    {
      id: 'lighthouse',
      name: 'Lighthouse Performance',
      status: 'testing',
      description: 'Website performance and SEO analysis',
      eta: 'Next week',
      icon: Zap
    },
    {
      id: 'seo',
      name: 'SEO Analysis',
      status: 'testing',
      description: 'Comprehensive SEO audit and recommendations',
      eta: 'Next week',
      icon: BarChart3
    }
  ];

  const statusBadges = {
    ready: <Badge className="bg-green-500 text-white">Ready</Badge>,
    testing: <Badge className="bg-yellow-500 text-white">Testing</Badge>,
    pending: <Badge className="bg-gray-500 text-white">Coming Soon</Badge>
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Analysis Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            AI-powered business framework analysis. Only working, tested features shown.
          </p>
        </div>

        {/* Working Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <CheckCircle className="mr-2 text-green-500" />
            Ready to Use
          </h2>

          <div className="grid gap-6">
            {workingAssessments.map((assessment) => {
              const IconComponent = assessment.icon;
              return (
                <Card key={assessment.id} className="border-green-200 bg-green-50 dark:bg-green-900/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-8 w-8 text-green-600" />
                        <div>
                          <CardTitle className="text-xl">{assessment.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            {statusBadges[assessment.status as keyof typeof statusBadges]}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {assessment.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={assessment.route}>
                        <Button className="bg-green-600 hover:bg-green-700">
                          Start Analysis
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {assessment.description}
                    </CardDescription>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          What You Get:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {assessment.whatYouGet.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>⏱️ {assessment.estimatedTime}</span>
                        <span>📊 {assessment.complexity}</span>
                        <span>✅ {assessment.prerequisites}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Clock className="mr-2 text-yellow-500" />
              Coming Soon
            </h2>
            <Link href="/dashboard/coming-soon">
              <Button variant="outline" className="flex items-center gap-2">
                View All Features
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comingSoonAssessments.slice(0, 3).map((assessment) => {
              const IconComponent = assessment.icon;
              return (
                <Card key={assessment.id} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-6 w-6 text-yellow-600" />
                      <div>
                        <CardTitle className="text-lg">{assessment.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {statusBadges[assessment.status as keyof typeof statusBadges]}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ETA: {assessment.eta}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {assessment.description}
                    </CardDescription>
                    <div className="mt-3">
                      <Button variant="outline" disabled className="w-full">
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <Link href="/dashboard/coming-soon">
              <Button variant="ghost" className="text-yellow-600 hover:text-yellow-700">
                View all coming soon features with manual prompts →
              </Button>
            </Link>
          </div>
        </div>

        {/* Development Info */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
              <Zap className="mr-2 h-5 w-5" />
              Development Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>✅ <strong>Main Branch:</strong> Clean, working features only</p>
              <p>🔧 <strong>Dev Branch:</strong> Broken features being fixed separately</p>
              <p>📊 <strong>Assessment Pipeline:</strong> Features move from testing → ready</p>
              <p>🚀 <strong>Deployment:</strong> Only tested features go to production</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

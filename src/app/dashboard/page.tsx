'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReportsViewer to prevent SSR hydration issues
const ReportsViewer = dynamic(
  () => import('@/components/shared/ReportsViewer').then((mod) => mod.default || mod.ReportsViewer),
  { ssr: false }
);

export default function DashboardPage() {
  const [_url, _setUrl] = useState('');

  const workingAssessments = [
    {
      id: 'content-comparison',
      name: 'Content Comparison Analysis',
      status: 'ready',
      description:
        'Compare existing website content against proposed content with side-by-side analysis.',
      icon: Brain,
      route: '/dashboard/content-comparison',
      whatYouGet: [
        'Side-by-side existing vs proposed analysis',
        'SEO metadata, tags, and keyword analysis',
        'AI-powered optimization recommendations',
        'Keyword stuffing detection and protection',
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - enter your website URL or upload content',
    },
    {
      id: 'multi-page-scraping',
      name: 'Multi-Page Content Scraping',
      status: 'ready',
      description:
        'Discover and scrape multiple pages for broader content coverage.',
      icon: Globe,
      route: '/dashboard/multi-page-scraping',
      whatYouGet: [
        'Automatic page discovery across key site sections',
        'Comprehensive multi-page content extraction',
        'Theme and heading coverage across pages',
        'Configurable scraping depth',
      ],
      estimatedTime: '5-10 minutes',
      complexity: 'Intermediate',
      prerequisites: 'None - just enter your website URL',
    },
    {
      id: 'elements-value-b2c',
      name: 'B2C Elements of Value Analysis',
      status: 'ready',
      description:
        'Analyze consumer-facing messaging across all 30 B2C Elements of Value.',
      icon: Users,
      route: '/dashboard/elements-value-b2c',
      whatYouGet: [
        'All 30 B2C elements scored with evidence',
        'Flat fractional scoring (0.0-1.0)',
        'Clear strengths and gap identification',
        'Prioritized improvement recommendations',
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL',
    },
    {
      id: 'elements-value-b2b',
      name: 'B2B Elements of Value Analysis',
      status: 'ready',
      description:
        'Analyze enterprise messaging across all B2B value dimensions.',
      icon: BarChart3,
      route: '/dashboard/elements-value-b2b',
      whatYouGet: [
        'B2B value elements scored with evidence',
        'Flat fractional scoring (0.0-1.0)',
        'Category-level and overall scoring',
        'Actionable recommendations for value gaps',
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL',
    },
    {
      id: 'golden-circle-standalone',
      name: 'Golden Circle Analysis',
      status: 'ready',
      description:
        'Assess WHY, HOW, and WHAT clarity and alignment from website language.',
      icon: Target,
      route: '/dashboard/golden-circle-standalone',
      whatYouGet: [
        'WHY/HOW/WHAT clarity analysis',
        'Flat fractional scoring (0.0-1.0)',
        'Positioning and messaging alignment insights',
        'Improvement priorities for strategic clarity',
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL',
    },
    {
      id: 'clifton-strengths-simple',
      name: 'CliftonStrengths Analysis',
      status: 'ready',
      description:
        "Analyze brand language for all 34 CliftonStrengths theme signals.",
      icon: Brain,
      route: '/dashboard/clifton-strengths-simple',
      whatYouGet: [
        'All 34 CliftonStrengths themes scored',
        'Domain-level scoring and distribution',
        'Top strengths and weak-signal areas',
        'Actionable recommendations',
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL',
    },
    {
      id: 'brand-archetypes-standalone',
      name: 'Brand Archetypes Analysis',
      status: 'ready',
      description:
        'Evaluate all 12 Jambojon brand archetypes with flat fractional scoring.',
      icon: Brain,
      route: '/dashboard/brand-archetypes-standalone',
      whatYouGet: [
        'All 12 archetypes scored with evidence',
        'Flat fractional scoring (0.0-1.0)',
        'Primary and secondary archetype signals',
        'Recommendations to strengthen narrative consistency',
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL',
    },
    {
      id: 'revenue-trends',
      name: 'Revenue-Focused Market Analysis',
      status: 'ready',
      description:
        'Identify market and messaging opportunities with revenue-oriented outputs.',
      icon: TrendingUp,
      route: '/dashboard/revenue-trends',
      whatYouGet: [
        'Opportunity and gap scoring',
        'Revenue-oriented recommendation briefs',
        'Competitive differentiation insights',
        'Prioritized action roadmap',
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Advanced',
      prerequisites: 'None - just enter your website URL',
    },
    {
      id: 'google-tools',
      name: 'Google Tools Analysis',
      status: 'ready',
      description:
        'Analyze Google tools exports or pasted metrics with Ollama.',
      icon: TrendingUp,
      route: '/dashboard/google-tools',
      whatYouGet: [
        'Manual data input for Google Trends/PageSpeed/Search Console/Analytics',
        'Evidence-based insight synthesis',
        'Prioritized opportunities and action plan',
        'Confidence and coverage-aware analysis',
      ],
      estimatedTime: '5-10 minutes',
      complexity: 'Beginner',
      prerequisites: 'Provide URL and at least one Google data source',
    },
    {
      id: 'automated-google-tools',
      name: 'Automated Google Tools Analysis',
      status: 'ready',
      description:
        'Collect Google tool signals automatically, then run AI interpretation.',
      icon: Bot,
      route: '/dashboard/automated-google-tools',
      whatYouGet: [
        'Automated data extraction workflow',
        'Combined scraping and AI interpretation',
        'Downloadable JSON outputs',
        'Priority recommendations from extracted data',
      ],
      estimatedTime: '3-5 minutes',
      complexity: 'Intermediate',
      prerequisites: 'Enter website URL and target keywords',
    },
  ];

  const comingSoonAssessments = [
    {
      id: 'lighthouse',
      name: 'Lighthouse Performance',
      status: 'testing',
      description: 'Website performance and SEO analysis',
      eta: 'Next week',
      icon: Zap,
    },
    {
      id: 'seo',
      name: 'SEO Analysis',
      status: 'testing',
      description: 'Comprehensive SEO audit and recommendations',
      eta: 'Next week',
      icon: BarChart3,
    },
  ];

  const statusBadges = {
    ready: <Badge className="bg-green-500 text-white">Ready</Badge>,
    testing: <Badge className="bg-yellow-500 text-white">Testing</Badge>,
    pending: <Badge className="bg-gray-500 text-white">Coming Soon</Badge>,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Analysis Dashboard
            </h1>
            <ReportsViewer />
            <Link href="/dashboard/evaluation-guide" prefetch={false}>
              <Button variant="outline">Interactive Workflow Guide</Button>
            </Link>
          </div>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            AI-powered business framework analysis. Only working, tested
            features shown.
          </p>
        </div>

        {/* Working Features */}
        <div className="mb-12">
          <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
            <CheckCircle className="mr-2 text-green-500" />
            Ready to Use
          </h2>

          <div className="grid gap-6">
            {workingAssessments.map((assessment, idx) => {
              const IconComponent = assessment.icon;
              return (
                <Card
                  key={`${assessment.id}-${idx}`}
                  className="border-green-200 bg-green-50 dark:bg-green-900/10"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-8 w-8 text-green-600" />
                        <div>
                          <CardTitle className="text-xl">
                            {assessment.name}
                          </CardTitle>
                          <div className="mt-1 flex items-center space-x-2">
                            {
                              statusBadges[
                                assessment.status as keyof typeof statusBadges
                              ]
                            }
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {assessment.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={assessment.route} prefetch={false}>
                        <Button className="bg-green-600 hover:bg-green-700">
                          Start Analysis
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-base">
                      {assessment.description}
                    </CardDescription>

                    <div className="space-y-3">
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                          What You Get:
                        </h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
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
            {comingSoonAssessments.slice(0, 3).map((assessment, idx) => {
              const IconComponent = assessment.icon;
              return (
                <Card
                  key={`coming-soon-${assessment.id}-${idx}`}
                  className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-6 w-6 text-yellow-600" />
                      <div>
                        <CardTitle className="text-lg">
                          {assessment.name}
                        </CardTitle>
                        <div className="mt-1 flex items-center space-x-2">
                          {
                            statusBadges[
                              assessment.status as keyof typeof statusBadges
                            ]
                          }
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
              <Button
                variant="ghost"
                className="text-yellow-600 hover:text-yellow-700"
              >
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
              <p>
                ✅ <strong>Main Branch:</strong> Clean, working features only
              </p>
              <p>
                🔧 <strong>Dev Branch:</strong> Broken features being fixed
                separately
              </p>
              <p>
                📊 <strong>Assessment Pipeline:</strong> Features move from
                testing → ready
              </p>
              <p>
                🚀 <strong>Deployment:</strong> Only tested features go to
                production
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

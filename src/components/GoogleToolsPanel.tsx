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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  CheckCircle,
  ExternalLink,
  Info,
  Search,
  Settings,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface GoogleToolsPanelProps {
  url?: string;
  onToolSelect?: (tool: string) => void;
}

export default function GoogleToolsPanel({
  url,
  onToolSelect,
}: GoogleToolsPanelProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');

  const workingTools = [
    {
      id: 'gemini-ai',
      name: 'Google Gemini AI',
      description: 'Main analysis engine for all AI-powered insights',
      icon: Search,
      status: 'working',
      features: [
        'Golden Circle Analysis',
        'Elements of Value Scoring',
        'CliftonStrengths Identification',
        'Content Quality Analysis',
      ],
      setup: 'Already configured',
      cost: 'FREE (60 requests/min)',
    },
    {
      id: 'lighthouse',
      name: 'Google Lighthouse',
      description: 'Performance, accessibility, and SEO auditing',
      icon: Zap,
      status: 'working',
      features: [
        'Performance Score (Core Web Vitals)',
        'Accessibility (WCAG 2.1)',
        'SEO Optimization',
        'Best Practices',
      ],
      setup: 'No setup required',
      cost: 'FREE',
    },
    {
      id: 'trends',
      name: 'Google Trends',
      description: 'Keyword trending and market intelligence',
      icon: TrendingUp,
      status: 'working',
      features: [
        'Keyword Trending Data',
        'Interest Over Time',
        'Related Queries',
        'Regional Interest',
      ],
      setup: 'No setup required',
      cost: 'FREE',
    },
  ];

  const readyToActivate = [
    {
      id: 'search-console',
      name: 'Google Search Console',
      description: 'Current keyword rankings and traffic data',
      icon: BarChart3,
      status: 'ready',
      features: [
        'Keyword Rankings',
        'Impressions & Clicks',
        'CTR Analysis',
        'Top Performing Pages',
      ],
      setup: 'OAuth2 authentication required',
      cost: 'FREE',
      setupSteps: [
        'Go to Google Cloud Console',
        'Enable Search Console API',
        'Create OAuth2 credentials',
        'Add credentials to environment variables',
      ],
    },
    {
      id: 'keyword-planner',
      name: 'Google Keyword Planner',
      description: 'Search volume and keyword research',
      icon: Search,
      status: 'ready',
      features: [
        'Search Volume Data',
        'Keyword Ideas',
        'Competition Analysis',
        'Bid Estimates',
      ],
      setup: 'Google Ads account required',
      cost: 'FREE',
      setupSteps: [
        'Create Google Ads account',
        'Enable Keyword Planner API',
        'Add API credentials',
        'Configure in environment variables',
      ],
    },
    {
      id: 'pagespeed-insights',
      name: 'PageSpeed Insights',
      description: 'Advanced performance analysis',
      icon: Zap,
      status: 'ready',
      features: [
        'Real User Metrics',
        'Field Data',
        'Lab Data',
        'Performance Recommendations',
      ],
      setup: 'Optional API key (Lighthouse used instead)',
      cost: 'FREE',
      setupSteps: [
        'Get PageSpeed Insights API key',
        'Add to environment variables',
        'Enable in configuration',
      ],
    },
    {
      id: 'safe-browsing',
      name: 'Safe Browsing API',
      description: 'Security and malware detection',
      icon: Shield,
      status: 'ready',
      features: [
        'Malware Detection',
        'Phishing Protection',
        'Security Status',
        'Threat Intelligence',
      ],
      setup: 'API key required',
      cost: 'FREE',
      setupSteps: [
        'Get Safe Browsing API key',
        'Add to environment variables',
        'Enable security scanning',
      ],
    },
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    onToolSelect?.(toolId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Google Tools Integration
          </CardTitle>
          <CardDescription>
            Access Google&apos;s suite of analysis tools for comprehensive website
            insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="working" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="working">
                Working Tools ({workingTools.length})
              </TabsTrigger>
              <TabsTrigger value="ready">
                Ready to Activate ({readyToActivate.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="working" className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  These tools are fully integrated and working. They&apos;re
                  automatically used in your analyses.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {workingTools.map((tool) => (
                  <Card
                    key={tool.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTool === tool.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleToolSelect(tool.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <tool.icon className="h-5 w-5 text-green-600" />
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Working
                        </Badge>
                      </div>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="mb-2 text-sm font-medium">
                            Features:
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {tool.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Setup:</span>
                            <span className="text-green-600">{tool.setup}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Cost:</span>
                            <span className="text-green-600">{tool.cost}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ready" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These tools are ready to activate. Follow the setup steps to
                  unlock additional insights.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {readyToActivate.map((tool) => (
                  <Card
                    key={tool.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTool === tool.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleToolSelect(tool.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <tool.icon className="h-5 w-5 text-orange-600" />
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-orange-200 text-orange-800"
                        >
                          <Settings className="mr-1 h-3 w-3" />
                          Ready
                        </Badge>
                      </div>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="mb-2 text-sm font-medium">
                            Features:
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {tool.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="mr-2 h-3 w-3 text-orange-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t pt-2">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Setup:</span>
                              <span className="text-orange-600">
                                {tool.setup}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Cost:</span>
                              <span className="text-green-600">
                                {tool.cost}
                              </span>
                            </div>
                          </div>

                          {tool.setupSteps && (
                            <div className="mt-3">
                              <h5 className="mb-2 text-sm font-medium">
                                Setup Steps:
                              </h5>
                              <ol className="space-y-1 text-xs text-gray-600">
                                {tool.setupSteps.map((step, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-2 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-xs text-orange-800">
                                      {index + 1}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedTool && (
        <Card>
          <CardHeader>
            <CardTitle>Tool Selected: {selectedTool}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              This tool will be integrated into your analysis workflow.
            </p>
            {url && (
              <div className="mt-4">
                <Button
                  onClick={() =>
                    window.open(
                      `https://pagespeed.web.dev/analysis/${url}`,
                      '_blank'
                    )
                  }
                  variant="outline"
                  className="mr-2"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Test with {url}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Download, ExternalLink, Eye, GitCompare, Layers, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AnalysisByUrl {
  url: string;
  analyses: any[];
  totalPhases: number;
  completedPhases: number;
  completionPercentage: number;
  lastUpdated: string;
}

export default function DashboardPage() {
  const [analysesByUrl, setAnalysesByUrl] = useState<AnalysisByUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      // Fetch analyses from database
      const response = await fetch('/api/reports');
      const data = await response.json();

      if (data.success) {
        // Group by URL
        const grouped = groupAnalysesByUrl(data.data.reports);
        setAnalysesByUrl(grouped);
      }
    } catch (error) {
      console.error('Failed to load analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupAnalysesByUrl = (analyses: any[]): AnalysisByUrl[] => {
    const urlMap: Record<string, any[]> = {};

    analyses.forEach(analysis => {
      const content = typeof analysis.data === 'string'
        ? JSON.parse(analysis.data)
        : analysis.data;

      const url = content.url || analysis.url || 'Unknown URL';

      if (!urlMap[url]) {
        urlMap[url] = [];
      }
      urlMap[url].push(analysis);
    });

    return Object.entries(urlMap).map(([url, urlAnalyses]) => {
      const latest = urlAnalyses[0];
      const content = typeof latest.data === 'string'
        ? JSON.parse(latest.data)
        : latest.data;

      const completedPhases = content.completedPhases?.length || 0;
      const totalPhases = 3;
      const completionPercentage = Math.round((completedPhases / totalPhases) * 100);

      return {
        url,
        analyses: urlAnalyses,
        totalPhases,
        completedPhases,
        completionPercentage,
        lastUpdated: latest.timestamp
      };
    }).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analysis Dashboard</h1>
        <p className="text-muted-foreground">
          View all your website analyses organized by site. Click to view details or start a new analysis.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Layers className="h-5 w-5" />
              Phased Analysis
            </CardTitle>
            <CardDescription>
              Step-by-step analysis with manual control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/phased-analysis">
              <Button className="w-full bg-blue-600">
                Start New Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Badge className="mt-2 bg-blue-500">Recommended</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Content Comparison
            </CardTitle>
            <CardDescription>
              Compare existing vs. proposed content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/content-comparison">
              <Button className="w-full" variant="outline">
                Compare Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Badge className="mt-2" variant="secondary">New</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Analysis
            </CardTitle>
            <CardDescription>
              Automated full analysis (no manual steps)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/progressive-analysis">
              <Button className="w-full" variant="outline">
                Start Quick Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Analyses by Site */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Website Analyses</h2>
          <Badge variant="outline">{analysesByUrl.length} sites analyzed</Badge>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Loading analyses...
            </CardContent>
          </Card>
        ) : analysesByUrl.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No analyses yet. Start your first analysis!
              </p>
              <Link href="/dashboard/phased-analysis">
                <Button>
                  <Layers className="mr-2 h-4 w-4" />
                  Start Phased Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          analysesByUrl.map((siteData, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      {siteData.url}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Last updated: {new Date(siteData.lastUpdated).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant={siteData.completionPercentage === 100 ? 'default' : 'secondary'}>
                      {siteData.completedPhases}/{siteData.totalPhases} Phases
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Analysis Progress</span>
                    <span className="font-semibold">{siteData.completionPercentage}%</span>
                  </div>
                  <Progress value={siteData.completionPercentage} className="h-3" />
                </div>

                {/* Phase Status */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`p-2 border rounded text-center ${
                    siteData.completedPhases >= 1
                      ? 'bg-green-50 dark:bg-green-950 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-900'
                  }`}>
                    <div className="font-semibold">Phase 1</div>
                    <div className="text-muted-foreground">
                      {siteData.completedPhases >= 1 ? '✓ Complete' : 'Pending'}
                    </div>
                  </div>
                  <div className={`p-2 border rounded text-center ${
                    siteData.completedPhases >= 2
                      ? 'bg-green-50 dark:bg-green-950 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-900'
                  }`}>
                    <div className="font-semibold">Phase 2</div>
                    <div className="text-muted-foreground">
                      {siteData.completedPhases >= 2 ? '✓ Complete' : 'Pending'}
                    </div>
                  </div>
                  <div className={`p-2 border rounded text-center ${
                    siteData.completedPhases >= 3
                      ? 'bg-green-50 dark:bg-green-950 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-900'
                  }`}>
                    <div className="font-semibold">Phase 3</div>
                    <div className="text-muted-foreground">
                      {siteData.completedPhases >= 3 ? '✓ Complete' : 'Pending'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => window.location.href = `/dashboard/phased-analysis?analysisId=${siteData.analyses[0].id}`}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                  {siteData.completedPhases < 3 && (
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/dashboard/phased-analysis?url=${encodeURIComponent(siteData.url)}&continue=${siteData.analyses[0].id}`}
                    >
                      Continue Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {siteData.completedPhases === 3 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Download all reports for this site
                        siteData.analyses.forEach(analysis => {
                          const content = typeof analysis.data === 'string'
                            ? JSON.parse(analysis.data)
                            : analysis.data;
                          const markdown = JSON.stringify(content, null, 2);
                          const blob = new Blob([markdown], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `analysis-${siteData.url.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
                          a.click();
                          URL.revokeObjectURL(url);
                        });
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download All
                    </Button>
                  )}
                </div>

                {/* Individual Reports Count */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  {siteData.analyses.length} report{siteData.analyses.length !== 1 ? 's' : ''} available
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Help Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 How to Use This Dashboard
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Each card represents one website you&apos;ve analyzed</li>
            <li>• Progress bar shows how many phases are complete (1, 2, or 3)</li>
            <li>• Click &quot;View Reports&quot; to see all assessments for that site</li>
            <li>• Click &quot;Continue Analysis&quot; to finish incomplete phases</li>
            <li>• Click &quot;Download All&quot; when all 3 phases are done</li>
            <li>• Start a new analysis using the buttons at the top</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface QualityMetric {
  name: string;
  value: number;
  target: number;
  status: 'pass' | 'fail' | 'warning';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  coverage?: number;
  lastRun: string;
}

interface QualityReport {
  overallScore: number;
  metrics: QualityMetric[];
  testResults: TestResult[];
  lastUpdated: string;
  buildNumber: string;
}

export function QualityDashboard() {
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from your CI/CD system
    fetchQualityData();
  }, []);

  const fetchQualityData = async () => {
    try {
      // Simulate API call - replace with actual endpoint
      const mockData: QualityReport = {
        overallScore: 87,
        buildNumber: 'build-2024.1.15',
        lastUpdated: new Date().toISOString(),
        metrics: [
          {
            name: 'Code Coverage',
            value: 92,
            target: 85,
            status: 'pass',
            trend: 'up',
            lastUpdated: new Date().toISOString(),
          },
          {
            name: 'Performance Score',
            value: 89,
            target: 90,
            status: 'warning',
            trend: 'down',
            lastUpdated: new Date().toISOString(),
          },
          {
            name: 'Accessibility Score',
            value: 98,
            target: 95,
            status: 'pass',
            trend: 'stable',
            lastUpdated: new Date().toISOString(),
          },
          {
            name: 'Security Score',
            value: 95,
            target: 90,
            status: 'pass',
            trend: 'up',
            lastUpdated: new Date().toISOString(),
          },
          {
            name: 'Bundle Size',
            value: 78,
            target: 80,
            status: 'pass',
            trend: 'up',
            lastUpdated: new Date().toISOString(),
          },
        ],
        testResults: [
          {
            name: 'Unit Tests',
            status: 'passed',
            duration: 45,
            coverage: 92,
            lastRun: new Date().toISOString(),
          },
          {
            name: 'Integration Tests',
            status: 'passed',
            duration: 120,
            coverage: 88,
            lastRun: new Date().toISOString(),
          },
          {
            name: 'E2E Tests',
            status: 'passed',
            duration: 300,
            lastRun: new Date().toISOString(),
          },
          {
            name: 'Load Tests',
            status: 'passed',
            duration: 180,
            lastRun: new Date().toISOString(),
          },
          {
            name: 'Security Tests',
            status: 'passed',
            duration: 60,
            lastRun: new Date().toISOString(),
          },
        ],
      };

      setQualityReport(mockData);
    } catch (err) {
      setError('Failed to fetch quality data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !qualityReport) {
    return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'Failed to load quality data'}
        </AlertDescription>
      </Alert>
    );
  }

  const passedTests = qualityReport.testResults.filter(
    (t) => t.status === 'passed'
  ).length;
  const totalTests = qualityReport.testResults.length;
  const testSuccessRate = (passedTests / totalTests) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality Dashboard</h1>
          <p className="text-muted-foreground">
            Build {qualityReport.buildNumber} • Last updated{' '}
            {new Date(qualityReport.lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {qualityReport.overallScore}%
          </div>
          <div className="text-sm text-muted-foreground">Overall Score</div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Test Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testSuccessRate.toFixed(1)}%
            </div>
            <Progress value={testSuccessRate} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {passedTests} of {totalTests} tests passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Code Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                qualityReport.metrics.find((m) => m.name === 'Code Coverage')
                  ?.value
              }
              %
            </div>
            <Progress
              value={
                qualityReport.metrics.find((m) => m.name === 'Code Coverage')
                  ?.value || 0
              }
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">Target: 85%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                qualityReport.metrics.find(
                  (m) => m.name === 'Performance Score'
                )?.value
              }
              %
            </div>
            <Progress
              value={
                qualityReport.metrics.find(
                  (m) => m.name === 'Performance Score'
                )?.value || 0
              }
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">Target: 90%</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>
                Detailed breakdown of quality scores and targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityReport.metrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(metric.status)}
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Target: {metric.target}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-lg font-bold">{metric.value}%</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(metric.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                      {getTrendIcon(metric.trend)}
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Comprehensive test execution results and coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityReport.testResults.map((test) => (
                  <div
                    key={test.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Duration: {test.duration}s
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {test.coverage && (
                        <div className="text-right">
                          <div className="text-sm font-medium">Coverage</div>
                          <div className="text-lg font-bold">
                            {test.coverage}%
                          </div>
                        </div>
                      )}
                      <Badge className={getStatusColor(test.status)}>
                        {test.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quality Gates */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Gates</CardTitle>
          <CardDescription>
            Status of critical quality requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-3 rounded-lg border p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Code Coverage</div>
                <div className="text-sm text-muted-foreground">
                  ≥ 85% (Passed)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">All Tests Passing</div>
                <div className="text-sm text-muted-foreground">
                  100% Success Rate
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium">Performance Score</div>
                <div className="text-sm text-muted-foreground">
                  89% (Target: 90%)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Security Score</div>
                <div className="text-sm text-muted-foreground">
                  ≥ 90% (Passed)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



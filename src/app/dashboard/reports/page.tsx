'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Textarea } from '@/components/ui/textarea'; // Unused import
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  // Calendar, // Unused import
  // Clock, // Unused import
  // CheckCircle, // Unused import
  AlertCircle,
  // ExternalLink, // Unused import
  Copy,
  Loader2,
  BarChart3,
  Target,
  Zap,
  TrendingUp
} from 'lucide-react';

interface Phase1Report {
  id: string;
  url: string;
  timestamp: string;
  data: {
    scrapedContent: any;
    seoAnalysis: any;
    lighthouseData: any;
    qaAnalysis: any;
    trendsAnalysis: any;
    competitionAnalysis: any;
    summary: any;
  };
}

interface Phase2Report {
  id: string;
  url: string;
  timestamp: string;
  data: {
    goldenCircle: any;
    elementsOfValueB2C: any;
    elementsOfValueB2B: any;
    cliftonStrengths: any;
  };
}

interface Phase3Report {
  id: string;
  url: string;
  timestamp: string;
  data: {
    comprehensiveReport: any;
    strategicInsights: any;
    recommendations: any;
  };
}

export default function ReportsPage() {
  const [phase1Reports, setPhase1Reports] = useState<Phase1Report[]>([]);
  const [phase2Reports, setPhase2Reports] = useState<Phase2Report[]>([]);
  const [phase3Reports, setPhase3Reports] = useState<Phase3Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('phase1');
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setIsLoadingReports(true);
      
      // Fetch from database API
      const response = await fetch('/api/analysis');
      if (!response.ok) throw new Error('Failed to fetch analyses');
      const data = await response.json();
      
      // Parse and categorize reports by phase
      const analyses = data.analyses || [];
      const phase1 = analyses.filter((a: any) => a.contentType === 'phase1-complete');
      const phase2 = analyses.filter((a: any) => a.contentType === 'phase2-complete');
      const phase3 = analyses.filter((a: any) => a.contentType === 'phase3-complete');
      
      setPhase1Reports(phase1);
      setPhase2Reports(phase2);
      setPhase3Reports(phase3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
      setIsLoadingReports(false);
    }
  };

  const filteredPhase1Reports = phase1Reports.filter(report =>
    report.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPhase2Reports = phase2Reports.filter(report =>
    report.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPhase3Reports = phase3Reports.filter(report =>
    report.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadReport = (report: any, filename: string) => {
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const downloadMarkdown = (report: any, phase: string) => {
    const markdown = generateReportMarkdown(report, phase);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${phase}-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportMarkdown = (report: any, phase: string) => {
    const data = typeof report.content === 'string' ? JSON.parse(report.content) : report.content;
    
    let markdown = `# ${phase.toUpperCase()} Analysis Report\n\n`;
    markdown += `**URL:** ${report.url}\n`;
    markdown += `**Generated:** ${formatDate(report.createdAt)}\n`;
    markdown += `**Analysis ID:** ${report.id}\n\n`;
    
    if (phase === 'phase1' && data.summary) {
      markdown += `## Summary\n\n`;
      markdown += `- **Content Words:** ${data.summary.contentWords}\n`;
      markdown += `- **SEO Score:** ${data.summary.seoScore}/10\n`;
      markdown += `- **Performance Score:** ${data.summary.performanceScore}/100\n`;
      markdown += `- **Accessibility Score:** ${data.summary.accessibilityScore}/100\n`;
      markdown += `- **QA Issues:** ${data.summary.qaIssues}\n\n`;
    }
    
    markdown += `## Full Analysis Data\n\n`;
    markdown += `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
    
    return markdown;
  };

  const ReportCard = ({ report, phase }: { report: any; phase: string }) => {
    const data = typeof report.content === 'string' ? JSON.parse(report.content) : report.content;
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {report.url}
              </CardTitle>
              <CardDescription className="mt-1">
                {formatDate(report.createdAt)}
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {phase.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Phase-specific metrics */}
            {phase === 'phase1' && data?.summary && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">SEO Score:</span>
                  <span className={`ml-2 font-semibold ${getScoreColor(data.summary.seoScore)}`}>
                    {data.summary.seoScore}/10
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Performance:</span>
                  <span className={`ml-2 font-semibold ${getScoreColor(data.summary.performanceScore / 10)}`}>
                    {data.summary.performanceScore}/100
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Words:</span>
                  <span className="ml-2 font-semibold">{data.summary.contentWords}</span>
                </div>
                <div>
                  <span className="text-gray-500">Issues:</span>
                  <span className="ml-2 font-semibold">{data.summary.qaIssues}</span>
                </div>
              </div>
            )}

            {phase === 'phase2' && data?.goldenCircle && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Golden Circle:</span>
                  <span className={`ml-2 font-semibold ${getScoreColor(data.goldenCircle.overallScore)}`}>
                    {data.goldenCircle.overallScore}/10
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">B2C Elements:</span>
                  <span className={`ml-2 font-semibold ${getScoreColor(data.elementsOfValueB2C?.overallScore || 0)}`}>
                    {data.elementsOfValueB2C?.overallScore || 0}/10
                  </span>
                </div>
              </div>
            )}

            {phase === 'phase3' && data?.comprehensiveReport && (
              <div className="text-sm">
                <span className="text-gray-500">Comprehensive Analysis:</span>
                <span className="ml-2 font-semibold text-green-600">Complete</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedReport({ ...report, phase, data })}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadReport(report, `${phase}-report-${Date.now()}.json`)}
              >
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadMarkdown(report, phase)}
              >
                <FileText className="h-4 w-4 mr-1" />
                MD
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (selectedReport) {
    const data = selectedReport.data;
    const phase = selectedReport.phase;
    
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedReport(null)}
            className="mb-4"
          >
            ← Back to Reports
          </Button>
          <div className="flex gap-2">
            <Badge variant="outline">
              {phase.toUpperCase()} Report
            </Badge>
            <Button
              variant="outline"
              onClick={() => downloadMarkdown(selectedReport, phase)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  {phase.toUpperCase()} Analysis Overview
                </CardTitle>
                <CardDescription>
                  Key metrics and insights from your {phase} analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {phase === 'phase1' && data?.summary && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Content Analysis
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Content Words:</span>
                          <span className="font-semibold">{data.summary.contentWords}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Images:</span>
                          <span className="font-semibold">{data.summary.contentImages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Links:</span>
                          <span className="font-semibold">{data.summary.contentLinks}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Performance Metrics
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>SEO Score:</span>
                          <span className={`font-semibold ${getScoreColor(data.summary.seoScore)}`}>
                            {data.summary.seoScore}/10
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Performance:</span>
                          <span className={`font-semibold ${getScoreColor(data.summary.performanceScore / 10)}`}>
                            {data.summary.performanceScore}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accessibility:</span>
                          <span className={`font-semibold ${getScoreColor(data.summary.accessibilityScore / 10)}`}>
                            {data.summary.accessibilityScore}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {phase === 'phase2' && data?.goldenCircle && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Golden Circle Analysis
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Overall Score:</span>
                          <span className={`font-semibold ${getScoreColor(data.goldenCircle.overallScore)}`}>
                            {data.goldenCircle.overallScore}/10
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Clarity:</span>
                          <span className={`font-semibold ${getScoreColor(data.goldenCircle.clarity_rating)}`}>
                            {data.goldenCircle.clarity_rating}/10
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Authenticity:</span>
                          <span className={`font-semibold ${getScoreColor(data.goldenCircle.authenticity_rating)}`}>
                            {data.goldenCircle.authenticity_rating}/10
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Elements of Value
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>B2C Score:</span>
                          <span className={`font-semibold ${getScoreColor(data.elementsOfValueB2C?.overallScore || 0)}`}>
                            {data.elementsOfValueB2C?.overallScore || 0}/10
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>B2B Score:</span>
                          <span className={`font-semibold ${getScoreColor(data.elementsOfValueB2B?.overallScore || 0)}`}>
                            {data.elementsOfValueB2B?.overallScore || 0}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {phase === 'phase3' && data?.comprehensiveAnalysis && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Comprehensive Strategic Analysis
                    </h3>
                    <p className="text-sm text-gray-600">
                      Complete strategic analysis with recommendations and insights.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis Results</CardTitle>
                <CardDescription>
                  Comprehensive analysis data and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-md max-h-96 overflow-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Raw Data Tab */}
          <TabsContent value="raw">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Raw Analysis Data</CardTitle>
                    <CardDescription>
                      Complete raw data from the analysis
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(selectedReport, null, 2))}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-md max-h-96 overflow-auto">
                  {JSON.stringify(selectedReport, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Analysis Reports
          </CardTitle>
          <CardDescription>
            View and manage all your website analysis reports by phase. Access detailed insights and download reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <label htmlFor="search-reports" className="sr-only">
                Search reports by URL or report ID
              </label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search-reports"
                name="search-reports"
                type="text"
                placeholder="Search by URL or report ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search reports by URL or report ID"
              />
            </div>
            <Button 
              onClick={fetchReports} 
              variant="outline"
              disabled={isLoadingReports}
            >
              {isLoadingReports ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin mr-2 h-6 w-6" />
            <p>Loading reports...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="phase1">
              Phase 1: Data Collection ({phase1Reports.length})
            </TabsTrigger>
            <TabsTrigger value="phase2">
              Phase 2: Framework Analysis ({phase2Reports.length})
            </TabsTrigger>
            <TabsTrigger value="phase3">
              Phase 3: Strategic Analysis ({phase3Reports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phase1" className="space-y-4">
            {filteredPhase1Reports.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Phase 1 Reports</h3>
                    <p className="text-gray-500 mb-4">
                      Run Phase 1 analysis to collect website data, SEO metrics, and performance insights.
                    </p>
                    <Button onClick={() => window.location.href = '/dashboard/analysis'}>
                      Start Phase 1 Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPhase1Reports.map((report) => (
                  <ReportCard key={report.id} report={report} phase="phase1" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="phase2" className="space-y-4">
            {filteredPhase2Reports.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Phase 2 Reports</h3>
                    <p className="text-gray-500 mb-4">
                      Run Phase 2 analysis to perform framework analysis (Golden Circle, Elements of Value, CliftonStrengths).
                    </p>
                    <Button onClick={() => window.location.href = '/dashboard/phase2'}>
                      Start Phase 2
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPhase2Reports.map((report) => (
                  <ReportCard key={report.id} report={report} phase="phase2" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="phase3" className="space-y-4">
            {filteredPhase3Reports.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Phase 3 Reports</h3>
                    <p className="text-gray-500 mb-4">
                      Run Phase 3 analysis to generate comprehensive strategic insights and recommendations.
                    </p>
                    <Button onClick={() => window.location.href = '/dashboard/phase3'}>
                      Start Phase 3
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPhase3Reports.map((report) => (
                  <ReportCard key={report.id} report={report} phase="phase3" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
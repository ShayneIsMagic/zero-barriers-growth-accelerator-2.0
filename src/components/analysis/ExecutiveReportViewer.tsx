'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Target,
  TrendingUp,
  Zap,
  Globe,
  Calendar,
  Eye,
  Printer
} from 'lucide-react';

interface ExecutiveReport {
  reportId: string;
  markdownContent: string;
  htmlContent?: string;
  metadata: {
    url: string;
    generatedAt: string;
    frameworks: string[];
    dataSources: string[];
  };
}

interface ReportListItem {
  reportId: string;
  filename: string;
  createdAt: string;
  size: number;
}

export function ExecutiveReportViewer() {
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load existing reports on component mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await fetch('/api/generate-executive-report');
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const generateReport = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/generate-executive-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setReport({
          reportId: data.reportId,
          markdownContent: data.markdownContent,
          htmlContent: data.htmlContent,
          metadata: data.metadata
        });
        setSuccess('Executive report generated successfully!');
        loadReports(); // Refresh the reports list
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Report generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/generate-executive-report?reportId=${reportId}`);
      const data = await response.json();

      if (data.success) {
        setReport({
          reportId: data.reportId,
          markdownContent: data.markdownContent,
          htmlContent: data.htmlContent,
          metadata: {
            url: 'Previously generated report',
            generatedAt: data.metadata.createdAt,
            frameworks: [],
            dataSources: []
          }
        });
        setError(null);
        setSuccess('Report loaded successfully!');
      } else {
        setError(data.error || 'Failed to load report');
      }
    } catch (error) {
      setError('Failed to load report');
      console.error('Report loading error:', error);
    }
  };

  const downloadReport = (format: 'markdown' | 'html') => {
    if (!report) return;

    const content = format === 'html' ? report.htmlContent : report.markdownContent;
    const mimeType = format === 'html' ? 'text/html' : 'text/markdown';
    const extension = format === 'html' ? 'html' : 'md';
    
    const blob = new Blob([content || ''], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-report-${report.reportId}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    if (!report?.htmlContent) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(report.htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Executive Report Generator</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Generate comprehensive executive reports with strategic insights, technical analysis, and actionable recommendations
        </p>
      </div>

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Generate New Report
          </CardTitle>
          <CardDescription>
            Enter a website URL to generate a comprehensive executive analysis report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          
          <Button 
            onClick={generateReport} 
            disabled={isGenerating || !url.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Executive Report
              </>
            )}
          </Button>

          {/* Analysis Frameworks Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-900">Golden Circle</div>
              <div className="text-xs text-blue-700">Strategic Analysis</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-green-900">Elements of Value</div>
              <div className="text-xs text-green-700">Value Proposition</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-purple-900">B2B Elements</div>
              <div className="text-xs text-purple-700">Business Focus</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-orange-900">Performance</div>
              <div className="text-xs text-orange-700">Technical Analysis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Existing Reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Previous Reports
            </CardTitle>
            <CardDescription>
              Access and download previously generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.slice(0, 5).map((reportItem) => (
                <div 
                  key={reportItem.reportId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{reportItem.filename}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(reportItem.size)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      Generated: {formatDate(reportItem.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadReport(reportItem.reportId)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Display */}
      {report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Executive Report
                </CardTitle>
                <CardDescription>
                  {report.metadata.url} • Generated: {formatDate(report.metadata.generatedAt)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadReport('markdown')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Markdown
                </Button>
                {report.htmlContent && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadReport('html')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      HTML
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={printReport}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="markdown" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="markdown">Markdown View</TabsTrigger>
                <TabsTrigger value="html" disabled={!report.htmlContent}>
                  Executive View {report.htmlContent ? '' : '(Not Available)'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="markdown" className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {report.markdownContent}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="html" className="space-y-4">
                {report.htmlContent ? (
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={report.htmlContent}
                      className="w-full h-96 border-0"
                      title="Executive Report"
                    />
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      HTML version not available for this report
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

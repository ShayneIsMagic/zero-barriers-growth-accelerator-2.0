/**
 * Reports Viewer Component
 * Displays all reports stored in Local Forage
 * Allows viewing, downloading, and sharing reports across assessments
 */

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedLocalForageStorage, StoredReport } from '@/lib/services/unified-localforage-storage.service';
import {
  Database,
  FileText,
  Download,
  Eye,
  Search,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface ReportsViewerProps {
  onReportSelected?: (report: any) => void;
  allowSelection?: boolean;
}

export function ReportsViewer({
  onReportSelected,
  allowSelection = false,
}: ReportsViewerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<StoredReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (open) {
      loadReports();
    }
  }, [open]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const allReports = await UnifiedLocalForageStorage.getAllReports();
      setReports(allReports);
    } catch (_error) {
      console.error('Failed to load reports:', _error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      report.url.toLowerCase().includes(searchLower) ||
      report.domain?.toLowerCase().includes(searchLower) ||
      report.displayName?.toLowerCase().includes(searchLower) ||
      report.assessmentType?.toLowerCase().includes(searchLower) ||
      report.assessmentDisplayName?.toLowerCase().includes(searchLower) ||
      report.id.toLowerCase().includes(searchLower) ||
      report.formattedDate?.toLowerCase().includes(searchLower);

    const matchesFilter =
      filterType === 'all' || report.assessmentType === filterType;

    return matchesSearch && matchesFilter;
  });

  // Group by domain for better organization
  const groupedByDomain = filteredReports.reduce((acc, report) => {
    const key = report.domain || report.url;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(report);
    return acc;
  }, {} as Record<string, StoredReport[]>);

  const assessmentTypes = [
    'all',
    'content-comparison',
    'b2c-elements',
    'b2b-elements',
    'clifton-strengths',
    'golden-circle',
    'jambojon-archetypes',
  ];

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
  };

  const handleDownloadReport = (report: any) => {
    const content =
      typeof report.content === 'string'
        ? report.content
        : JSON.stringify(report.content, null, 2);
    const blob = new Blob([content], {
      type: report.format === 'markdown' ? 'text/markdown' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Create better filename: domain-assessment-date-version.format
    const domain = report.domain || 'report';
    const assessment = (report.assessmentType || 'report').replace(/-/g, '_');
    const date = new Date(report.timestamp).toISOString().split('T')[0];
    const version = report.version && report.version > 1 ? `_v${report.version}` : '';
    const extension = report.format === 'markdown' ? 'md' : 'json';
    a.download = `${domain}-${assessment}-${date}${version}.${extension}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = async (report: any) => {
    const content =
      typeof report.content === 'string'
        ? report.content
        : JSON.stringify(report.content, null, 2);
    await navigator.clipboard.writeText(content);
    alert('Report copied to clipboard!');
  };

  const handleSelectReport = (report: any) => {
    if (allowSelection && onReportSelected) {
      onReportSelected(report);
      setOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Puppeteer Collected Reports
            </DialogTitle>
            <DialogDescription>
              View, download, and share reports collected from Puppeteer analysis
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by URL, assessment type, or report ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Tabs value={filterType} onValueChange={setFilterType}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="content-comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="b2c-elements">B2C</TabsTrigger>
                  <TabsTrigger value="b2b-elements">B2B</TabsTrigger>
                  <TabsTrigger value="clifton-strengths">Clifton</TabsTrigger>
                  <TabsTrigger value="golden-circle">Golden</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Reports List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredReports.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reports found</p>
                    <p className="text-xs mt-2">
                      Run analyses to generate reports
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedByDomain)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([domain, domainReports]) => (
                      <Card key={domain}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                <span className="truncate font-semibold">{domain}</span>
                              </CardTitle>
                              <CardDescription>
                                {domainReports.length} report
                                {domainReports.length !== 1 ? 's' : ''} • {domainReports[0]?.url}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {domainReports
                              .sort((a, b) => {
                                // Sort by date (newest first), then by version (highest first)
                                const dateCompare = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                                if (dateCompare !== 0) return dateCompare;
                                return (b.version || 0) - (a.version || 0);
                              })
                              .map((report) => (
                                <div
                                  key={report.id}
                                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <Badge variant="outline" className="font-medium">
                                        {report.assessmentDisplayName || report.assessmentType || 'Report'}
                                      </Badge>
                                      {report.version && report.version > 1 && (
                                        <Badge variant="secondary" className="text-xs">
                                          v{report.version}
                                        </Badge>
                                      )}
                                      <Badge variant="secondary" className="text-xs">
                                        {report.format}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {report.formattedDate || formatDate(report.timestamp)}
                                      </span>
                                    </div>
                                    {report.displayName && (
                                      <p className="text-sm font-medium text-foreground mb-1">
                                        {report.displayName}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground truncate">
                                      {report.url}
                                    </p>
                                  </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewReport(report)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadReport(report)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyReport(report)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                {allowSelection && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleSelectReport(report)}
                                  >
                                    Use
                                  </Button>
                                )}
                              </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {filteredReports.length} report
                {filteredReports.length !== 1 ? 's' : ''} found
              </p>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Viewer Dialog */}
      {selectedReport && (
        <Dialog
          open={!!selectedReport}
          onOpenChange={() => setSelectedReport(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedReport.displayName || 
                  `${selectedReport.assessmentDisplayName || selectedReport.assessmentType || 'Report'}`}
              </DialogTitle>
              <DialogDescription className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{selectedReport.domain || selectedReport.url}</span>
                  {selectedReport.version && selectedReport.version > 1 && (
                    <Badge variant="secondary" className="text-xs">v{selectedReport.version}</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {selectedReport.assessmentDisplayName || selectedReport.assessmentType || 'Report'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedReport.url} • {selectedReport.formattedDate || formatDate(selectedReport.timestamp)}
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="raw">Raw {selectedReport.format}</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="prose max-w-none">
                    {selectedReport.format === 'markdown' ? (
                      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                        {typeof selectedReport.content === 'string'
                          ? selectedReport.content
                          : JSON.stringify(selectedReport.content, null, 2)}
                      </pre>
                    ) : (
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedReport.content, null, 2)}
                      </pre>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-96">
                    {typeof selectedReport.content === 'string'
                      ? selectedReport.content
                      : JSON.stringify(selectedReport.content, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleDownloadReport(selectedReport)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCopyReport(selectedReport)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button onClick={() => setSelectedReport(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Export default for dynamic import compatibility
export default ReportsViewer;


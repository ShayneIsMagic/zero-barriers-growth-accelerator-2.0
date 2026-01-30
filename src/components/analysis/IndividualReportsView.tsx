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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndividualReport } from '@/lib/individual-report-generator';
import { Code, Download, Eye, FileText } from 'lucide-react';
import { useState } from 'react';

interface IndividualReportsViewProps {
  reports: IndividualReport[];
  url: string;
}

export function IndividualReportsView({
  reports,
  url: _url,
}: IndividualReportsViewProps) {
  const [selectedReport, setSelectedReport] = useState<IndividualReport | null>(
    null
  );
  const [viewMode, setViewMode] = useState<'preview' | 'markdown' | 'prompt'>(
    'preview'
  );

  const phase1Reports = reports.filter((r) => r.phase === 'Phase 1');
  const phase2Reports = reports.filter((r) => r.phase === 'Phase 2');
  const phase3Reports = reports.filter((r) => r.phase === 'Phase 3');

  const downloadMarkdown = (report: IndividualReport) => {
    const blob = new Blob([report.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPrompt = (report: IndividualReport) => {
    const blob = new Blob([report.prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ReportCard = ({ report }: { report: IndividualReport }) => (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{report.name}</CardTitle>
            <CardDescription>{report.phase}</CardDescription>
          </div>
          {report.score !== undefined && (
            <Badge variant={report.score >= 70 ? 'default' : 'destructive'}>
              {report.score}/100
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedReport(report);
              setViewMode('preview');
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Report
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadMarkdown(report)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Download .md
          </Button>
          {report.prompt !== 'N/A - Direct web scraping, no AI prompt' &&
            report.prompt !== 'N/A - Google Lighthouse automated tool' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedReport(report);
                  setViewMode('prompt');
                }}
              >
                <Code className="mr-2 h-4 w-4" />
                View Prompt
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Reports by Phase */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Phase 1 */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            Phase 1: Data Collection
          </h3>
          <div className="space-y-3">
            {phase1Reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>

        {/* Phase 2 */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            Phase 2: Framework Analysis
          </h3>
          <div className="space-y-3">
            {phase2Reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>

        {/* Phase 3 */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            Phase 3: Strategic Analysis
          </h3>
          <div className="space-y-3">
            {phase3Reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </div>

      {/* Selected Report Viewer */}
      {selectedReport && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedReport.name}</CardTitle>
                <CardDescription>
                  {selectedReport.phase} •{' '}
                  {new Date(selectedReport.timestamp).toLocaleString()}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                {selectedReport.prompt !==
                  'N/A - Direct web scraping, no AI prompt' &&
                  selectedReport.prompt !==
                    'N/A - Google Lighthouse automated tool' && (
                    <TabsTrigger value="prompt">AI Prompt</TabsTrigger>
                  )}
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: markdownToHtml(selectedReport.markdown),
                    }}
                  />
                </div>
                <div className="flex gap-2 border-t pt-4">
                  <Button onClick={() => downloadMarkdown(selectedReport)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Markdown
                  </Button>
                  {selectedReport.prompt !==
                    'N/A - Direct web scraping, no AI prompt' &&
                    selectedReport.prompt !==
                      'N/A - Google Lighthouse automated tool' && (
                      <Button
                        variant="outline"
                        onClick={() => downloadPrompt(selectedReport)}
                      >
                        <Code className="mr-2 h-4 w-4" />
                        Download Prompt
                      </Button>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="markdown">
                <pre className="max-h-[600px] overflow-auto rounded-lg bg-muted p-4 text-sm">
                  {selectedReport.markdown}
                </pre>
                <Button
                  className="mt-4"
                  onClick={() => downloadMarkdown(selectedReport)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Markdown
                </Button>
              </TabsContent>

              {selectedReport.prompt !==
                'N/A - Direct web scraping, no AI prompt' &&
                selectedReport.prompt !==
                  'N/A - Google Lighthouse automated tool' && (
                  <TabsContent value="prompt">
                    <div className="space-y-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <strong>
                            This is the exact prompt sent to Google Gemini AI.
                          </strong>{' '}
                          You can copy it and run it manually at{' '}
                          <a
                            href="https://gemini.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            gemini.google.com
                          </a>
                        </p>
                      </div>
                      <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                        {selectedReport.prompt}
                      </pre>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedReport.prompt
                            );
                          }}
                        >
                          Copy Prompt
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => downloadPrompt(selectedReport)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Prompt
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Download All Button */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          onClick={() => {
            reports.forEach((report) => downloadMarkdown(report));
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Download All Reports ({reports.length})
        </Button>
      </div>
    </div>
  );
}

// Simple markdown to HTML converter (basic version)
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\*\*(.+?)\*\*$/gm, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
}

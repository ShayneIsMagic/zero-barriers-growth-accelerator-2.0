'use client';

import { useEffect, useState } from 'react';
import { ClientStorage } from '@/lib/shared/client-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await ClientStorage.listIds();
      if (!mounted) return;
      setIds(list);
      const readiness: Record<string, boolean> = {};
      for (const id of list) {
        const report = await ClientStorage.getComprehensiveReport(id);
        readiness[id] = !!report;
      }
      if (!mounted) return;
      setReady(readiness);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleViewReport = async (id: string) => {
    const report = await ClientStorage.getComprehensiveReport(id);
    const bundle = await ClientStorage.getScrapeBundle(id);
    if (report || bundle) {
      setSelectedReport({ id, report, bundle });
      setSelectedId(id);
    }
  };

  const handleDownloadReport = async (id: string) => {
    const report = await ClientStorage.getComprehensiveReport(id);
    const bundle = await ClientStorage.getScrapeBundle(id);
    const data = { id, report, bundle, timestamp: new Date().toISOString() };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `report-${id.replace(/[:/]/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  if (selectedReport) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedReport(null)}>
            ← Back to Reports
          </Button>
          <Button onClick={() => handleDownloadReport(selectedReport.id)}>
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Report: {selectedReport.id}</CardTitle>
            <CardDescription>Comprehensive analysis report data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedReport.bundle && (
                <div>
                  <h3 className="font-semibold mb-2">Scraped Content</h3>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(selectedReport.bundle, null, 2)}
                  </pre>
                </div>
              )}
              {selectedReport.report && (
                <div>
                  <h3 className="font-semibold mb-2">Comprehensive Report</h3>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-96">
                    {JSON.stringify(selectedReport.report, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved Analyses</CardTitle>
          <CardDescription>
            Reports created from Content Comparison and framework runs. Access your comprehensive reports here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ids.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No saved analyses yet. Run a Content Comparison to generate one.
              </p>
              <Link href="/dashboard/content-comparison">
                <Button>Go to Content Comparison</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ids.map((id) => (
                <div key={id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{id.split('::')[0] || id}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(id.split('::')[1] || Date.now()).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ready[id] ? (
                      <Badge variant="default">Report Ready</Badge>
                    ) : (
                      <Badge variant="secondary">Scrape Saved</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReport(id)}
                      disabled={!ready[id]}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport(id)}
                      disabled={!ready[id]}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

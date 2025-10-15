'use client';

import ReportViewer from '@/components/ReportViewer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Calendar,
    CheckCircle,
    Clock,
    Download,
    ExternalLink,
    Eye,
    FileText,
    Search,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Analysis {
  id: string;
  url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  content?: any;
}

export default function ReportsPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analysis');
      if (!response.ok) throw new Error('Failed to fetch analyses');
      const data = await response.json();
      setAnalyses(data.analyses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'PHASE_2_COMPLETE':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Phase 2</Badge>;
      case 'PHASE_1_COMPLETE':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Phase 1</Badge>;
      case 'PENDING':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreFromContent = (content: any) => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      return parsed.overall_score || parsed.phase2Data?.overall_score || 'N/A';
    } catch {
      return 'N/A';
    }
  };

  if (selectedAnalysis) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedAnalysis(null)}
            className="mb-4"
          >
            ← Back to Reports
          </Button>
        </div>
        <ReportViewer analysisId={selectedAnalysis} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Analysis Reports
          </CardTitle>
          <CardDescription>
            View and manage all your website analysis reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by URL or analysis ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchAnalyses} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Clock className="animate-spin mr-2" />
            <p>Loading reports...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {filteredAnalyses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No reports match your search criteria.' : 'You haven\'t run any analyses yet.'}
                </p>
                <Link href="/dashboard/analysis">
                  <Button>
                    Run Your First Analysis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAnalyses.map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold truncate">
                            {analysis.url}
                          </h3>
                          {getStatusBadge(analysis.status)}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            ID: {analysis.id.slice(0, 8)}...
                          </div>
                          {getScoreFromContent(analysis.content) !== 'N/A' && (
                            <div className="flex items-center">
                              <span className="font-medium">Score:</span>
                              <span className="ml-1 font-bold text-blue-600">
                                {getScoreFromContent(analysis.content)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedAnalysis(analysis.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(analysis.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Site
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const data = {
                                id: analysis.id,
                                url: analysis.url,
                                status: analysis.status,
                                createdAt: analysis.createdAt,
                                content: analysis.content
                              };
                              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `analysis-${analysis.id}.json`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analyses.length}</div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analyses.filter(a => a.status === 'COMPLETE').length}
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {analyses.filter(a => a.status.includes('PHASE')).length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {analyses.filter(a => a.status === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Eye, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EvaluationGuideData {
  success: boolean;
  content: string;
  htmlContent: string;
  metadata: {
    title: string;
    description: string;
    generatedAt: string;
    version: string;
  };
}

export default function EvaluationGuideViewer() {
  const [guideData, setGuideData] = useState<EvaluationGuideData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'markdown' | 'html'>('html');

  const fetchGuide = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-evaluation-guide');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch evaluation guide');
      }
      
      setGuideData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evaluation guide');
    } finally {
      setLoading(false);
    }
  };

  const downloadGuide = () => {
    if (!guideData) return;
    
    const content = viewMode === 'html' ? guideData.htmlContent : guideData.content;
    const extension = viewMode === 'html' ? 'html' : 'md';
    const mimeType = viewMode === 'html' ? 'text/html' : 'text/markdown';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-evaluation-guide.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    if (!guideData) return;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(guideData.htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Website Evaluation Worksheet Integration Guide
          </CardTitle>
          <CardDescription>
            Complete deliverable showing how the system captures actual language and evidence matching for website analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!guideData && !loading && (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generate Evaluation Guide Deliverable
              </h3>
              <p className="text-gray-600 mb-6">
                Access the comprehensive guide that shows exactly how website evaluation scores are calculated with specific evidence and exact language extraction.
              </p>
              <Button onClick={fetchGuide} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Guide
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Generating evaluation guide...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {guideData && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Document Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Title:</span> {guideData.metadata.title}
                  </div>
                  <div>
                    <span className="font-medium">Version:</span> {guideData.metadata.version}
                  </div>
                  <div>
                    <span className="font-medium">Generated:</span> {new Date(guideData.metadata.generatedAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span> {guideData.metadata.description}
                  </div>
                </div>
              </div>

              {/* View Options */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium">View Mode:</span>
                <Button
                  variant={viewMode === 'html' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('html')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Formatted View
                </Button>
                <Button
                  variant={viewMode === 'markdown' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('markdown')}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Raw Markdown
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={downloadGuide} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download {viewMode === 'html' ? 'HTML' : 'Markdown'}
                </Button>
                <Button onClick={openInNewTab} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button onClick={fetchGuide} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Content Preview */}
              <div className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-medium text-gray-900">
                    Preview: Website Evaluation Worksheet Integration Guide
                  </h4>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  {viewMode === 'html' ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: guideData.htmlContent.substring(0, 2000) + '...' }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {guideData.content.substring(0, 2000)}...
                    </pre>
                  )}
                </div>
              </div>

              {/* Features Highlight */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  What&apos;s Included in This Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Complete 3-phase analysis pipeline documentation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Exact language extraction and evidence matching</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>10-category website evaluation worksheet</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Framework-specific evidence matching examples</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Scoring methodology and transparency standards</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Real analysis examples with actual quotes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

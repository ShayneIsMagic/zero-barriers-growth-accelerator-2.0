'use client';

import { AnalysisResult } from '@/lib/ai-providers';
import { AnalysisVisualization } from './AnalysisVisualization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Analysis Report
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <a
              href={analysis.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {analysis.url}
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">
            Analysis completed on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Rich Visualization */}
      <AnalysisVisualization analysis={analysis} />
    </div>
  );
}
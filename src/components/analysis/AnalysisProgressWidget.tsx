'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

interface AnalysisProgressWidgetProps {
  className?: string;
}

interface SimpleAnalysis {
  id: string;
  url: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  steps: {
    baseAnalysis: boolean;
    pageAudit: boolean;
    lighthouse: boolean;
    geminiInsights: boolean;
  };
  startedAt: string;
  completedAt?: string;
}

export default function AnalysisProgressWidget({ className }: AnalysisProgressWidgetProps) {
  const [analyses, setAnalyses] = useState<SimpleAnalysis[]>([]);

  useEffect(() => {
    // Load from localStorage
    const loadAnalyses = () => {
      try {
        const saved = localStorage.getItem('simple-analyses');
        if (saved) {
          setAnalyses(JSON.parse(saved));
        }
      } catch (error) {
        console.warn('Failed to load analyses:', error);
      }
    };

    loadAnalyses();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadAnalyses();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'running':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStepIcon = (completed: boolean) => {
    return completed ? (
      <CheckCircle className="h-3 w-3 text-green-500" />
    ) : (
      <Circle className="h-3 w-3 text-gray-300" />
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          Analysis Progress
        </CardTitle>
        <CardDescription>
          Track your website analysis progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analyses.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Circle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No analyses yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.slice(0, 3).map((analysis) => (
              <div key={analysis.id} className="border rounded-lg p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(analysis.status)}
                    <span className="text-sm font-medium truncate max-w-32">
                      {new URL(analysis.url).hostname}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {analysis.progress}%
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${analysis.progress}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    {getStepIcon(analysis.steps.baseAnalysis)}
                    <span>AI</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStepIcon(analysis.steps.pageAudit)}
                    <span>SEO</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStepIcon(analysis.steps.lighthouse)}
                    <span>Speed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStepIcon(analysis.steps.geminiInsights)}
                    <span>Insights</span>
                  </div>
                </div>

                {/* Time */}
                <div className="text-xs text-gray-500 mt-1">
                  {analysis.status === 'running' ? 'Started' : 'Completed'} at {formatTime(analysis.completedAt || analysis.startedAt)}
                </div>
              </div>
            ))}

            {analyses.length > 3 && (
              <div className="text-center pt-2">
                <span className="text-xs text-gray-500">
                  +{analyses.length - 3} more analyses
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

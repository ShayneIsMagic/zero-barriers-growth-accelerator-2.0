'use client';

import { useEffect, useState } from 'react';

interface SimpleStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
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

export function useSimpleProgress() {
  const [analyses, setAnalyses] = useState<SimpleAnalysis[]>([]);

  useEffect(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('simple-analyses');
      if (saved) {
        setAnalyses(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load analyses:', error);
    }
  }, []);

  const saveAnalyses = (newAnalyses: SimpleAnalysis[]) => {
    setAnalyses(newAnalyses);
    try {
      localStorage.setItem('simple-analyses', JSON.stringify(newAnalyses));
    } catch (error) {
      console.warn('Failed to save analyses:', error);
    }
  };

  const startAnalysis = (url: string): string => {
    const id = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAnalysis: SimpleAnalysis = {
      id,
      url,
      status: 'running',
      progress: 0,
      steps: {
        baseAnalysis: false,
        pageAudit: false,
        lighthouse: false,
        geminiInsights: false,
      },
      startedAt: new Date().toISOString(),
    };

    const updatedAnalyses = [newAnalysis, ...analyses];
    saveAnalyses(updatedAnalyses);
    return id;
  };

  const updateStep = (
    analysisId: string,
    step: keyof SimpleAnalysis['steps'],
    completed: boolean
  ) => {
    const updatedAnalyses = analyses.map((analysis) => {
      if (analysis.id === analysisId) {
        const updatedSteps = { ...analysis.steps, [step]: completed };
        const completedSteps =
          Object.values(updatedSteps).filter(Boolean).length;
        const progress = Math.round((completedSteps / 4) * 100);

        const status: 'running' | 'completed' | 'failed' =
          progress === 100 ? 'completed' : 'running';
        const completedAt =
          status === 'completed' ? new Date().toISOString() : undefined;

        return {
          ...analysis,
          steps: updatedSteps,
          progress,
          status,
          ...(completedAt && { completedAt }),
        };
      }
      return analysis;
    });

    saveAnalyses(updatedAnalyses);
  };

  const markFailed = (analysisId: string) => {
    const updatedAnalyses = analyses.map((analysis) => {
      if (analysis.id === analysisId) {
        return {
          ...analysis,
          status: 'failed' as const,
          completedAt: new Date().toISOString(),
        };
      }
      return analysis;
    });

    saveAnalyses(updatedAnalyses);
  };

  const deleteAnalysis = (analysisId: string) => {
    const updatedAnalyses = analyses.filter(
      (analysis) => analysis.id !== analysisId
    );
    saveAnalyses(updatedAnalyses);
  };

  const clearAll = () => {
    saveAnalyses([]);
  };

  return {
    analyses,
    startAnalysis,
    updateStep,
    markFailed,
    deleteAnalysis,
    clearAll,
  };
}

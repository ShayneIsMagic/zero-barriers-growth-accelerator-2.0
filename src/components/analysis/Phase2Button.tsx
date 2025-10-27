'use client';

import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Phase2ButtonProps {
  scrapedContent: any;
  url: string;
  industry?: string;
  onPhase2Complete: (result: any) => void;
}

export function Phase2Button({ scrapedContent, url, industry, onPhase2Complete }: Phase2ButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhase2 = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/phase2-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          content: scrapedContent,
          industry: industry || 'general'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Phase 2 analysis failed');
      }

      console.log('Phase 2 Analysis Complete:', result);

      // Create complete analysis result
      const completeAnalysis = {
        id: `analysis-${Date.now()}`,
        url: result.url,
        overallScore: 75, // Placeholder score
        summary: 'Phase 2 AI analysis completed',
        status: 'phase2_complete' as const,
        timestamp: new Date().toISOString(),
        goldenCircle: result.data.goldenCircle,
        elementsOfValue: result.data.elementsOfValue,
        cliftonStrengths: result.data.cliftonStrengths,
        b2bElements: result.data.b2bElements,
        recommendations: [],
        scrapedContent: scrapedContent,
        phase: 2
      };

      onPhase2Complete(completeAnalysis);

    } catch (err) {
      console.error('Phase 2 analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handlePhase2}
        disabled={isAnalyzing}
        className="w-full"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running AI Analysis...
          </>
        ) : (
          <>
            <Brain className="mr-2 h-4 w-4" />
            Run Phase 2: AI Analysis
          </>
        )}
      </Button>

      {error && (
        <div className="text-red-600 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
}

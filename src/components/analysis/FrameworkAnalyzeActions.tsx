'use client';

import { Button } from '@/components/ui/button';
import { DeterministicEvaluationButton } from '@/components/analysis/DeterministicEvaluationButton';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface FrameworkAnalyzeActionsProps {
  endpoint: string;
  isBusy: boolean;
  isFlaskRunning: boolean;
  hasUrl: boolean;
  onRunAnalysis: () => void;
  onRunDeterministic: () => void;
  analysisMethod?: string;
  hasProposedContent?: boolean;
  analyzeIcon: ReactNode;
}

export function FrameworkAnalyzeActions({
  endpoint,
  isBusy,
  isFlaskRunning,
  hasUrl,
  onRunAnalysis,
  onRunDeterministic,
  analysisMethod,
  hasProposedContent = false,
  analyzeIcon,
}: FrameworkAnalyzeActionsProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={onRunAnalysis}
          disabled={isBusy || !hasUrl}
          className="w-full sm:flex-1"
          size="lg"
        >
          {isBusy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              {analyzeIcon}
              {hasProposedContent
                ? 'Compare Existing vs. Proposed'
                : 'Analyze Existing Content'}
            </>
          )}
        </Button>
        <DeterministicEvaluationButton
          endpoint={endpoint}
          disabled={!hasUrl}
          isRunning={isFlaskRunning}
          onRun={onRunDeterministic}
        />
      </div>
      {analysisMethod === 'flask-deterministic' ? (
        <p className="text-xs text-muted-foreground">
          Showing deterministic Flask evaluation (pattern matching, no AI).
        </p>
      ) : null}
    </div>
  );
}

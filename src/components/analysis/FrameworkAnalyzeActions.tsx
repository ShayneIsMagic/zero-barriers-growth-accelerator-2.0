'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFlaskEvaluationAvailability } from '@/hooks/useFlaskEvaluationAvailability';
import {
  useFrameworkAnalysisEngine,
  type FrameworkAnalysisEngine,
} from '@/hooks/useFrameworkAnalysisEngine';
import { FLASK_FRAMEWORK_KEYS } from '@/lib/services/flask-evaluation.service';
import { FlaskConical, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

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
  const flaskSupported = Boolean(FLASK_FRAMEWORK_KEYS[endpoint]);
  const {
    available: flaskAvailable,
    loading: flaskLoading,
    message: flaskMessage,
    preferDeterministic,
    defaultEngine,
  } = useFlaskEvaluationAvailability();

  const { engine: analysisEngine, setEngine: setAnalysisEngine } =
    useFrameworkAnalysisEngine({
      preferDeterministic,
      serverDefaultEngine: defaultEngine,
      flaskLoading,
    });

  const isDeterministic = analysisEngine === 'flask-deterministic';
  const isRunning = isBusy || isFlaskRunning;

  const handleRun = (): void => {
    if (isDeterministic) {
      if (!flaskAvailable) {
        toast.error(
          flaskMessage ||
            'Deterministic evaluation API is not reachable. Set EVALUATION_API_URL on Vercel.'
        );
        return;
      }
      onRunDeterministic();
      return;
    }
    onRunAnalysis();
  };

  return (
    <div className="space-y-3">
      {flaskSupported ? (
        <div className="space-y-1">
          <Label htmlFor="framework-analysis-engine">Analysis engine</Label>
          <Select
            value={analysisEngine}
            onValueChange={(value: FrameworkAnalysisEngine) =>
              setAnalysisEngine(value)
            }
            disabled={isRunning || flaskLoading}
          >
            <SelectTrigger id="framework-analysis-engine" className="w-full">
              <SelectValue placeholder="Choose analysis engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai-chunked">
                AI analysis (Ollama chunked)
              </SelectItem>
              <SelectItem
                value="flask-deterministic"
                disabled={!flaskAvailable && !flaskLoading}
              >
                Deterministic — no AI (Flask pattern matching)
              </SelectItem>
            </SelectContent>
          </Select>
          {isDeterministic ? (
            <p className="text-xs text-muted-foreground">
              {flaskAvailable
                ? 'Pattern/synonym scoring via Flask — no LLM calls.'
                : flaskMessage}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Chunked AI scoring. Requires Ollama or Gemini on the server.
            </p>
          )}
        </div>
      ) : null}

      <Button
        onClick={handleRun}
        disabled={isRunning || !hasUrl}
        className="w-full"
        size="lg"
      >
        {isRunning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            {isDeterministic ? (
              <FlaskConical className="mr-2 h-4 w-4" />
            ) : (
              analyzeIcon
            )}
            {hasProposedContent
              ? 'Compare Existing vs. Proposed'
              : isDeterministic
                ? 'Run Deterministic Analysis'
                : 'Analyze Existing Content'}
          </>
        )}
      </Button>

      {analysisMethod === 'flask-deterministic' ? (
        <p className="text-xs text-muted-foreground">
          Showing deterministic Flask evaluation (pattern matching, no AI).
        </p>
      ) : null}
    </div>
  );
}

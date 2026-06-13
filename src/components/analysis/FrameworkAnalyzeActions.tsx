'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
    aiAvailable,
    scoringAvailable,
    environment,
    setupHint,
    aiPrimaryProvider,
  } = useFlaskEvaluationAvailability();

  const { engine: analysisEngine, setEngine: setAnalysisEngine } =
    useFrameworkAnalysisEngine({
      preferDeterministic,
      serverDefaultEngine: defaultEngine,
      flaskAvailable,
      flaskLoading,
    });

  const isDeterministic = analysisEngine === 'flask-deterministic';
  const isRunning = isBusy || isFlaskRunning;
  const noEvaluationBackend =
    !flaskLoading && !scoringAvailable;

  const aiEngineLabel =
    environment === 'production' || aiPrimaryProvider === 'gemini'
      ? 'AI analysis (Gemini chunked)'
      : 'AI analysis (Ollama / Gemini chunked)';

  const handleRun = (): void => {
    if (isDeterministic) {
      if (!flaskAvailable) {
        toast.error(
          flaskMessage ||
            (environment === 'production'
              ? 'Deterministic evaluation API is not reachable. Set EVALUATION_API_URL on Vercel.'
              : 'Flask is not running. Start: cd backend && pipenv run python app.py')
        );
        return;
      }
      onRunDeterministic();
      return;
    }
    if (!aiAvailable) {
      toast.error(
        environment === 'production'
          ? 'AI scoring requires GEMINI_API_KEY on Vercel.'
          : 'AI scoring requires GEMINI_API_KEY or a running Ollama instance.'
      );
      return;
    }
    onRunAnalysis();
  };

  return (
    <div className="space-y-3">
      {noEvaluationBackend ? (
        <Alert variant="destructive">
          <AlertDescription>
            {setupHint ||
              (environment === 'production'
                ? 'Production scoring needs GEMINI_API_KEY on Vercel or EVALUATION_API_URL pointing to hosted Flask.'
                : 'Local scoring needs Flask on :5001, or GEMINI_API_KEY, or Ollama running.')}
          </AlertDescription>
        </Alert>
      ) : null}

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
              <SelectItem value="ai-chunked" disabled={!aiAvailable && !flaskLoading}>
                {aiEngineLabel}
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
              {aiAvailable
                ? environment === 'production'
                  ? 'Chunked AI scoring via Gemini on Vercel.'
                  : 'Chunked AI scoring via Ollama, with Gemini fallback when configured.'
                : 'AI scoring unavailable — configure Gemini or start Ollama.'}
            </p>
          )}
        </div>
      ) : null}

      <Button
        onClick={handleRun}
        disabled={isRunning || !hasUrl || noEvaluationBackend}
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

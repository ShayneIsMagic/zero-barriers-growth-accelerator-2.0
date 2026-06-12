'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FLASK_FRAMEWORK_KEYS,
  isFlaskEvaluationEnabled,
} from '@/lib/services/flask-evaluation.service';
import { FlaskConical, Loader2 } from 'lucide-react';

interface DeterministicEvaluationButtonProps {
  endpoint: string;
  disabled?: boolean;
  isRunning?: boolean;
  onRun: () => void;
}

export function DeterministicEvaluationButton({
  endpoint,
  disabled = false,
  isRunning = false,
  onRun,
}: DeterministicEvaluationButtonProps) {
  const frameworkKey = FLASK_FRAMEWORK_KEYS[endpoint];
  const enabled = isFlaskEvaluationEnabled() && Boolean(frameworkKey);

  if (!enabled) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isRunning}
            onClick={onRun}
          >
            {isRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="mr-2 h-4 w-4" />
            )}
            Deterministic (Flask)
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">
          Pattern-matching evaluation on port 5001 — no AI. Set
          NEXT_PUBLIC_ENABLE_FLASK_EVALUATION=true and run the Flask backend.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

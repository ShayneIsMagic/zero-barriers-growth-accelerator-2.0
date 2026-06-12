'use client';

import { useEffect, useState } from 'react';

export interface FlaskEvaluationAvailability {
  available: boolean;
  loading: boolean;
  message: string;
  preferDeterministic: boolean;
  defaultEngine: 'ai-chunked' | 'flask-deterministic';
}

const INITIAL: FlaskEvaluationAvailability = {
  available: false,
  loading: true,
  message: '',
  preferDeterministic: false,
  defaultEngine: 'ai-chunked',
};

/**
 * Runtime check — does not rely on NEXT_PUBLIC_ENABLE_FLASK_EVALUATION build flag.
 */
export function useFlaskEvaluationAvailability(): FlaskEvaluationAvailability {
  const [state, setState] = useState<FlaskEvaluationAvailability>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const response = await fetch('/api/system/status', { cache: 'no-store' });
        const data = (await response.json()) as {
          evaluation?: {
            flask?: { status?: string; message?: string; enabled?: boolean };
            preferDeterministic?: boolean;
            defaultEngine?: 'ai-chunked' | 'flask-deterministic';
          };
        };

        if (cancelled) {
          return;
        }

        const flask = data.evaluation?.flask;
        const available = flask?.status === 'healthy';
        const defaultEngine =
          data.evaluation?.defaultEngine === 'flask-deterministic'
            ? 'flask-deterministic'
            : 'ai-chunked';

        setState({
          available,
          loading: false,
          message:
            flask?.message ??
            (available
              ? 'Deterministic evaluation ready'
              : 'Evaluation API not reachable — set EVALUATION_API_URL on Vercel'),
          preferDeterministic: Boolean(data.evaluation?.preferDeterministic),
          defaultEngine,
        });
      } catch {
        if (!cancelled) {
          setState({
            available: false,
            loading: false,
            message: 'Could not reach system status',
            preferDeterministic: false,
            defaultEngine: 'ai-chunked',
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

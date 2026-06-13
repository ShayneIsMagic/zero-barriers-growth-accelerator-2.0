'use client';

import { useEffect, useState } from 'react';

export interface FlaskEvaluationAvailability {
  available: boolean;
  loading: boolean;
  message: string;
  preferDeterministic: boolean;
  /** Engine to use when ?engine= is not set (accounts for Flask health). */
  defaultEngine: 'ai-chunked' | 'flask-deterministic';
  configuredDefaultEngine: 'ai-chunked' | 'flask-deterministic';
  aiAvailable: boolean;
  scoringAvailable: boolean;
  environment: 'local' | 'production';
  setupHint: string;
  aiPrimaryProvider: 'gemini' | 'ollama' | 'none';
}

const INITIAL: FlaskEvaluationAvailability = {
  available: false,
  loading: true,
  message: '',
  preferDeterministic: false,
  defaultEngine: 'ai-chunked',
  configuredDefaultEngine: 'ai-chunked',
  aiAvailable: false,
  scoringAvailable: false,
  environment: 'local',
  setupHint: '',
  aiPrimaryProvider: 'none',
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
          scoring?: {
            environment?: 'local' | 'production';
            anyAvailable?: boolean;
            setupHint?: string;
            ai?: {
              available?: boolean;
              primaryProvider?: 'gemini' | 'ollama' | 'none';
            };
            flask?: { available?: boolean };
          };
          evaluation?: {
            flask?: { status?: string; message?: string; enabled?: boolean };
            preferDeterministic?: boolean;
            defaultEngine?: 'ai-chunked' | 'flask-deterministic';
            configuredDefaultEngine?: 'ai-chunked' | 'flask-deterministic';
          };
          ai?: {
            canRunChunkedAnalysis?: boolean;
            primaryProvider?: 'gemini' | 'ollama' | 'none';
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
        const configuredDefaultEngine =
          data.evaluation?.configuredDefaultEngine === 'flask-deterministic'
            ? 'flask-deterministic'
            : 'ai-chunked';
        const aiAvailable = Boolean(
          data.scoring?.ai?.available ?? data.ai?.canRunChunkedAnalysis
        );
        const scoringAvailable = Boolean(
          data.scoring?.anyAvailable ?? (available || aiAvailable)
        );

        setState({
          available,
          loading: false,
          message:
            flask?.message ??
            (available
              ? 'Deterministic evaluation ready'
              : data.scoring?.environment === 'production'
                ? 'Set EVALUATION_API_URL on Vercel for Flask scoring'
                : 'Start Flask: cd backend && pipenv run python app.py'),
          preferDeterministic: Boolean(data.evaluation?.preferDeterministic),
          defaultEngine,
          configuredDefaultEngine,
          aiAvailable,
          scoringAvailable,
          environment: data.scoring?.environment ?? 'local',
          setupHint: data.scoring?.setupHint ?? '',
          aiPrimaryProvider:
            data.scoring?.ai?.primaryProvider ??
            data.ai?.primaryProvider ??
            'none',
        });
      } catch {
        if (!cancelled) {
          setState({
            available: false,
            loading: false,
            message: 'Could not reach system status',
            preferDeterministic: false,
            defaultEngine: 'ai-chunked',
            configuredDefaultEngine: 'ai-chunked',
            aiAvailable: false,
            scoringAvailable: false,
            environment: 'local',
            setupHint: '',
            aiPrimaryProvider: 'none',
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

import 'server-only';

import { isRemoteEvaluationApiConfigured } from '@/lib/server/flask-config';
import {
  isGeminiConfigured,
  isServerlessDeployment,
} from '@/lib/scoring/scoring-env';

export type ServerAnalysisEngine = 'ai-chunked' | 'flask-deterministic';

export function parseAnalysisEngineParam(
  value: string | null | undefined
): ServerAnalysisEngine | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === 'flask' ||
    normalized === 'deterministic' ||
    normalized === 'no-ai' ||
    normalized === 'flask-deterministic'
  ) {
    return 'flask-deterministic';
  }

  if (
    normalized === 'ai' ||
    normalized === 'ollama' ||
    normalized === 'ai-chunked' ||
    normalized === 'chunked'
  ) {
    return 'ai-chunked';
  }

  return null;
}

interface ResolveEffectiveEngineInput {
  flaskHealthy: boolean;
  ollamaHealthy: boolean;
  geminiConfigured: boolean;
}

/** Configured preference from env — may point at an unreachable backend. */
export function getConfiguredDefaultAnalysisEngine(): ServerAnalysisEngine {
  const explicit = parseAnalysisEngineParam(process.env.DEFAULT_ANALYSIS_ENGINE);
  if (explicit) {
    return explicit;
  }

  if (isRemoteEvaluationApiConfigured()) {
    return 'flask-deterministic';
  }

  return 'ai-chunked';
}

/** Engine the UI should select when no ?engine= override is present. */
export function getEffectiveDefaultAnalysisEngine(
  input: ResolveEffectiveEngineInput
): ServerAnalysisEngine {
  const configured = getConfiguredDefaultAnalysisEngine();
  const geminiConfigured =
    input.geminiConfigured || isGeminiConfigured();

  if (configured === 'flask-deterministic' && input.flaskHealthy) {
    return 'flask-deterministic';
  }

  // Local dev: prefer Flask when the backend is running on :5001
  if (!isServerlessDeployment() && input.flaskHealthy) {
    return 'flask-deterministic';
  }

  // Production: prefer Gemini AI when configured (Ollama is not on Vercel)
  if (isServerlessDeployment() && geminiConfigured) {
    return 'ai-chunked';
  }

  if (input.flaskHealthy && !input.ollamaHealthy && !geminiConfigured) {
    return 'flask-deterministic';
  }

  return 'ai-chunked';
}

/** @deprecated Use getConfiguredDefaultAnalysisEngine or getEffectiveDefaultAnalysisEngine. */
export function getDefaultAnalysisEngine(): ServerAnalysisEngine {
  return getConfiguredDefaultAnalysisEngine();
}

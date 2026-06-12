import 'server-only';

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

/** Default engine for dashboard pages when no ?engine= query param is present. */
export function getDefaultAnalysisEngine(): ServerAnalysisEngine {
  const explicit = parseAnalysisEngineParam(process.env.DEFAULT_ANALYSIS_ENGINE);
  if (explicit) {
    return explicit;
  }

  // Live Vercel deployments default to deterministic Flask (no Ollama on serverless).
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
    return 'flask-deterministic';
  }

  return 'ai-chunked';
}

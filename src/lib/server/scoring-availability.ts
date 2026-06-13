import 'server-only';

import type { FlaskHealthResult } from '@/lib/server/flask-health';
import type { OllamaHealthResult } from '@/lib/server/ollama-health';
import {
  isGeminiConfigured,
  isServerlessDeployment,
} from '@/lib/scoring/scoring-env';

export { isGeminiConfigured, isServerlessDeployment } from '@/lib/scoring/scoring-env';

export interface ScoringAvailability {
  environment: 'local' | 'production';
  ai: {
    available: boolean;
    primaryProvider: 'gemini' | 'ollama' | 'none';
    geminiConfigured: boolean;
    ollamaReady: boolean;
  };
  flask: {
    available: boolean;
    baseUrl: string;
  };
  anyAvailable: boolean;
  recommendedEngine: 'ai-chunked' | 'flask-deterministic';
  setupHint: string;
}

export function resolveScoringAvailability(input: {
  ollama: OllamaHealthResult;
  flask: FlaskHealthResult;
}): ScoringAvailability {
  const environment = isServerlessDeployment() ? 'production' : 'local';
  const geminiConfigured = isGeminiConfigured();
  const ollamaReady = input.ollama.status === 'ready';
  const flaskAvailable =
    input.flask.status === 'healthy' && input.flask.enabled !== false;

  let primaryProvider: ScoringAvailability['ai']['primaryProvider'] = 'none';
  if (environment === 'production' && geminiConfigured) {
    primaryProvider = 'gemini';
  } else if (ollamaReady) {
    primaryProvider = 'ollama';
  } else if (geminiConfigured) {
    primaryProvider = 'gemini';
  }

  const aiAvailable = geminiConfigured || ollamaReady;

  let recommendedEngine: ScoringAvailability['recommendedEngine'] = 'ai-chunked';

  if (environment === 'local' && flaskAvailable) {
    recommendedEngine = 'flask-deterministic';
  } else if (environment === 'production' && geminiConfigured) {
    recommendedEngine = 'ai-chunked';
  } else if (flaskAvailable && !geminiConfigured && !ollamaReady) {
    recommendedEngine = 'flask-deterministic';
  } else if (aiAvailable) {
    recommendedEngine = 'ai-chunked';
  }

  const anyAvailable = aiAvailable || flaskAvailable;

  let setupHint = '';
  if (!anyAvailable) {
    setupHint =
      environment === 'production'
        ? 'Add GEMINI_API_KEY on Vercel, or set EVALUATION_API_URL to a hosted Flask API, then redeploy.'
        : 'Start Flask (cd backend && pipenv run python app.py), or set GEMINI_API_KEY / start Ollama locally.';
  } else if (environment === 'local' && flaskAvailable) {
    setupHint =
      'Local scoring: Flask deterministic is ready. AI path uses Ollama with Gemini fallback when configured.';
  } else if (environment === 'production' && geminiConfigured) {
    setupHint = 'Production scoring: Gemini AI is configured for chunked framework analysis.';
  } else if (flaskAvailable) {
    setupHint = 'Deterministic Flask scoring is available.';
  } else {
    setupHint = 'AI chunked scoring is available.';
  }

  return {
    environment,
    ai: {
      available: aiAvailable,
      primaryProvider,
      geminiConfigured,
      ollamaReady,
    },
    flask: {
      available: flaskAvailable,
      baseUrl: input.flask.baseUrl,
    },
    anyAvailable,
    recommendedEngine,
    setupHint,
  };
}

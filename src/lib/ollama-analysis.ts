/**
 * Ollama Local AI Analysis Service
 *
 * Uses the local Ollama REST API (http://localhost:11434) to run
 * open-source models for framework analysis. Designed as the primary
 * provider for local development, with Claude and Gemini as fallbacks.
 *
 * Default model: llama3.1:8b
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const OLLAMA_KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE || '6h';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';
const OLLAMA_AUTH_SCHEME = process.env.OLLAMA_AUTH_SCHEME || 'Bearer';
const OLLAMA_NUM_PREDICT = Number(process.env.OLLAMA_NUM_PREDICT || '1400');

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

function getOllamaRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (OLLAMA_API_KEY) {
    headers.Authorization = `${OLLAMA_AUTH_SCHEME} ${OLLAMA_API_KEY}`;
  }
  return headers;
}

function isLocalOllamaUrl(url: string): boolean {
  return url.includes('127.0.0.1') || url.includes('localhost');
}

export function getOllamaConfigurationIssue(): string | null {
  const isVercelRuntime = process.env.VERCEL === '1';
  if (isVercelRuntime && isLocalOllamaUrl(OLLAMA_BASE_URL)) {
    return `Invalid OLLAMA_BASE_URL for Vercel: ${OLLAMA_BASE_URL}. Use a network-reachable Ollama endpoint (remote VM/container), not localhost.`;
  }
  return null;
}

export async function ensureOllamaReadyForAssessment(): Promise<boolean> {
  if (getOllamaConfigurationIssue()) {
    return false;
  }
  return isOllamaAvailable();
}

/**
 * Check whether the Ollama server is reachable and the configured model is available.
 */
export async function isOllamaAvailable(): Promise<boolean> {
  const configurationIssue = getOllamaConfigurationIssue();
  if (configurationIssue) {
    console.log(configurationIssue);
    return false;
  }

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      headers: getOllamaRequestHeaders(),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.log(`Ollama health check returned ${res.status}`);
      return false;
    }

    const data = (await res.json()) as { models?: { name: string }[] };
    const models = data.models || [];
    const modelPrefix = OLLAMA_MODEL.split(':')[0];
    const found = models.some(
      (m) => m.name === OLLAMA_MODEL || m.name.startsWith(modelPrefix)
    );

    if (!found) {
      console.log(
        `Ollama is running but model "${OLLAMA_MODEL}" not found. Available: ${models.map((m) => m.name).join(', ')}`
      );
    }

    return found;
  } catch (err) {
    console.log(`Ollama not reachable at ${OLLAMA_BASE_URL}: ${err instanceof Error ? err.message : 'unknown'}`);
    return false;
  }
}

/**
 * Analyze content using the local Ollama model.
 * Returns parsed JSON or throws on failure.
 */
export async function analyzeWithOllama(
  prompt: string,
  _analysisType: string
): Promise<Record<string, unknown>> {
  const configurationIssue = getOllamaConfigurationIssue();
  if (configurationIssue) {
    throw new Error(configurationIssue);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 900_000);

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: getOllamaRequestHeaders(),
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt:
          prompt +
          '\n\nIMPORTANT: Return ONLY valid JSON. No markdown code fences, no explanatory text outside the JSON object.',
        stream: false,
        // Keep model loaded during active usage; auto-unload after 6h inactivity.
        keep_alive: OLLAMA_KEEP_ALIVE,
        options: {
          temperature: 0.3,
          // Keep chunked framework responses bounded so local analyses do not stall.
          num_predict: OLLAMA_NUM_PREDICT,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Ollama returned ${res.status}: ${body.substring(0, 200)}`);
    }

    const data = (await res.json()) as OllamaGenerateResponse;
    const text = data.response || '';

    let jsonText = text.trim();
    jsonText = jsonText
      .replace(/^```(?:json|javascript)?\s*/i, '')
      .replace(/\s*```$/i, '');

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
      throw new Error(`Ollama returned non-JSON response: ${jsonText.substring(0, 100)}`);
    }

    try {
      return JSON.parse(jsonText);
    } catch {
      throw new Error(`Ollama returned invalid JSON: ${jsonText.substring(0, 100)}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

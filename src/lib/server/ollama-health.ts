import 'server-only';

export interface OllamaHealthResult {
  status: 'ready' | 'unreachable' | 'model_missing' | 'not_configured';
  baseUrl: string;
  model: string;
  availableModels: string[];
  message: string;
}

export async function checkOllamaHealth(): Promise<OllamaHealthResult> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';

  if (!process.env.OLLAMA_BASE_URL && process.env.NODE_ENV === 'production') {
    return {
      status: 'not_configured',
      baseUrl,
      model,
      availableModels: [],
      message: 'OLLAMA_BASE_URL is not configured',
    };
  }

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        status: 'unreachable',
        baseUrl,
        model,
        availableModels: [],
        message: `Ollama returned HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as { models?: Array<{ name?: string }> };
    const availableModels = (data.models ?? [])
      .map((item) => item.name)
      .filter((name): name is string => typeof name === 'string');

    const modelPrefix = model.split(':')[0];
    const hasModel = availableModels.some(
      (name) => name === model || name.startsWith(`${modelPrefix}:`)
    );

    if (!hasModel) {
      return {
        status: 'model_missing',
        baseUrl,
        model,
        availableModels,
        message: `Model "${model}" is not available locally`,
      };
    }

    return {
      status: 'ready',
      baseUrl,
      model,
      availableModels,
      message: 'Ollama is ready',
    };
  } catch (error) {
    return {
      status: 'unreachable',
      baseUrl,
      model,
      availableModels: [],
      message: error instanceof Error ? error.message : 'Ollama unreachable',
    };
  }
}

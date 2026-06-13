import 'server-only';

const DEFAULT_EVALUATION_API_URL = 'http://127.0.0.1:5001';

const LOCAL_EVALUATION_HOSTS = new Set([
  '127.0.0.1',
  'localhost',
  '0.0.0.0',
  '::1',
]);

/** True when EVALUATION_API_URL points at a host reachable outside the dev machine. */
export function isRemoteEvaluationApiConfigured(): boolean {
  const url = getEvaluationApiUrl();
  try {
    const parsed = new URL(url);
    return !LOCAL_EVALUATION_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function getEvaluationApiUrl(): string {
  const candidates = [
    process.env.EVALUATION_API_URL,
    process.env.NEXT_PUBLIC_EVALUATION_API_URL,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return normalizeEvaluationApiUrl(value.trim());
    }
  }

  return DEFAULT_EVALUATION_API_URL;
}

function normalizeEvaluationApiUrl(url: string): string {
  return url
    .replace(/\/$/, '')
    .replace('://localhost', '://127.0.0.1')
    .replace('://localhost:', '://127.0.0.1:');
}

/** Server-side gate for Flask proxy and status endpoints. */
export function isFlaskEvaluationEnabledServer(): boolean {
  if (process.env.ENABLE_FLASK_EVALUATION === 'false') {
    return false;
  }
  if (process.env.NEXT_PUBLIC_ENABLE_FLASK_EVALUATION === 'false') {
    return false;
  }
  if (
    process.env.ENABLE_FLASK_EVALUATION === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_FLASK_EVALUATION === 'true'
  ) {
    return true;
  }
  // Default on — UI shows toggle; health check marks unavailable when backend is down.
  return true;
}

const PLACEHOLDER_GEMINI_KEYS = new Set([
  'your-gemini-api-key-here',
  'your-gemini-api-key',
]);

export function isServerlessDeployment(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

export function isGeminiConfigured(): boolean {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) {
    return false;
  }
  return !PLACEHOLDER_GEMINI_KEYS.has(key);
}

/**
 * Claude AI Analysis Service
 * Falls back to Claude when Gemini is unavailable (suspended, quota exceeded, etc.)
 *
 * FREE TIER LIMITS (must respect):
 * - 5 requests per minute
 * - 10K input tokens per minute (excluding cache reads)
 * - 4K output tokens per minute
 * - Model: claude-3-haiku-20240307 (cheapest, fastest)
 */

import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';

// Rate limiting state
let requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 5;
const MINUTE_MS = 60_000;

/**
 * Simple rate limiter: waits if we've hit 5 requests in the last 60 seconds
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  // Prune old timestamps
  requestTimestamps = requestTimestamps.filter((t) => now - t < MINUTE_MS);

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestInWindow = requestTimestamps[0];
    const waitTime = MINUTE_MS - (now - oldestInWindow) + 500; // +500ms buffer
    console.log(
      `⏳ Claude rate limit: waiting ${Math.round(waitTime / 1000)}s before next request`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    // Re-prune after waiting
    requestTimestamps = requestTimestamps.filter(
      (t) => Date.now() - t < MINUTE_MS
    );
  }

  requestTimestamps.push(Date.now());
}

/**
 * Truncate content to stay under ~8K input tokens (~32K chars)
 * Claude haiku free tier: 10K input tokens/min
 * We keep prompts lean to stay well under the limit.
 */
function truncateForTokenLimit(text: string, maxChars: number = 6000): string {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '\n[... content truncated for token limit ...]';
}

/**
 * Analyze content with Claude API
 * Returns parsed JSON or throws on failure
 */
export async function analyzeWithClaude(
  prompt: string,
  _analysisType: string
): Promise<Record<string, unknown>> {
  if (!CLAUDE_API_KEY) {
    throw new Error(
      'CLAUDE_API_KEY not configured. Add CLAUDE_API_KEY to your .env.local file.'
    );
  }

  // Respect rate limits
  await waitForRateLimit();

  const claude = new Anthropic({
    apiKey: CLAUDE_API_KEY,
  });

  // Truncate prompt to stay within input token limits
  const safePrompt = truncateForTokenLimit(prompt, 8000);

  const model = process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307';

  const message = await claude.messages.create({
    model,
    max_tokens: 3500,
    messages: [
      {
        role: 'user',
        content:
          safePrompt +
          '\n\nIMPORTANT: Return ONLY valid JSON. No markdown code fences, no explanatory text outside the JSON object.',
      },
    ],
  });

  const text =
    message.content?.[0]?.type === 'text' ? message.content[0].text || '' : '';

  // Clean up response - remove markdown code fences if present
  let jsonText = text.trim();
  jsonText = jsonText
    .replace(/^```(?:json|javascript)?\s*/i, '')
    .replace(/\s*```$/i, '');

  // Try to extract JSON object
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.error('Claude JSON parsing error. Raw response:', jsonText.substring(0, 200));
    throw new Error(
      `Claude returned invalid JSON: ${jsonText.substring(0, 100)}`
    );
  }
}

/**
 * Check if Claude API key is configured
 */
export function isClaudeConfigured(): boolean {
  return Boolean(CLAUDE_API_KEY && CLAUDE_API_KEY !== 'your-claude-api-key');
}


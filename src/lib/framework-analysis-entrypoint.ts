'use client';

import { CanonicalFrameworkPayload } from '@/types/canonical-framework-payload';

interface AnalyzeFrameworkParams {
  frameworkName: string;
  payload: CanonicalFrameworkPayload;
  stream?: boolean;
  analysisType?: string;
}

const FRAMEWORK_ENDPOINTS: Record<string, string> = {
  'b2c-elements': '/api/analyze/elements-value-b2c-standalone',
  'b2b-elements': '/api/analyze/elements-value-b2b-standalone',
  clifton: '/api/analyze/clifton-strengths-standalone',
  'golden-circle': '/api/analyze/golden-circle-standalone',
  'brand-archetypes': '/api/analyze/brand-archetypes-standalone',
};

/**
 * Single framework analysis entry point used by framework pages.
 * Server routes remain Ollama-first and handle fallback behavior.
 */
export async function analyzeFrameworkWithAI({
  frameworkName,
  payload,
  stream = true,
  analysisType = 'full',
}: AnalyzeFrameworkParams): Promise<Response> {
  const endpoint = FRAMEWORK_ENDPOINTS[frameworkName];
  if (!endpoint) {
    throw new Error(`Unsupported framework: ${frameworkName}`);
  }

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: payload.url,
      proposedContent: payload.proposedContent || '',
      existingContent: payload.rawEvidence,
      canonicalPayload: payload,
      analysisType,
      stream,
    }),
  });
}

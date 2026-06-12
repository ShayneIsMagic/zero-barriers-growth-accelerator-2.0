/**
 * Client for Flask deterministic evaluation API (port 5001).
 * See backend/API_DOCUMENTATION.md — POST /api/evaluate
 */

import type { CanonicalFrameworkPayload } from '@/types/canonical-framework-payload';
import {
  buildCanonicalFrameworkPayload,
  normalizeRawEvidence,
} from '@/types/canonical-framework-payload';

export interface FlaskEvaluateRequest {
  frameworkKey: string;
  payload: CanonicalFrameworkPayload | Record<string, unknown>;
  persistCollection?: boolean;
}

export interface FlaskEvaluateResponse {
  success: boolean;
  runId?: string;
  frameworkKey?: string;
  overallScore?: number;
  totalElements?: number;
  categories?: Record<string, unknown>;
  topStrengths?: unknown[];
  criticalGaps?: unknown[];
  analysisMethod?: string;
  verification?: Record<string, unknown>;
  error?: string;
  details?: string;
}

function getFlaskBaseUrl(): string {
  const fromEnv =
    typeof process.env.NEXT_PUBLIC_EVALUATION_API_URL === 'string'
      ? process.env.NEXT_PUBLIC_EVALUATION_API_URL.trim()
      : '';
  return fromEnv || 'http://localhost:5001';
}

export function isFlaskEvaluationEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_FLASK_EVALUATION === 'true';
}

export async function evaluateWithFlask(
  request: FlaskEvaluateRequest
): Promise<FlaskEvaluateResponse> {
  const baseUrl = getFlaskBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/api/evaluate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      frameworkKey: request.frameworkKey,
      payload: request.payload,
      persistCollection: request.persistCollection ?? true,
    }),
  });

  const data = (await response.json()) as FlaskEvaluateResponse;
  if (!response.ok || !data.success) {
    throw new Error(data.error || data.details || `Flask evaluate failed (${response.status})`);
  }
  return data;
}

export interface RunFlaskFrameworkEvaluationParams {
  frameworkKey: string;
  pageUrl: string;
  existingContent: Record<string, unknown>;
  proposedContent?: string;
}

export async function runFlaskFrameworkEvaluation(
  params: RunFlaskFrameworkEvaluationParams
): Promise<FlaskEvaluateResponse> {
  return evaluateWithFlask({
    frameworkKey: params.frameworkKey,
    payload: buildCanonicalFrameworkPayload({
      url: params.pageUrl,
      collectorType: 'content-collect-api',
      rawEvidence: normalizeRawEvidence(params.existingContent),
      proposedContent: params.proposedContent,
    }),
  });
}

export async function checkFlaskHealth(): Promise<boolean> {
  try {
    const baseUrl = getFlaskBaseUrl();
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return false;
    }
    const data = (await response.json()) as { success?: boolean; status?: string };
    return data.success === true || data.status === 'healthy';
  } catch {
    return false;
  }
}

export const FLASK_FRAMEWORK_KEYS: Record<string, string> = {
  '/api/analyze/elements-value-b2c-standalone': 'b2c-elements',
  '/api/analyze/elements-value-b2b-standalone': 'b2b-elements',
  '/api/analyze/clifton-strengths-standalone': 'clifton',
  '/api/analyze/golden-circle-standalone': 'golden-circle',
  '/api/analyze/brand-archetypes-standalone': 'brand-archetypes',
  '/api/analyze/revenue-trends': 'revenue-trends',
};

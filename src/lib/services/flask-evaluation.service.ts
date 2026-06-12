/**
 * Client for deterministic Flask evaluation via Next.js proxy (/api/evaluate).
 * See backend/API_DOCUMENTATION.md — upstream POST /api/evaluate on port 5001.
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

/** @deprecated Use runtime availability from useFlaskEvaluationAvailability instead. */
export function isFlaskEvaluationEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_FLASK_EVALUATION !== 'false';
}

export async function evaluateWithFlask(
  request: FlaskEvaluateRequest
): Promise<FlaskEvaluateResponse> {
  const response = await fetch('/api/evaluate', {
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
    throw new Error(
      data.error ||
        data.details ||
        `Deterministic evaluation failed (${response.status})`
    );
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

export const FLASK_FRAMEWORK_KEYS: Record<string, string> = {
  '/api/analyze/elements-value-b2c-standalone': 'b2c-elements',
  '/api/analyze/elements-value-b2b-standalone': 'b2b-elements',
  '/api/analyze/clifton-strengths-standalone': 'clifton',
  '/api/analyze/golden-circle-standalone': 'golden-circle',
  '/api/analyze/brand-archetypes-standalone': 'brand-archetypes',
  '/api/analyze/revenue-trends': 'revenue-trends',
};

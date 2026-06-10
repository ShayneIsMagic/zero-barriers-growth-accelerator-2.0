/**
 * Persist standalone framework analyses to Postgres (Prisma).
 * AGENTS: server owns durable data; client LocalForage is a cache only.
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { StructuredStorageService } from '@/lib/services/structured-storage.service';
import { getRequestUser } from '@/lib/server/api-route';
import type { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

export interface PersistStandaloneAnalysisInput {
  userId: string | null;
  url: string;
  /** Internal framework key — e.g. golden-circle, b2c-elements */
  framework: string;
  /** Analysis.contentType — e.g. golden-circle-standalone */
  contentType: string;
  analysis: Record<string, unknown>;
  proposed?: unknown;
}

export interface PersistStandaloneAnalysisResult {
  analysisId: string | null;
  frameworkResultId: string | null;
}

export function resolveStandaloneScore(
  analysis: Record<string, unknown>
): number | null {
  if (typeof analysis.overallScore === 'number') {
    return analysis.overallScore;
  }
  if (typeof analysis.overall_score === 'number') {
    return analysis.overall_score;
  }
  return null;
}

/**
 * Store analysis JSON on Analysis; optionally mirror into FrameworkResult tables.
 * Skips silently when userId is null (unauthenticated local dev).
 */
export async function persistStandaloneAnalysis(
  input: PersistStandaloneAnalysisInput
): Promise<PersistStandaloneAnalysisResult> {
  if (!input.userId) {
    return { analysisId: null, frameworkResultId: null };
  }

  const analysisId = randomUUID();
  const score = resolveStandaloneScore(input.analysis);

  const content = JSON.stringify({
    url: input.url,
    framework: input.framework,
    analysis: input.analysis,
    proposed: input.proposed ?? null,
    persistedAt: new Date().toISOString(),
  });

  try {
    await prisma.analysis.create({
      data: {
        id: analysisId,
        userId: input.userId,
        content,
        contentType: input.contentType,
        status: 'COMPLETED',
        score,
      },
    });
  } catch (error) {
    logger.error(
      `[analysis-persistence] Failed to create Analysis for ${input.contentType}`,
      error
    );
    return { analysisId: null, frameworkResultId: null };
  }

  let frameworkResultId: string | null = null;
  try {
    const structured = await StructuredStorageService.storeFrameworkResult(
      analysisId,
      input.framework,
      input.analysis
    );
    frameworkResultId = structured.id;
  } catch (error) {
    logger.error(
      `[analysis-persistence] Structured storage failed for ${input.framework}`,
      error
    );
  }

  return { analysisId, frameworkResultId };
}

/**
 * Attach analysisId to a route response when the caller is authenticated.
 */
export async function enrichResponseWithPersistence(
  request: NextRequest,
  input: Omit<PersistStandaloneAnalysisInput, 'userId'>,
  response: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const user = getRequestUser(request);
  const persisted = await persistStandaloneAnalysis({
    ...input,
    userId: user?.userId ?? null,
  });

  if (!persisted.analysisId) {
    return response;
  }

  return {
    ...response,
    analysisId: persisted.analysisId,
    frameworkResultId: persisted.frameworkResultId,
  };
}

/** Streaming `onComplete` hook for standalone framework routes. */
export function buildPersistenceOnComplete(
  request: NextRequest,
  meta: Omit<PersistStandaloneAnalysisInput, 'userId' | 'analysis'>
): (
  analysis: Record<string, unknown>,
  response: Record<string, unknown>
) => Promise<Record<string, unknown>> {
  return async (analysis, response) =>
    enrichResponseWithPersistence(request, { ...meta, analysis }, response);
}

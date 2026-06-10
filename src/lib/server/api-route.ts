/**
 * Shared Next.js API route utilities.
 * Adapted from AGENTS-backend BaseRoute patterns for this monorepo.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { isDevelopmentEnvironment as isDevEnv } from '@/lib/security-config';
import { verifyAuthToken, type AuthTokenPayload } from '@/lib/server/jwt';

export interface ApiErrorBody {
  success: false;
  error: string;
  details?: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponseBody<T> = ApiSuccessBody<T> | ApiErrorBody;

export function isDevelopmentEnvironment(): boolean {
  return isDevEnv();
}

/**
 * Returns 404 in production so test/debug routes are not discoverable.
 */
export function guardDevelopmentOnly(): NextResponse<ApiErrorBody> | null {
  if (isDevelopmentEnvironment()) {
    return null;
  }

  return NextResponse.json(
    { success: false, error: 'Not found' },
    { status: 404 }
  );
}

export function apiErrorResponse(
  status: number,
  error: string,
  details?: string
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { success: false, error };
  if (details) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

export function apiSuccessResponse<T>(
  data: T,
  options?: { status?: number; message?: string }
): NextResponse<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = {
    success: true,
    data,
  };
  if (options?.message) {
    body.message = options.message;
  }
  return NextResponse.json(body, { status: options?.status ?? 200 });
}

export async function parseRequestJson<T extends Record<string, unknown>>(
  request: NextRequest
): Promise<{ data: T } | { error: NextResponse<ApiErrorBody> }> {
  try {
    const data = (await request.json()) as T;
    return { data };
  } catch {
    return {
      error: apiErrorResponse(400, 'Invalid JSON body'),
    };
  }
}

export function logRouteError(route: string, error: unknown): void {
  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error(`[${route}] ${message}`, error);
}

export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Require a valid JWT. Returns payload or a 401 response.
 */
export function requireAuth(
  request: NextRequest
): { user: AuthTokenPayload } | { error: NextResponse<ApiErrorBody> } {
  const token = extractBearerToken(request);
  if (!token) {
    return { error: apiErrorResponse(401, 'Authentication required') };
  }

  const user = verifyAuthToken(token);
  if (!user) {
    return { error: apiErrorResponse(401, 'Invalid or expired token') };
  }

  return { user };
}

/** Read user identity set by middleware (fallback for cookie-only requests). */
export function getRequestUser(request: NextRequest): AuthTokenPayload | null {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role');

  if (userId && email && role) {
    return { userId, email, role };
  }

  const token = extractBearerToken(request);
  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

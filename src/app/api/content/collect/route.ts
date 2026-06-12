/**
 * Unified content collection API — delegates to the proven compare and multi-page routes.
 * Prefer calling /api/analyze/compare or /api/scrape-multi-page directly from the client.
 */

import {
  apiErrorResponse,
  logRouteError,
  parseRequestJson,
} from '@/lib/server/api-route';
import type { ContentCollectionMode } from '@/types/content-collection';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

interface CollectRequestBody extends Record<string, unknown> {
  url?: string;
  mode?: ContentCollectionMode;
  options?: Record<string, unknown>;
}

function isValidUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function forwardCollectionRequest(
  request: NextRequest,
  targetPath: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; status: number; payload: Record<string, unknown> }> {
  const origin = request.nextUrl.origin;
  const response = await fetch(`${origin}${targetPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as Record<string, unknown>;
  return { ok: response.ok, status: response.status, payload };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = await parseRequestJson<CollectRequestBody>(request);
  if ('error' in parsed) {
    return parsed.error;
  }

  const { url, mode = 'comprehensive', options } = parsed.data;

  if (!url) {
    return apiErrorResponse(400, 'URL is required');
  }

  if (!isValidUrl(url)) {
    return apiErrorResponse(
      400,
      `Invalid URL: "${url}". Must start with http:// or https://`
    );
  }

  try {
    if (mode === 'multi-page') {
      const { ok, status, payload } = await forwardCollectionRequest(
        request,
        '/api/scrape-multi-page',
        { url, options: options ?? {} }
      );

      if (!ok || payload.success !== true || !payload.data) {
        return apiErrorResponse(
          status,
          typeof payload.error === 'string'
            ? payload.error
            : 'Multi-page collection failed'
        );
      }

      const { transformMultiPageData } = await import(
        '@/lib/server/content-collection/transform'
      );
      const existing = transformMultiPageData(
        payload.data as Parameters<typeof transformMultiPageData>[0]
      );

      return NextResponse.json({
        success: true,
        mode: 'multi-page',
        url,
        existing,
        comprehensive: payload.data,
        data: payload.data,
        collectedAt: new Date().toISOString(),
        message: 'Content collected successfully',
      });
    }

    const { ok, status, payload } = await forwardCollectionRequest(
      request,
      '/api/analyze/compare',
      { url, proposedContent: '' }
    );

    if (!ok || payload.success === false) {
      return apiErrorResponse(
        status,
        typeof payload.error === 'string'
          ? payload.error
          : 'Content collection failed'
      );
    }

    return NextResponse.json({
      success: true,
      mode: 'comprehensive',
      url,
      existing: payload.existing,
      comprehensive: payload.comprehensive,
      data: payload.comprehensive ?? payload.existing,
      collectedAt: new Date().toISOString(),
      message: 'Content collected successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('blocked') || message.includes('Blocked')) {
      return apiErrorResponse(
        403,
        `Website blocked the scraper: ${url}. Try a different website.`,
        message
      );
    }

    logRouteError('POST /api/content/collect', error);
    return apiErrorResponse(500, 'Content collection failed', message);
  }
}

/**
 * Unified content collection API.
 * Same protocol as content-comparison and multi-page-scraping.
 */

import { collectWebsiteContent } from '@/lib/server/content-collection/collector';
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
  options?: {
    maxPages?: number;
    maxDepth?: number;
    includeSubpages?: boolean;
    includeBlog?: boolean;
    includeProducts?: boolean;
    includeAbout?: boolean;
    includeContact?: boolean;
    includeServices?: boolean;
  };
}

function isValidUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
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
    const { result, comprehensiveRaw } = await collectWebsiteContent({
      url,
      mode,
      options,
    });

    return NextResponse.json({
      success: true,
      mode: result.mode,
      url: result.url,
      existing: result.existing,
      comprehensive: comprehensiveRaw ?? result.raw,
      data: result.raw,
      collectedAt: result.collectedAt,
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

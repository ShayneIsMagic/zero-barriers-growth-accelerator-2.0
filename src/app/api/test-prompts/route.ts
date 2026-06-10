/**
 * API endpoint for testing prompts between Gemini and Claude (dev only).
 */

import { PromptTestingService } from '@/lib/ai-engines/prompt-testing.service';
import {
  apiErrorResponse,
  guardDevelopmentOnly,
  logRouteError,
} from '@/lib/server/api-route';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const blocked = guardDevelopmentOnly();
  if (blocked) {
    return blocked;
  }

  try {
    const body = await request.json();
    const { url, scrapedData, assessmentType } = body as {
      url?: string;
      scrapedData?: unknown;
      assessmentType?: string;
    };

    if (!url) {
      return apiErrorResponse(400, 'URL is required');
    }

    if (!scrapedData) {
      return apiErrorResponse(400, 'Scraped data is required');
    }

    let results;

    if (assessmentType) {
      results = await PromptTestingService.testPrompt(
        assessmentType,
        scrapedData,
        url
      );
    } else {
      results = await PromptTestingService.runComprehensiveTest(
        scrapedData,
        url
      );
    }

    return NextResponse.json({
      success: true,
      url,
      assessmentType: assessmentType || 'all',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logRouteError('POST /api/test-prompts', error);
    return apiErrorResponse(
      500,
      'Prompt testing failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

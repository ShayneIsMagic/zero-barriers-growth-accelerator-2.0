import { analyzeWithGemini } from '@/lib/free-ai-analysis';
import {
  apiErrorResponse,
  guardDevelopmentOnly,
  logRouteError,
} from '@/lib/server/api-route';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const blocked = guardDevelopmentOnly();
  if (blocked) {
    return blocked;
  }

  try {
    const body = await request.json();
    const { content } = body as { content?: string };

    if (!content) {
      return apiErrorResponse(400, 'Content is required');
    }

    logger.info('Testing simple Gemini analysis');

    const result = await analyzeWithGemini(content, 'test');

    return NextResponse.json({
      success: true,
      result,
      message: 'Simple analysis completed',
    });
  } catch (error) {
    logRouteError('POST /api/test-simple-analysis', error);
    return apiErrorResponse(
      500,
      'Analysis test failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

import {
  apiErrorResponse,
  guardDevelopmentOnly,
  logRouteError,
} from '@/lib/server/api-route';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const blocked = guardDevelopmentOnly();
  if (blocked) {
    return blocked;
  }

  try {
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      database: 'connected',
      userCount,
      message: 'Database connection successful',
    });
  } catch (error) {
    logRouteError('GET /api/test-db', error);
    return apiErrorResponse(
      500,
      'Database connection failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

import {
  apiErrorResponse,
  guardDevelopmentOnly,
  logRouteError,
} from '@/lib/server/api-route';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const blocked = guardDevelopmentOnly();
  if (blocked) {
    return blocked;
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const result = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      result,
      message: 'Simple Prisma test successful',
    });
  } catch (error) {
    logRouteError('GET /api/test-prisma-simple', error);
    return apiErrorResponse(
      500,
      'Prisma test failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

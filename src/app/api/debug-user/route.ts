import {
  apiErrorResponse,
  guardDevelopmentOnly,
  logRouteError,
} from '@/lib/server/api-route';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const blocked = guardDevelopmentOnly();
  if (blocked) {
    return blocked;
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return apiErrorResponse(400, 'Email parameter required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiErrorResponse(404, 'User not found');
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    logRouteError('GET /api/debug-user', error);
    return apiErrorResponse(
      500,
      'Internal server error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

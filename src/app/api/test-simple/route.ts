import { guardDevelopmentOnly } from '@/lib/server/api-route';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const blocked = guardDevelopmentOnly();
  if (blocked) {
    return blocked;
  }

  return NextResponse.json({
    success: true,
    message: 'Simple API test successful',
    timestamp: new Date().toISOString(),
  });
}

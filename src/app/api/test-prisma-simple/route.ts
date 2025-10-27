import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Test Prisma connection without any complex queries
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Simple query that shouldn't cause prepared statement conflicts
    const result = await prisma.user.findFirst();

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      result,
      message: 'Simple Prisma test successful',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Prisma test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

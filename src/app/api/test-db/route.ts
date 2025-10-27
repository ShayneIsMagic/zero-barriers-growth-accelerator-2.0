import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    // Test basic database connection
    const userCount = await prisma.user.count();

    // Test if we can find the specific user
    const testUser = await prisma.user.findUnique({
      where: { email: 'shayne+1@devpipeline.com' },
    });

    return NextResponse.json({
      success: true,
      database: 'connected',
      userCount,
      testUser: testUser
        ? {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
            hasPassword: !!testUser.password,
          }
        : null,
      message: 'Database connection successful',
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

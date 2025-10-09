import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test 1: Check if DATABASE_URL is configured
    const hasDbUrl = !!process.env.DATABASE_URL;
    
    // Test 2: Try to connect
    await prisma.$connect();
    
    // Test 3: Count users
    const userCount = await prisma.user.count();
    
    // Test 4: Get sample user (without password)
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
      take: 3
    });
    
    // Test 5: Check if specific user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'shayne+1@devpipeline.com' },
      select: { email: true, role: true, createdAt: true }
    });
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'SUCCESS',
      tests: {
        databaseUrlConfigured: hasDbUrl,
        connectionSuccessful: true,
        userCount,
        adminUserExists: !!adminUser,
        adminUser: adminUser || null,
        allUsers: users
      },
      message: 'Database connection working!'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      tests: {
        databaseUrlConfigured: !!process.env.DATABASE_URL,
        connectionSuccessful: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      message: 'Database connection failed',
      help: 'Check DATABASE_URL in Vercel environment variables'
    }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { DemoAuthService } from '@/lib/demo-auth';

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return the demo user
    const user = await DemoAuthService.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        searchedEmail: email.toLowerCase(),
        allUsers: await prisma.user.findMany({
          select: { id: true, email: true, name: true, role: true, password: true }
        })
      }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0
      },
      allUsers: await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, password: true }
      })
    });
  } catch (error) {
    console.error('Debug user error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

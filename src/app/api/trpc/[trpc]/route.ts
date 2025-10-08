// Static fallback for GitHub Pages - tRPC won't work on static hosting
import { NextRequest, NextResponse } from 'next/server';

// Required for static export
export async function generateStaticParams() {
  return [{ trpc: 'analysis' }, { trpc: 'auth' }];
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: 'tRPC not available on static hosting',
    message: 'This feature requires a server environment. Please run locally for full functionality.'
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'tRPC not available on static hosting',
    message: 'This feature requires a server environment. Please run locally for full functionality.'
  });
}
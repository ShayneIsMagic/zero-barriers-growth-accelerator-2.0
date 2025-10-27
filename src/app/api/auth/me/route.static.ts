// Static fallback for GitHub Pages deployment
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Authentication not available in static deployment',
      message:
        'This is a static deployment - authentication requires server-side functionality',
    },
    { status: 501 }
  );
}

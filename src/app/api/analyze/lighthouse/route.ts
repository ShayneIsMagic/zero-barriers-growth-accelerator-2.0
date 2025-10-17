// ComingSoonService archived - using simple response
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, content } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🚧 Lighthouse analysis requested for: ${url} (Coming Soon)`);

    // Return coming soon response with manual prompt
    const response = {
      success: true,
      status: 'coming_soon',
      message: 'Lighthouse analysis is coming soon',
      module: {
        id: 'lighthouse',
        name: 'Lighthouse Performance',
        description: 'Advanced performance analysis',
        status: 'coming_soon',
        estimatedRelease: 'Q2 2025'
      },
      manualPrompt: `Analyze Lighthouse performance for ${url}. Content: ${content?.substring(0, 1000)}...`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Lighthouse API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Lighthouse analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'status') {
      return NextResponse.json({
        success: true,
        data: {
          status: 'coming_soon',
          module: {
            id: 'lighthouse',
            name: 'Lighthouse Performance',
            description: 'Advanced performance analysis',
            status: 'coming_soon',
            estimatedRelease: 'Q2 2025'
          },
          message: 'Lighthouse analysis is coming soon! Use manual prompt for immediate results.'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Lighthouse Analysis API - Coming Soon',
        endpoints: {
          'POST /api/analyze/lighthouse': 'Request lighthouse analysis (coming soon)',
          'GET /api/analyze/lighthouse?action=status': 'Check lighthouse status'
        },
        note: 'Use manual prompt for immediate analysis'
      }
    });

  } catch (error) {
    console.error('Lighthouse GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { ComingSoonService } from '@/lib/services/coming-soon.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, content, industry } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🚧 SEO opportunities analysis requested for: ${url} (Coming Soon)`);

    // Return coming soon response with manual prompt
    const response = ComingSoonService.createComingSoonResponse('seo_opportunities', {
      url,
      content: content?.substring(0, 1000), // Truncate for prompt
      industry
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('SEO opportunities API error:', error);
    return NextResponse.json({
      success: false,
      error: 'SEO opportunities analysis failed',
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
          module: ComingSoonService.getModule('seo_opportunities'),
          message: 'SEO opportunities analysis is coming soon! Use manual prompt for immediate results.'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'SEO Opportunities Analysis API - Coming Soon',
        endpoints: {
          'POST /api/analyze/seo-opportunities': 'Request SEO analysis (coming soon)',
          'GET /api/analyze/seo-opportunities?action=status': 'Check SEO analysis status'
        },
        note: 'Use manual prompt for immediate analysis'
      }
    });

  } catch (error) {
    console.error('SEO opportunities GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

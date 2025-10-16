import { SEOActionableAnalysisService } from '@/lib/services/seo-actionable-analysis.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for comprehensive SEO analysis

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, scrapedContent, focusArea = 'general' } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    if (!scrapedContent) {
      return NextResponse.json({
        success: false,
        error: 'Scraped content is required'
      }, { status: 400 });
    }

    console.log(`🔍 Starting SEO actionable analysis for: ${url}`);
    console.log(`🎯 Focus area: ${focusArea}`);

    const result = await SEOActionableAnalysisService.generateSEOReport(
      url,
      scrapedContent,
      focusArea as any
    );

    if (!result.success) {
      console.error('SEO actionable analysis failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'SEO actionable analysis failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ SEO actionable analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      focusArea,
      report: result.report,
      message: 'SEO actionable analysis generated successfully'
    });

  } catch (error) {
    console.error('SEO actionable analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

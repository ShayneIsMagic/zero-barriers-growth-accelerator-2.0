import { SimpleActionableReportService } from '@/lib/services/simple-actionable-report.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // 1 minute for simple analysis

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, scrapedContent, analysisType = 'seo' } = body;

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

    console.log(`📊 Starting simple actionable analysis for: ${url}`);
    console.log(`🔍 Analysis type: ${analysisType}`);

    const result = await SimpleActionableReportService.generateReport(
      url,
      scrapedContent,
      analysisType as any
    );

    if (!result.success) {
      console.error('Simple actionable analysis failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Simple actionable analysis failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ Simple actionable analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      analysisType,
      report: result.report,
      message: 'Simple actionable analysis generated successfully'
    });

  } catch (error) {
    console.error('Simple actionable analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { ActionableReportService } from '@/lib/services/actionable-report.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for comprehensive analysis

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, scrapedContent, analysisType = 'golden-circle' } = body;

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

    console.log(`📊 Starting actionable report generation for: ${url}`);
    console.log(`🔍 Analysis type: ${analysisType}`);

    const result = await ActionableReportService.generateComprehensiveReport(
      url,
      scrapedContent,
      analysisType as 'golden-circle' | 'clifton-strengths' | 'seo-analysis' | 'elements-value-b2c' | 'elements-value-b2b'
    );

    if (!result.success) {
      console.error('Actionable report generation failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Actionable report generation failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ Actionable report completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      analysisType,
      report: result.report,
      message: 'Actionable report generated successfully'
    });

  } catch (error) {
    console.error('Actionable report API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

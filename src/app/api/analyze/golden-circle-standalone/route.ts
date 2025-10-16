/**
 * Standalone Golden Circle Analysis API
 * Uses Content-Comparison pattern: No database dependencies, direct AI analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { SimpleFrameworkAnalysisService } from '@/lib/simple-framework-analysis.service';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, scrapedContent } = body;

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

    console.log(`🚀 Starting standalone Golden Circle analysis for: ${url}`);

    const result = await SimpleFrameworkAnalysisService.analyzeGoldenCircle(url, scrapedContent);

    if (!result.success) {
      console.error('Golden Circle analysis failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Golden Circle analysis failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ Golden Circle analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      data: result.analysis,
      message: 'Golden Circle analysis completed successfully'
    });

  } catch (error) {
    console.error('Golden Circle API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Golden Circle analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Standalone CliftonStrengths Analysis API
 * Uses Content-Comparison pattern: No database dependencies, direct AI analysis
 */

import { StandaloneCliftonStrengthsService } from '@/lib/services/standalone-clifton-strengths.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🚀 Starting standalone CliftonStrengths analysis for: ${url}`);

    const result = await StandaloneCliftonStrengthsService.analyzeWebsite(url);

    if (!result.success) {
      console.error('CliftonStrengths analysis failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'CliftonStrengths analysis failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ CliftonStrengths analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      data: result.data,
      message: 'CliftonStrengths analysis completed successfully'
    });

  } catch (error) {
    console.error('CliftonStrengths API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'CliftonStrengths analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

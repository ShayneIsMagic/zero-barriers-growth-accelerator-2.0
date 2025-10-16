/**
 * Standalone Elements of Value Analysis API
 * Uses Content-Comparison pattern: No database dependencies, direct AI analysis
 */

import { StandaloneElementsOfValueService } from '@/lib/services/standalone-elements-value.service';
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

    console.log(`🚀 Starting standalone Elements of Value analysis for: ${url}`);

    const result = await StandaloneElementsOfValueService.analyzeWebsite(url);

    if (!result.success) {
      console.error('Elements of Value analysis failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Elements of Value analysis failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ Elements of Value analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      data: result.data,
      message: 'Elements of Value analysis completed successfully'
    });

  } catch (error) {
    console.error('Elements of Value API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Elements of Value analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

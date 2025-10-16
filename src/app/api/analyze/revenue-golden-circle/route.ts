/**
 * Revenue-Focused Golden Circle Analysis API
 * Focuses on identifying revenue opportunities and calculating potential ROI
 */

import { NextRequest, NextResponse } from 'next/server';
import { RevenueFocusedGoldenCircleService } from '@/lib/services/revenue-focused-golden-circle.service';

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

    console.log(`💰 Starting revenue-focused Golden Circle analysis for: ${url}`);

    const result = await RevenueFocusedGoldenCircleService.analyzeWebsite(url);

    if (!result.success) {
      console.error('Revenue-focused Golden Circle analysis failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Revenue-focused Golden Circle analysis failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ Revenue-focused Golden Circle analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      data: result.data,
      message: 'Revenue-focused Golden Circle analysis completed successfully'
    });

  } catch (error) {
    console.error('Revenue-focused Golden Circle API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Revenue-focused Golden Circle analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

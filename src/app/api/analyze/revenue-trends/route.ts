/**
 * Revenue-Focused Google Trends Analysis API
 * Identifies underserved market demand and emerging revenue opportunities
 */

import { NextRequest, NextResponse } from 'next/server';
import { RevenueTrendsAnalysisService } from '@/lib/services/revenue-trends-analysis.service';

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

    console.log(`💰 Starting revenue-focused trends analysis for: ${url}`);

    const result = await RevenueTrendsAnalysisService.analyzeWebsite(url);

    if (!result.success) {
      console.error('Revenue-focused trends analysis failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Revenue-focused trends analysis failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ Revenue-focused trends analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      data: result.data,
      message: 'Revenue-focused trends analysis completed successfully'
    });

  } catch (error) {
    console.error('Revenue-focused trends API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Revenue-focused trends analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

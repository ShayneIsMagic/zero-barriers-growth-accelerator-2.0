/**
 * Revenue-Focused Elements of Value Analysis API
 * Focuses on identifying revenue opportunities and calculating potential ROI
 */

import { RevenueFocusedElementsOfValueService } from '@/lib/services/revenue-focused-elements-value.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required',
        },
        { status: 400 }
      );
    }

    console.log(
      `💰 Starting revenue-focused Elements of Value analysis for: ${url}`
    );

    const result =
      await RevenueFocusedElementsOfValueService.analyzeWebsite(url);

    if (!result.success) {
      console.error(
        'Revenue-focused Elements of Value analysis failed:',
        result.error
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Revenue-focused Elements of Value analysis failed',
          details: result.error,
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ Revenue-focused Elements of Value analysis completed for: ${url}`
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      data: result.data,
      message:
        'Revenue-focused Elements of Value analysis completed successfully',
    });
  } catch (error) {
    console.error(
      'Revenue-focused Elements of Value API execution error:',
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Revenue-focused Elements of Value analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

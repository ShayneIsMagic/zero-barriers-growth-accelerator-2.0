/**
 * Individual Golden Circle Analysis API
 * Extracts Golden Circle results from comprehensive analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComprehensiveParserService } from '@/lib/services/comprehensive-parser.service';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { comprehensiveData } = await request.json();

    if (!comprehensiveData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Comprehensive analysis data is required',
        },
        { status: 400 }
      );
    }

    console.log(
      '🔍 Extracting Golden Circle analysis from comprehensive data...'
    );

    const goldenCircleAssessment =
      ComprehensiveParserService.getIndividualAssessment(
        comprehensiveData,
        'golden-circle'
      );

    if (!goldenCircleAssessment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Golden Circle analysis not found in comprehensive data',
        },
        { status: 404 }
      );
    }

    console.log('✅ Golden Circle analysis extracted successfully');

    return NextResponse.json({
      success: true,
      data: goldenCircleAssessment.data,
      score: goldenCircleAssessment.score,
      status: goldenCircleAssessment.status,
      message: 'Golden Circle analysis extracted from comprehensive data',
    });
  } catch (error) {
    console.error('Golden Circle extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract Golden Circle analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

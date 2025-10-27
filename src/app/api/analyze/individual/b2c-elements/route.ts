/**
 * Individual B2C Elements Analysis API
 * Extracts B2C Elements of Value results from comprehensive analysis
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
      '🔍 Extracting B2C Elements analysis from comprehensive data...'
    );

    const b2cAssessment = ComprehensiveParserService.getIndividualAssessment(
      comprehensiveData,
      'b2c-elements'
    );

    if (!b2cAssessment) {
      return NextResponse.json(
        {
          success: false,
          error: 'B2C Elements analysis not found in comprehensive data',
        },
        { status: 404 }
      );
    }

    console.log('✅ B2C Elements analysis extracted successfully');

    return NextResponse.json({
      success: true,
      data: b2cAssessment.data,
      score: b2cAssessment.score,
      status: b2cAssessment.status,
      message: 'B2C Elements analysis extracted from comprehensive data',
    });
  } catch (error) {
    console.error('B2C Elements extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract B2C Elements analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

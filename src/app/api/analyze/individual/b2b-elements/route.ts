/**
 * Individual B2B Elements Analysis API
 * Extracts B2B Elements of Value results from comprehensive analysis
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
      '🔍 Extracting B2B Elements analysis from comprehensive data...'
    );

    const b2bAssessment = ComprehensiveParserService.getIndividualAssessment(
      comprehensiveData,
      'b2b-elements'
    );

    if (!b2bAssessment) {
      return NextResponse.json(
        {
          success: false,
          error: 'B2B Elements analysis not found in comprehensive data',
        },
        { status: 404 }
      );
    }

    console.log('✅ B2B Elements analysis extracted successfully');

    return NextResponse.json({
      success: true,
      data: b2bAssessment.data,
      score: b2bAssessment.score,
      status: b2bAssessment.status,
      message: 'B2B Elements analysis extracted from comprehensive data',
    });
  } catch (error) {
    console.error('B2B Elements extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract B2B Elements analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

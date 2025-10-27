/**
 * Individual CliftonStrengths Analysis API
 * Extracts CliftonStrengths results from comprehensive analysis
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
      '🔍 Extracting CliftonStrengths analysis from comprehensive data...'
    );

    const cliftonAssessment =
      ComprehensiveParserService.getIndividualAssessment(
        comprehensiveData,
        'clifton-strengths'
      );

    if (!cliftonAssessment) {
      return NextResponse.json(
        {
          success: false,
          error: 'CliftonStrengths analysis not found in comprehensive data',
        },
        { status: 404 }
      );
    }

    console.log('✅ CliftonStrengths analysis extracted successfully');

    return NextResponse.json({
      success: true,
      data: cliftonAssessment.data,
      score: cliftonAssessment.score,
      status: cliftonAssessment.status,
      message: 'CliftonStrengths analysis extracted from comprehensive data',
    });
  } catch (error) {
    console.error('CliftonStrengths extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract CliftonStrengths analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

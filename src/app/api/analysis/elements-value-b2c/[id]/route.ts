/**
 * Elements of Value B2C Analysis Fetch API
 * GET /api/analysis/elements-value-b2c/[analysisId]
 */

import { ElementsOfValueB2CService } from '@/lib/services/elements-value-b2c.service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const eovB2C = await ElementsOfValueB2CService.getByAnalysisId(id);

    if (!eovB2C) {
      return NextResponse.json(
        {
          success: false,
          error: 'Elements of Value B2C analysis not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: eovB2C,
    });
  } catch (error) {
    console.error('Failed to fetch Elements B2C:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

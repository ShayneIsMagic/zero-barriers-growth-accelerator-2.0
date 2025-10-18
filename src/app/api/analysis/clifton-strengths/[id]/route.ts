/**
 * CliftonStrengths Analysis Fetch API
 * GET /api/analysis/clifton-strengths/[analysisId]
 */

import { CliftonStrengthsService } from '@/lib/services/clifton-strengths-detailed.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cliftonStrengths = await CliftonStrengthsService.getByAnalysisId(id)

    if (!cliftonStrengths) {
      return NextResponse.json({
        success: false,
        error: 'CliftonStrengths analysis not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: cliftonStrengths
    })

  } catch (error) {
    console.error('Failed to fetch CliftonStrengths:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


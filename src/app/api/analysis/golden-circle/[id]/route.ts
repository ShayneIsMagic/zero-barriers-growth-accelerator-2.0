/**
 * Golden Circle Analysis Fetch API
 * GET /api/analysis/golden-circle/[analysisId]
 */

import { GoldenCircleDetailedService } from '@/lib/services/golden-circle-detailed.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const goldenCircle = await GoldenCircleDetailedService.getByAnalysisId(id)

    if (!goldenCircle) {
      return NextResponse.json({
        success: false,
        error: 'Golden Circle analysis not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: goldenCircle
    })

  } catch (error) {
    console.error('Failed to fetch Golden Circle:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


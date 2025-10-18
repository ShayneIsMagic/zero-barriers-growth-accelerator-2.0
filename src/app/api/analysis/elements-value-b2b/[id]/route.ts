/**
 * Elements of Value B2B Analysis Fetch API
 * GET /api/analysis/elements-value-b2b/[analysisId]
 */

import { ElementsOfValueB2BService } from '@/lib/services/elements-value-b2b.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const eovB2B = await ElementsOfValueB2BService.getByAnalysisId(id)

    if (!eovB2B) {
      return NextResponse.json({
        success: false,
        error: 'Elements of Value B2B analysis not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: eovB2B
    })

  } catch (error) {
    console.error('Failed to fetch Elements B2B:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


/**
 * Comprehensive Report Fetch API
 * GET /api/analysis/report/[analysisId]
 */

import { ComprehensiveReportService } from '@/lib/services/comprehensive-report.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const report = await ComprehensiveReportService.getByAnalysisId(id)

    if (!report) {
      return NextResponse.json({
        success: false,
        error: 'Comprehensive report not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('Failed to fetch report:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


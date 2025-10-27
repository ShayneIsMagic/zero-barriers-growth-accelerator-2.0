/**
 * Individual Report API - Get, update, or delete specific reports
 */

import { reportStorage } from '@/lib/report-storage';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/reports/[id] - Get specific report
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = await reportStorage.getReport(id);

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Failed to retrieve report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - Delete specific report
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const success = await reportStorage.deleteReport(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete report',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

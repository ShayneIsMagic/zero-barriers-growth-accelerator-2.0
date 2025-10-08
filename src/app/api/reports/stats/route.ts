/**
 * Report Statistics API
 */

import { NextRequest, NextResponse } from 'next/server';
import { reportStorage } from '@/lib/report-storage';

// GET /api/reports/stats - Get report statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await reportStorage.getReportStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Failed to get report stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get report stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

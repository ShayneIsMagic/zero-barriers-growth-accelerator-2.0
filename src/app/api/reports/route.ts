/**
 * Reports API - List and manage analysis reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { reportStorage } from '@/lib/report-storage';

// GET /api/reports - List all reports with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const url = searchParams.get('url');

    let result;
    
    if (url) {
      // Get reports for specific URL
      const reports = await reportStorage.getReportsByUrl(url);
      result = {
        reports: reports.slice((page - 1) * limit, page * limit),
        total: reports.length,
        page,
        totalPages: Math.ceil(reports.length / limit)
      };
    } else {
      // Get all reports with pagination
      result = await reportStorage.getAllReports(page, limit);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Failed to retrieve reports:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/reports - Store a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportData, url, reportType } = body;

    if (!reportData || !url) {
      return NextResponse.json({
        success: false,
        error: 'reportData and url are required'
      }, { status: 400 });
    }

    const storedReport = await reportStorage.storeReport(reportData, url, reportType);

    return NextResponse.json({
      success: true,
      data: storedReport,
      message: 'Report stored successfully'
    });

  } catch (error) {
    console.error('Failed to store report:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to store report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

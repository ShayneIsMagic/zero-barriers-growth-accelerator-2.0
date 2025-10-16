/**
 * Analysis List API
 * GET /api/analysis - List all analyses with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for filtering using proper Prisma methods
    const where: any = {};
    if (contentType) {
      where.contentType = contentType;
    }
    if (status) {
      where.status = status;
    }

    // Fetch analyses using proper Prisma client methods (no raw SQL)
    const analyses = await prisma.analysis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        contentType: true,
        status: true,
        score: true,
        createdAt: true,
        updatedAt: true,
        content: true
      }
    });

    // Parse content to extract URL and other metadata
    const processedAnalyses = (analyses as any[]).map(analysis => {
      let url = 'Unknown URL';
      let data = null;
      
      try {
        const content = typeof analysis.content === 'string' 
          ? JSON.parse(analysis.content) 
          : analysis.content;
        
        if (content && typeof content === 'object') {
          url = content.url || content.data?.url || 'Unknown URL';
          data = content;
        }
      } catch (error) {
        console.warn('Failed to parse analysis content:', error);
      }

      return {
        id: analysis.id,
        url,
        contentType: analysis.contentType,
        status: analysis.status,
        score: analysis.score,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
        content: data
      };
    });

    return NextResponse.json({
      success: true,
      analyses: processedAnalyses,
      pagination: {
        total: processedAnalyses.length, // Simplified for now
        limit,
        offset,
        hasMore: processedAnalyses.length === limit
      }
    });

  } catch (error) {
    console.error('Failed to fetch analyses:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analyses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

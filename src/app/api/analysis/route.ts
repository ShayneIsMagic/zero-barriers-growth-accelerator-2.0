/**
 * Analysis List API
 * GET /api/analysis - List analyses for the authenticated user
 */

import { getRequestUser, apiErrorResponse } from '@/lib/server/api-route';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = getRequestUser(request);
    if (!user) {
      return apiErrorResponse(401, 'Authentication required');
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: {
      contentType?: string;
      status?: string;
      userId: string;
    } = {
      userId: user.userId,
    };

    if (contentType) {
      where.contentType = contentType;
    }
    if (status) {
      where.status = status;
    }

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
        content: true,
      },
    });

    interface AnalysisWithContent {
      id: string;
      contentType: string | null;
      status: string | null;
      score: number | null;
      createdAt: Date | null;
      updatedAt: Date | null;
      content: string | null;
    }

    const processedAnalyses = (analyses as AnalysisWithContent[]).map(
      (analysis) => {
        let url = 'Unknown URL';
        let data = null;

        try {
          const content =
            typeof analysis.content === 'string'
              ? JSON.parse(analysis.content)
              : analysis.content;

          if (content && typeof content === 'object') {
            url = content.url || content.data?.url || 'Unknown URL';
            data = content;
          }
        } catch {
          // keep defaults
        }

        return {
          id: analysis.id,
          url,
          contentType: analysis.contentType,
          status: analysis.status,
          score: analysis.score,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
          content: data,
        };
      }
    );

    const total = await prisma.analysis.count({ where });

    return NextResponse.json({
      success: true,
      analyses: processedAnalyses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + processedAnalyses.length < total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analyses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

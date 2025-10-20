/**
 * Get status of progressive analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({
      success: false,
      error: 'Analysis ID required'
    }, { status: 400 });
  }

  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        content: true,
        score: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!analysis) {
      return NextResponse.json({
        success: false,
        error: 'Analysis not found'
      }, { status: 404 });
    }

    const content = analysis.content ? JSON.parse(analysis.content) : null;

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      url: content?.url || null,
      status: analysis.status,
      score: analysis.score,
      currentStep: content?.currentStep || 0,
      totalSteps: content?.totalSteps || 9,
      steps: content?.steps || [],
      result: content?.result || null,
      completed: content?.completed || false,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt
    });

  } catch (error) {
    console.error('Failed to retrieve analysis status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


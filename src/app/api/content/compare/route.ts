/**
 * Content Comparison API
 * Creates and manages content comparisons between existing and proposed content
 */

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { existingId, proposedId, analysisResults, similarityScore } =
      await request.json();

    if (!existingId || !proposedId) {
      return NextResponse.json(
        {
          success: false,
          error: 'existingId and proposedId are required',
        },
        { status: 400 }
      );
    }

    console.log(
      `🔄 Creating content comparison: ${existingId} vs ${proposedId}`
    );

    // Create content comparison
    const comparison = await prisma.contentComparison.create({
      data: {
        existingId,
        proposedId,
        analysisResults: analysisResults || null,
        similarityScore: similarityScore || null,
      },
      include: {
        existing: {
          select: {
            id: true,
            url: true,
            title: true,
            content: true,
            createdAt: true,
          },
        },
        proposed: {
          select: {
            id: true,
            content: true,
            version: true,
            status: true,
            createdBy: true,
            createdAt: true,
          },
        },
      },
    });

    console.log(`✅ Content comparison created: ${comparison.id}`);

    return NextResponse.json({
      success: true,
      comparison: {
        id: comparison.id,
        existingId: comparison.existingId,
        proposedId: comparison.proposedId,
        analysisResults: comparison.analysisResults,
        similarityScore: comparison.similarityScore,
        createdAt: comparison.createdAt,
        existing: comparison.existing,
        proposed: comparison.proposed,
      },
      message: 'Content comparison created successfully',
    });
  } catch (error) {
    console.error('Content comparison creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create content comparison',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const existingId = searchParams.get('existingId');
    const proposedId = searchParams.get('proposedId');

    if (!existingId && !proposedId) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one of existingId or proposedId is required',
        },
        { status: 400 }
      );
    }

    console.log(`📋 Fetching content comparisons`);

    const whereClause: any = {};
    if (existingId) whereClause.existingId = existingId;
    if (proposedId) whereClause.proposedId = proposedId;

    const comparisons = await prisma.contentComparison.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        existing: {
          select: {
            id: true,
            url: true,
            title: true,
            content: true,
            createdAt: true,
          },
        },
        proposed: {
          select: {
            id: true,
            content: true,
            version: true,
            status: true,
            createdBy: true,
            createdAt: true,
          },
        },
      },
    });

    console.log(`✅ Found ${comparisons.length} content comparisons`);

    return NextResponse.json({
      success: true,
      comparisons: comparisons.map((comparison) => ({
        id: comparison.id,
        existingId: comparison.existingId,
        proposedId: comparison.proposedId,
        analysisResults: comparison.analysisResults,
        similarityScore: comparison.similarityScore,
        createdAt: comparison.createdAt,
        existing: comparison.existing,
        proposed: comparison.proposed,
      })),
      message: 'Content comparisons retrieved successfully',
    });
  } catch (error) {
    console.error('Content comparisons retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve content comparisons',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

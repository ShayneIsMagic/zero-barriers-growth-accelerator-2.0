/**
 * Proposed Content API
 * Creates and manages proposed content versions
 */

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const {
      snapshotId,
      content,
      createdBy,
      status = 'draft',
    } = await request.json();

    if (!snapshotId || !content || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'snapshotId, content, and createdBy are required',
        },
        { status: 400 }
      );
    }

    console.log(`📝 Creating proposed content for snapshot: ${snapshotId}`);

    // Get the latest version number for this snapshot
    const latestProposed = await prisma.proposedContent.findFirst({
      where: { snapshotId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestProposed?.version || 0) + 1;

    // Create proposed content
    const proposedContent = await prisma.proposedContent.create({
      data: {
        snapshotId,
        content,
        version: nextVersion,
        status,
        createdBy,
      },
    });

    console.log(
      `✅ Proposed content created: ${proposedContent.id} (version ${nextVersion})`
    );

    return NextResponse.json({
      success: true,
      proposedContent: {
        id: proposedContent.id,
        snapshotId: proposedContent.snapshotId,
        content: proposedContent.content,
        version: proposedContent.version,
        status: proposedContent.status,
        createdBy: proposedContent.createdBy,
        createdAt: proposedContent.createdAt,
      },
      message: 'Proposed content created successfully',
    });
  } catch (error) {
    console.error('Proposed content creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create proposed content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const snapshotId = searchParams.get('snapshotId');
    const status = searchParams.get('status');

    if (!snapshotId) {
      return NextResponse.json(
        {
          success: false,
          error: 'snapshotId is required',
        },
        { status: 400 }
      );
    }

    console.log(`📋 Fetching proposed content for snapshot: ${snapshotId}`);

    const whereClause: any = { snapshotId };
    if (status) {
      whereClause.status = status;
    }

    const proposedContent = await prisma.proposedContent.findMany({
      where: whereClause,
      orderBy: { version: 'desc' },
    });

    console.log(`✅ Found ${proposedContent.length} proposed content versions`);

    return NextResponse.json({
      success: true,
      proposedContent: proposedContent.map((proposed) => ({
        id: proposed.id,
        snapshotId: proposed.snapshotId,
        content: proposed.content,
        version: proposed.version,
        status: proposed.status,
        createdBy: proposed.createdBy,
        createdAt: proposed.createdAt,
      })),
      message: 'Proposed content retrieved successfully',
    });
  } catch (error) {
    console.error('Proposed content retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve proposed content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          error: 'id and status are required',
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating proposed content status: ${id} -> ${status}`);

    const updatedProposed = await prisma.proposedContent.update({
      where: { id },
      data: { status },
    });

    console.log(`✅ Proposed content status updated: ${updatedProposed.id}`);

    return NextResponse.json({
      success: true,
      proposedContent: {
        id: updatedProposed.id,
        snapshotId: updatedProposed.snapshotId,
        content: updatedProposed.content,
        version: updatedProposed.version,
        status: updatedProposed.status,
        createdBy: updatedProposed.createdBy,
        createdAt: updatedProposed.createdAt,
      },
      message: 'Proposed content status updated successfully',
    });
  } catch (error) {
    console.error('Proposed content update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update proposed content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

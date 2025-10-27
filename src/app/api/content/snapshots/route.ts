/**
 * Content Snapshots API
 * Creates and manages content snapshots for version control
 */

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { url, title, content, metadata, userId } = await request.json();

    if (!url || !content || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL, content, and userId are required',
        },
        { status: 400 }
      );
    }

    console.log(`📸 Creating content snapshot for: ${url}`);

    // Create content snapshot
    const snapshot = await prisma.contentSnapshot.create({
      data: {
        url,
        title: title || null,
        content,
        metadata: metadata || {},
        userId,
      },
    });

    console.log(`✅ Content snapshot created: ${snapshot.id}`);

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        url: snapshot.url,
        title: snapshot.title,
        content: snapshot.content,
        metadata: snapshot.metadata,
        userId: snapshot.userId,
        createdAt: snapshot.createdAt,
      },
      message: 'Content snapshot created successfully',
    });
  } catch (error) {
    console.error('Content snapshot creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create content snapshot',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const url = searchParams.get('url');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    console.log(`📋 Fetching content snapshots for user: ${userId}`);

    const whereClause: any = { userId };
    if (url) {
      whereClause.url = url;
    }

    const snapshots = await prisma.contentSnapshot.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        proposedContent: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    console.log(`✅ Found ${snapshots.length} content snapshots`);

    return NextResponse.json({
      success: true,
      snapshots: snapshots.map((snapshot) => ({
        id: snapshot.id,
        url: snapshot.url,
        title: snapshot.title,
        content: snapshot.content,
        metadata: snapshot.metadata,
        userId: snapshot.userId,
        createdAt: snapshot.createdAt,
        proposedContent: snapshot.proposedContent.map((proposed) => ({
          id: proposed.id,
          version: proposed.version,
          status: proposed.status,
          createdBy: proposed.createdBy,
          createdAt: proposed.createdAt,
        })),
      })),
      message: 'Content snapshots retrieved successfully',
    });
  } catch (error) {
    console.error('Content snapshots retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve content snapshots',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Claude Project Analysis API
 * Creates fresh Claude chats within the Zero Barriers Growth Accelerator project
 * Each client gets a unique session with stored assessment rules
 */

import { ClaudeProjectIntegrationService } from '@/lib/ai-engines/claude-project-integration.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for Claude analysis

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, scrapedData, assessmentType } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    if (!scrapedData) {
      return NextResponse.json({
        success: false,
        error: 'Scraped data is required'
      }, { status: 400 });
    }

    if (!assessmentType) {
      return NextResponse.json({
        success: false,
        error: 'Assessment type is required'
      }, { status: 400 });
    }

    console.log(`🤖 Starting Claude project analysis for: ${url}`);
    console.log(`📊 Assessment type: ${assessmentType}`);

    // Create fresh Claude session for this client
    const session = await ClaudeProjectIntegrationService.createClientSession(url);
    console.log(`✅ Claude session created: ${session.sessionId}`);

    // Run assessment using Claude project
    const result = await ClaudeProjectIntegrationService.runAssessment(
      session,
      assessmentType,
      scrapedData
    );

    if (result.success) {
      console.log(`✅ Claude project analysis completed for: ${url}`);

      return NextResponse.json({
        success: true,
        url,
        assessmentType,
        clientId: session.clientId,
        sessionId: session.sessionId,
        claudeChatUrl: result.claudeChatUrl,
        analysis: result.analysis,
        timestamp: result.timestamp,
        projectUrl: 'https://claude.ai/project/0199eeed-2813-7556-982f-f4773a045d86'
      });
    } else {
      console.error(`❌ Claude project analysis failed for: ${url}`, result.error);

      return NextResponse.json({
        success: false,
        url,
        assessmentType,
        clientId: session.clientId,
        sessionId: session.sessionId,
        error: result.error,
        timestamp: result.timestamp
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Claude project analysis API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Claude project analysis failed',
      details: 'Failed to create Claude session or run analysis'
    }, { status: 500 });
  }
}

/**
 * Get active client sessions
 */
export async function GET(request: NextRequest) {
  try {
    const sessions = await ClaudeProjectIntegrationService.getActiveSessions();

    return NextResponse.json({
      success: true,
      sessions,
      projectUrl: 'https://claude.ai/project/0199eeed-2813-7556-982f-f4773a045d86',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get active sessions:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get sessions'
    }, { status: 500 });
  }
}

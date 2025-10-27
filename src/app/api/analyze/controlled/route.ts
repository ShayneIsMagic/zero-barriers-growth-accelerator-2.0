/**
 * Controlled Analysis API Endpoint
 * Provides precise control over analysis timing, prompts, and deliverables
 */

import {
  ANALYSIS_STEPS,
  ControlledAnalysisConfig,
  ControlledAnalyzer,
} from '@/lib/controlled-analysis';
import { reportStorage } from '@/lib/report-storage';
import { NextRequest, NextResponse } from 'next/server';

export interface ControlledAnalysisRequest {
  _url: string;
  steps?: string[]; // Optional: specify which steps to run
  timeoutPerStep?: number; // Optional: override default timeout
}

export interface ControlledAnalysisResponse {
  success: boolean;
  data?: {
    _url: string;
    timestamp: string;
    steps: Array<{
      name: string;
      status: 'completed' | 'failed' | 'skipped';
      duration: number;
      result?: unknown;
    }>;
    totalDuration: number;
  };
  error?: string;
  message?: string;
  progress?: {
    currentStep: string;
    progress: number;
    totalSteps: number;
    completedSteps: number;
    estimatedTimeRemaining: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ControlledAnalysisRequest = await request.json();
    const { _url, steps, timeoutPerStep = 30000 } = body;

    if (!_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required',
        },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(_url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL format',
        },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting controlled analysis for: ${_url}`);

    // Filter steps if specified
    const selectedSteps = steps
      ? ANALYSIS_STEPS.filter((step) => steps.includes(step.id))
      : ANALYSIS_STEPS;

    if (selectedSteps.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid steps specified',
        },
        { status: 400 }
      );
    }

    // Create controlled analysis configuration
    const config: ControlledAnalysisConfig = {
      _url,
      steps: selectedSteps,
      timeoutPerStep,
      retryAttempts: 2,
      onProgressUpdate: (progress) => {
        console.log(
          `📊 ${progress.stepName}: ${progress.progress}% - ${progress.status}`
        );
      },
    };

    // Initialize analyzer
    const analyzer = new ControlledAnalyzer(config);

    // Execute analysis
    const result = await analyzer.execute();

    // Store the report
    const storedReport = await reportStorage.storeReport(
      result,
      _url,
      'controlled-analysis'
    );

    return NextResponse.json({
      success: true,
      data: result,
      reportId: storedReport.id,
      message: 'Controlled analysis completed successfully',
      metadata: {
        totalSteps: selectedSteps.length,
        totalDuration: result.totalDuration,
        completedAt: result.timestamp,
      },
    });
  } catch (error) {
    console.error('Controlled analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'steps':
        // Return available analysis steps
        return NextResponse.json({
          success: true,
          data: {
            availableSteps: ANALYSIS_STEPS.map((step) => ({
              id: step.id,
              name: step.name,
              description: step.description,
              expectedDuration: step.expectedDuration,
              dependencies: step.dependencies,
            })),
          },
        });

      case 'status':
        // Return system status
        return NextResponse.json({
          success: true,
          data: {
            status: 'ready',
            geminiApiKey: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
            availableSteps: ANALYSIS_STEPS.length,
            systemHealth: 'operational',
          },
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Controlled Analysis API is ready',
            endpoints: {
              'POST /api/analyze/controlled': 'Execute controlled analysis',
              'GET /api/analyze/controlled?action=steps':
                'Get available analysis steps',
              'GET /api/analyze/controlled?action=status': 'Get system status',
            },
          },
        });
    }
  } catch (error) {
    console.error('Controlled analysis GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

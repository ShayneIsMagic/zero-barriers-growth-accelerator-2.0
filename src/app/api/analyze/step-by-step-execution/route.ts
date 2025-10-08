import { NextRequest, NextResponse } from 'next/server';
import { ThreePhaseAnalyzer, Phase3Report } from '@/lib/three-phase-analyzer';
import { reportStorage } from '@/lib/report-storage';

export interface StepByStepExecutionRequest {
  url: string;
  stepId?: string; // Optional: execute specific step only
}

export interface StepByStepExecutionResponse {
  success: boolean;
  data?: Phase3Report;
  progress?: {
    currentStep: string;
    progress: number;
    steps: Array<{
      id: string;
      name: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      duration?: number;
    }>;
  };
  error?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, stepId } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format'
      }, { status: 400 });
    }

    console.log(`🚀 Starting step-by-step execution for: ${url}`);
    
    let progressData: any = null;
    
    // Execute 3-phase analysis with progress tracking
    const analyzer = new ThreePhaseAnalyzer(url, (phase, step, progress) => {
      progressData = {
        currentStep: `${phase}: ${step}`,
        progress: Math.round(progress),
        timestamp: new Date().toISOString()
      };
      console.log(`📊 ${phase}: ${step} - ${progress.toFixed(1)}%`);
    });
    
    const result = await analyzer.execute();

    // Store the report automatically
    const storedReport = await reportStorage.storeReport(result, url, 'comprehensive');

    return NextResponse.json({
      success: true,
      data: result,
      reportId: storedReport.id,
      reportPath: storedReport.filePath,
      message: 'Step-by-step analysis completed successfully',
      finalProgress: progressData
    });

  } catch (error) {
    console.error('Step-by-step execution error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check status (for future real-time updates)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    // For now, return a simple status
    // In the future, this could track real-time progress
    return NextResponse.json({
      success: true,
      status: 'ready',
      message: 'Step-by-step analysis system is ready'
    });

  } catch (error) {
    console.error('Status check error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

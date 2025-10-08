/**
 * Enhanced Analysis API Endpoint
 * Provides thorough analysis with clear progress tracking and actionable deliverables
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnhancedControlledAnalyzer, EnhancedAnalysisConfig } from '@/lib/enhanced-controlled-analysis';

export interface EnhancedAnalysisRequest {
  url: string;
  enableDetailedLogging?: boolean;
  timeoutPerStep?: number;
}

export interface EnhancedAnalysisResponse {
  success: boolean;
  data?: any;
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
    const body: EnhancedAnalysisRequest = await request.json();
    const { url, enableDetailedLogging = true, timeoutPerStep = 45000 } = body;

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

    console.log(`🚀 Starting enhanced analysis for: ${url}`);

    // Create enhanced analysis configuration
    const config: EnhancedAnalysisConfig = {
      url,
      enableDetailedLogging,
      timeoutPerStep,
      onProgressUpdate: (progress) => {
        console.log(`📊 ${progress.stepName}: ${progress.progress}% - ${progress.status}${progress.details ? ` - ${progress.details}` : ''}`);
      }
    };

    // Initialize enhanced analyzer
    const analyzer = new EnhancedControlledAnalyzer(config);

    // Execute enhanced analysis
    const result = await analyzer.execute();

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Enhanced analysis completed successfully',
      metadata: {
        url: result.executiveSummary.overallScore,
        rating: result.executiveSummary.rating,
        keyStrengths: result.executiveSummary.keyStrengths.length,
        priorityActions: result.executiveSummary.priorityActions.length,
        completedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Enhanced analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            status: 'ready',
            geminiApiKey: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
            analysisSteps: 8,
            systemHealth: 'operational',
            features: [
              'Comprehensive content collection',
              'Golden Circle analysis with exact quotes',
              'Elements of Value analysis (30 B2C)',
              'B2B Elements analysis (40 elements)',
              'CliftonStrengths analysis (34 themes)',
              'Technical performance analysis',
              'Content quality analysis',
              'Actionable report generation'
            ]
          }
        });

      case 'info':
        return NextResponse.json({
          success: true,
          data: {
            name: 'Enhanced Analysis System',
            description: 'Thorough analysis with clear progress tracking and actionable deliverables',
            steps: [
              {
                id: 'content_collection',
                name: 'Comprehensive Content Collection',
                description: 'Single step that collects ALL content for parsing to different assessments',
                duration: '30-60 seconds'
              },
              {
                id: 'golden_circle',
                name: 'Golden Circle Analysis',
                description: 'Extract exact quotes for Why, How, What, and Who',
                duration: '20-30 seconds'
              },
              {
                id: 'elements_of_value',
                name: 'B2C Elements of Value Analysis',
                description: 'Evaluate 30 Consumer Elements with specific evidence',
                duration: '25-35 seconds'
              },
              {
                id: 'b2b_elements',
                name: 'B2B Elements of Value Analysis',
                description: 'Evaluate 40 B2B Elements with specific evidence',
                duration: '30-40 seconds'
              },
              {
                id: 'clifton_strengths',
                name: 'CliftonStrengths Analysis',
                description: 'Evaluate 34 themes across 4 domains with evidence',
                duration: '25-35 seconds'
              },
              {
                id: 'technical_performance',
                name: 'Technical Performance Analysis',
                description: 'Analyze technical structure, SEO, and accessibility',
                duration: '10-15 seconds'
              },
              {
                id: 'content_quality',
                name: 'Content Quality Analysis',
                description: 'Evaluate content depth, clarity, and effectiveness',
                duration: '20-25 seconds'
              },
              {
                id: 'actionable_report',
                name: 'Actionable Report Generation',
                description: 'Generate comprehensive, actionable recommendations',
                duration: '15-20 seconds'
              }
            ],
            totalEstimatedTime: '3-4 minutes',
            deliverables: [
              'Executive summary with overall score and rating',
              'Detailed analysis for all frameworks',
              'Actionable recommendations (immediate, quick wins, strategic)',
              'Implementation roadmap with phases and timelines',
              'Specific evidence and quotes from website content'
            ]
          }
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Enhanced Analysis API is ready',
            endpoints: {
              'POST /api/analyze/enhanced': 'Execute enhanced analysis',
              'GET /api/analyze/enhanced?action=status': 'Get system status',
              'GET /api/analyze/enhanced?action=info': 'Get detailed information'
            },
            features: 'No demo data, real AI analysis only, comprehensive content collection, actionable deliverables'
          }
        });
    }

  } catch (error) {
    console.error('Enhanced analysis GET error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

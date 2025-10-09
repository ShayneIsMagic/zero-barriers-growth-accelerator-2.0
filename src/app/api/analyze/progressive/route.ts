/**
 * Progressive Analysis API
 * 
 * Stores progress in database so UI can show real-time updates
 * Each step completion saves to database immediately
 */

import { NextRequest, NextResponse } from 'next/server';
import { ThreePhaseAnalyzer } from '@/lib/three-phase-analyzer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

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

    // Create analysis record with PENDING status
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.analysis.create({
      data: {
        id: analysisId,
        url: url,
        status: 'PENDING',
        content: JSON.stringify({
          currentStep: 0,
          totalSteps: 9,
          steps: [
            { id: 'scrape_content', name: 'Content & SEO Scraping', status: 'pending' },
            { id: 'pageaudit', name: 'PageAudit Analysis', status: 'pending' },
            { id: 'lighthouse', name: 'Lighthouse Performance', status: 'pending' },
            { id: 'golden_circle', name: 'Golden Circle Analysis', status: 'pending' },
            { id: 'elements_of_value', name: 'Elements of Value Analysis', status: 'pending' },
            { id: 'b2b_elements', name: 'B2B Elements Analysis', status: 'pending' },
            { id: 'clifton_strengths', name: 'CliftonStrengths Analysis', status: 'pending' },
            { id: 'gemini_insights', name: 'Gemini Deep Analysis', status: 'pending' },
            { id: 'generate_report', name: 'Generate Raw Report', status: 'pending' }
          ]
        }),
        contentType: 'progressive',
        score: 0
      }
    });

    console.log(`🚀 Starting progressive analysis: ${analysisId} for ${url}`);

    // Start analysis in background (don't await)
    runProgressiveAnalysis(analysisId, url).catch(error => {
      console.error('Progressive analysis failed:', error);
      prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'FAILED',
          content: JSON.stringify({ error: error.message })
        }
      }).catch(console.error);
    });

    // Return immediately with analysis ID
    return NextResponse.json({
      success: true,
      analysisId,
      message: 'Analysis started. Poll /api/analyze/progressive/status for updates.',
      pollUrl: `/api/analyze/progressive/status?id=${analysisId}`
    });

  } catch (error) {
    console.error('Progressive analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Analysis failed to start',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/analyze/progressive?id=xxx - Check status
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
      where: { id }
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
      status: analysis.status,
      data: content
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

/**
 * Run analysis in background, updating database after each step
 */
async function runProgressiveAnalysis(analysisId: string, url: string) {
  let currentStepIndex = 0;
  
  const updateStep = async (stepId: string, status: 'running' | 'completed' | 'failed', data?: any) => {
    const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
    if (!analysis || !analysis.content) return;
    
    const content = JSON.parse(analysis.content);
    const stepIndex = content.steps.findIndex((s: any) => s.id === stepId);
    
    if (stepIndex >= 0) {
      content.steps[stepIndex].status = status;
      if (data) {
        content.steps[stepIndex].data = data;
      }
      
      if (status === 'completed') {
        currentStepIndex = stepIndex + 1;
        content.currentStep = currentStepIndex;
      }
    }
    
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        content: JSON.stringify(content),
        status: status === 'failed' ? 'FAILED' : (currentStepIndex >= 9 ? 'COMPLETED' : 'IN_PROGRESS')
      }
    });
    
    console.log(`📊 ${analysisId}: ${stepId} → ${status}`);
  };

  try {
    // Execute analysis with progress tracking
    const analyzer = new ThreePhaseAnalyzer(url, async (phase, step, progress) => {
      console.log(`📊 ${phase}: ${step} - ${progress.toFixed(1)}%`);
      
      // Map phases to step IDs
      if (step.includes('Scraping') || step.includes('data collection')) {
        await updateStep('scrape_content', 'running');
      } else if (step.includes('PageAudit')) {
        if (progress === 100) await updateStep('scrape_content', 'completed');
        await updateStep('pageaudit', 'running');
      } else if (step.includes('Lighthouse')) {
        if (progress === 100) await updateStep('pageaudit', 'completed');
        await updateStep('lighthouse', 'running');
      } else if (step.includes('Golden Circle')) {
        if (progress === 100) await updateStep('lighthouse', 'completed');
        await updateStep('golden_circle', 'running');
      } else if (step.includes('Elements of Value') && !step.includes('B2B')) {
        if (progress === 100) await updateStep('golden_circle', 'completed');
        await updateStep('elements_of_value', 'running');
      } else if (step.includes('B2B')) {
        if (progress === 100) await updateStep('elements_of_value', 'completed');
        await updateStep('b2b_elements', 'running');
      } else if (step.includes('CliftonStrengths') || step.includes('Strengths')) {
        if (progress === 100) await updateStep('b2b_elements', 'completed');
        await updateStep('clifton_strengths', 'running');
      } else if (step.includes('insights') || step.includes('Strategic')) {
        if (progress === 100) await updateStep('clifton_strengths', 'completed');
        await updateStep('gemini_insights', 'running');
      } else if (step.includes('report') || step.includes('final')) {
        if (progress === 100) await updateStep('gemini_insights', 'completed');
        await updateStep('generate_report', 'running');
      }
    });

    const result = await analyzer.execute();

    // Mark all steps as completed
    await updateStep('generate_report', 'completed', result);

    // Update final result
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'COMPLETED',
        content: JSON.stringify({
          currentStep: 9,
          totalSteps: 9,
          completed: true,
          result: result
        }),
        score: result.finalReport?.evaluationFramework?.overallScore || 0
      }
    });

    console.log(`✅ Progressive analysis completed: ${analysisId}`);

  } catch (error) {
    console.error(`❌ Progressive analysis failed: ${analysisId}`, error);
    throw error;
  }
}


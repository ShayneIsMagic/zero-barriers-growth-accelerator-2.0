/**
 * Progressive Analysis API
 *
 * Stores progress in database so UI can show real-time updates
 * Each step completion saves to database immediately
 */

import { prisma } from '@/lib/prisma';
import { ThreePhaseAnalyzer } from '@/lib/three-phase-analyzer';
import { NextRequest, NextResponse } from 'next/server';

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
 * Generates individual reports with prompts for each assessment
 */
async function runProgressiveAnalysis(analysisId: string, url: string) {
  let currentStepIndex = 0;
  const individualReports: any[] = [];

  const updateStep = async (stepId: string, status: 'running' | 'completed' | 'failed', data?: any, reportData?: any) => {
    const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
    if (!analysis || !analysis.content) return;

    const content = JSON.parse(analysis.content);
    const stepIndex = content.steps.findIndex((s: any) => s.id === stepId);

    if (stepIndex >= 0) {
      content.steps[stepIndex].status = status;
      if (data) {
        content.steps[stepIndex].data = data;
      }
      if (reportData) {
        content.steps[stepIndex].report = reportData;
        individualReports.push(reportData);
      }

      if (status === 'completed') {
        currentStepIndex = stepIndex + 1;
        content.currentStep = currentStepIndex;
      }
    }

    content.individualReports = individualReports;

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
    // Import report generators
    const {
      generateContentCollectionReport,
      generateLighthouseReport,
      generateGoldenCircleReport,
      generateElementsB2CReport,
      generateB2BElementsReport,
      generateCliftonStrengthsReport,
      generateComprehensiveReport
    } = await import('@/lib/individual-report-generator');

    // Execute analysis with progress tracking and report generation
    const analyzer = new ThreePhaseAnalyzer(url, async (phase, step, progress) => {
      console.log(`📊 ${phase}: ${step} - ${progress.toFixed(1)}%`);
    });

    const result = await analyzer.execute();

    // Generate individual reports with prompts
    console.log('📝 Generating individual reports...');

    // Content Collection Report
    const contentReport = generateContentCollectionReport(result.phase1Data?.scrapedContent, url);
    await updateStep('scrape_content', 'completed', result.phase1Data?.scrapedContent, contentReport);

    // Lighthouse Report
    if (result.phase1Data?.lighthouseData) {
      const lighthouseReport = generateLighthouseReport(result.phase1Data.lighthouseData, url);
      await updateStep('lighthouse', 'completed', result.phase1Data.lighthouseData, lighthouseReport);
    }

    // Golden Circle Report (with prompt)
    if (result.phase2Data?.goldenCircle) {
      const prompt = `Analyze the website content for Golden Circle framework (Why, How, What, Who):\n\nURL: ${url}\nContent: ${result.phase1Data?.scrapedContent?.content?.substring(0, 2000)}...\n\nExtract:\n1. WHY (dominant purpose) - exact quotes from website\n2. HOW (unique methodology) - exact quotes about their approach\n3. WHAT (products/services) - exact list of offerings\n4. WHO (target audience) - exact quotes about their market\n\nReturn structured analysis with scores and evidence.`;
      const goldenReport = generateGoldenCircleReport(result.phase2Data.goldenCircle, url, prompt);
      await updateStep('golden_circle', 'completed', result.phase2Data.goldenCircle, goldenReport);
    }

    // Elements of Value (B2C) Report
    if (result.phase2Data?.elementsOfValue) {
      const prompt = `Analyze the website content for B2C Elements of Value (30 elements):\n\nURL: ${url}\nContent: ${result.phase1Data?.scrapedContent?.content?.substring(0, 2000)}...\n\nEvaluate each of the 30 B2C Elements of Value and provide specific evidence from the content.\n\nReturn structured analysis with scores for each element.`;
      const elementsReport = generateElementsB2CReport(result.phase2Data.elementsOfValue, url, prompt);
      await updateStep('elements_of_value', 'completed', result.phase2Data.elementsOfValue, elementsReport);
    }

    // B2B Elements Report
    if (result.phase2Data?.b2bElements) {
      const prompt = `Analyze the website content for B2B Elements of Value (40 elements):\n\nURL: ${url}\nContent: ${result.phase1Data?.scrapedContent?.content?.substring(0, 2000)}...\n\nEvaluate each of the 40 B2B Elements of Value and provide specific evidence from the content.\n\nReturn structured analysis with scores for each element.`;
      const b2bReport = generateB2BElementsReport(result.phase2Data.b2bElements, url, prompt);
      await updateStep('b2b_elements', 'completed', result.phase2Data.b2bElements, b2bReport);
    }

    // CliftonStrengths Report
    if (result.phase2Data?.cliftonStrengths) {
      const prompt = `Analyze the website content for CliftonStrengths (34 themes):\n\nURL: ${url}\nContent: ${result.phase1Data?.scrapedContent?.content?.substring(0, 2000)}...\n\nEvaluate each of the 34 CliftonStrengths themes and provide specific evidence from the content.\n\nReturn structured analysis with top 5 themes and scores.`;
      const strengthsReport = generateCliftonStrengthsReport(result.phase2Data.cliftonStrengths, url, prompt);
      await updateStep('clifton_strengths', 'completed', result.phase2Data.cliftonStrengths, strengthsReport);
    }

    // Comprehensive Report
    if (result.phase3Data) {
      const prompt = `Comprehensive Strategic Analysis:\n\nPhase 1 Data:\n- SEO Score: ${result.phase1Data?.summary.seoScore}/100\n- Performance Score: ${result.phase1Data?.summary.performanceScore}/100\n\nPhase 2 Data:\n- Golden Circle Score: ${result.phase2Data?.summary.goldenCircleScore}/100\n- Elements of Value Score: ${result.phase2Data?.summary.elementsOfValueScore}/100\n\nProvide comprehensive recommendations for:\n1. Performance optimization\n2. SEO improvements\n3. Lead generation improvements\n4. Sales optimization\n5. Overall business growth\n\nReturn structured recommendations with quick wins and long-term strategy.`;
      const comprehensiveReport = generateComprehensiveReport(result.phase3Data.comprehensiveAnalysis, url, prompt);
      await updateStep('gemini_insights', 'completed', result.phase3Data, comprehensiveReport);
    }

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
          result: result,
          individualReports: individualReports
        }),
        score: result.finalReport?.evaluationFramework?.overallScore || 0
      }
    });

    console.log(`✅ Progressive analysis completed with ${individualReports.length} individual reports: ${analysisId}`);

  } catch (error) {
    console.error(`❌ Progressive analysis failed: ${analysisId}`, error);
    throw error;
  }
}


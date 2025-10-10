/**
 * Individual Phase Execution API
 * Allows running Phase 1, 2, or 3 independently with manual control
 */

import {
    generateB2BElementsReport,
    generateCliftonStrengthsReport,
    generateComprehensiveReport,
    generateContentCollectionReport,
    generateElementsB2CReport,
    generateGoldenCircleReport,
    generateLighthouseReport
} from '@/lib/individual-report-generator';
import { prisma } from '@/lib/prisma';
import { ThreePhaseAnalyzer } from '@/lib/three-phase-analyzer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, phase, analysisId } = body;

    if (!url || !phase) {
      return NextResponse.json({
        success: false,
        error: 'URL and phase are required'
      }, { status: 400 });
    }

    console.log(`🚀 Starting Phase ${phase} for: ${url}`);

    // Create or update analysis record
    let analysis;
    if (analysisId) {
      analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
      if (!analysis) {
        return NextResponse.json({
          success: false,
          error: 'Analysis not found'
        }, { status: 404 });
      }
    }

    const analyzer = new ThreePhaseAnalyzer(url);
    const individualReports: any[] = analysis ? JSON.parse(analysis.content || '{}').individualReports || [] : [];

    if (phase === 1) {
      // Execute Phase 1: Data Collection
      const phase1Result = await (analyzer as any).executePhase1();

      // Generate individual reports for Phase 1
      const contentReport = generateContentCollectionReport(phase1Result.scrapedContent, url);
      individualReports.push(contentReport);

      if (phase1Result.lighthouseData) {
        const lighthouseReport = generateLighthouseReport(phase1Result.lighthouseData, url);
        individualReports.push(lighthouseReport);
      } else {
        // Lighthouse failed - add manual fallback report
        const fallbackReport = {
          id: 'lighthouse-fallback',
          name: 'Lighthouse Performance (Manual Fallback)',
          phase: 'Phase 1',
          prompt: `⚠️ Automated Lighthouse failed. Use manual option:

1. Go to https://pagespeed.web.dev/
2. Enter: ${url}
3. Click "Analyze"
4. Copy scores and paste into Gemini with this prompt:

Analyze these Lighthouse scores for ${url}:
- Performance: [YOUR_SCORE]/100
- Accessibility: [YOUR_SCORE]/100
- Best Practices: [YOUR_SCORE]/100
- SEO: [YOUR_SCORE]/100

Key Issues:
[PASTE TOP 3-5 ISSUES FROM REPORT]

Provide:
1. What these scores mean
2. Priority fixes
3. Quick wins (< 1 hour)
4. Impact on user experience`,
          markdown: `# Lighthouse Performance - Manual Fallback Required

**URL:** ${url}  
**Date:** ${new Date().toLocaleString()}  
**Status:** ⚠️ Automated analysis failed

---

## Manual Steps Required

The automated Lighthouse analysis failed. Please run it manually:

### Step 1: Run Lighthouse
1. Go to: **https://pagespeed.web.dev/**
2. Enter your URL: \`${url}\`
3. Click "Analyze"
4. Wait 30 seconds for results

### Step 2: Copy Scores
Note these scores:
- Performance: ___/100
- Accessibility: ___/100
- Best Practices: ___/100
- SEO: ___/100

### Step 3: Get AI Analysis
Copy this prompt and paste into Gemini (https://gemini.google.com/):

\`\`\`
Analyze these Lighthouse scores for ${url}:
- Performance: [YOUR_SCORE]/100
- Accessibility: [YOUR_SCORE]/100
- Best Practices: [YOUR_SCORE]/100
- SEO: [YOUR_SCORE]/100

Key Issues:
[PASTE TOP 3-5 ISSUES FROM REPORT]

Provide:
1. What these scores mean
2. Priority fixes
3. Quick wins (< 1 hour)
4. Impact on user experience
\`\`\`

---

**Why did automated fail?** The Lighthouse script may be missing or the API timed out. Manual analysis provides the same quality results.
`,
          timestamp: new Date().toISOString()
        };
        individualReports.push(fallbackReport);
      }

      // Store Phase 1 results
      const newAnalysisId = analysisId || `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await prisma.analysis.upsert({
        where: { id: newAnalysisId },
        create: {
          id: newAnalysisId,
          url: url,
          status: 'IN_PROGRESS',
          content: JSON.stringify({
            phase: 1,
            phase1Data: phase1Result,
            individualReports,
            completedPhases: [1]
          }),
          contentType: 'phased',
          score: 0
        },
        update: {
          content: JSON.stringify({
            phase: 1,
            phase1Data: phase1Result,
            individualReports,
            completedPhases: [1]
          })
        }
      });

      return NextResponse.json({
        success: true,
        analysisId: newAnalysisId,
        phase: 1,
        data: phase1Result,
        individualReports,
        message: 'Phase 1 completed. Ready for Phase 2.'
      });
    }

    if (phase === 2) {
      // Execute Phase 2: Framework Analysis
      if (!analysisId) {
        return NextResponse.json({
          success: false,
          error: 'Must complete Phase 1 first'
        }, { status: 400 });
      }

      const content = JSON.parse(analysis!.content || '{}');
      const phase1Data = content.phase1Data;

      if (!phase1Data) {
        return NextResponse.json({
          success: false,
          error: 'Phase 1 data not found. Run Phase 1 first.'
        }, { status: 400 });
      }

      const phase2Result = await (analyzer as any).executePhase2(phase1Data);

      // Generate Phase 2 individual reports with prompts
      if (phase2Result.goldenCircle) {
        const prompt = `Analyze the website content for Golden Circle framework (Why, How, What, Who):

URL: ${url}
Title: ${phase1Data.scrapedContent?.title}
Content: ${phase1Data.scrapedContent?.content?.substring(0, 2000)}...

Extract:
1. WHY (dominant purpose) - exact quotes from website
2. HOW (unique methodology) - exact quotes about their approach
3. WHAT (products/services) - exact list of offerings
4. WHO (target audience) - exact quotes about their market

Return structured analysis with scores and evidence.`;
        const goldenReport = generateGoldenCircleReport(phase2Result.goldenCircle, url, prompt);
        individualReports.push(goldenReport);
      }

      if (phase2Result.elementsOfValue) {
        const prompt = `Analyze the website content for B2C Elements of Value (30 elements):

URL: ${url}
Content: ${phase1Data.scrapedContent?.content?.substring(0, 2000)}...

Evaluate each of the 30 B2C Elements of Value and provide specific evidence from the content.
Return structured analysis with scores for each element.`;
        const elementsReport = generateElementsB2CReport(phase2Result.elementsOfValue, url, prompt);
        individualReports.push(elementsReport);
      }

      if (phase2Result.b2bElements) {
        const prompt = `Analyze the website content for B2B Elements of Value (40 elements):

URL: ${url}
Content: ${phase1Data.scrapedContent?.content?.substring(0, 2000)}...

Evaluate each of the 40 B2B Elements of Value and provide specific evidence from the content.
Return structured analysis with scores for each element.`;
        const b2bReport = generateB2BElementsReport(phase2Result.b2bElements, url, prompt);
        individualReports.push(b2bReport);
      }

      if (phase2Result.cliftonStrengths) {
        const prompt = `Analyze the website content for CliftonStrengths (34 themes):

URL: ${url}
Content: ${phase1Data.scrapedContent?.content?.substring(0, 2000)}...

Evaluate each of the 34 CliftonStrengths themes and provide specific evidence from the content.
Return structured analysis with top 5 themes and scores.`;
        const strengthsReport = generateCliftonStrengthsReport(phase2Result.cliftonStrengths, url, prompt);
        individualReports.push(strengthsReport);
      }

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          content: JSON.stringify({
            phase: 2,
            phase1Data,
            phase2Data: phase2Result,
            individualReports,
            completedPhases: [1, 2]
          })
        }
      });

      return NextResponse.json({
        success: true,
        analysisId,
        phase: 2,
        data: phase2Result,
        individualReports,
        message: 'Phase 2 completed. Ready for Phase 3.'
      });
    }

    if (phase === 3) {
      // Execute Phase 3: Strategic Analysis
      if (!analysisId) {
        return NextResponse.json({
          success: false,
          error: 'Must complete Phase 1 and 2 first'
        }, { status: 400 });
      }

      const content = JSON.parse(analysis!.content || '{}');
      const phase1Data = content.phase1Data;
      const phase2Data = content.phase2Data;

      if (!phase1Data || !phase2Data) {
        return NextResponse.json({
          success: false,
          error: 'Phase 1 and 2 data not found. Run them first.'
        }, { status: 400 });
      }

      const phase3Result = await (analyzer as any).executePhase3(phase1Data, phase2Data);

      // Generate Phase 3 comprehensive report
      if (phase3Result.comprehensiveAnalysis) {
        const prompt = `Comprehensive Strategic Analysis:

Phase 1 Data:
- SEO Score: ${phase1Data.summary.seoScore}/100
- Performance Score: ${phase1Data.summary.performanceScore}/100
- Total Words: ${phase1Data.summary.totalWords}

Phase 2 Data:
- Golden Circle Score: ${phase2Data.summary.goldenCircleScore}/100
- Elements of Value Score: ${phase2Data.summary.elementsOfValueScore}/100
- B2B Elements Score: ${phase2Data.summary.b2bElementsScore}/100
- CliftonStrengths Score: ${phase2Data.summary.cliftonStrengthsScore}/100

Provide comprehensive recommendations for:
1. Performance optimization
2. SEO improvements
3. Lead generation improvements
4. Sales optimization
5. Overall business growth

Return structured recommendations with quick wins and long-term strategy.`;
        const comprehensiveReport = generateComprehensiveReport(phase3Result.comprehensiveAnalysis, url, prompt);
        individualReports.push(comprehensiveReport);
      }

      const overallScore = phase3Result.finalReport?.evaluationFramework?.overallScore || 0;

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          content: JSON.stringify({
            phase: 3,
            phase1Data,
            phase2Data,
            phase3Data: phase3Result,
            individualReports,
            completedPhases: [1, 2, 3],
            completed: true
          }),
          score: overallScore
        }
      });

      return NextResponse.json({
        success: true,
        analysisId,
        phase: 3,
        data: phase3Result,
        individualReports,
        overallScore,
        message: 'All phases completed!'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid phase. Must be 1, 2, or 3.'
    }, { status: 400 });

  } catch (error) {
    console.error('Phase execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Phase execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


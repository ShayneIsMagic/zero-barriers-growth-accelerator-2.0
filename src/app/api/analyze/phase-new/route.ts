/**
 * NEW Individual Phase Execution API
 * Uses detailed schema with 60+ tables for enhanced analysis
 */

import { prisma } from '@/lib/prisma'
import { CliftonStrengthsService } from '@/lib/services/clifton-strengths-detailed.service'
import { ComprehensiveReportService } from '@/lib/services/comprehensive-report.service'
import { ElementsOfValueB2BService } from '@/lib/services/elements-value-b2b.service'
import { ElementsOfValueB2CService } from '@/lib/services/elements-value-b2c.service'
import { GoldenCircleDetailedService } from '@/lib/services/golden-circle-detailed.service'
import { LighthouseDetailedService } from '@/lib/services/lighthouse-detailed.service'
import { SEOOpportunitiesService } from '@/lib/services/seo-opportunities.service'
import { SynonymDetectionService } from '@/lib/services/synonym-detection.service'
import { ThreePhaseAnalyzer } from '@/lib/three-phase-analyzer'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, phase, analysisId, industry } = body

    if (!url || !phase) {
      return NextResponse.json({
        success: false,
        error: 'URL and phase are required'
      }, { status: 400 })
    }

    console.log(`🚀 Starting Phase ${phase} for: ${url}`)

    // Get existing analysis if provided
    let analysis
    if (analysisId) {
      analysis = await prisma.analysis.findUnique({ where: { id: analysisId } })
      if (!analysis) {
        return NextResponse.json({
          success: false,
          error: 'Analysis not found'
        }, { status: 404 })
      }
    }

    // Route to appropriate phase handler
    switch (phase) {
      case 1:
        return await handlePhase1(url, analysisId, industry)
      case 2:
        return await handlePhase2(url, analysisId, analysis, industry)
      case 3:
        return await handlePhase3(url, analysisId, analysis, industry)
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid phase. Must be 1, 2, or 3.'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Phase execution error:', error)
    return NextResponse.json({
      success: false,
      error: 'Phase execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * PHASE 1: Data Collection (Keep current behavior)
 */
async function handlePhase1(
  url: string,
  analysisId?: string,
  industry?: string
) {
  console.log('📊 Phase 1: Data Collection')

  // Use existing scraper
  const analyzer = new ThreePhaseAnalyzer(url)
  const phase1Result = await (analyzer as any).executePhase1()

  // Create or update analysis
  const newAnalysisId = analysisId || `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Create website record
  await prisma.$queryRaw`
    INSERT INTO websites (url, domain, industry, total_analyses)
    VALUES (
      ${url},
      ${new URL(url).hostname},
      ${industry || 'general'},
      1
    )
    ON CONFLICT (url) DO UPDATE
    SET total_analyses = websites.total_analyses + 1,
        last_analyzed_at = NOW()
  `

  // Store Phase 1 data
  await prisma.analysis.upsert({
    where: { id: newAnalysisId },
    create: {
      id: newAnalysisId,
      status: 'PHASE_1_COMPLETE',
      content: JSON.stringify({
        phase: 1,
        url,
        industry,
        phase1Data: phase1Result,
        completedPhases: [1]
      }),
      contentType: 'phased',
      score: 0
    },
    update: {
      status: 'PHASE_1_COMPLETE',
      content: JSON.stringify({
        phase: 1,
        url,
        industry,
        phase1Data: phase1Result,
        completedPhases: [1]
      })
    }
  })

  return NextResponse.json({
    success: true,
    analysisId: newAnalysisId,
    phase: 1,
    data: phase1Result,
    message: 'Phase 1 completed. Ready for Phase 2 (AI Analysis).'
  })
}

/**
 * PHASE 2: AI Framework Analysis (NEW - Uses detailed tables)
 */
async function handlePhase2(
  url: string,
  analysisId: string | undefined,
  analysis: any,
  industry?: string
) {
  console.log('🤖 Phase 2: AI Framework Analysis (Enhanced with Synonym Detection)')

  // Get Phase 1 data
  let phase1Data
  if (analysis) {
    const content = JSON.parse(analysis.content || '{}')
    phase1Data = content.phase1Data
  }

  if (!phase1Data) {
    console.log('⚠️ No Phase 1 data - running quick scrape')
    const analyzer = new ThreePhaseAnalyzer(url)
    phase1Data = await (analyzer as any).executePhase1()
  }

  const contentText = phase1Data.scrapedContent?.content || phase1Data.scrapedContent?.text || ''
  const detectedIndustry = industry || phase1Data.industry || 'general'

  // Step 1: Run synonym detection FIRST
  console.log('🔍 Running pattern detection...')
  const patterns = await SynonymDetectionService.findValuePatterns(
    contentText,
    detectedIndustry
  )

  console.log(`✅ Found ${patterns.length} pattern matches`)

  // Step 2: Run all 4 AI analyses in parallel with pattern context
  console.log('🤖 Running 4 AI framework analyses...')

  const [goldenCircle, eovB2C, eovB2B, cliftonStrengths] = await Promise.all([
    GoldenCircleDetailedService.analyze(analysisId!, phase1Data.scrapedContent, detectedIndustry, patterns)
      .catch(err => {
        console.error('Golden Circle failed:', err)
        return null
      }),
    ElementsOfValueB2CService.analyze(analysisId!, phase1Data.scrapedContent, detectedIndustry, patterns)
      .catch(err => {
        console.error('Elements B2C failed:', err)
        return null
      }),
    ElementsOfValueB2BService.analyze(analysisId!, phase1Data.scrapedContent, detectedIndustry, patterns)
      .catch(err => {
        console.error('Elements B2B failed:', err)
        return null
      }),
    CliftonStrengthsService.analyze(analysisId!, phase1Data.scrapedContent, detectedIndustry, patterns)
      .catch(err => {
        console.error('CliftonStrengths failed:', err)
        return null
      })
  ])

  // Store pattern matches
  await SynonymDetectionService.storePatternMatches(
    analysisId!,
    patterns.map(p => ({
      element_name: p.element_name,
      pattern_text: p.pattern_text,
      confidence: p.confidence,
      matched_text: p.pattern_text
    })),
    url
  )

  // Update analysis status
  await prisma.analysis.update({
    where: { id: analysisId },
    data: {
      status: 'PHASE_2_COMPLETE',
      content: JSON.stringify({
        phase: 2,
        url,
        industry: detectedIndustry,
        phase1Data,
        phase2Data: {
          goldenCircleId: goldenCircle?.id,
          eovB2CId: eovB2C?.id,
          eovB2BId: eovB2B?.id,
          cliftonStrengthsId: cliftonStrengths?.id,
          patternsFound: patterns.length
        },
        completedPhases: [1, 2]
      })
    }
  })

  return NextResponse.json({
    success: true,
    analysisId,
    phase: 2,
    data: {
      goldenCircle,
      elementsOfValueB2C: eovB2C,
      elementsOfValueB2B: eovB2B,
      cliftonStrengths,
      patterns: {
        total: patterns.length,
        top10: patterns.slice(0, 10)
      }
    },
    message: `Phase 2 completed with ${patterns.length} patterns detected. Ready for Phase 3.`
  })
}

/**
 * PHASE 3: Google Tools + Comprehensive Report (NEW)
 */
async function handlePhase3(
  url: string,
  analysisId: string | undefined,
  analysis: any,
  industry?: string
) {
  console.log('📊 Phase 3: Google Tools Analysis + Comprehensive Report')

  if (!analysisId) {
    return NextResponse.json({
      success: false,
      error: 'Analysis ID required for Phase 3'
    }, { status: 400 })
  }

  // Get Phase 1 and 2 data
  const content = JSON.parse(analysis.content || '{}')
  const phase1Data = content.phase1Data
  const phase2Data = content.phase2Data

  // Step 1: Run Lighthouse analysis
  console.log('🔍 Running Lighthouse analysis...')
  const lighthouse = await LighthouseDetailedService.analyze(
    analysisId,
    url,
    phase1Data?.lighthouseData // Use Phase 1 data if available
  ).catch(err => {
    console.error('Lighthouse failed:', err)
    return null
  })

  // Step 2: Run SEO analysis
  console.log('🔎 Running SEO opportunities analysis...')
  const seo = await SEOOpportunitiesService.analyze(
    analysisId,
    url,
    phase1Data?.scrapedContent || {}
  ).catch(err => {
    console.error('SEO failed:', err)
    return null
  })

  // Step 3: Generate comprehensive report
  console.log('📝 Generating comprehensive report...')
  const comprehensiveReport = await ComprehensiveReportService.generate(
    analysisId
  ).catch(err => {
    console.error('Report generation failed:', err)
    return null
  })

  // Calculate final overall score
  const overallScore = comprehensiveReport?.overall_score || 0

  // Update analysis with final status
  await prisma.analysis.update({
    where: { id: analysisId },
    data: {
      status: 'COMPLETE',
      score: overallScore,
      insights: comprehensiveReport?.sections.executive_summary || '',
      content: JSON.stringify({
        phase: 3,
        url,
        industry: industry || content.industry,
        phase1Data,
        phase2Data,
        phase3Data: {
          lighthouseId: lighthouse?.id,
          seoId: seo?.id,
          reportId: comprehensiveReport?.id
        },
        completedPhases: [1, 2, 3],
        completed: true
      })
    }
  })

  return NextResponse.json({
    success: true,
    analysisId,
    phase: 3,
    data: {
      lighthouse,
      seo,
      report: comprehensiveReport
    },
    overallScore,
    message: 'All phases completed! Comprehensive report generated.'
  })
}


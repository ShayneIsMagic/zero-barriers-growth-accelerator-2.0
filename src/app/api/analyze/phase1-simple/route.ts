/**
 * SIMPLE Phase 1 API - Data Collection Only
 * Uses the working scraper pattern from content comparison
 * No complex database operations that cause Prisma errors
 */

import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, industry } = body

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 })
    }

    console.log(`🚀 Starting SIMPLE Phase 1 for: ${url}`)

    // Use the WORKING scraper from content comparison page
    const { scrapeWebsiteContent } = await import('@/lib/reliable-content-scraper')
    
    console.log('🔍 Step 1: Scraping website content...')
    const scrapedContent = await scrapeWebsiteContent(url)
    
    console.log(`✅ Successfully scraped ${scrapedContent.wordCount} words from ${url}`)

    // Create Phase 1 result in the same format as ThreePhaseAnalyzer
    const phase1Result = {
      phase: 'Phase 1: Data Collection Foundation',
      url: url,
      timestamp: new Date().toISOString(),
      scrapedContent,
      pageAuditData: null,
      lighthouseData: null,
      seoAnalysis: null,
      summary: {
        totalWords: scrapedContent.wordCount || 0,
        totalImages: scrapedContent.imageCount || 0,
        totalLinks: scrapedContent.linkCount || 0,
        seoScore: 0,
        performanceScore: 0,
        accessibilityScore: 0,
        technicalIssues: [],
        contentIssues: []
      }
    }

    // Generate analysis ID
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log(`✅ Phase 1 completed - Collected ${scrapedContent.wordCount} words, ${scrapedContent.extractedKeywords?.length || 0} keywords`)

    return NextResponse.json({
      success: true,
      analysisId: analysisId,
      phase: 1,
      data: phase1Result,
      message: 'Phase 1 completed successfully. Ready for Phase 2 (AI Analysis).',
      nextSteps: {
        phase2: `/api/analyze/phase-new`,
        phase2Payload: {
          url: url,
          phase: 2,
          analysisId: analysisId,
          industry: industry || 'general'
        }
      }
    })

  } catch (error) {
    console.error('Simple Phase 1 error:', error)
    return NextResponse.json({
      success: false,
      error: 'Phase 1 data collection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

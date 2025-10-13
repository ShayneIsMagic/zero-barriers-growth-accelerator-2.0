/**
 * SEO Opportunities Service
 *
 * Analyzes SEO, keyword opportunities, and content gaps
 * Provides actionable recommendations for search optimization
 */

import { prisma } from '@/lib/prisma'

export interface SEOAnalysis {
  id: string
  analysis_id: string
  overall_seo_score: number
  technical_seo_score: number
  content_quality_score: number
  keyword_optimization_score: number
  opportunities: KeywordOpportunity[]
  content_gaps: ContentGap[]
}

export interface KeywordOpportunity {
  id: string
  keyword: string
  search_volume: number
  competition: string
  keyword_difficulty: number
  opportunity_score: number
  priority: string
  recommended_action: string
}

export interface ContentGap {
  id: string
  topic: string
  opportunity_description: string
  target_keywords: string[]
  estimated_traffic: number
  priority: string
  recommended_word_count: number
}

export class SEOOpportunitiesService {
  /**
   * Run complete SEO analysis
   */
  static async analyze(
    analysisId: string,
    url: string,
    content: any
  ): Promise<SEOAnalysis> {
    // Extract keywords from content
    const keywords = this.extractKeywords(content)

    // Analyze SEO elements
    const seoData = this.analyzeSEOElements(content, keywords)

    // Store in database
    return await this.storeSEOAnalysis(analysisId, url, seoData, keywords)
  }

  /**
   * Extract keywords from content
   */
  private static extractKeywords(content: any): string[] {
    const text = content.text || content.content || ''

    // Simple keyword extraction (in production, use proper NLP)
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter((w: string) => w.length > 3)

    // Count frequency
    const frequency: Record<string, number> = {}
    words.forEach((w: string) => {
      frequency[w] = (frequency[w] || 0) + 1
    })

    // Get top keywords
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word)
  }

  /**
   * Analyze SEO elements from content
   */
  private static analyzeSEOElements(content: any, keywords: string[]): any {
    const hasTitle = !!content.title
    const hasMetaDescription = !!content.metaDescription
    const hasH1 = !!content.headings?.h1
    const hasImages = (content.images?.length || 0) > 0
    const imagesWithAlt = content.images?.filter((img: any) => img.alt).length || 0
    const totalImages = content.images?.length || 0

    // Calculate scores
    const titleScore = hasTitle ? 100 : 0
    const metaScore = hasMetaDescription ? 100 : 0
    const headingScore = hasH1 ? 100 : 0
    const imageScore = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 0

    const technical_seo_score = (titleScore + metaScore + headingScore + imageScore) / 4
    const content_quality_score = keywords.length > 5 ? 80 : 50
    const keyword_optimization_score = keywords.length > 10 ? 85 : 60

    const overall_seo_score = (
      technical_seo_score * 0.4 +
      content_quality_score * 0.3 +
      keyword_optimization_score * 0.3
    )

    return {
      overall_seo_score,
      technical_seo_score,
      content_quality_score,
      keyword_optimization_score,
      primary_keyword: keywords[0] || 'not-detected',
      keywords,
      issues: {
        missingTitle: !hasTitle,
        missingMeta: !hasMetaDescription,
        missingH1: !hasH1,
        imagesWithoutAlt: totalImages - imagesWithAlt
      }
    }
  }

  /**
   * Store SEO analysis in database
   */
  private static async storeSEOAnalysis(
    analysisId: string,
    url: string,
    seoData: any,
    keywords: string[]
  ): Promise<SEOAnalysis> {
    // Get website_id
    const website = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM websites WHERE url = ${url} LIMIT 1
    `

    const websiteId = website.length > 0 ? website[0].id : null

    // Create main SEO record
    const seo = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO seo_analyses (
        analysis_id, website_id, primary_keyword,
        overall_seo_score, technical_seo_score,
        content_quality_score, keyword_optimization_score
      ) VALUES (
        ${analysisId}::text,
        ${websiteId}::uuid,
        ${seoData.primary_keyword},
        ${seoData.overall_seo_score},
        ${seoData.technical_seo_score},
        ${seoData.content_quality_score},
        ${seoData.keyword_optimization_score}
      )
      RETURNING id
    `

    const seoId = seo[0].id

    // Create keyword opportunities
    const opportunities: KeywordOpportunity[] = []

    for (const [index, keyword] of keywords.entries()) {
      // Simulate search volume and difficulty (in production, use real API)
      const searchVolume = Math.floor(Math.random() * 5000) + 100
      const difficulty = Math.floor(Math.random() * 100)
      const opportunityScore = 100 - difficulty + (searchVolume / 100)

      const stored = await prisma.$queryRaw<Array<KeywordOpportunity>>`
        INSERT INTO keyword_opportunities (
          seo_analysis_id, keyword, search_volume,
          competition, keyword_difficulty, opportunity_score,
          priority, recommended_action
        ) VALUES (
          ${seoId}::uuid,
          ${keyword},
          ${searchVolume},
          ${difficulty > 70 ? 'high' : difficulty > 40 ? 'medium' : 'low'},
          ${difficulty},
          ${opportunityScore},
          ${opportunityScore > 80 ? 'high' : opportunityScore > 60 ? 'medium' : 'low'},
          ${`Create content targeting "${keyword}"`}
        )
        RETURNING *
      `

      if (stored[0]) opportunities.push(stored[0])
    }

    // Create content gaps (topics to cover)
    const contentGaps: ContentGap[] = []
    const suggestedTopics = [
      { topic: 'Getting Started Guide', keywords: keywords.slice(0, 3) },
      { topic: 'Common Use Cases', keywords: keywords.slice(3, 6) },
      { topic: 'Best Practices', keywords: keywords.slice(6, 9) }
    ]

    for (const gap of suggestedTopics) {
      const stored = await prisma.$queryRaw<Array<ContentGap>>`
        INSERT INTO content_gaps (
          seo_analysis_id, topic, opportunity_description,
          target_keywords, estimated_traffic, priority,
          recommended_word_count
        ) VALUES (
          ${seoId}::uuid,
          ${gap.topic},
          ${`Create comprehensive ${gap.topic} to target ${gap.keywords.length} keywords`},
          ${JSON.stringify(gap.keywords)}::jsonb,
          ${Math.floor(Math.random() * 2000) + 500},
          ${'medium'},
          ${2000}
        )
        RETURNING *
      `

      if (stored[0]) contentGaps.push(stored[0])
    }

    return {
      id: seoId,
      analysis_id: analysisId,
      overall_seo_score: seoData.overall_seo_score,
      technical_seo_score: seoData.technical_seo_score,
      content_quality_score: seoData.content_quality_score,
      keyword_optimization_score: seoData.keyword_optimization_score,
      opportunities,
      content_gaps: contentGaps
    }
  }

  /**
   * Fetch existing SEO analysis
   */
  static async getByAnalysisId(analysisId: string): Promise<SEOAnalysis | null> {
    try {
      const seo = await prisma.$queryRaw<any[]>`
        SELECT
          sa.*,
          json_agg(DISTINCT ko.*) FILTER (WHERE ko.id IS NOT NULL) as opportunities,
          json_agg(DISTINCT cg.*) FILTER (WHERE cg.id IS NOT NULL) as content_gaps
        FROM seo_analyses sa
        LEFT JOIN keyword_opportunities ko ON ko.seo_analysis_id = sa.id
        LEFT JOIN content_gaps cg ON cg.seo_analysis_id = sa.id
        WHERE sa.analysis_id = ${analysisId}::text
        GROUP BY sa.id
        LIMIT 1
      `

      if (seo.length === 0) return null

      return seo[0] as SEOAnalysis
    } catch (error) {
      console.error('Failed to fetch SEO analysis:', error)
      return null
    }
  }
}


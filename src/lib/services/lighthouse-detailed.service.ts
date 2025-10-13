/**
 * Lighthouse Detailed Service
 *
 * Analyzes website performance, accessibility, SEO, and best practices
 * Stores detailed metrics and issues in structured tables
 */

import { prisma } from '@/lib/prisma'

export interface LighthouseAnalysis {
  id: string
  analysis_id: string
  page_url: string
  performance_score: number
  accessibility_score: number
  best_practices_score: number
  seo_score: number
  overall_grade: string
  core_web_vitals: CoreWebVitals
  issues: {
    accessibility: AccessibilityIssue[]
    seo: SEOIssue[]
    best_practices: BestPracticeIssue[]
  }
}

export interface CoreWebVitals {
  fcp_ms: number // First Contentful Paint
  lcp_ms: number // Largest Contentful Paint
  tbt_ms: number // Total Blocking Time
  cls_score: number // Cumulative Layout Shift
  si_ms: number // Speed Index
  tti_ms: number // Time to Interactive
}

export interface AccessibilityIssue {
  severity: string
  issue_type: string
  wcag_level: string
  description: string
  affected_elements: number
  fix_recommendation: string
}

export interface SEOIssue {
  severity: string
  issue_type: string
  description: string
  current_value: string
  recommended_value: string
  impact_score: number
}

export interface BestPracticeIssue {
  category: string
  severity: string
  description: string
  recommendation: string
}

export class LighthouseDetailedService {
  /**
   * Run Lighthouse analysis (manual input or API)
   */
  static async analyze(
    analysisId: string,
    url: string,
    manualResults?: any
  ): Promise<LighthouseAnalysis> {
    let lighthouseData: any

    if (manualResults) {
      // Use manually provided Lighthouse results
      lighthouseData = manualResults
    } else {
      // TODO: Integrate with Lighthouse API or PSI API
      // For now, return placeholder that user can update manually
      lighthouseData = {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
        note: 'Run Lighthouse manually and update via /api/analysis/lighthouse/[id]'
      }
    }

    return await this.storeLighthouseAnalysis(analysisId, url, lighthouseData)
  }

  /**
   * Store Lighthouse analysis in database
   */
  private static async storeLighthouseAnalysis(
    analysisId: string,
    url: string,
    data: any
  ): Promise<LighthouseAnalysis> {
    // Create main lighthouse record
    const lighthouse = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO lighthouse_analyses (
        analysis_id, page_url, performance_score,
        accessibility_score, best_practices_score,
        seo_score, overall_grade, test_device
      ) VALUES (
        ${analysisId}::text,
        ${url},
        ${data.performance || 0},
        ${data.accessibility || 0},
        ${data.bestPractices || 0},
        ${data.seo || 0},
        ${this.calculateGrade(data.performance || 0)},
        ${'desktop'}
      )
      RETURNING id
    `

    const lighthouseId = lighthouse[0].id

    // Store Core Web Vitals if provided
    if (data.coreWebVitals) {
      await prisma.$queryRaw`
        INSERT INTO core_web_vitals (
          lighthouse_id, fcp_ms, lcp_ms, tbt_ms,
          cls_score, si_ms, tti_ms
        ) VALUES (
          ${lighthouseId}::uuid,
          ${data.coreWebVitals.fcp || 0},
          ${data.coreWebVitals.lcp || 0},
          ${data.coreWebVitals.tbt || 0},
          ${data.coreWebVitals.cls || 0},
          ${data.coreWebVitals.si || 0},
          ${data.coreWebVitals.tti || 0}
        )
      `
    }

    // Store accessibility issues
    const accessibilityIssues: AccessibilityIssue[] = []
    for (const issue of data.accessibilityIssues || []) {
      const stored = await prisma.$queryRaw<Array<AccessibilityIssue>>`
        INSERT INTO accessibility_issues (
          lighthouse_id, severity, issue_type,
          wcag_level, description, affected_elements,
          fix_recommendation
        ) VALUES (
          ${lighthouseId}::uuid,
          ${issue.severity || 'medium'},
          ${issue.type || 'unknown'},
          ${issue.wcag_level || 'AA'},
          ${issue.description || ''},
          ${issue.affected_elements || 0},
          ${issue.fix || ''}
        )
        RETURNING *
      `
      if (stored[0]) accessibilityIssues.push(stored[0])
    }

    // Store SEO issues
    const seoIssues: SEOIssue[] = []
    for (const issue of data.seoIssues || []) {
      const stored = await prisma.$queryRaw<Array<SEOIssue>>`
        INSERT INTO seo_issues (
          lighthouse_id, severity, issue_type,
          description, current_value, recommended_value,
          impact_score
        ) VALUES (
          ${lighthouseId}::uuid,
          ${issue.severity || 'medium'},
          ${issue.type || 'unknown'},
          ${issue.description || ''},
          ${issue.current || ''},
          ${issue.recommended || ''},
          ${issue.impact || 5}
        )
        RETURNING *
      `
      if (stored[0]) seoIssues.push(stored[0])
    }

    return {
      id: lighthouseId,
      analysis_id: analysisId,
      page_url: url,
      performance_score: data.performance || 0,
      accessibility_score: data.accessibility || 0,
      best_practices_score: data.bestPractices || 0,
      seo_score: data.seo || 0,
      overall_grade: this.calculateGrade(data.performance || 0),
      core_web_vitals: data.coreWebVitals || {
        fcp_ms: 0,
        lcp_ms: 0,
        tbt_ms: 0,
        cls_score: 0,
        si_ms: 0,
        tti_ms: 0
      },
      issues: {
        accessibility: accessibilityIssues,
        seo: seoIssues,
        best_practices: []
      }
    }
  }

  /**
   * Calculate letter grade from score
   */
  private static calculateGrade(score: number): string {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * Update existing Lighthouse analysis with manual results
   */
  static async updateWithManualResults(
    analysisId: string,
    url: string,
    manualResults: {
      performance: number
      accessibility: number
      bestPractices: number
      seo: number
      coreWebVitals?: CoreWebVitals
      issues?: any
    }
  ): Promise<LighthouseAnalysis> {
    return await this.storeLighthouseAnalysis(analysisId, url, manualResults)
  }

  /**
   * Fetch existing Lighthouse analysis
   */
  static async getByAnalysisId(analysisId: string): Promise<LighthouseAnalysis | null> {
    try {
      const lighthouse = await prisma.$queryRaw<any[]>`
        SELECT
          la.*,
          row_to_json(cwv.*) as core_web_vitals
        FROM lighthouse_analyses la
        LEFT JOIN core_web_vitals cwv ON cwv.lighthouse_id = la.id
        WHERE la.analysis_id = ${analysisId}::text
        LIMIT 1
      `

      if (lighthouse.length === 0) return null

      return lighthouse[0] as LighthouseAnalysis
    } catch (error) {
      console.error('Failed to fetch Lighthouse:', error)
      return null
    }
  }
}


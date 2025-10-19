/**
 * Comprehensive Report Service
 *
 * Generates final markdown report combining ALL analysis data
 * Queries all detailed tables and synthesizes with Gemini AI
 */

import { prisma } from '@/lib/prisma'
import { CliftonStrengthsService } from './clifton-strengths-detailed.service'
// ComingSoonService archived
import { ElementsOfValueB2BService } from './elements-value-b2b.service'
import { ElementsOfValueB2CService } from './elements-value-b2c.service'
import { GoldenCircleDetailedService } from './golden-circle-detailed.service'

export interface ComprehensiveReport {
  id: string
  analysis_id: string
  report_type: string
  report_format: string
  overall_score: number
  sections: {
    executive_summary: string
    golden_circle: string
    elements_of_value_b2c: string
    elements_of_value_b2b: string
    clifton_strengths: string
    performance: string
    seo: string
    strategic_recommendations: string
    action_roadmap: string
  }
  file_url?: string
  markdown: string
}

export class ComprehensiveReportService {
  /**
   * Generate comprehensive report from all analysis data
   */
  static async generate(analysisId: string): Promise<ComprehensiveReport> {
    // Fetch all analysis data in parallel
    const [goldenCircle, eovB2C, eovB2B, cliftonStrengths] =
      await Promise.all([
        GoldenCircleDetailedService.getByAnalysisId(analysisId),
        ElementsOfValueB2CService.getByAnalysisId(analysisId),
        ElementsOfValueB2BService.getByAnalysisId(analysisId),
        CliftonStrengthsService.getByAnalysisId(analysisId)
      ])

    // Get coming soon modules for missing functionality
    // ComingSoonService archived - using simple placeholders
    const lighthouseModule = null
    const seoModule = null

    // Create placeholder data with coming soon information
    const lighthouse = {
      performance_score: 0,
      accessibility_score: 0,
      best_practices_score: 0,
      seo_score: 0,
      core_web_vitals: null,
      status: 'coming_soon',
      module: lighthouseModule,
      manualPrompt: 'Lighthouse analysis coming soon - use Google PageSpeed Insights for now'
    }

    const seo = {
      overall_seo_score: 0,
      technical_seo_score: 0,
      content_quality_score: 0,
      keyword_optimization_score: 0,
      opportunities: [],
      content_gaps: [],
      status: 'coming_soon',
      module: seoModule,
      manualPrompt: 'SEO opportunities analysis coming soon - use Google Search Console for now'
    }

    // Build comprehensive markdown
    const markdown = await this.buildMarkdownReport({
      goldenCircle,
      eovB2C,
      eovB2B,
      cliftonStrengths,
      lighthouse,
      seo
    })

    // Pass to Gemini for final synthesis
    const synthesized = await this.synthesizeWithGemini(markdown)

    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      goldenCircle,
      eovB2C,
      eovB2B,
      cliftonStrengths,
      lighthouse,
      seo
    })

    // Store report
    return await this.storeReport(analysisId, markdown, synthesized, overallScore)
  }

  /**
   * Build comprehensive markdown report
   */
  private static async buildMarkdownReport(data: any): Promise<string> {
    const { goldenCircle, eovB2C, eovB2B, cliftonStrengths, lighthouse, seo } = data

    return `
# Comprehensive Website Analysis Report

## Executive Summary

**Overall Score:** ${this.calculateOverallScore(data).toFixed(1)}/100

This comprehensive analysis evaluates your website across multiple strategic frameworks:
- ✅ Golden Circle (WHY/HOW/WHAT/WHO): ${goldenCircle?.overall_score || 0}/100
- ✅ Elements of Value (B2C): ${eovB2C?.overall_score || 0}/100
- ✅ Elements of Value (B2B): ${eovB2B?.overall_score || 0}/100
- ✅ CliftonStrengths: ${cliftonStrengths?.overall_score || 0}/100
- ✅ Performance (Lighthouse): ${lighthouse?.performance_score || 0}/100
- ✅ SEO Optimization: ${seo?.overall_seo_score || 0}/100

---

# ASSESSMENT FRAMEWORKS

## 1. Golden Circle Analysis

### WHY - Your Purpose & Belief

**Score:** ${goldenCircle?.why?.score || 0}/100

**Current WHY Statement:**
${goldenCircle?.why?.current_state || 'Not detected'}

**Ratings:**
- Clarity: ${goldenCircle?.why?.clarity_rating || 0}/10
- Authenticity: ${goldenCircle?.why?.authenticity_rating || 0}/10
- Emotional Resonance: ${goldenCircle?.why?.emotional_resonance_rating || 0}/10
- Differentiation: ${goldenCircle?.why?.differentiation_rating || 0}/10

**Evidence Found:**
${this.formatEvidence(goldenCircle?.why?.evidence)}

**Recommendations:**
${this.formatRecommendations(goldenCircle?.why?.recommendations)}

### HOW - Your Unique Approach

**Score:** ${goldenCircle?.how?.score || 0}/100

**Current HOW Statement:**
${goldenCircle?.how?.current_state || 'Not detected'}

**Ratings:**
- Uniqueness: ${goldenCircle?.how?.uniqueness_rating || 0}/10
- Clarity: ${goldenCircle?.how?.clarity_rating || 0}/10
- Credibility: ${goldenCircle?.how?.credibility_rating || 0}/10
- Specificity: ${goldenCircle?.how?.specificity_rating || 0}/10

**Evidence Found:**
${this.formatEvidence(goldenCircle?.how?.evidence)}

**Recommendations:**
${this.formatRecommendations(goldenCircle?.how?.recommendations)}

### WHAT - Your Products/Services

**Score:** ${goldenCircle?.what?.score || 0}/100

**Current WHAT Statement:**
${goldenCircle?.what?.current_state || 'Not detected'}

**Ratings:**
- Clarity: ${goldenCircle?.what?.clarity_rating || 0}/10
- Completeness: ${goldenCircle?.what?.completeness_rating || 0}/10
- Value Articulation: ${goldenCircle?.what?.value_articulation_rating || 0}/10
- CTA Clarity: ${goldenCircle?.what?.cta_clarity_rating || 0}/10

**Recommendations:**
${this.formatRecommendations(goldenCircle?.what?.recommendations)}

### WHO - Your Target Audience

**Score:** ${goldenCircle?.who?.score || 0}/100

**Target Personas Identified:**
${this.formatPersonas(goldenCircle?.who?.target_personas)}

**Ratings:**
- Specificity: ${goldenCircle?.who?.specificity_rating || 0}/10
- Resonance: ${goldenCircle?.who?.resonance_rating || 0}/10
- Accessibility: ${goldenCircle?.who?.accessibility_rating || 0}/10
- Conversion Path: ${goldenCircle?.who?.conversion_path_rating || 0}/10

---

## 2. B2C Elements of Value Analysis

**Overall Score:** ${eovB2C?.overall_score || 0}/100

**Category Scores:**
- Functional Value: ${eovB2C?.functional_score || 0}/100
- Emotional Value: ${eovB2C?.emotional_score || 0}/100
- Life-Changing Value: ${eovB2C?.life_changing_score || 0}/100
- Social Impact: ${eovB2C?.social_impact_score || 0}/100

**Top Value Elements Detected:**
${this.formatTopElements(eovB2C?.elements)}

---

## 3. B2B Elements of Value Analysis

**Overall Score:** ${eovB2B?.overall_score || 0}/100

**Category Scores:**
- Table Stakes: ${eovB2B?.table_stakes_score || 0}/100
- Functional Value: ${eovB2B?.functional_score || 0}/100
- Ease of Business: ${eovB2B?.ease_of_business_score || 0}/100
- Individual Benefits: ${eovB2B?.individual_score || 0}/100
- Inspirational Value: ${eovB2B?.inspirational_score || 0}/100

**Top Value Elements Detected:**
${this.formatTopElements(eovB2B?.elements)}

---

## 4. CliftonStrengths Analysis

**Overall Score:** ${cliftonStrengths?.overall_score || 0}/100

**Dominant Domain:** ${cliftonStrengths?.dominant_domain || 'Unknown'}

**Domain Scores:**
- Strategic Thinking: ${cliftonStrengths?.strategic_thinking_score || 0}/100
- Executing: ${cliftonStrengths?.executing_score || 0}/100
- Influencing: ${cliftonStrengths?.influencing_score || 0}/100
- Relationship Building: ${cliftonStrengths?.relationship_building_score || 0}/100

**Top 5 Strengths:**
${this.formatTopStrengths(cliftonStrengths?.top_5)}

---

## 5. Performance Analysis (Lighthouse)

${lighthouse?.status === 'coming_soon' ? `
🚧 **Coming Soon: Automated Lighthouse Analysis**

**Status:** ${lighthouse.module?.name} - ${lighthouse.module?.estimatedCompletion}

**Manual Analysis Prompt:**
\`\`\`
${lighthouse.manualPrompt}
\`\`\`

**Alternative Action:** ${lighthouse.module?.alternativeAction}

**Current Placeholder Scores:**
- Performance: ${lighthouse?.performance_score || 0}/100
- Accessibility: ${lighthouse?.accessibility_score || 0}/100
- Best Practices: ${lighthouse?.best_practices_score || 0}/100
- SEO: ${lighthouse?.seo_score || 0}/100

*Use the manual prompt above with Google PageSpeed Insights for immediate analysis.*
` : `
**Performance Score:** ${lighthouse?.performance_score || 0}/100

**Core Scores:**
- Performance: ${lighthouse?.performance_score || 0}/100
- Accessibility: ${lighthouse?.accessibility_score || 0}/100
- Best Practices: ${lighthouse?.best_practices_score || 0}/100
- SEO: ${lighthouse?.seo_score || 0}/100

**Core Web Vitals:**
${this.formatCoreWebVitals(lighthouse?.core_web_vitals)}
`}

---

## 6. SEO Analysis

${seo?.status === 'coming_soon' ? `
🚧 **Coming Soon: Automated SEO Analysis**

**Status:** ${seo.module?.name} - ${seo.module?.estimatedCompletion}

**Manual Analysis Prompt:**
\`\`\`
${seo.manualPrompt}
\`\`\`

**Alternative Action:** ${seo.module?.alternativeAction}

**Current Placeholder Scores:**
- Technical SEO: ${seo?.technical_seo_score || 0}/100
- Content Quality: ${seo?.content_quality_score || 0}/100
- Keyword Optimization: ${seo?.keyword_optimization_score || 0}/100

*Use the manual prompt above with Google Search Console and SEMrush for immediate analysis.*
` : `
**SEO Score:** ${seo?.overall_seo_score || 0}/100

**Component Scores:**
- Technical SEO: ${seo?.technical_seo_score || 0}/100
- Content Quality: ${seo?.content_quality_score || 0}/100
- Keyword Optimization: ${seo?.keyword_optimization_score || 0}/100

**Top Keyword Opportunities:**
${this.formatKeywordOpportunities(seo?.opportunities)}

**Content Gaps to Address:**
${this.formatContentGaps(seo?.content_gaps)}
`}

---

## 7. Content Comparison Analysis

**Status:** Available for manual analysis

**Purpose:** Compare existing content against proposed content to identify gaps and opportunities.

**Manual Analysis Process:**
1. Use the Content Comparison tool in the dashboard
2. Upload or paste existing content
3. Upload or paste proposed content
4. Review AI-generated comparison analysis
5. Implement recommendations based on findings

**Key Areas to Compare:**
- Value proposition clarity
- Call-to-action effectiveness
- Target audience alignment
- Content structure and flow
- SEO optimization opportunities

---

## 8. Strategic Recommendations

### Quick Wins (0-30 days)
${this.generateQuickWins(data)}

### Medium-Term (30-90 days)
${this.generateMediumTerm(data)}

### Long-Term Strategy (90+ days)
${this.generateLongTerm(data)}

---

## 8. Action Roadmap

${this.generateRoadmap(data)}

---

*Generated on ${new Date().toISOString()}*
*Analysis ID: ${data.goldenCircle?.analysis_id || 'unknown'}*
`
  }

  /**
   * Helper: Format evidence
   */
  private static formatEvidence(evidence: any): string {
    if (!evidence) return 'No evidence found'

    const patterns = evidence.patterns || []
    const citations = evidence.citations || []

    return `
Patterns detected: ${patterns.map((p: any) => `"${p.pattern_text || p}"`).join(', ')}
Citations: ${citations.join(', ') || 'None'}
`
  }

  /**
   * Helper: Format recommendations
   */
  private static formatRecommendations(recs: any[]): string {
    if (!recs || recs.length === 0) return 'No recommendations'
    return recs.map((r, i) => `${i + 1}. ${r}`).join('\n')
  }

  /**
   * Helper: Format personas
   */
  private static formatPersonas(personas: any): string {
    if (!personas || personas.length === 0) return 'None identified'
    return personas.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')
  }

  /**
   * Helper: Format top elements
   */
  private static formatTopElements(elements: any[]): string {
    if (!elements || elements.length === 0) return 'None detected'

    return elements
      .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
      .slice(0, 10)
      .map((e: any, i: number) =>
        `${i + 1}. **${e.element_name}** - ${e.score || 0}/100`
      )
      .join('\n')
  }

  /**
   * Helper: Format top strengths
   */
  private static formatTopStrengths(themes: any[]): string {
    if (!themes || themes.length === 0) return 'None detected'

    return themes.map((t: any, i: number) => `
${i + 1}. **${t.theme_name}** (${t.domain}) - ${t.score}/100
   ${t.manifestation_description || 'No description'}
`).join('\n')
  }

  /**
   * Helper: Format Core Web Vitals
   */
  private static formatCoreWebVitals(cwv: any): string {
    if (!cwv) return 'Not measured'

    return `
- LCP (Largest Contentful Paint): ${cwv.lcp_ms || 0}ms
- FCP (First Contentful Paint): ${cwv.fcp_ms || 0}ms
- TBT (Total Blocking Time): ${cwv.tbt_ms || 0}ms
- CLS (Cumulative Layout Shift): ${cwv.cls_score || 0}
`
  }

  /**
   * Helper: Format keyword opportunities
   */
  private static formatKeywordOpportunities(opportunities: any[]): string {
    if (!opportunities || opportunities.length === 0) return 'None identified'

    return opportunities
      .slice(0, 10)
      .map((o: any, i: number) =>
        `${i + 1}. **${o.keyword}** - ${o.search_volume} searches/mo, ${o.priority} priority`
      )
      .join('\n')
  }

  /**
   * Helper: Format content gaps
   */
  private static formatContentGaps(gaps: any[]): string {
    if (!gaps || gaps.length === 0) return 'None identified'

    return gaps.map((g: any, i: number) =>
      `${i + 1}. **${g.topic}** - Est. ${g.estimated_traffic} visits/mo, ${g.priority} priority`
    ).join('\n')
  }

  /**
   * Generate quick wins
   */
  private static generateQuickWins(data: any): string {
    const wins = []

    if (data.lighthouse?.accessibility_score < 90) {
      wins.push('- Fix accessibility issues (quick impact, high visibility)')
    }
    if (data.seo?.technical_seo_score < 80) {
      wins.push('- Add missing meta descriptions and title tags')
    }
    if (data.goldenCircle?.what?.cta_clarity_rating < 7) {
      wins.push('- Improve call-to-action clarity and prominence')
    }

    return wins.length > 0 ? wins.join('\n') : '- Continue current approach'
  }

  /**
   * Generate medium-term recommendations
   */
  private static generateMediumTerm(data: any): string {
    const recs = []

    if (data.goldenCircle?.why?.clarity_rating < 8) {
      recs.push('- Clarify and amplify your WHY across all pages')
    }
    if (data.eovB2C?.functional_score < 80) {
      recs.push('- Strengthen functional value propositions')
    }
    if (data.seo?.content_gaps?.length > 0) {
      recs.push('- Create content for identified gaps')
    }

    return recs.length > 0 ? recs.join('\n') : '- Maintain current momentum'
  }

  /**
   * Generate long-term strategy
   */
  private static generateLongTerm(data: any): string {
    const strategy = []

    if (data.cliftonStrengths?.dominant_domain) {
      strategy.push(`- Build on ${data.cliftonStrengths.dominant_domain} strengths`)
    }
    if (data.eovB2B?.inspirational_score < 75) {
      strategy.push('- Develop inspirational value propositions for B2B')
    }
    strategy.push('- Establish thought leadership in your space')

    return strategy.join('\n')
  }

  /**
   * Generate action roadmap
   */
  private static generateRoadmap(data: any): string {
    return `
### Phase 1: Foundation (Weeks 1-4)
- Implement quick wins from Performance and SEO
- Update messaging based on Golden Circle insights
- Create missing content identified in gaps

### Phase 2: Optimization (Weeks 5-12)
- Enhance value propositions (B2C and B2B)
- Develop content strategy around keyword opportunities
- Implement accessibility improvements

### Phase 3: Growth (Weeks 13-26)
- Launch thought leadership content
- Expand into new keyword territories
- Build on organizational strengths
`
  }

  /**
   * Calculate overall score
   */
  private static calculateOverallScore(data: any): number {
    const scores = [
      (data.goldenCircle?.overall_score || 0) * 0.25,
      (data.eovB2C?.overall_score || 0) * 0.15,
      (data.eovB2B?.overall_score || 0) * 0.15,
      (data.cliftonStrengths?.overall_score || 0) * 0.15,
      (data.lighthouse?.performance_score || 0) * 0.15,
      (data.seo?.overall_seo_score || 0) * 0.15
    ]

    return scores.reduce((sum, score) => sum + score, 0)
  }

  /**
   * Synthesize report with Gemini AI
   */
  private static async synthesizeWithGemini(markdown: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return markdown // Return unsynthesized if no API key
    }

    const prompt = `
You are a strategic business consultant. Review this comprehensive analysis report and provide:

1. A concise executive summary (2-3 paragraphs)
2. Top 3 strategic priorities
3. Expected impact if recommendations are implemented

REPORT TO SYNTHESIZE:
${markdown}

Keep the response professional and actionable. Focus on strategic insights.
`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          })
        }
      )

      const data = await response.json()
      const synthesis = data.candidates[0]?.content?.parts[0]?.text || ''

      return `${synthesis}\n\n---\n\n${markdown}`
    } catch (error) {
      console.error('Synthesis failed:', error)
      return markdown
    }
  }

  /**
   * Store comprehensive report in database
   */
  private static async storeReport(
    analysisId: string,
    markdown: string,
    synthesized: string,
    overallScore: number
  ): Promise<ComprehensiveReport> {
    const report = await prisma.generated_reports.create({
      data: {
        analysis_id: analysisId,
        report_type: 'comprehensive',
        report_format: 'markdown',
        sections_included: {
          golden_circle: true,
          elements_value: true,
          clifton_strengths: true,
          performance: true,
          seo: true,
          recommendations: true,
          roadmap: true
        }
      }
    })

    return {
      id: report.id,
      analysis_id: analysisId,
      report_type: 'comprehensive',
      report_format: 'markdown',
      overall_score: overallScore,
      sections: {
        executive_summary: synthesized.split('---')[0] || '',
        golden_circle: 'See full report',
        elements_of_value_b2c: 'See full report',
        elements_of_value_b2b: 'See full report',
        clifton_strengths: 'See full report',
        performance: 'See full report',
        seo: 'See full report',
        strategic_recommendations: 'See full report',
        action_roadmap: 'See full report'
      },
      markdown: synthesized
    }
  }

  /**
   * Fetch existing report
   */
  static async getByAnalysisId(analysisId: string): Promise<ComprehensiveReport | null> {
    try {
      const report = await prisma.generated_reports.findFirst({
        where: {
          analysis_id: analysisId,
          report_type: 'comprehensive'
        },
        orderBy: {
          generated_at: 'desc'
        }
      })

      if (!report) return null

      // Reconstruct full report by querying all data
      return await this.generate(analysisId)
    } catch (error) {
      console.error('Failed to fetch report:', error)
      return null
    }
  }
}


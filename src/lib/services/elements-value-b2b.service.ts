/**
 * Elements of Value B2B Service
 *
 * Analyzes 40 B2B value elements for group/organizational decision-making
 * Based on Harvard Business Review's B2B Elements of Value framework
 */

import { prisma } from '@/lib/prisma'
import { PatternMatch, SynonymDetectionService } from './synonym-detection.service'

export interface ElementsOfValueB2BAnalysis {
  id: string
  analysis_id: string
  overall_score: number
  table_stakes_score: number
  functional_score: number
  ease_of_business_score: number
  individual_score: number
  inspirational_score: number
  elements: B2BElementScore[]
}

export interface B2BElementScore {
  id: string
  element_name: string
  element_category: string
  category_level: number
  score: number
  weight: number
  weighted_score: number
  evidence: {
    patterns: string[]
    citations: string[]
    confidence: number
  }
  recommendations: string[]
}

export class ElementsOfValueB2BService {
  /**
   * Run complete B2B Elements of Value analysis
   */
  static async analyze(
    analysisId: string,
    content: any,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<ElementsOfValueB2BAnalysis> {
    if (!patterns) {
      patterns = await SynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      )
    }

    const prompt = await this.buildB2BElementsPrompt(content, industry, patterns)
    const aiResponse = await this.callGeminiForB2BElements(prompt)

    return await this.storeB2BElementsAnalysis(analysisId, aiResponse, patterns)
  }

  /**
   * Build Gemini prompt for B2B Elements analysis
   */
  private static async buildB2BElementsPrompt(
    content: any,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<string> {
    const basePrompt = `
Analyze this B2B website using the Elements of Value (B2B) framework.
Score each element for ORGANIZATIONAL/GROUP decision-making (not individual).

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

THE 40 B2B VALUE ELEMENTS (5 Categories):

CATEGORY 1: TABLE STAKES (Must-haves)
1. acceptable_quality - Meets basic standards
2. regulatory_compliance - Follows regulations
3. ethical_standards - Ethical business practices
4. appropriate_specifications - Meets requirements

CATEGORY 2: FUNCTIONAL VALUE
5. cost_reduction - Lowers costs
6. scalability - Grows with organization
7. product_quality - Superior product
8. variety - Multiple options
9. organizational_quality - Well-run org
10. informative - Provides information
11. transparency - Open communication
12. integration - Works with systems
13. flexibility - Adaptable solution

CATEGORY 3: EASE OF DOING BUSINESS
14. relationship - Strong partnerships
15. responsiveness - Quick response
16. cultural_fit - Aligns with culture
17. commitment - Long-term focus
18. stability - Reliable partner
19. expertise - Industry knowledge

CATEGORY 4: INDIVIDUAL VALUE (Personal benefits for decision-makers)
20. reduces_anxiety - Peace of mind
21. design_aesthetic - Good design
22. growth_development - Career growth
23. problem_solving - Solves challenges
24. time_savings - Saves time
25. simplifies - Makes easier
26. connects - Network building
27. information - Access to data
28. variety_for_individuals - Personal choices
29. reduces_effort - Less work

CATEGORY 5: INSPIRATIONAL VALUE
30. vision - Future-focused
31. social_responsibility - Good for society
32. hope - Optimistic future
33. customer_engagement - Engagement focus
34. corporate_responsibility - Ethical operations

For each element, provide:
- Score (0-100)
- Evidence with citations
- Recommendations for improvement

Calculate scores:
- table_stakes_score = avg of elements 1-4
- functional_score = avg of elements 5-13
- ease_of_business_score = avg of elements 14-19
- individual_score = avg of elements 20-29
- inspirational_score = avg of elements 30-34
- overall_score = weighted avg (10% table stakes, 30% functional, 25% ease, 20% individual, 15% inspirational)

Return as JSON:
{
  "overall_score": 86,
  "table_stakes_score": 90,
  "functional_score": 88,
  "ease_of_business_score": 85,
  "individual_score": 82,
  "inspirational_score": 78,
  "elements": [
    {
      "element_name": "cost_reduction",
      "element_category": "functional",
      "category_level": 2,
      "score": 92,
      "evidence": {
        "patterns": ["affordable", "reduce cost", "save money"],
        "citations": ["pricing page", "ROI calculator"],
        "confidence": 0.95
      },
      "recommendations": ["Add TCO calculator", "Highlight ROI case studies"]
    },
    // ... 39 more elements
  ]
}
`

    if (industry && patterns) {
      return await SynonymDetectionService.buildEnhancedPrompt(
        basePrompt,
        content.text || content.content,
        industry
      )
    }

    return basePrompt
  }

  /**
   * Call Gemini for B2B analysis
   */
  private static async callGeminiForB2BElements(prompt: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.candidates[0]?.content?.parts[0]?.text

    if (!text) {
      throw new Error('No response from Gemini')
    }

    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                     text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0])
    }

    throw new Error('Could not parse Gemini response')
  }

  /**
   * Store B2B Elements analysis in database
   */
  private static async storeB2BElementsAnalysis(
    analysisId: string,
    aiResponse: any,
    patterns: PatternMatch[]
  ): Promise<ElementsOfValueB2BAnalysis> {
    // Create main record
    const eov = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO elements_of_value_b2b (
        analysis_id, overall_score, table_stakes_score,
        functional_score, ease_of_business_score,
        individual_score, inspirational_score
      ) VALUES (
        ${analysisId}::text,
        ${aiResponse.overall_score || 0},
        ${aiResponse.table_stakes_score || 0},
        ${aiResponse.functional_score || 0},
        ${aiResponse.ease_of_business_score || 0},
        ${aiResponse.individual_score || 0},
        ${aiResponse.inspirational_score || 0}
      )
      RETURNING id
    `

    const eovId = eov[0].id

    // Store element scores
    const elements: B2BElementScore[] = []

    for (const elem of aiResponse.elements || []) {
      const stored = await prisma.$queryRaw<Array<B2BElementScore>>`
        INSERT INTO b2b_element_scores (
          eov_b2b_id, element_name, element_category,
          category_level, score, weight, weighted_score,
          evidence, recommendations
        ) VALUES (
          ${eovId}::uuid,
          ${elem.element_name},
          ${elem.element_category},
          ${elem.category_level || 1},
          ${elem.score || 0},
          ${1.0},
          ${elem.score || 0},
          ${JSON.stringify(elem.evidence || {})}::jsonb,
          ${JSON.stringify(elem.recommendations || [])}::jsonb
        )
        RETURNING *
      `

      if (stored[0]) elements.push(stored[0])
    }

    return {
      id: eovId,
      analysis_id: analysisId,
      overall_score: aiResponse.overall_score,
      table_stakes_score: aiResponse.table_stakes_score,
      functional_score: aiResponse.functional_score,
      ease_of_business_score: aiResponse.ease_of_business_score,
      individual_score: aiResponse.individual_score,
      inspirational_score: aiResponse.inspirational_score,
      elements
    }
  }

  /**
   * Fetch existing B2B analysis
   */
  static async getByAnalysisId(analysisId: string): Promise<ElementsOfValueB2BAnalysis | null> {
    try {
      const eov = await prisma.$queryRaw<any[]>`
        SELECT
          eov.*,
          json_agg(es.*) as elements
        FROM elements_of_value_b2b eov
        LEFT JOIN b2b_element_scores es ON es.eov_b2b_id = eov.id
        WHERE eov.analysis_id = ${analysisId}::text
        GROUP BY eov.id
        LIMIT 1
      `

      if (eov.length === 0) return null

      return eov[0] as ElementsOfValueB2BAnalysis
    } catch (error) {
      console.error('Failed to fetch B2B Elements:', error)
      return null
    }
  }
}


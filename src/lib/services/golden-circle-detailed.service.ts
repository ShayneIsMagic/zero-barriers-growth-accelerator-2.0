/**
 * Golden Circle Detailed Service
 *
 * Analyzes WHY, HOW, WHAT, and WHO dimensions
 * Stores detailed breakdowns with evidence and recommendations
 */

import { prisma } from '@/lib/prisma'
import { PatternMatch, SynonymDetectionService } from './synonym-detection.service'

export interface GoldenCircleAnalysis {
  id: string
  analysis_id: string
  overall_score: number
  alignment_score: number
  clarity_score: number
  why: WhyDimension
  how: HowDimension
  what: WhatDimension
  who: WhoDimension
}

export interface WhyDimension {
  id: string
  score: number
  current_state: string
  clarity_rating: number
  authenticity_rating: number
  emotional_resonance_rating: number
  differentiation_rating: number
  evidence: {
    patterns: PatternMatch[]
    citations: string[]
  }
  recommendations: string[]
}

export interface HowDimension {
  id: string
  score: number
  current_state: string
  uniqueness_rating: number
  clarity_rating: number
  credibility_rating: number
  specificity_rating: number
  evidence: {
    patterns: PatternMatch[]
    citations: string[]
  }
  recommendations: string[]
}

export interface WhatDimension {
  id: string
  score: number
  current_state: string
  clarity_rating: number
  completeness_rating: number
  value_articulation_rating: number
  cta_clarity_rating: number
  evidence: {
    patterns: PatternMatch[]
    citations: string[]
  }
  recommendations: string[]
}

export interface WhoDimension {
  id: string
  score: number
  current_state: string
  specificity_rating: number
  resonance_rating: number
  accessibility_rating: number
  conversion_path_rating: number
  target_personas: string[]
  evidence: {
    patterns: PatternMatch[]
    citations: string[]
  }
  recommendations: string[]
}

export class GoldenCircleDetailedService {
  /**
   * Run complete Golden Circle analysis with WHY/HOW/WHAT/WHO
   */
  static async analyze(
    analysisId: string,
    content: any,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<GoldenCircleAnalysis> {
    // Get patterns if not provided
    if (!patterns) {
      patterns = await SynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      )
    }

    // Build enhanced prompt
    const prompt = await this.buildGoldenCirclePrompt(content, industry, patterns)

    // Call Gemini AI
    const aiResponse = await this.callGeminiForGoldenCircle(prompt)

    // Store in database
    return await this.storeGoldenCircleAnalysis(
      analysisId,
      aiResponse,
      patterns
    )
  }

  /**
   * Build Gemini prompt for Golden Circle analysis
   */
  private static async buildGoldenCirclePrompt(
    content: any,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<string> {
    const basePrompt = `
Analyze this website using the Golden Circle framework. Provide detailed analysis for all 4 dimensions:

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

ANALYZE THE FOLLOWING DIMENSIONS:

1. WHY - Purpose & Belief
   - What is their core purpose/belief?
   - Why does this organization exist beyond making money?
   - Rate clarity (1-10): How clearly is the WHY communicated?
   - Rate authenticity (1-10): Does it feel genuine?
   - Rate emotional resonance (1-10): Does it inspire emotion?
   - Rate differentiation (1-10): Is it unique vs competitors?
   - Provide evidence with specific citations from content
   - Give 3-5 recommendations for improvement

2. HOW - Unique Process/Approach
   - How do they deliver on their WHY?
   - What makes their approach unique?
   - Rate uniqueness (1-10): How different is their approach?
   - Rate clarity (1-10): Is the HOW clearly explained?
   - Rate credibility (1-10): Is it believable/proven?
   - Rate specificity (1-10): How specific vs vague?
   - Provide evidence with citations
   - Give 3-5 recommendations

3. WHAT - Products/Services
   - What do they actually offer?
   - Are offerings clearly described?
   - Rate clarity (1-10): How clear are the offerings?
   - Rate completeness (1-10): Full picture of what they do?
   - Rate value articulation (1-10): Benefits clearly stated?
   - Rate CTA clarity (1-10): Clear calls-to-action?
   - Provide evidence with citations
   - Give 3-5 recommendations

4. WHO - Target Audience
   - Who is their ideal customer?
   - How specific is their targeting?
   - Rate specificity (1-10): How well-defined is the audience?
   - Rate resonance (1-10): Does content speak to this audience?
   - Rate accessibility (1-10): Can target audience find/understand it?
   - Rate conversion path (1-10): Clear path for audience to act?
   - List 3-5 specific target personas
   - Provide evidence with citations
   - Give 3-5 recommendations

IMPORTANT:
- Calculate an overall score (0-100) for Golden Circle alignment
- Calculate alignment score (how well WHY/HOW/WHAT/WHO align)
- Calculate clarity score (how clearly communicated)
- Use detected patterns as evidence
- Be specific with citations (which page, which section)

Return response as valid JSON with this structure:
{
  "overall_score": 85,
  "alignment_score": 90,
  "clarity_score": 80,
  "why": {
    "statement": "...",
    "clarity_rating": 9.0,
    "authenticity_rating": 8.5,
    "emotional_resonance_rating": 9.0,
    "differentiation_rating": 8.0,
    "evidence": {
      "citations": ["homepage hero", "about page"],
      "key_phrases": ["...", "..."]
    },
    "recommendations": ["...", "...", "..."]
  },
  "how": { ... },
  "what": { ... },
  "who": {
    "statement": "...",
    "target_personas": ["Persona 1", "Persona 2", "Persona 3"],
    ...
  }
}
`

    // Add industry context if available
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
   * Call Gemini AI for Golden Circle analysis
   */
  private static async callGeminiForGoldenCircle(prompt: string): Promise<any> {
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
            maxOutputTokens: 4096
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

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                     text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0])
    }

    throw new Error('Could not parse Gemini response as JSON')
  }

  /**
   * Store Golden Circle analysis in detailed tables
   */
  private static async storeGoldenCircleAnalysis(
    analysisId: string,
    aiResponse: any,
    patterns: PatternMatch[]
  ): Promise<GoldenCircleAnalysis> {
    // Create main Golden Circle record
    const gc = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO golden_circle_analyses (
        analysis_id, overall_score, alignment_score, clarity_score
      ) VALUES (
        ${analysisId}::text,
        ${aiResponse.overall_score || 0},
        ${aiResponse.alignment_score || 0},
        ${aiResponse.clarity_score || 0}
      )
      RETURNING id
    `

    const goldenCircleId = gc[0].id

    // Store WHY dimension
    const why = await prisma.$queryRaw<Array<WhyDimension>>`
      INSERT INTO golden_circle_why (
        golden_circle_id, score, current_state,
        clarity_rating, authenticity_rating,
        emotional_resonance_rating, differentiation_rating,
        evidence, recommendations
      ) VALUES (
        ${goldenCircleId}::uuid,
        ${aiResponse.why.clarity_rating * 10 || 0},
        ${aiResponse.why.statement || ''},
        ${aiResponse.why.clarity_rating || 0},
        ${aiResponse.why.authenticity_rating || 0},
        ${aiResponse.why.emotional_resonance_rating || 0},
        ${aiResponse.why.differentiation_rating || 0},
        ${JSON.stringify({
          patterns: patterns.slice(0, 5),
          citations: aiResponse.why.evidence?.citations || []
        })}::jsonb,
        ${JSON.stringify(aiResponse.why.recommendations || [])}::jsonb
      )
      RETURNING *
    `

    // Store HOW dimension
    const how = await prisma.$queryRaw<Array<HowDimension>>`
      INSERT INTO golden_circle_how (
        golden_circle_id, score, current_state,
        uniqueness_rating, clarity_rating,
        credibility_rating, specificity_rating,
        evidence, recommendations
      ) VALUES (
        ${goldenCircleId}::uuid,
        ${aiResponse.how.uniqueness_rating * 10 || 0},
        ${aiResponse.how.statement || ''},
        ${aiResponse.how.uniqueness_rating || 0},
        ${aiResponse.how.clarity_rating || 0},
        ${aiResponse.how.credibility_rating || 0},
        ${aiResponse.how.specificity_rating || 0},
        ${JSON.stringify({
          patterns: patterns.filter(p => p.element_name === 'simplifies' || p.element_name === 'quality'),
          citations: aiResponse.how.evidence?.citations || []
        })}::jsonb,
        ${JSON.stringify(aiResponse.how.recommendations || [])}::jsonb
      )
      RETURNING *
    `

    // Store WHAT dimension
    const what = await prisma.$queryRaw<Array<WhatDimension>>`
      INSERT INTO golden_circle_what (
        golden_circle_id, score, current_state,
        clarity_rating, completeness_rating,
        value_articulation_rating, cta_clarity_rating,
        evidence, recommendations
      ) VALUES (
        ${goldenCircleId}::uuid,
        ${aiResponse.what.clarity_rating * 10 || 0},
        ${aiResponse.what.statement || ''},
        ${aiResponse.what.clarity_rating || 0},
        ${aiResponse.what.completeness_rating || 0},
        ${aiResponse.what.value_articulation_rating || 0},
        ${aiResponse.what.cta_clarity_rating || 0},
        ${JSON.stringify({
          patterns: patterns.slice(5, 10),
          citations: aiResponse.what.evidence?.citations || []
        })}::jsonb,
        ${JSON.stringify(aiResponse.what.recommendations || [])}::jsonb
      )
      RETURNING *
    `

    // Store WHO dimension
    const who = await prisma.$queryRaw<Array<WhoDimension>>`
      INSERT INTO golden_circle_who (
        golden_circle_id, score, current_state,
        specificity_rating, resonance_rating,
        accessibility_rating, conversion_path_rating,
        target_personas, evidence, recommendations
      ) VALUES (
        ${goldenCircleId}::uuid,
        ${aiResponse.who.specificity_rating * 10 || 0},
        ${aiResponse.who.statement || ''},
        ${aiResponse.who.specificity_rating || 0},
        ${aiResponse.who.resonance_rating || 0},
        ${aiResponse.who.accessibility_rating || 0},
        ${aiResponse.who.conversion_path_rating || 0},
        ${JSON.stringify(aiResponse.who.target_personas || [])}::jsonb,
        ${JSON.stringify({
          patterns: [],
          citations: aiResponse.who.evidence?.citations || []
        })}::jsonb,
        ${JSON.stringify(aiResponse.who.recommendations || [])}::jsonb
      )
      RETURNING *
    `

    return {
      id: goldenCircleId,
      analysis_id: analysisId,
      overall_score: aiResponse.overall_score,
      alignment_score: aiResponse.alignment_score,
      clarity_score: aiResponse.clarity_score,
      why: why[0],
      how: how[0],
      what: what[0],
      who: who[0]
    }
  }

  /**
   * Fetch existing Golden Circle analysis
   */
  static async getByAnalysisId(analysisId: string): Promise<GoldenCircleAnalysis | null> {
    try {
      const gc = await prisma.$queryRaw<any[]>`
        SELECT
          gc.*,
          row_to_json(gw.*) as why,
          row_to_json(gh.*) as how,
          row_to_json(gwa.*) as what,
          row_to_json(gwh.*) as who
        FROM golden_circle_analyses gc
        LEFT JOIN golden_circle_why gw ON gw.golden_circle_id = gc.id
        LEFT JOIN golden_circle_how gh ON gh.golden_circle_id = gc.id
        LEFT JOIN golden_circle_what gwa ON gwa.golden_circle_id = gc.id
        LEFT JOIN golden_circle_who gwh ON gwh.golden_circle_id = gc.id
        WHERE gc.analysis_id = ${analysisId}::text
        LIMIT 1
      `

      if (gc.length === 0) return null

      return gc[0] as GoldenCircleAnalysis
    } catch (error) {
      console.error('Failed to fetch Golden Circle:', error)
      return null
    }
  }
}


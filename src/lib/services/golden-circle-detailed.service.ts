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
    // Create main Golden Circle record using Prisma client
    const gc = await prisma.golden_circle_analyses.create({
      data: {
        analysis_id: analysisId,
        overall_score: aiResponse.overall_score || 0,
        alignment_score: aiResponse.alignment_score || 0,
        clarity_score: aiResponse.clarity_score || 0
      }
    })

    // Store WHY dimension
    const why = await prisma.golden_circle_why.create({
      data: {
        golden_circle_id: gc.id,
        score: (aiResponse.why.clarity_rating || 0) * 10,
        current_state: aiResponse.why.statement || '',
        clarity_rating: aiResponse.why.clarity_rating || 0,
        authenticity_rating: aiResponse.why.authenticity_rating || 0,
        emotional_resonance_rating: aiResponse.why.emotional_resonance_rating || 0,
        differentiation_rating: aiResponse.why.differentiation_rating || 0,
        evidence: {
          patterns: patterns.slice(0, 5),
          citations: aiResponse.why.evidence?.citations || []
        },
        recommendations: aiResponse.why.recommendations || []
      }
    })

    // Store HOW dimension
    const how = await prisma.golden_circle_how.create({
      data: {
        golden_circle_id: gc.id,
        score: (aiResponse.how.uniqueness_rating || 0) * 10,
        current_state: aiResponse.how.statement || '',
        uniqueness_rating: aiResponse.how.uniqueness_rating || 0,
        clarity_rating: aiResponse.how.clarity_rating || 0,
        credibility_rating: aiResponse.how.credibility_rating || 0,
        specificity_rating: aiResponse.how.specificity_rating || 0,
        evidence: {
          patterns: patterns.filter(p => p.element_name === 'simplifies' || p.element_name === 'quality'),
          citations: aiResponse.how.evidence?.citations || []
        },
        recommendations: aiResponse.how.recommendations || []
      }
    })

    // Store WHAT dimension
    const what = await prisma.golden_circle_what.create({
      data: {
        golden_circle_id: gc.id,
        score: (aiResponse.what.clarity_rating || 0) * 10,
        current_state: aiResponse.what.statement || '',
        clarity_rating: aiResponse.what.clarity_rating || 0,
        completeness_rating: aiResponse.what.completeness_rating || 0,
        value_articulation_rating: aiResponse.what.value_articulation_rating || 0,
        cta_clarity_rating: aiResponse.what.cta_clarity_rating || 0,
        evidence: {
          patterns: patterns.slice(5, 10),
          citations: aiResponse.what.evidence?.citations || []
        },
        recommendations: aiResponse.what.recommendations || []
      }
    })

    // Store WHO dimension
    const who = await prisma.golden_circle_who.create({
      data: {
        golden_circle_id: gc.id,
        score: (aiResponse.who.specificity_rating || 0) * 10,
        current_state: aiResponse.who.statement || '',
        specificity_rating: aiResponse.who.specificity_rating || 0,
        resonance_rating: aiResponse.who.resonance_rating || 0,
        accessibility_rating: aiResponse.who.accessibility_rating || 0,
        conversion_path_rating: aiResponse.who.conversion_path_rating || 0,
        target_personas: aiResponse.who.target_personas || [],
        evidence: {
          patterns: [],
          citations: aiResponse.who.evidence?.citations || []
        },
        recommendations: aiResponse.who.recommendations || []
      }
    })

    return {
      id: gc.id,
      analysis_id: analysisId,
      overall_score: aiResponse.overall_score,
      alignment_score: aiResponse.alignment_score,
      clarity_score: aiResponse.clarity_score,
      why,
      how,
      what,
      who
    }
  }

  /**
   * Fetch existing Golden Circle analysis
   */
  static async getByAnalysisId(analysisId: string): Promise<GoldenCircleAnalysis | null> {
    try {
      const gc = await prisma.golden_circle_analyses.findFirst({
        where: { analysis_id: analysisId },
        include: {
          golden_circle_why: true,
          golden_circle_how: true,
          golden_circle_what: true,
          golden_circle_who: true
        }
      })

      if (!gc) return null

      return {
        id: gc.id,
        analysis_id: gc.analysis_id,
        overall_score: gc.overall_score,
        alignment_score: gc.alignment_score,
        clarity_score: gc.clarity_score,
        why: gc.golden_circle_why,
        how: gc.golden_circle_how,
        what: gc.golden_circle_what,
        who: gc.golden_circle_who
      }
    } catch (error) {
      console.error('Failed to fetch Golden Circle:', error)
      return null
    }
  }
}


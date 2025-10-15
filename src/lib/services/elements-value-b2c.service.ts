/**
 * Elements of Value B2C Service
 *
 * Analyzes 28 B2C value elements for individual user decision-making
 * Based on Harvard Business Review's Elements of Value framework
 */

import { prisma } from '@/lib/prisma'
import { PatternMatch, SynonymDetectionService } from './synonym-detection.service'

export interface ElementsOfValueB2CAnalysis {
  id: string
  analysis_id: string
  overall_score: number
  functional_score: number
  emotional_score: number
  life_changing_score: number
  social_impact_score: number
  elements: ElementScore[]
}

export interface ElementScore {
  id: string
  element_name: string
  element_category: string
  pyramid_level: number
  score: number
  weight: number
  weighted_score: number
  evidence: {
    patterns: string[]
    citations: string[]
    confidence: number
  }
}

export class ElementsOfValueB2CService {
  /**
   * Run complete B2C Elements of Value analysis
   */
  static async analyze(
    analysisId: string,
    content: any,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<ElementsOfValueB2CAnalysis> {
    // Get patterns if not provided
    if (!patterns) {
      patterns = await SynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      )
    }

    // Build prompt
    const prompt = await this.buildElementsPrompt(content, industry, patterns)

    // Call Gemini
    const aiResponse = await this.callGeminiForElements(prompt)

    // Store in database
    return await this.storeElementsAnalysis(analysisId, aiResponse, patterns)
  }

  /**
   * Build Gemini prompt for Elements of Value analysis
   */
  private static async buildElementsPrompt(
    content: any,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<string> {
    const basePrompt = `
Analyze this website using the Elements of Value (B2C) framework.
Score each of the 30 value elements on a scale of 0-100.

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

THE 30 B2C VALUE ELEMENTS (Bain & Company Framework):

FUNCTIONAL (Pyramid Level 1 - 14 elements):
1. saves_time - Helps complete tasks faster
2. simplifies - Makes things easier
3. makes_money - Helps earn income
4. reduces_effort - Minimizes work required
5. reduces_cost - Saves money
6. reduces_risk - Minimizes negative outcomes
7. organizes - Helps structure tasks
8. integrates - Connects systems
9. connects - Brings people together
10. quality - Superior standards
11. variety - Offers choices
12. informs - Provides knowledge
13. avoids_hassles - Avoiding or reducing hassles and inconveniences
14. sensory_appeal - Appealing in taste, smell, hearing and other senses

EMOTIONAL (Pyramid Level 2 - 10 elements):
15. reduces_anxiety - Peace of mind
16. rewards_me - Incentives/recognition
17. nostalgia - Positive memories
18. design_aesthetics - Visual appeal
19. badge_value - Status signal
20. wellness - Health promotion
21. therapeutic - Stress relief
22. fun_entertainment - Enjoyment
23. attractiveness - Personal appeal
24. provides_access - Exclusive opportunities

LIFE CHANGING (Pyramid Level 3 - 5 elements):
25. provides_hope - Inspires optimism
26. self_actualization - Achieve potential
27. motivation - Inspires action
28. heirloom - Legacy value
29. affiliation - Sense of belonging

SOCIAL IMPACT (Pyramid Level 4 - 1 element):
30. self_transcendence - Greater good

For each element:
- Score 0-100 (0 = not present, 100 = strongly present)
- Provide evidence with specific citations
- Note which patterns were detected

Calculate category scores:
- functional_score = average of elements 1-12
- emotional_score = average of elements 13-22
- life_changing_score = average of elements 23-27
- social_impact_score = element 28 score
- overall_score = weighted average (40% functional, 30% emotional, 20% life changing, 10% social)

Return as valid JSON:
{
  "overall_score": 82,
  "functional_score": 85,
  "emotional_score": 78,
  "life_changing_score": 75,
  "social_impact_score": 70,
  "elements": [
    {
      "element_name": "saves_time",
      "element_category": "functional",
      "pyramid_level": 1,
      "score": 90,
      "evidence": {
        "patterns": ["automation", "fast", "instant"],
        "citations": ["homepage hero", "features section"],
        "confidence": 0.95
      }
    },
    // ... 27 more elements
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
   * Call Gemini for Elements of Value analysis
   */
  private static async callGeminiForElements(prompt: string): Promise<any> {
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

    throw new Error('Could not parse Gemini response as JSON')
  }

  /**
   * Store Elements of Value analysis in database
   */
  private static async storeElementsAnalysis(
    analysisId: string,
    aiResponse: any,
    patterns: PatternMatch[]
  ): Promise<ElementsOfValueB2CAnalysis> {
    // Create main EoV B2C record using Prisma client
    const eov = await prisma.elements_of_value_b2c.create({
      data: {
        analysis_id: analysisId,
        overall_score: aiResponse.overall_score || 0,
        functional_score: aiResponse.functional_score || 0,
        emotional_score: aiResponse.emotional_score || 0,
        life_changing_score: aiResponse.life_changing_score || 0,
        social_impact_score: aiResponse.social_impact_score || 0
      }
    })

    // Store individual element scores using Prisma client
    const elements: ElementScore[] = []

    for (const elem of aiResponse.elements || []) {
      const stored = await prisma.b2c_element_scores.create({
        data: {
          eov_b2c_id: eov.id,
          element_name: elem.element_name,
          element_category: elem.element_category,
          pyramid_level: elem.pyramid_level || 1,
          score: elem.score || 0,
          weight: 1.0,
          weighted_score: elem.score || 0,
          evidence: elem.evidence || {}
        }
      })

      elements.push(stored)
    }

    return {
      id: eov.id,
      analysis_id: analysisId,
      overall_score: aiResponse.overall_score,
      functional_score: aiResponse.functional_score,
      emotional_score: aiResponse.emotional_score,
      life_changing_score: aiResponse.life_changing_score,
      social_impact_score: aiResponse.social_impact_score,
      elements
    }
  }

  /**
   * Fetch existing B2C analysis
   */
  static async getByAnalysisId(analysisId: string): Promise<ElementsOfValueB2CAnalysis | null> {
    try {
      const eov = await prisma.elements_of_value_b2c.findFirst({
        where: { analysis_id: analysisId },
        include: {
          b2c_element_scores: true
        }
      })

      if (!eov) return null

      return {
        id: eov.id,
        analysis_id: eov.analysis_id,
        overall_score: eov.overall_score,
        functional_score: eov.functional_score,
        emotional_score: eov.emotional_score,
        life_changing_score: eov.life_changing_score,
        social_impact_score: eov.social_impact_score,
        elements: eov.b2c_element_scores
      }
    } catch (error) {
      console.error('Failed to fetch Elements of Value B2C:', error)
      return null
    }
  }
}


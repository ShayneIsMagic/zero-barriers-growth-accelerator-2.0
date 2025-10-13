/**
 * CliftonStrengths Detailed Service
 *
 * Analyzes organizational strengths using the 34 CliftonStrengths themes
 * Identifies top themes and provides detailed manifestation descriptions
 */

import { prisma } from '@/lib/prisma'
import { PatternMatch, SynonymDetectionService } from './synonym-detection.service'

export interface CliftonStrengthsAnalysis {
  id: string
  analysis_id: string
  overall_score: number
  strategic_thinking_score: number
  executing_score: number
  influencing_score: number
  relationship_building_score: number
  dominant_domain: string
  top_5: ThemeScore[]
  all_themes: ThemeScore[]
}

export interface ThemeScore {
  id: string
  theme_name: string
  domain: string
  score: number
  rank: number
  is_top_5: boolean
  is_top_10: boolean
  evidence: {
    patterns: string[]
    manifestations: string[]
  }
  manifestation_description: string
}

export class CliftonStrengthsService {
  /**
   * Run complete CliftonStrengths analysis
   */
  static async analyze(
    analysisId: string,
    content: any,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<CliftonStrengthsAnalysis> {
    if (!patterns) {
      patterns = await SynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      )
    }

    // Get all 34 themes from reference
    const themes = await this.getAllThemes()

    // Build prompt
    const prompt = await this.buildCliftonPrompt(content, themes, industry, patterns)

    // Call Gemini
    const aiResponse = await this.callGeminiForClifton(prompt)

    // Store in database
    return await this.storeCliftonAnalysis(analysisId, aiResponse, patterns)
  }

  /**
   * Get all 34 CliftonStrengths themes
   */
  private static async getAllThemes(): Promise<Array<{ theme_name: string; domain: string; description: string }>> {
    try {
      const themes = await prisma.$queryRaw<Array<{
        theme_name: string
        domain: string
        description: string
      }>>`
        SELECT theme_name, domain, description
        FROM clifton_themes_reference
        ORDER BY domain, theme_name
      `

      return themes
    } catch (error) {
      console.error('Failed to get themes:', error)
      return []
    }
  }

  /**
   * Build Gemini prompt for CliftonStrengths analysis
   */
  private static async buildCliftonPrompt(
    content: any,
    themes: Array<{ theme_name: string; domain: string; description: string }>,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<string> {
    const basePrompt = `
Analyze this organization's website to identify CliftonStrengths themes.
Score all 34 themes and identify the top 5 that are most evident.

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

THE 34 CLIFTONSTRENGTHS THEMES:

${themes.map(t => `${t.theme_name} (${t.domain}): ${t.description}`).join('\n')}

For each theme:
- Score 0-100 based on evidence in content
- Identify specific manifestations (how the theme shows up)
- Provide evidence with citations
- Rank themes (1 = strongest, 34 = weakest)

Calculate domain scores:
- strategic_thinking_score = avg of Strategic Thinking themes
- executing_score = avg of Executing themes
- influencing_score = avg of Influencing themes
- relationship_building_score = avg of Relationship Building themes
- overall_score = average of all 34 themes
- dominant_domain = domain with highest score

Return as JSON:
{
  "overall_score": 84,
  "strategic_thinking_score": 88,
  "executing_score": 85,
  "influencing_score": 82,
  "relationship_building_score": 81,
  "dominant_domain": "strategic_thinking",
  "themes": [
    {
      "theme_name": "Strategic",
      "domain": "strategic_thinking",
      "score": 95,
      "rank": 1,
      "manifestation": "Strong evidence of strategic thinking through forward-looking language, alternative path planning, and anticipatory statements.",
      "evidence": {
        "patterns": ["future-focused", "planning", "strategy"],
        "manifestations": [
          "Creates multiple pathways to success",
          "Anticipates future challenges",
          "Plans for various scenarios"
        ],
        "citations": ["homepage", "about page", "services"]
      }
    },
    // ... 33 more themes (all ranked)
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
   * Call Gemini for CliftonStrengths analysis
   */
  private static async callGeminiForClifton(prompt: string): Promise<any> {
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
   * Store CliftonStrengths analysis in database
   */
  private static async storeCliftonAnalysis(
    analysisId: string,
    aiResponse: any,
    patterns: PatternMatch[]
  ): Promise<CliftonStrengthsAnalysis> {
    // Create main record
    const cs = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO clifton_strengths_analyses (
        analysis_id, overall_score, strategic_thinking_score,
        executing_score, influencing_score, relationship_building_score,
        dominant_domain
      ) VALUES (
        ${analysisId}::text,
        ${aiResponse.overall_score || 0},
        ${aiResponse.strategic_thinking_score || 0},
        ${aiResponse.executing_score || 0},
        ${aiResponse.influencing_score || 0},
        ${aiResponse.relationship_building_score || 0},
        ${aiResponse.dominant_domain || 'strategic_thinking'}
      )
      RETURNING id
    `

    const csId = cs[0].id

    // Store theme scores
    const themes: ThemeScore[] = []

    for (const theme of aiResponse.themes || []) {
      const stored = await prisma.$queryRaw<Array<ThemeScore>>`
        INSERT INTO clifton_theme_scores (
          clifton_analysis_id, theme_name, domain,
          score, rank, is_top_5, is_top_10,
          evidence, manifestation_description
        ) VALUES (
          ${csId}::uuid,
          ${theme.theme_name},
          ${theme.domain},
          ${theme.score || 0},
          ${theme.rank || 0},
          ${theme.rank <= 5},
          ${theme.rank <= 10},
          ${JSON.stringify(theme.evidence || {})}::jsonb,
          ${theme.manifestation || ''}
        )
        RETURNING *
      `

      if (stored[0]) themes.push(stored[0])
    }

    return {
      id: csId,
      analysis_id: analysisId,
      overall_score: aiResponse.overall_score,
      strategic_thinking_score: aiResponse.strategic_thinking_score,
      executing_score: aiResponse.executing_score,
      influencing_score: aiResponse.influencing_score,
      relationship_building_score: aiResponse.relationship_building_score,
      dominant_domain: aiResponse.dominant_domain,
      top_5: themes.filter(t => t.rank <= 5).sort((a, b) => a.rank - b.rank),
      all_themes: themes.sort((a, b) => a.rank - b.rank)
    }
  }

  /**
   * Fetch existing CliftonStrengths analysis
   */
  static async getByAnalysisId(analysisId: string): Promise<CliftonStrengthsAnalysis | null> {
    try {
      const cs = await prisma.$queryRaw<any[]>`
        SELECT
          cs.*,
          json_agg(
            json_build_object(
              'id', cts.id,
              'theme_name', cts.theme_name,
              'domain', cts.domain,
              'score', cts.score,
              'rank', cts.rank,
              'is_top_5', cts.is_top_5,
              'evidence', cts.evidence,
              'manifestation_description', cts.manifestation_description
            ) ORDER BY cts.rank
          ) as themes
        FROM clifton_strengths_analyses cs
        LEFT JOIN clifton_theme_scores cts ON cts.clifton_analysis_id = cs.id
        WHERE cs.analysis_id = ${analysisId}::text
        GROUP BY cs.id
        LIMIT 1
      `

      if (cs.length === 0) return null

      const result = cs[0]
      return {
        ...result,
        top_5: result.themes.filter((t: any) => t.rank <= 5),
        all_themes: result.themes
      }
    } catch (error) {
      console.error('Failed to fetch CliftonStrengths:', error)
      return null
    }
  }
}


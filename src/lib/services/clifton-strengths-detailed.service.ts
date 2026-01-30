/**
 * CliftonStrengths Detailed Service
 *
 * Analyzes organizational strengths using the 34 CliftonStrengths themes
 * Identifies top themes and provides detailed manifestation descriptions
 */

import { prisma } from '@/lib/prisma';
import {
  PatternMatch,
  SimpleSynonymDetectionService,
} from './simple-synonym-detection.service';

export interface CliftonStrengthsAnalysis {
  id: string;
  analysis_id: string;
  overall_score: number;
  strategic_thinking_score: number;
  executing_score: number;
  influencing_score: number;
  relationship_building_score: number;
  dominant_domain: string;
  top_5: ThemeScore[];
  all_themes: ThemeScore[];
}

export interface ThemeScore {
  id: string;
  theme_name: string;
  domain: string;
  score: number;
  rank: number;
  is_top_5: boolean;
  is_top_10: boolean;
  evidence: {
    patterns: string[];
    manifestations: string[];
  };
  manifestation_description: string;
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
      patterns = await SimpleSynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      );
    }

    // Get all 34 themes from reference
    const themes = await this.getAllThemes();

    // Build prompt
    const prompt = await this.buildCliftonPrompt(
      content,
      themes,
      industry,
      patterns
    );

    // Call Gemini
    const aiResponse = await this.callGeminiForClifton(prompt);

    // Store in database
    return await this.storeCliftonAnalysis(analysisId, aiResponse, patterns);
  }

  /**
   * Get all 34 CliftonStrengths themes
   */
  private static async getAllThemes(): Promise<
    Array<{ theme_name: string; domain: string; description: string }>
  > {
    try {
      const themes = await prisma.clifton_themes_reference.findMany({
        select: {
          theme_name: true,
          domain: true,
          description: true,
        },
        orderBy: [{ domain: 'asc' }, { theme_name: 'asc' }],
      });

      return themes;
    } catch (error) {
      console.error('Failed to get themes:', error);
      return [];
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
    // Group themes by domain for better organization
    const themesByDomain = themes.reduce(
      (acc, theme) => {
        if (!acc[theme.domain]) acc[theme.domain] = [];
        acc[theme.domain].push(theme);
        return acc;
      },
      {} as Record<
        string,
        Array<{ theme_name: string; domain: string; description: string }>
      >
    );

    const basePrompt = `
Analyze this organization's website to identify CliftonStrengths themes.
Score all 34 themes and identify the top 5 that are most evident.

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

THE 34 CLIFTONSTRENGTHS THEMES BY DOMAIN:

STRATEGIC THINKING (8 themes):
${themesByDomain.strategic_thinking?.map((t) => `• ${t.theme_name}: ${t.description}`).join('\n') || 'No themes found'}

EXECUTING (9 themes):
${themesByDomain.executing?.map((t) => `• ${t.theme_name}: ${t.description}`).join('\n') || 'No themes found'}

INFLUENCING (8 themes):
${themesByDomain.influencing?.map((t) => `• ${t.theme_name}: ${t.description}`).join('\n') || 'No themes found'}

RELATIONSHIP BUILDING (9 themes):
${themesByDomain.relationship_building?.map((t) => `• ${t.theme_name}: ${t.description}`).join('\n') || 'No themes found'}

ANALYSIS INSTRUCTIONS:
For each of the 34 themes:
- Score 0-100 based on evidence in content
- Identify specific manifestations (how the theme shows up)
- Provide evidence with citations from the website
- Rank themes (1 = strongest, 34 = weakest)

Calculate domain scores:
- strategic_thinking_score = average of Strategic Thinking themes
- executing_score = average of Executing themes
- influencing_score = average of Influencing themes
- relationship_building_score = average of Relationship Building themes
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
    }
  ]
}
`;

    if (industry && patterns) {
      return await SimpleSynonymDetectionService.buildEnhancedPrompt(
        basePrompt,
        content.text || content.content,
        industry
      );
    }

    return basePrompt;
  }

  /**
   * Call Gemini for CliftonStrengths analysis
   */
  private static async callGeminiForClifton(prompt: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
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
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    throw new Error('Could not parse Gemini response');
  }

  /**
   * Store CliftonStrengths analysis in database
   */
  private static async storeCliftonAnalysis(
    analysisId: string,
    aiResponse: any,
    _patterns: PatternMatch[]
  ): Promise<CliftonStrengthsAnalysis> {
    // Create main record using Prisma client
    const cs = await prisma.clifton_strengths_analyses.create({
      data: {
        analysis_id: analysisId,
        overall_score: aiResponse.overall_score || 0,
        strategic_thinking_score: aiResponse.strategic_thinking_score || 0,
        executing_score: aiResponse.executing_score || 0,
        influencing_score: aiResponse.influencing_score || 0,
        relationship_building_score:
          aiResponse.relationship_building_score || 0,
        dominant_domain: aiResponse.dominant_domain || 'strategic_thinking',
      },
    });

    // Store theme scores using Prisma client
    const themes: ThemeScore[] = [];

    for (const theme of aiResponse.themes || []) {
      const stored = await prisma.clifton_theme_scores.create({
        data: {
          clifton_analysis_id: cs.id,
          theme_name: theme.theme_name,
          domain: theme.domain,
          score: theme.score || 0,
          rank: theme.rank || 0,
          is_top_5: (theme.rank || 0) <= 5,
          is_top_10: (theme.rank || 0) <= 10,
          evidence: theme.evidence || {},
          manifestation_description: theme.manifestation || '',
        },
      });

      const evidence = stored.evidence as {
        patterns?: unknown[];
        manifestations?: unknown[];
      } | null;
      themes.push({
        ...stored,
        score: Number(stored.score),
        evidence: {
          patterns: Array.isArray(evidence?.patterns)
            ? (evidence.patterns as string[])
            : [],
          manifestations: Array.isArray(evidence?.manifestations)
            ? (evidence.manifestations as string[])
            : [],
        },
      });
    }

    return {
      id: cs.id,
      analysis_id: analysisId,
      overall_score: aiResponse.overall_score,
      strategic_thinking_score: aiResponse.strategic_thinking_score,
      executing_score: aiResponse.executing_score,
      influencing_score: aiResponse.influencing_score,
      relationship_building_score: aiResponse.relationship_building_score,
      dominant_domain: aiResponse.dominant_domain,
      top_5: themes.filter((t) => t.rank <= 5).sort((a, b) => a.rank - b.rank),
      all_themes: themes.sort((a, b) => a.rank - b.rank),
    };
  }

  /**
   * Fetch existing CliftonStrengths analysis
   */
  static async getByAnalysisId(
    analysisId: string
  ): Promise<CliftonStrengthsAnalysis | null> {
    try {
      const cs = await prisma.clifton_strengths_analyses.findFirst({
        where: { analysis_id: analysisId },
        include: {
          clifton_theme_scores: {
            orderBy: { rank: 'asc' },
          },
        },
      });

      if (!cs) return null;

      return {
        id: cs.id,
        analysis_id: cs.analysis_id,
        overall_score: cs.overall_score ? Number(cs.overall_score) : 0,
        strategic_thinking_score: cs.strategic_thinking_score
          ? Number(cs.strategic_thinking_score)
          : 0,
        executing_score: cs.executing_score ? Number(cs.executing_score) : 0,
        influencing_score: cs.influencing_score
          ? Number(cs.influencing_score)
          : 0,
        relationship_building_score: cs.relationship_building_score
          ? Number(cs.relationship_building_score)
          : 0,
        dominant_domain: cs.dominant_domain,
        top_5: cs.clifton_theme_scores
          .filter((t) => t.rank && t.rank <= 5)
          .map((t) => {
            const evidence = t.evidence as {
              patterns?: unknown[];
              manifestations?: unknown[];
            } | null;
            return {
              ...t,
              score: t.score ? Number(t.score) : 0,
              evidence: {
                patterns: Array.isArray(evidence?.patterns)
                  ? (evidence.patterns as string[])
                  : [],
                manifestations: Array.isArray(evidence?.manifestations)
                  ? (evidence.manifestations as string[])
                  : [],
              },
            };
          }),
        all_themes: cs.clifton_theme_scores.map((t) => {
          const evidence = t.evidence as {
            patterns?: unknown[];
            manifestations?: unknown[];
          } | null;
          return {
            ...t,
            score: t.score ? Number(t.score) : 0,
            evidence: {
              patterns: Array.isArray(evidence?.patterns)
                ? (evidence.patterns as string[])
                : [],
              manifestations: Array.isArray(evidence?.manifestations)
                ? (evidence.manifestations as string[])
                : [],
            },
          };
        }),
      };
    } catch (error) {
      console.error('Failed to fetch CliftonStrengths:', error);
      return null;
    }
  }
}

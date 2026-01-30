/**
 * Golden Circle Detailed Service
 *
 * Analyzes WHY, HOW, WHAT, and WHO dimensions
 * Stores detailed breakdowns with evidence and recommendations
 */

import { prisma } from '@/lib/prisma';
import {
  PatternMatch,
  SimpleSynonymDetectionService,
} from './simple-synonym-detection.service';

export interface GoldenCircleAnalysis {
  id: string;
  analysis_id: string;
  overall_score: number;
  alignment_score: number;
  clarity_score: number;
  why: WhyDimension;
  how: HowDimension;
  what: WhatDimension;
  who: WhoDimension;
}

export interface WhyDimension {
  id: string;
  score: number;
  current_state: string;
  clarity_rating: number;
  authenticity_rating: number;
  emotional_resonance_rating: number;
  differentiation_rating: number;
  evidence: {
    patterns: PatternMatch[];
    citations: string[];
  };
  recommendations: string[];
}

export interface HowDimension {
  id: string;
  score: number;
  current_state: string;
  uniqueness_rating: number;
  clarity_rating: number;
  credibility_rating: number;
  specificity_rating: number;
  evidence: {
    patterns: PatternMatch[];
    citations: string[];
  };
  recommendations: string[];
}

export interface WhatDimension {
  id: string;
  score: number;
  current_state: string;
  clarity_rating: number;
  completeness_rating: number;
  value_articulation_rating: number;
  cta_clarity_rating: number;
  evidence: {
    patterns: PatternMatch[];
    citations: string[];
  };
  recommendations: string[];
}

export interface WhoDimension {
  id: string;
  score: number;
  current_state: string;
  specificity_rating: number;
  resonance_rating: number;
  accessibility_rating: number;
  conversion_path_rating: number;
  target_personas: string[];
  evidence: {
    patterns: PatternMatch[];
    citations: string[];
  };
  recommendations: string[];
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
      patterns = await SimpleSynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      );
    }

    // Build enhanced prompt
    const prompt = await this.buildGoldenCirclePrompt(
      content,
      industry,
      patterns
    );

    // Call Gemini AI
    const aiResponse = await this.callGeminiForGoldenCircle(prompt);

    // Store in database
    return await this.storeGoldenCircleAnalysis(
      analysisId,
      aiResponse,
      patterns
    );
  }

  /**
   * Build Gemini prompt for Golden Circle analysis
   */
  private static async buildGoldenCirclePrompt(
    content: any,
    _industry?: string,
    _patterns?: PatternMatch[]
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

   SYNONYM GUIDANCE FOR WHY:
   Look for these terms and concepts that indicate purpose/belief:
   - Mission language: "mission", "vision", "purpose", "cause", "passion", "drive"
   - Problem-solving: "solve", "address", "tackle", "fight against", "overcome"
   - Change-making: "transform", "revolutionize", "improve", "make better", "enhance"
   - Values: "integrity", "excellence", "innovation", "service", "care", "quality"
   - Belief statements: "We believe", "Our mission", "We exist to", "We're passionate about"

2. HOW - Unique Process/Approach
   - How do they deliver on their WHY?
   - What makes their approach unique?
   - Rate uniqueness (1-10): How different is their approach?
   - Rate clarity (1-10): Is the HOW clearly explained?
   - Rate credibility (1-10): Is it believable/proven?
   - Rate specificity (1-10): How specific vs vague?
   - Provide evidence with citations
   - Give 3-5 recommendations

   SYNONYM GUIDANCE FOR HOW:
   Look for these terms and concepts that indicate process/approach:
   - Methodology: "approach", "method", "process", "system", "framework", "strategy"
   - Values: "principles", "standards", "ethics", "values", "philosophy", "culture"
   - Uniqueness: "unique", "different", "innovative", "proprietary", "exclusive", "distinctive"
   - Quality: "rigorous", "thorough", "meticulous", "precise", "expert", "professional"
   - Experience: "expertise", "experience", "knowledge", "skill", "proven", "tested"

3. WHAT - Products/Services
   - What do they actually offer?
   - Are offerings clearly described?
   - Rate clarity (1-10): How clear are the offerings?
   - Rate completeness (1-10): Full picture of what they do?
   - Rate value articulation (1-10): Benefits clearly stated?
   - Rate CTA clarity (1-10): Clear calls-to-action?
   - Provide evidence with citations
   - Give 3-5 recommendations

   SYNONYM GUIDANCE FOR WHAT:
   Look for these terms and concepts that indicate offerings:
   - Products: "product", "solution", "service", "offering", "platform", "tool"
   - Features: "feature", "capability", "function", "resource", "option", "choice"
   - Benefits: "benefit", "advantage", "value", "outcome", "result", "impact"
   - Delivery: "provide", "deliver", "offer", "supply", "give", "enable"

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

   SYNONYM GUIDANCE FOR WHO:
   Look for these terms and concepts that indicate target audience:
   - Demographics: "customers", "clients", "users", "audience", "members", "visitors"
   - Segments: "professionals", "businesses", "individuals", "organizations", "teams"
   - Industries: specific industry names, "sectors", "markets", "fields", "verticals"
   - Characteristics: "busy", "growing", "established", "innovative", "quality-focused", "successful"

IMPORTANT:
- Calculate an overall score (0-100) for Golden Circle alignment
- Calculate alignment score (how well WHY/HOW/WHAT/WHO align)
- Calculate clarity score (how clearly communicated)
- Look for both explicit statements AND implicit indicators
- Focus on underlying meaning and intent, not just exact keyword matches
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
`;

    return basePrompt;
  }

  /**
   * Call Gemini AI for Golden Circle analysis
   */
  private static async callGeminiForGoldenCircle(prompt: string): Promise<any> {
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
            maxOutputTokens: 4096,
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

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    throw new Error('Could not parse Gemini response as JSON');
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
        clarity_score: aiResponse.clarity_score || 0,
      },
    });

    // Store WHY dimension
    const why = await prisma.golden_circle_why.create({
      data: {
        golden_circle_id: gc.id,
        score: (aiResponse.why.clarity_rating || 0) * 10,
        current_state: aiResponse.why.statement || '',
        clarity_rating: aiResponse.why.clarity_rating || 0,
        authenticity_rating: aiResponse.why.authenticity_rating || 0,
        emotional_resonance_rating:
          aiResponse.why.emotional_resonance_rating || 0,
        differentiation_rating: aiResponse.why.differentiation_rating || 0,
        evidence: {
          patterns: patterns.slice(0, 5).map((p) => ({
            element_name: p.element_name,
            pattern_text: p.pattern_text,
            match_count: p.match_count,
            confidence: p.confidence,
          })),
          citations: aiResponse.why.evidence?.citations || [],
        },
        recommendations: aiResponse.why.recommendations || [],
      },
    });

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
          patterns: patterns
            .filter(
              (p) =>
                p.element_name === 'simplifies' || p.element_name === 'quality'
            )
            .map((p) => ({
              element_name: p.element_name,
              pattern_text: p.pattern_text,
              match_count: p.match_count,
              confidence: p.confidence,
            })),
          citations: aiResponse.how.evidence?.citations || [],
        },
        recommendations: aiResponse.how.recommendations || [],
      },
    });

    // Store WHAT dimension
    const what = await prisma.golden_circle_what.create({
      data: {
        golden_circle_id: gc.id,
        score: (aiResponse.what.clarity_rating || 0) * 10,
        current_state: aiResponse.what.statement || '',
        clarity_rating: aiResponse.what.clarity_rating || 0,
        completeness_rating: aiResponse.what.completeness_rating || 0,
        value_articulation_rating:
          aiResponse.what.value_articulation_rating || 0,
        cta_clarity_rating: aiResponse.what.cta_clarity_rating || 0,
        evidence: {
          patterns: patterns.slice(5, 10).map((p) => ({
            element_name: p.element_name,
            pattern_text: p.pattern_text,
            match_count: p.match_count,
            confidence: p.confidence,
          })),
          citations: aiResponse.what.evidence?.citations || [],
        },
        recommendations: aiResponse.what.recommendations || [],
      },
    });

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
          citations: aiResponse.who.evidence?.citations || [],
        },
        recommendations: aiResponse.who.recommendations || [],
      },
    });

    return {
      id: gc.id,
      analysis_id: analysisId,
      overall_score: aiResponse.overall_score || 0,
      alignment_score: aiResponse.alignment_score || 0,
      clarity_score: aiResponse.clarity_score || 0,
      why: {
        ...why,
        score: why.score ? Number(why.score) : 0,
        clarity_rating: why.clarity_rating ? Number(why.clarity_rating) : 0,
        authenticity_rating: why.authenticity_rating
          ? Number(why.authenticity_rating)
          : 0,
        emotional_resonance_rating: why.emotional_resonance_rating
          ? Number(why.emotional_resonance_rating)
          : 0,
        differentiation_rating: why.differentiation_rating
          ? Number(why.differentiation_rating)
          : 0,
        evidence: {
          patterns: Array.isArray((why.evidence as any)?.patterns)
            ? (why.evidence as any).patterns
            : [],
          citations: Array.isArray((why.evidence as any)?.citations)
            ? (why.evidence as any).citations
            : [],
        },
        recommendations: Array.isArray(why.recommendations)
          ? (why.recommendations as string[])
          : [],
      },
      how: {
        ...how,
        score: how.score ? Number(how.score) : 0,
        uniqueness_rating: how.uniqueness_rating
          ? Number(how.uniqueness_rating)
          : 0,
        clarity_rating: how.clarity_rating ? Number(how.clarity_rating) : 0,
        credibility_rating: how.credibility_rating
          ? Number(how.credibility_rating)
          : 0,
        specificity_rating: how.specificity_rating
          ? Number(how.specificity_rating)
          : 0,
        evidence: {
          patterns: Array.isArray((how.evidence as any)?.patterns)
            ? (how.evidence as any).patterns
            : [],
          citations: Array.isArray((how.evidence as any)?.citations)
            ? (how.evidence as any).citations
            : [],
        },
        recommendations: Array.isArray(how.recommendations)
          ? (how.recommendations as string[])
          : [],
      },
      what: {
        ...what,
        score: what.score ? Number(what.score) : 0,
        clarity_rating: what.clarity_rating ? Number(what.clarity_rating) : 0,
        completeness_rating: what.completeness_rating
          ? Number(what.completeness_rating)
          : 0,
        value_articulation_rating: what.value_articulation_rating
          ? Number(what.value_articulation_rating)
          : 0,
        cta_clarity_rating: what.cta_clarity_rating
          ? Number(what.cta_clarity_rating)
          : 0,
        evidence: {
          patterns: Array.isArray((what.evidence as any)?.patterns)
            ? (what.evidence as any).patterns
            : [],
          citations: Array.isArray((what.evidence as any)?.citations)
            ? (what.evidence as any).citations
            : [],
        },
        recommendations: Array.isArray(what.recommendations)
          ? (what.recommendations as string[])
          : [],
      },
      who: {
        ...who,
        score: who.score ? Number(who.score) : 0,
        specificity_rating: who.specificity_rating
          ? Number(who.specificity_rating)
          : 0,
        resonance_rating: who.resonance_rating
          ? Number(who.resonance_rating)
          : 0,
        accessibility_rating: who.accessibility_rating
          ? Number(who.accessibility_rating)
          : 0,
        conversion_path_rating: who.conversion_path_rating
          ? Number(who.conversion_path_rating)
          : 0,
        evidence: {
          patterns: Array.isArray((who.evidence as any)?.patterns)
            ? (who.evidence as any).patterns
            : [],
          citations: Array.isArray((who.evidence as any)?.citations)
            ? (who.evidence as any).citations
            : [],
        },
        recommendations: Array.isArray(who.recommendations)
          ? (who.recommendations as string[])
          : [],
        target_personas: Array.isArray(who.target_personas)
          ? (who.target_personas as string[])
          : [],
      },
    };
  }

  /**
   * Fetch existing Golden Circle analysis
   */
  static async getByAnalysisId(
    analysisId: string
  ): Promise<GoldenCircleAnalysis | null> {
    try {
      const gc = await prisma.golden_circle_analyses.findFirst({
        where: { analysis_id: analysisId },
        include: {
          golden_circle_why: true,
          golden_circle_how: true,
          golden_circle_what: true,
          golden_circle_who: true,
        },
      });

      if (!gc) return null;

      return {
        id: gc.id,
        analysis_id: gc.analysis_id,
        overall_score: gc.overall_score ? Number(gc.overall_score) : 0,
        alignment_score: gc.alignment_score ? Number(gc.alignment_score) : 0,
        clarity_score: gc.clarity_score ? Number(gc.clarity_score) : 0,
        why: gc.golden_circle_why
          ? {
              ...gc.golden_circle_why,
              score: gc.golden_circle_why.score
                ? Number(gc.golden_circle_why.score)
                : 0,
              clarity_rating: gc.golden_circle_why.clarity_rating
                ? Number(gc.golden_circle_why.clarity_rating)
                : 0,
              authenticity_rating: gc.golden_circle_why.authenticity_rating
                ? Number(gc.golden_circle_why.authenticity_rating)
                : 0,
              emotional_resonance_rating: gc.golden_circle_why
                .emotional_resonance_rating
                ? Number(gc.golden_circle_why.emotional_resonance_rating)
                : 0,
              differentiation_rating: gc.golden_circle_why
                .differentiation_rating
                ? Number(gc.golden_circle_why.differentiation_rating)
                : 0,
              evidence: {
                patterns: Array.isArray(
                  (gc.golden_circle_why.evidence as any)?.patterns
                )
                  ? (gc.golden_circle_why.evidence as any).patterns
                  : [],
                citations: Array.isArray(
                  (gc.golden_circle_why.evidence as any)?.citations
                )
                  ? (gc.golden_circle_why.evidence as any).citations
                  : [],
              },
              recommendations: Array.isArray(
                gc.golden_circle_why.recommendations
              )
                ? (gc.golden_circle_why.recommendations as string[])
                : [],
            }
          : null,
        how: gc.golden_circle_how
          ? {
              ...gc.golden_circle_how,
              score: gc.golden_circle_how.score
                ? Number(gc.golden_circle_how.score)
                : 0,
              uniqueness_rating: gc.golden_circle_how.uniqueness_rating
                ? Number(gc.golden_circle_how.uniqueness_rating)
                : 0,
              clarity_rating: gc.golden_circle_how.clarity_rating
                ? Number(gc.golden_circle_how.clarity_rating)
                : 0,
              credibility_rating: gc.golden_circle_how.credibility_rating
                ? Number(gc.golden_circle_how.credibility_rating)
                : 0,
              specificity_rating: gc.golden_circle_how.specificity_rating
                ? Number(gc.golden_circle_how.specificity_rating)
                : 0,
              evidence: {
                patterns: Array.isArray(
                  (gc.golden_circle_how.evidence as any)?.patterns
                )
                  ? (gc.golden_circle_how.evidence as any).patterns
                  : [],
                citations: Array.isArray(
                  (gc.golden_circle_how.evidence as any)?.citations
                )
                  ? (gc.golden_circle_how.evidence as any).citations
                  : [],
              },
              recommendations: Array.isArray(
                gc.golden_circle_how.recommendations
              )
                ? (gc.golden_circle_how.recommendations as string[])
                : [],
            }
          : null,
        what: gc.golden_circle_what
          ? {
              ...gc.golden_circle_what,
              score: gc.golden_circle_what.score
                ? Number(gc.golden_circle_what.score)
                : 0,
              clarity_rating: gc.golden_circle_what.clarity_rating
                ? Number(gc.golden_circle_what.clarity_rating)
                : 0,
              completeness_rating: gc.golden_circle_what.completeness_rating
                ? Number(gc.golden_circle_what.completeness_rating)
                : 0,
              value_articulation_rating: gc.golden_circle_what
                .value_articulation_rating
                ? Number(gc.golden_circle_what.value_articulation_rating)
                : 0,
              cta_clarity_rating: gc.golden_circle_what.cta_clarity_rating
                ? Number(gc.golden_circle_what.cta_clarity_rating)
                : 0,
              evidence: {
                patterns: Array.isArray(
                  (gc.golden_circle_what.evidence as any)?.patterns
                )
                  ? (gc.golden_circle_what.evidence as any).patterns
                  : [],
                citations: Array.isArray(
                  (gc.golden_circle_what.evidence as any)?.citations
                )
                  ? (gc.golden_circle_what.evidence as any).citations
                  : [],
              },
              recommendations: Array.isArray(
                gc.golden_circle_what.recommendations
              )
                ? (gc.golden_circle_what.recommendations as string[])
                : [],
            }
          : null,
        who: gc.golden_circle_who
          ? {
              ...gc.golden_circle_who,
              score: gc.golden_circle_who.score
                ? Number(gc.golden_circle_who.score)
                : 0,
              specificity_rating: gc.golden_circle_who.specificity_rating
                ? Number(gc.golden_circle_who.specificity_rating)
                : 0,
              resonance_rating: gc.golden_circle_who.resonance_rating
                ? Number(gc.golden_circle_who.resonance_rating)
                : 0,
              accessibility_rating: gc.golden_circle_who.accessibility_rating
                ? Number(gc.golden_circle_who.accessibility_rating)
                : 0,
              conversion_path_rating: gc.golden_circle_who
                .conversion_path_rating
                ? Number(gc.golden_circle_who.conversion_path_rating)
                : 0,
              evidence: {
                patterns: Array.isArray(
                  (gc.golden_circle_who.evidence as any)?.patterns
                )
                  ? (gc.golden_circle_who.evidence as any).patterns
                  : [],
                citations: Array.isArray(
                  (gc.golden_circle_who.evidence as any)?.citations
                )
                  ? (gc.golden_circle_who.evidence as any).citations
                  : [],
              },
              recommendations: Array.isArray(
                gc.golden_circle_who.recommendations
              )
                ? (gc.golden_circle_who.recommendations as string[])
                : [],
              target_personas: Array.isArray(
                gc.golden_circle_who.target_personas
              )
                ? (gc.golden_circle_who.target_personas as string[])
                : [],
            }
          : null,
      };
    } catch (error) {
      console.error('Failed to fetch Golden Circle:', error);
      return null;
    }
  }
}

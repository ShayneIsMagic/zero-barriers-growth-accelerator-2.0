/**
 * Focused Analysis Service
 * Breaks down complex analysis into smaller, focused prompts for better Gemini responses
 */

import { prisma } from '../prisma';
import { SimpleSynonymDetectionService, PatternMatch } from './simple-synonym-detection.service';

export interface FocusedAnalysisResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class FocusedAnalysisService {
  /**
   * Run focused Golden Circle analysis (WHY only)
   */
  static async analyzeWhy(
    analysisId: string,
    content: any,
    industry?: string
  ): Promise<FocusedAnalysisResult> {
    try {
      const patterns = await SimpleSynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      );

      const prompt = `
Analyze ONLY the WHY dimension of this organization's Golden Circle.

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

FOCUS: WHY - Purpose & Belief
- What is their core purpose/belief?
- Why does this organization exist beyond making money?
- Rate clarity (1-10): How clearly is the WHY communicated?
- Rate authenticity (1-10): Does it feel genuine?
- Rate emotional resonance (1-10): Does it inspire emotion?
- Rate differentiation (1-10): Is it unique vs competitors?

Provide evidence with specific citations from content.
Give 3-5 recommendations for improvement.

Return as JSON:
{
  "statement": "Their core purpose statement",
  "clarity_rating": 8.5,
  "authenticity_rating": 9.0,
  "emotional_resonance_rating": 8.0,
  "differentiation_rating": 7.5,
  "evidence": {
    "citations": ["homepage hero", "about page"],
    "key_phrases": ["specific phrases from content"]
  },
  "recommendations": ["rec1", "rec2", "rec3"]
}
`;

      const aiResponse = await this.callGemini(prompt);
      return { success: true, data: aiResponse };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Run focused Elements of Value analysis (Functional only)
   */
  static async analyzeFunctionalElements(
    analysisId: string,
    content: any,
    industry?: string
  ): Promise<FocusedAnalysisResult> {
    try {
      const patterns = await SimpleSynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      );

      const prompt = `
Analyze ONLY the FUNCTIONAL elements of value (14 elements).

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

FOCUS: FUNCTIONAL ELEMENTS (Pyramid Level 1)
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
13. avoids_hassles - Avoiding or reducing hassles
14. sensory_appeal - Appealing in taste, smell, hearing

For each element:
- Score 0-100 (0 = not present, 100 = strongly present)
- Provide evidence with specific citations
- Note which patterns were detected

Return as JSON:
{
  "overall_score": 85,
  "elements": [
    {
      "element_name": "saves_time",
      "score": 90,
      "evidence": {
        "patterns": ["automation", "fast", "instant"],
        "citations": ["homepage hero", "features section"],
        "confidence": 0.95
      }
    }
  ]
}
`;

      const aiResponse = await this.callGemini(prompt);
      return { success: true, data: aiResponse };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Run focused CliftonStrengths analysis (Strategic Thinking only)
   */
  static async analyzeStrategicThinking(
    analysisId: string,
    content: any,
    industry?: string
  ): Promise<FocusedAnalysisResult> {
    try {
      const themes = await this.getStrategicThinkingThemes();
      const patterns = await SimpleSynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      );

      const prompt = `
Analyze ONLY the Strategic Thinking domain of CliftonStrengths (8 themes).

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

FOCUS: STRATEGIC THINKING THEMES (8 themes)
${themes.map(t => `• ${t.theme_name}: ${t.description}`).join('\n')}

For each theme:
- Score 0-100 based on evidence in content
- Identify specific manifestations (how the theme shows up)
- Provide evidence with citations from the website
- Rank themes (1 = strongest, 8 = weakest)

Return as JSON:
{
  "domain_score": 88,
  "themes": [
    {
      "theme_name": "Strategic",
      "score": 95,
      "rank": 1,
      "manifestation": "Strong evidence of strategic thinking through forward-looking language",
      "evidence": {
        "patterns": ["future-focused", "planning", "strategy"],
        "citations": ["homepage", "about page"]
      }
    }
  ]
}
`;

      const aiResponse = await this.callGemini(prompt);
      return { success: true, data: aiResponse };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Run focused B2B analysis (Table Stakes only)
   */
  static async analyzeTableStakes(
    analysisId: string,
    content: any,
    industry?: string
  ): Promise<FocusedAnalysisResult> {
    try {
      const patterns = await SimpleSynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      );

      const prompt = `
Analyze ONLY the Table Stakes elements of B2B value (4 elements).

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

FOCUS: TABLE STAKES (Must-haves for B2B)
1. meeting_specifications - Conforms to customer's internal specifications
2. acceptable_price - Provides products/services at acceptable price
3. regulatory_compliance - Complies with regulations
4. ethical_standards - Performs activities in ethical manner

For each element:
- Score 0-100 (0 = not present, 100 = strongly present)
- Provide evidence with specific citations
- Note which patterns were detected

Return as JSON:
{
  "overall_score": 90,
  "elements": [
    {
      "element_name": "meeting_specifications",
      "score": 95,
      "evidence": {
        "patterns": ["specifications", "requirements", "standards"],
        "citations": ["technical specs page", "compliance section"],
        "confidence": 0.98
      }
    }
  ]
}
`;

      const aiResponse = await this.callGemini(prompt);
      return { success: true, data: aiResponse };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get Strategic Thinking themes from database
   */
  private static async getStrategicThinkingThemes(): Promise<Array<{ theme_name: string; description: string }>> {
    try {
      // Use Prisma client instead of $queryRaw to avoid prepared statement issues
      const themes = await prisma.clifton_themes_reference.findMany({
        where: { domain: 'strategic_thinking' },
        select: { theme_name: true, description: true },
        orderBy: { theme_name: 'asc' }
      });
      return themes;
    } catch (error) {
      console.error('Failed to get Strategic Thinking themes:', error);
      return [];
    }
  }

  /**
   * Call Gemini AI with focused prompt
   */
  private static async callGemini(prompt: string): Promise<any> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error('Invalid JSON response from Gemini');
    }
  }
}

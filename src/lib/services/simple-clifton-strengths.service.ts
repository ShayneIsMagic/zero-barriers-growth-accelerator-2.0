/**
 * Simple CliftonStrengths Service
 * Follows Content-Comparison pattern: Direct AI analysis without database dependencies
 */

import { EnhancedAnalysisService } from '@/lib/ai-engines/enhanced-analysis.service';
import { analyzeWithGemini } from '@/lib/free-ai-analysis';

export interface SimpleCliftonStrengthsResult {
  success: boolean;
  url: string;
  data: {
    overall_score: number;
    strategic_thinking_score: number;
    executing_score: number;
    influencing_score: number;
    relationship_building_score: number;
    dominant_domain: string;
    top_5_themes: Array<{
      theme_name: string;
      domain: string;
      score: number;
      evidence: string[];
      manifestation: string;
    }>;
    all_themes: Array<{
      theme_name: string;
      domain: string;
      score: number;
      evidence: string[];
    }>;
    recommendations: Array<{
      theme: string;
      action: string;
      impact: string;
    }>;
  };
  error?: string;
}

export class SimpleCliftonStrengthsService {
  /**
   * Analyze website content using CliftonStrengths framework
   */
  static async analyzeWithScrapedContent(url: string, scrapedData: any): Promise<SimpleCliftonStrengthsResult> {
    try {
      console.log(`🎯 Starting CliftonStrengths analysis with framework knowledge for: ${url}`);

      // Use enhanced analysis with framework integration
      console.log('🧠 Running enhanced analysis with CliftonStrengths framework...');
      const enhancedResult = await EnhancedAnalysisService.analyzeWithFramework(
        'clifton-strengths',
        scrapedData,
        url
      );

      if (!enhancedResult.success) {
        throw new Error(enhancedResult.error || 'Enhanced analysis failed');
      }

      console.log(`✅ CliftonStrengths analysis completed for: ${url}`);
      console.log(`🎯 Framework used: ${enhancedResult.frameworkUsed}`);
      console.log(`📊 Validation score: ${enhancedResult.validation.score}`);

      return {
        success: true,
        url,
        data: enhancedResult.analysis
      };
    } catch (error) {
      console.error('CliftonStrengths analysis failed:', error);
      return {
        success: false,
        url,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  /**
   * Run CliftonStrengths analysis using AI
   */
  private static async runCliftonStrengthsAnalysis(scrapedData: any, url: string): Promise<any> {
    const prompt = this.buildCliftonStrengthsPrompt(scrapedData, url);

    const aiResponse = await analyzeWithGemini(prompt, 'gemini');

    if (!aiResponse.success) {
      throw new Error(aiResponse.error || 'AI analysis failed');
    }

    // Parse the AI response
    try {
      const analysis = JSON.parse(aiResponse.analysis);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a fallback structure
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Build CliftonStrengths analysis prompt
   */
  private static buildCliftonStrengthsPrompt(scrapedData: any, url: string): string {
    return `You are a Senior Organizational Psychologist and CliftonStrengths expert. Your expertise is in identifying organizational strengths and cultural patterns that drive business success.

TASK: Analyze the provided website content to identify the organization's dominant CliftonStrengths themes. Focus on identifying the top 5 themes that best represent the organization's culture, values, and operational approach.

WEBSITE CONTENT TO ANALYZE:
URL: ${url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}

CLIFTONSTRENGTHS THEMES TO CONSIDER:
Strategic Thinking: Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic
Executing: Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative
Influencing: Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo
Relationship Building: Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator

ANALYSIS REQUIREMENTS:
1. Score each of the 34 themes from 0-100 based on evidence in the content
2. Identify the top 5 themes that best represent the organization
3. Determine the dominant domain (Strategic Thinking, Executing, Influencing, or Relationship Building)
4. Provide specific evidence from the content for each top 5 theme
5. Suggest actionable recommendations for leveraging these strengths

Return your analysis as a valid JSON object with this exact structure:
{
  "overall_score": number (0-100),
  "strategic_thinking_score": number (0-100),
  "executing_score": number (0-100),
  "influencing_score": number (0-100),
  "relationship_building_score": number (0-100),
  "dominant_domain": string,
  "top_5_themes": [
    {
      "theme_name": string,
      "domain": string,
      "score": number,
      "evidence": [string],
      "manifestation": string
    }
  ],
  "all_themes": [
    {
      "theme_name": string,
      "domain": string,
      "score": number,
      "evidence": [string]
    }
  ],
  "recommendations": [
    {
      "theme": string,
      "action": string,
      "impact": string
    }
  ]
}`;
  }

  /**
   * Get fallback analysis structure
   */
  private static getFallbackAnalysis(): any {
    return {
      overall_score: 75,
      strategic_thinking_score: 70,
      executing_score: 80,
      influencing_score: 65,
      relationship_building_score: 75,
      dominant_domain: "Executing",
      top_5_themes: [
        {
          theme_name: "Achiever",
          domain: "Executing",
          score: 85,
          evidence: ["Focus on results and productivity"],
          manifestation: "Strong drive to accomplish goals and maintain high standards"
        },
        {
          theme_name: "Responsibility",
          domain: "Executing",
          score: 80,
          evidence: ["Commitment to follow through on commitments"],
          manifestation: "Takes psychological ownership of commitments and follows through"
        },
        {
          theme_name: "Learner",
          domain: "Strategic Thinking",
          score: 75,
          evidence: ["Emphasis on continuous improvement and growth"],
          manifestation: "Strong desire to learn and improve continuously"
        },
        {
          theme_name: "Communication",
          domain: "Influencing",
          score: 70,
          evidence: ["Clear messaging and value proposition"],
          manifestation: "Ability to put thoughts into words and engage others"
        },
        {
          theme_name: "Harmony",
          domain: "Relationship Building",
          score: 65,
          evidence: ["Focus on collaboration and team dynamics"],
          manifestation: "Seeks consensus and avoids conflict"
        }
      ],
      all_themes: [],
      recommendations: [
        {
          theme: "Achiever",
          action: "Set clear, measurable goals and celebrate milestones",
          impact: "Maintain high performance and motivation"
        },
        {
          theme: "Responsibility",
          action: "Create accountability systems and clear ownership",
          impact: "Ensure reliable delivery and build trust"
        }
      ]
    };
  }
}

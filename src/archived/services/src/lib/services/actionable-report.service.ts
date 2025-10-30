import { analyzeWithGemini } from '@/lib/free-ai-analysis';

export interface ActionableReportResult {
  success: boolean;
  url: string;
  report: {
    executiveSummary: {
      overallScore: number;
      verdict: string;
      keyInsights: string[];
      immediateActions: string[];
    };
    competitiveAnalysis: {
      currentPosition: string;
      competitorComparison: Array<{
        competitor: string;
        score: number;
        strengths: string[];
        weaknesses: string[];
      }>;
    };
    specificRecommendations: {
      priority1: Array<{
        action: string;
        impact: string;
        effort: 'Low' | 'Medium' | 'High';
        timeline: string;
        copyPasteContent?: string;
      }>;
      priority2: Array<{
        action: string;
        impact: string;
        effort: 'Low' | 'Medium' | 'High';
        timeline: string;
        copyPasteContent?: string;
      }>;
    };
    keywordOpportunities: {
      critical: Array<{
        keyword: string;
        volume: string;
        competition: string;
        opportunity: string;
        suggestedContent: string;
      }>;
      highValue: Array<{
        keyword: string;
        volume: string;
        competition: string;
        opportunity: string;
        suggestedContent: string;
      }>;
    };
    contentGaps: Array<{
      section: string;
      priority: 'Critical' | 'High' | 'Medium';
      currentStatus: string;
      recommendedContent: string;
      copyPasteReady: string;
    }>;
    technicalRecommendations: Array<{
      element: string;
      currentStatus: string;
      recommendation: string;
      implementation: string;
    }>;
    roadmap: {
      month1: string[];
      month2: string[];
      month3: string[];
    };
    expectedResults: {
      month1: string[];
      month3: string[];
      month6: string[];
    };
  };
  error?: string;
}

export class ActionableReportService {
  static async generateComprehensiveReport(
    url: string,
    scrapedContent: any,
    analysisType:
      | 'golden-circle'
      | 'elements-value-b2c'
      | 'elements-value-b2b'
      | 'clifton-strengths'
      | 'seo-analysis'
  ): Promise<ActionableReportResult> {
    try {
      console.log(`📊 Generating actionable report for: ${url}`);

      const prompt = this.buildActionablePrompt(
        url,
        scrapedContent,
        analysisType
      );
      const aiResponse = await analyzeWithGemini(
        prompt,
        `actionable-${analysisType}`
      );

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'AI analysis failed');
      }

      console.log(`✅ Actionable report generated for: ${url}`);

      return {
        success: true,
        url,
        report: aiResponse.analysis,
      };
    } catch (error) {
      console.error('Actionable report generation failed:', error);
      return {
        success: false,
        url,
        report: {} as any,
        error:
          error instanceof Error ? error.message : 'Report generation failed',
      };
    }
  }

  private static buildActionablePrompt(
    url: string,
    scrapedContent: any,
    analysisType: string
  ): string {
    const basePrompt = `
You are a world-class business consultant and marketing strategist. Generate a comprehensive, actionable report for this website that includes specific recommendations, copy-paste content, and implementation roadmaps.

WEBSITE: ${url}
CONTENT: ${scrapedContent.cleanText.substring(0, 4000)}

ANALYSIS TYPE: ${analysisType.toUpperCase()}

REPORT FORMAT REQUIREMENTS:
1. EXECUTIVE SUMMARY with overall score (1-10), verdict, key insights, and immediate actions
2. COMPETITIVE ANALYSIS comparing current position to competitors
3. SPECIFIC RECOMMENDATIONS with Priority 1 (Critical) and Priority 2 (Important) actions
4. KEYWORD OPPORTUNITIES with critical and high-value keywords
5. CONTENT GAPS with specific sections to add/improve
6. TECHNICAL RECOMMENDATIONS for implementation
7. 90-DAY ROADMAP with monthly priorities
8. EXPECTED RESULTS with specific metrics and timelines

OUTPUT FORMAT: Return a JSON object with this exact structure:
{
  "executiveSummary": {
    "overallScore": 7.2,
    "verdict": "Strong foundation with significant opportunities",
    "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
    "immediateActions": ["Action 1", "Action 2", "Action 3"]
  },
  "competitiveAnalysis": {
    "currentPosition": "Description of current market position",
    "competitorComparison": [
      {
        "competitor": "Competitor Name",
        "score": 6,
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Weakness 1", "Weakness 2"]
      }
    ]
  },
  "specificRecommendations": {
    "priority1": [
      {
        "action": "Specific action to take",
        "impact": "Expected impact on business",
        "effort": "Low/Medium/High",
        "timeline": "1-2 weeks",
        "copyPasteContent": "Ready-to-use content"
      }
    ],
    "priority2": [
      {
        "action": "Secondary action",
        "impact": "Expected impact",
        "effort": "Medium",
        "timeline": "1 month",
        "copyPasteContent": "Ready-to-use content"
      }
    ]
  },
  "keywordOpportunities": {
    "critical": [
      {
        "keyword": "primary keyword",
        "volume": "High/Medium/Low",
        "competition": "High/Medium/Low",
        "opportunity": "Why this matters",
        "suggestedContent": "Content to create"
      }
    ],
    "highValue": [
      {
        "keyword": "secondary keyword",
        "volume": "Medium",
        "competition": "Low",
        "opportunity": "Why valuable",
        "suggestedContent": "Content suggestion"
      }
    ]
  },
  "contentGaps": [
    {
      "section": "Section name",
      "priority": "Critical/High/Medium",
      "currentStatus": "What's missing",
      "recommendedContent": "What to add",
      "copyPasteReady": "Ready-to-use content"
    }
  ],
  "technicalRecommendations": [
    {
      "element": "Technical element",
      "currentStatus": "Current state",
      "recommendation": "What to change",
      "implementation": "How to implement"
    }
  ],
  "roadmap": {
    "month1": ["Task 1", "Task 2", "Task 3"],
    "month2": ["Task 1", "Task 2", "Task 3"],
    "month3": ["Task 1", "Task 2", "Task 3"]
  },
  "expectedResults": {
    "month1": ["Result 1", "Result 2"],
    "month3": ["Result 1", "Result 2"],
    "month6": ["Result 1", "Result 2"]
  }
}

SPECIFIC REQUIREMENTS FOR ${analysisType.toUpperCase()}:

${this.getAnalysisSpecificRequirements(analysisType)}

Make the report highly actionable with:
- Specific, measurable recommendations
- Copy-paste ready content
- Clear implementation steps
- Realistic timelines
- Expected business impact
- Competitive positioning insights

Focus on revenue generation, market positioning, and competitive advantage.
`;

    return basePrompt;
  }

  private static getAnalysisSpecificRequirements(analysisType: string): string {
    switch (analysisType) {
      case 'golden-circle':
        return `
GOLDEN CIRCLE ANALYSIS REQUIREMENTS:
- Analyze WHY (purpose/belief), HOW (process/method), WHAT (products/services), WHO (target audience)
- Provide specific messaging improvements for each element
- Include competitive analysis of messaging vs competitors
- Suggest specific copy changes with before/after examples
- Focus on emotional connection and differentiation
- Include target audience refinement recommendations
- Provide specific value proposition improvements
`;

      case 'elements-value-b2c':
        return `
B2C ELEMENTS OF VALUE ANALYSIS REQUIREMENTS:
- Score each of the 30 Elements of Value (1-10 scale)
- Identify top 5 strongest and weakest elements
- Provide specific content recommendations to improve weak elements
- Include competitive value analysis
- Suggest specific messaging changes
- Focus on emotional and life-changing elements
- Provide copy-paste content for value communication
`;

      case 'elements-value-b2b':
        return `
B2B ELEMENTS OF VALUE ANALYSIS REQUIREMENTS:
- Score each of the 40 B2B Elements of Value (1-10 scale)
- Identify top 5 strongest and weakest elements
- Provide specific content recommendations for B2B buyers
- Include competitive analysis for B2B value
- Suggest specific messaging for different buyer personas
- Focus on functional and ease-of-doing-business elements
- Provide copy-paste content for B2B value communication
`;

      case 'clifton-strengths':
        return `
CLIFTONSTRENGTHS ANALYSIS REQUIREMENTS:
- Analyze Strategic Thinking, Executing, Influencing, and Relationship Building themes
- Identify top 5 strengths and 3 development areas
- Provide specific recommendations for leveraging strengths
- Suggest team building and leadership development opportunities
- Include competitive advantage through strengths
- Focus on how strengths drive business results
- Provide specific action items for strength development
`;

      case 'seo-analysis':
        return `
SEO ANALYSIS REQUIREMENTS:
- Analyze current keyword strategy and opportunities
- Identify critical keywords with high volume and low competition
- Provide specific meta tag recommendations
- Include technical SEO recommendations
- Suggest content gaps and opportunities
- Focus on revenue-generating keywords
- Provide copy-paste ready SEO content
- Include competitive keyword analysis
`;

      default:
        return `
GENERAL ANALYSIS REQUIREMENTS:
- Provide comprehensive business analysis
- Include specific, actionable recommendations
- Focus on revenue generation opportunities
- Include competitive positioning insights
- Provide copy-paste ready content
- Suggest implementation roadmaps
`;
    }
  }
}

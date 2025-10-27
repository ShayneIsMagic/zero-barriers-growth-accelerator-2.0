import { analyzeWithGemini } from '@/lib/free-ai-analysis';

export interface SimpleActionableReport {
  success: boolean;
  url: string;
  report: {
    executiveSummary: {
      overallScore: number;
      verdict: string;
      top3Insights: string[];
      immediateActions: string[];
    };
    criticalKeywords: {
      primary: Array<{
        keyword: string;
        opportunity: string;
        suggestedContent: string;
      }>;
      secondary: Array<{
        keyword: string;
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
    copyPasteContent: {
      metaTitle: string;
      metaDescription: string;
      h1: string;
      keySections: Array<{
        section: string;
        content: string;
      }>;
    };
    roadmap: {
      week1: string[];
      month1: string[];
      month3: string[];
    };
    expectedResults: {
      month1: string[];
      month3: string[];
    };
  };
  error?: string;
}

export class SimpleActionableReportService {
  static async generateReport(
    url: string,
    scrapedContent: any,
    analysisType: 'seo' | 'golden-circle' | 'elements-value' | 'recruitment' = 'seo'
  ): Promise<SimpleActionableReport> {
    try {
      console.log(`📊 Generating simple actionable report for: ${url}`);

      const prompt = this.buildSimplePrompt(url, scrapedContent, analysisType);
      const aiResponse = await analyzeWithGemini(prompt, `simple-actionable-${analysisType}`);

      // The analyzeWithGemini function returns the analysis directly, not wrapped in success/error
      if (!aiResponse) {
        throw new Error('AI analysis returned empty response');
      }

      console.log(`✅ Simple actionable report generated for: ${url}`);

      return {
        success: true,
        url,
        report: aiResponse
      };

    } catch (error) {
      console.error('Simple actionable report generation failed:', error);
      return {
        success: false,
        url,
        report: {} as any,
        error: error instanceof Error ? error.message : 'Report generation failed'
      };
    }
  }

  private static buildSimplePrompt(url: string, scrapedContent: any, analysisType: string): string {
    return `
You are a world-class business consultant. Generate a concise, actionable report for this website.

WEBSITE: ${url}
CONTENT: ${scrapedContent.cleanText.substring(0, 2000)}

ANALYSIS TYPE: ${analysisType.toUpperCase()}

Generate a focused report with specific, actionable recommendations. Return a JSON object with this exact structure:

{
  "executiveSummary": {
    "overallScore": 7.2,
    "verdict": "Strong foundation with significant opportunities",
    "top3Insights": ["Insight 1", "Insight 2", "Insight 3"],
    "immediateActions": ["Action 1", "Action 2", "Action 3"]
  },
  "criticalKeywords": {
    "primary": [
      {
        "keyword": "primary keyword",
        "opportunity": "Why this matters",
        "suggestedContent": "Content to create"
      }
    ],
    "secondary": [
      {
        "keyword": "secondary keyword",
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
  "copyPasteContent": {
    "metaTitle": "Optimized title tag",
    "metaDescription": "Optimized meta description",
    "h1": "Optimized H1 tag",
    "keySections": [
      {
        "section": "Section name",
        "content": "Ready-to-use content"
      }
    ]
  },
  "roadmap": {
    "week1": ["Task 1", "Task 2", "Task 3"],
    "month1": ["Task 1", "Task 2", "Task 3"],
    "month3": ["Task 1", "Task 2", "Task 3"]
  },
  "expectedResults": {
    "month1": ["Result 1", "Result 2"],
    "month3": ["Result 1", "Result 2"]
  }
}

SPECIFIC REQUIREMENTS FOR ${analysisType.toUpperCase()}:

${this.getAnalysisRequirements(analysisType)}

Make the report highly actionable with:
- Specific, measurable recommendations
- Copy-paste ready content
- Clear implementation steps
- Realistic timelines
- Expected business impact

Focus on revenue generation and competitive advantage.
`;
  }

  private static getAnalysisRequirements(analysisType: string): string {
    switch (analysisType) {
      case 'seo':
        return `
SEO ANALYSIS REQUIREMENTS:
- Focus on keyword opportunities and content gaps
- Provide specific meta tag recommendations
- Include technical SEO improvements
- Focus on revenue-generating keywords
- Provide copy-paste ready content
`;

      case 'golden-circle':
        return `
GOLDEN CIRCLE ANALYSIS REQUIREMENTS:
- Analyze WHY (purpose), HOW (process), WHAT (products), WHO (audience)
- Provide specific messaging improvements
- Include competitive positioning insights
- Focus on emotional connection and differentiation
- Provide copy-paste ready messaging
`;

      case 'elements-value':
        return `
ELEMENTS OF VALUE ANALYSIS REQUIREMENTS:
- Score key value elements (1-10 scale)
- Identify strongest and weakest elements
- Provide specific content recommendations
- Focus on emotional and functional value
- Provide copy-paste ready value communication
`;

      case 'recruitment':
        return `
RECRUITMENT ANALYSIS REQUIREMENTS:
- Focus on talent acquisition and employer branding
- Include job-related keyword opportunities
- Provide career page optimization recommendations
- Focus on candidate journey and application funnel
- Provide copy-paste ready job content
`;

      default:
        return `
GENERAL ANALYSIS REQUIREMENTS:
- Provide comprehensive business analysis
- Include specific, actionable recommendations
- Focus on revenue generation opportunities
- Include competitive positioning insights
- Provide copy-paste ready content
`;
    }
  }
}

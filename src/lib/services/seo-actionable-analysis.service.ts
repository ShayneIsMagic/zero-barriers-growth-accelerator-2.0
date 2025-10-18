import { analyzeWithGemini } from '@/lib/free-ai-analysis';

export interface SEOActionableReport {
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
    criticalKeywords: {
      priority1: Array<{
        keyword: string;
        volume: string;
        competition: string;
        opportunity: string;
        suggestedContent: string;
        metaTitle?: string;
        metaDescription?: string;
        h1?: string;
      }>;
      priority2: Array<{
        keyword: string;
        volume: string;
        competition: string;
        opportunity: string;
        suggestedContent: string;
        metaTitle?: string;
        metaDescription?: string;
        h1?: string;
      }>;
    };
    contentGaps: Array<{
      section: string;
      priority: 'Critical' | 'High' | 'Medium';
      currentStatus: string;
      recommendedContent: string;
      copyPasteReady: string;
    }>;
    technicalSEO: Array<{
      element: string;
      currentStatus: string;
      recommendation: string;
      implementation: string;
      codeExample?: string;
    }>;
    copyPasteContent: {
      metaTags: Array<{
        page: string;
        title: string;
        description: string;
        h1: string;
      }>;
      schemaMarkup: Array<{
        type: string;
        implementation: string;
        code: string;
      }>;
      contentSections: Array<{
        section: string;
        content: string;
        placement: string;
      }>;
    };
    postingStrategy: Array<{
      platform: string;
      priority: 'Critical' | 'High' | 'Medium';
      method: string;
      why: string;
      expectedResults: string;
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

export class SEOActionableAnalysisService {
  static async generateSEOReport(
    url: string,
    scrapedContent: any,
    focusArea: 'general' | 'recruitment' | 'local' | 'ecommerce' = 'general'
  ): Promise<SEOActionableReport> {
    try {
      console.log(`🔍 Starting SEO actionable analysis for: ${url}`);
      console.log(`🎯 Focus area: ${focusArea}`);

      const prompt = this.buildSEOPrompt(url, scrapedContent, focusArea);
      const aiResponse = await analyzeWithGemini(prompt, `seo-actionable-${focusArea}`);

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'AI analysis failed');
      }

      console.log(`✅ SEO actionable analysis completed for: ${url}`);

      return {
        success: true,
        _url,
        report: aiResponse.analysis
      };

    } catch (error) {
      console.error('SEO actionable analysis failed:', error);
      return {
        success: false,
        _url,
        report: {} as any,
        error: error instanceof Error ? error.message : 'SEO analysis failed'
      };
    }
  }

  private static buildSEOPrompt(url: string, scrapedContent: any, focusArea: string): string {
    return `
You are a world-class SEO strategist and digital marketing expert. Generate a comprehensive, actionable SEO report that includes specific keyword recommendations, copy-paste content, and implementation roadmaps.

WEBSITE: ${url}
CONTENT: ${scrapedContent.cleanText.substring(0, 4000)}
FOCUS AREA: ${focusArea.toUpperCase()}

REPORT FORMAT REQUIREMENTS:
Generate a detailed SEO analysis with specific, actionable recommendations including:

1. EXECUTIVE SUMMARY with overall SEO score (1-10), verdict, key insights, and immediate actions
2. COMPETITIVE ANALYSIS comparing current SEO position to competitors
3. CRITICAL KEYWORDS with Priority 1 (Critical) and Priority 2 (High Value) keywords
4. CONTENT GAPS with specific sections to add/improve
5. TECHNICAL SEO recommendations with implementation details
6. COPY-PASTE CONTENT including meta tags, schema markup, and content sections
7. POSTING STRATEGY for different platforms
8. 90-DAY ROADMAP with monthly priorities
9. EXPECTED RESULTS with specific metrics and timelines

OUTPUT FORMAT: Return a JSON object with this exact structure:
{
  "executiveSummary": {
    "overallScore": 7.2,
    "verdict": "Strong foundation with significant opportunities",
    "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
    "immediateActions": ["Action 1", "Action 2", "Action 3"]
  },
  "competitiveAnalysis": {
    "currentPosition": "Description of current SEO position",
    "competitorComparison": [
      {
        "competitor": "Competitor Name",
        "score": 6,
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Weakness 1", "Weakness 2"]
      }
    ]
  },
  "criticalKeywords": {
    "priority1": [
      {
        "keyword": "primary keyword",
        "volume": "High/Medium/Low",
        "competition": "High/Medium/Low",
        "opportunity": "Why this matters",
        "suggestedContent": "Content to create",
        "metaTitle": "Optimized title tag",
        "metaDescription": "Optimized meta description",
        "h1": "Optimized H1 tag"
      }
    ],
    "priority2": [
      {
        "keyword": "secondary keyword",
        "volume": "Medium",
        "competition": "Low",
        "opportunity": "Why valuable",
        "suggestedContent": "Content suggestion",
        "metaTitle": "Optimized title tag",
        "metaDescription": "Optimized meta description",
        "h1": "Optimized H1 tag"
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
  "technicalSEO": [
    {
      "element": "Technical element",
      "currentStatus": "Current state",
      "recommendation": "What to change",
      "implementation": "How to implement",
      "codeExample": "Code example if applicable"
    }
  ],
  "copyPasteContent": {
    "metaTags": [
      {
        "page": "Page name",
        "title": "Optimized title",
        "description": "Optimized description",
        "h1": "Optimized H1"
      }
    ],
    "schemaMarkup": [
      {
        "type": "Schema type",
        "implementation": "How to implement",
        "code": "JSON-LD code"
      }
    ],
    "contentSections": [
      {
        "section": "Section name",
        "content": "Ready-to-use content",
        "placement": "Where to place it"
      }
    ]
  },
  "postingStrategy": [
    {
      "platform": "Platform name",
      "priority": "Critical/High/Medium",
      "method": "How to post",
      "why": "Why this platform",
      "expectedResults": "Expected outcomes"
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

SPECIFIC REQUIREMENTS FOR ${focusArea.toUpperCase()}:

${this.getFocusAreaRequirements(focusArea)}

Make the report highly actionable with:
- Specific, measurable SEO recommendations
- Copy-paste ready content (meta tags, schema, content)
- Clear implementation steps with code examples
- Realistic timelines and expected results
- Competitive keyword analysis
- Technical SEO improvements
- Content strategy recommendations

Focus on revenue-generating keywords, competitive advantage, and measurable SEO improvements.
`;
  }

  private static getFocusAreaRequirements(focusArea: string): string {
    switch (focusArea) {
      case 'recruitment':
        return `
RECRUITMENT SEO REQUIREMENTS:
- Focus on job-related keywords and talent acquisition
- Analyze career page optimization opportunities
- Include job posting schema markup
- Provide specific job board posting strategies
- Include employer branding SEO recommendations
- Focus on candidate journey and application funnel
- Include salary and benefits keyword opportunities
- Provide specific job posting optimization recommendations
`;

      case 'local':
        return `
LOCAL SEO REQUIREMENTS:
- Focus on local search optimization
- Include Google Business Profile optimization
- Provide local keyword recommendations
- Include local schema markup (LocalBusiness, etc.)
- Focus on "near me" searches
- Include local directory submission strategies
- Provide local content recommendations
- Include review and reputation management
`;

      case 'ecommerce':
        return `
ECOMMERCE SEO REQUIREMENTS:
- Focus on product and category optimization
- Include ecommerce schema markup (Product, Offer, etc.)
- Provide product page optimization recommendations
- Include shopping feed optimization
- Focus on conversion optimization
- Include category and collection page strategies
- Provide product review optimization
- Include cart and checkout optimization
`;

      default:
        return `
GENERAL SEO REQUIREMENTS:
- Focus on comprehensive SEO optimization
- Include technical SEO improvements
- Provide content strategy recommendations
- Include link building opportunities
- Focus on user experience and Core Web Vitals
- Include mobile optimization
- Provide site architecture improvements
- Include analytics and tracking recommendations
`;
    }
  }
}

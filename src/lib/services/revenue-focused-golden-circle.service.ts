/**
 * Revenue-Focused Golden Circle Analysis Service
 * Focuses on identifying revenue opportunities and calculating potential ROI
 */

import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface RevenueGoldenCircleResult {
  success: boolean;
  url: string;
  data: {
    overall_revenue_potential: number;
    market_opportunity_score: number;
    competitive_advantage_score: number;
    revenue_drivers: {
      why: {
        statement: string;
        revenue_impact: number;
        market_differentiation: number;
        customer_acquisition_potential: number;
        evidence: {
          citations: string[];
          key_phrases: string[];
        };
        revenue_opportunities: string[];
        estimated_roi: string;
      };
      how: {
        statement: string;
        unique_value_proposition: number;
        scalability_potential: number;
        cost_efficiency: number;
        evidence: {
          citations: string[];
          key_phrases: string[];
        };
        revenue_opportunities: string[];
        estimated_roi: string;
      };
      what: {
        statement: string;
        market_demand: number;
        pricing_power: number;
        upsell_potential: number;
        evidence: {
          citations: string[];
          key_phrases: string[];
        };
        revenue_opportunities: string[];
        estimated_roi: string;
      };
      who: {
        statement: string;
        target_personas: string[];
        customer_lifetime_value: number;
        market_size: number;
        conversion_potential: number;
        evidence: {
          citations: string[];
          key_phrases: string[];
        };
        revenue_opportunities: string[];
        estimated_roi: string;
      };
    };
    market_opportunities: Array<{
      opportunity: string;
      market_size: string;
      competition_level: string;
      revenue_potential: string;
      implementation_effort: string;
      timeline: string;
    }>;
    revenue_recommendations: Array<{
      priority: 'High' | 'Medium' | 'Low';
      action: string;
      expected_revenue_impact: string;
      implementation_cost: string;
      timeline: string;
      roi_estimate: string;
    }>;
  };
  error?: string;
}

export class RevenueFocusedGoldenCircleService {
  private static genAI: GoogleGenerativeAI;

  static initialize() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Analyze website for revenue opportunities using Golden Circle framework
   */
  static async analyzeWebsite(url: string): Promise<RevenueGoldenCircleResult> {
    try {
      console.log(`💰 Starting Revenue-Focused Golden Circle analysis for: ${url}`);

      // Step 1: Scrape website content
      console.log('📊 Step 1: Scraping website content...');
      const scrapedData = await scrapeWebsiteContent(url);

      // Step 2: Run revenue-focused AI analysis
      console.log('🤖 Step 2: Running Revenue-Focused Golden Circle AI analysis...');
      const analysisResult = await this.runRevenueGoldenCircleAnalysis(scrapedData, url);

      console.log(`✅ Revenue-Focused Golden Circle analysis completed for: ${url}`);

      return {
        success: true,
        url,
        data: analysisResult
      };

    } catch (error) {
      console.error('Revenue-Focused Golden Circle analysis failed:', error);
      return {
        success: false,
        url,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  /**
   * Run revenue-focused Golden Circle analysis using Gemini AI
   */
  private static async runRevenueGoldenCircleAnalysis(scrapedData: any, url: string): Promise<any> {
    if (!this.genAI) {
      this.initialize();
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = this.buildRevenueGoldenCirclePrompt(scrapedData, url);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Handle JSON wrapped in markdown code blocks
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Gemini Revenue-Focused Golden Circle analysis failed:', error);
      throw new Error('AI analysis failed');
    }
  }

  /**
   * Build revenue-focused Golden Circle prompt using PTCF framework
   */
  private static buildRevenueGoldenCirclePrompt(scrapedData: any, url: string): string {
    // PERSONA: Define the expert role
    const persona = `You are a Senior Business Model Architect and Revenue Growth Strategist. Your expertise is in identifying core business drivers and translating them into specific, high-impact revenue opportunities. You focus on market differentiation, competitive advantage, and ROI-driven recommendations.`;

    // TASK: Define the specific analytical objective
    const task = `Analyze the provided website content to identify the client's Golden Circle (Why, How, What, Who). For each component, assess current strengths, identify revenue opportunities, and calculate potential ROI. Focus on market gaps, competitive advantages, and specific actions that can drive revenue growth.`;

    // CONTEXT: Provide the data to analyze
    const context = `WEBSITE CONTENT TO ANALYZE:
URL: ${url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}

ADDITIONAL CONTEXT:
- Focus on revenue opportunities, not just problems
- Identify market gaps and underserved demand
- Calculate specific ROI estimates for each recommendation
- Prioritize high-impact, low-competition opportunities`;

    // FORMAT: Define the exact output structure
    const format = `Return your analysis as a valid JSON object with this exact structure:
{
  "overall_revenue_potential": number (0-100),
  "market_opportunity_score": number (0-100),
  "competitive_advantage_score": number (0-100),
  "revenue_drivers": {
    "why": {
      "statement": "string",
      "revenue_impact": number (0-10),
      "market_differentiation": number (0-10),
      "customer_acquisition_potential": number (0-10),
      "evidence": {
        "citations": ["string"],
        "key_phrases": ["string"]
      },
      "revenue_opportunities": ["string"],
      "estimated_roi": "string"
    },
    "how": { /* same structure as why */ },
    "what": { /* same structure as why */ },
    "who": {
      "statement": "string",
      "target_personas": ["string"],
      "customer_lifetime_value": number (0-10),
      "market_size": number (0-10),
      "conversion_potential": number (0-10),
      "evidence": {
        "citations": ["string"],
        "key_phrases": ["string"]
      },
      "revenue_opportunities": ["string"],
      "estimated_roi": "string"
    }
  },
  "market_opportunities": [
    {
      "opportunity": "string",
      "market_size": "string",
      "competition_level": "Low|Medium|High",
      "revenue_potential": "string",
      "implementation_effort": "Low|Medium|High",
      "timeline": "string"
    }
  ],
  "revenue_recommendations": [
    {
      "priority": "High|Medium|Low",
      "action": "string",
      "expected_revenue_impact": "string",
      "implementation_cost": "string",
      "timeline": "string",
      "roi_estimate": "string"
    }
  ]
}`;

    // Combine all components
    return `${persona}

${task}

${context}

${format}`;
  }
}

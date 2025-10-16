/**
 * Revenue-Focused Golden Circle Analysis Service
 * Focuses on identifying revenue opportunities and calculating potential ROI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';

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
   * Build revenue-focused Golden Circle prompt
   */
  private static buildRevenueGoldenCirclePrompt(scrapedData: any, url: string): string {
    return `
You are a Senior Revenue Strategy Director. Your goal is to identify revenue opportunities and calculate potential ROI for this business using the Golden Circle framework.

WEBSITE CONTENT:
URL: ${url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}

REVENUE-FOCUSED GOLDEN CIRCLE ANALYSIS:

1. WHY - Revenue-Driving Purpose & Belief
   - What is their core purpose that drives customer acquisition and retention?
   - How does their WHY create competitive advantage and pricing power?
   - Rate revenue impact (1-10): How much does their WHY drive customer willingness to pay?
   - Rate market differentiation (1-10): How unique is their WHY vs competitors?
   - Rate customer acquisition potential (1-10): How compelling is their WHY for new customers?
   - Identify specific revenue opportunities from their WHY
   - Calculate estimated ROI for WHY-based marketing initiatives
   - Provide evidence with specific citations from content

2. HOW - Revenue-Scaling Process/Approach
   - How does their unique approach create scalable revenue opportunities?
   - What makes their HOW defensible and profitable?
   - Rate unique value proposition (1-10): How differentiated is their approach?
   - Rate scalability potential (1-10): Can their HOW scale revenue efficiently?
   - Rate cost efficiency (1-10): How cost-effective is their approach?
   - Identify specific revenue opportunities from their HOW
   - Calculate estimated ROI for HOW-based initiatives
   - Provide evidence with citations

3. WHAT - Revenue-Generating Products/Services
   - What do they offer that has the highest revenue potential?
   - How can their offerings command premium pricing?
   - Rate market demand (1-10): How strong is demand for their offerings?
   - Rate pricing power (1-10): Can they charge premium prices?
   - Rate upsell potential (1-10): What additional revenue can they generate?
   - Identify specific revenue opportunities from their WHAT
   - Calculate estimated ROI for product/service expansion
   - Provide evidence with citations

4. WHO - High-Value Target Audience
   - Who are their most profitable customer segments?
   - How large is their addressable market?
   - Rate customer lifetime value (1-10): How valuable are their customers?
   - Rate market size (1-10): How large is their target market?
   - Rate conversion potential (1-10): How likely are prospects to convert?
   - List 3-5 specific high-value target personas with revenue potential
   - Identify specific revenue opportunities from their WHO
   - Calculate estimated ROI for audience expansion
   - Provide evidence with citations

MARKET OPPORTUNITIES ANALYSIS:
Identify 3-5 specific market opportunities with:
- Opportunity description
- Market size estimate
- Competition level (Low/Medium/High)
- Revenue potential estimate
- Implementation effort (Low/Medium/High)
- Timeline to revenue

REVENUE RECOMMENDATIONS:
Provide 5-7 specific, actionable recommendations with:
- Priority level (High/Medium/Low)
- Specific action to take
- Expected revenue impact
- Implementation cost estimate
- Timeline to implement
- ROI estimate

IMPORTANT:
- Focus on revenue opportunities, not just problems
- Calculate potential ROI for each recommendation
- Identify market gaps and underserved demand
- Prioritize high-impact, low-effort opportunities
- Be specific with revenue estimates and timelines

Return response as valid JSON with this structure:
{
  "overall_revenue_potential": 85,
  "market_opportunity_score": 90,
  "competitive_advantage_score": 80,
  "revenue_drivers": {
    "why": {
      "statement": "...",
      "revenue_impact": 8.5,
      "market_differentiation": 9.0,
      "customer_acquisition_potential": 8.0,
      "evidence": {
        "citations": ["homepage hero", "about page"],
        "key_phrases": ["...", "..."]
      },
      "revenue_opportunities": ["...", "...", "..."],
      "estimated_roi": "300% ROI in 6 months"
    },
    "how": { ... },
    "what": { ... },
    "who": {
      "statement": "...",
      "target_personas": ["High-Value Persona 1", "Enterprise Persona 2"],
      "customer_lifetime_value": 8.5,
      "market_size": 9.0,
      "conversion_potential": 7.5,
      "evidence": {
        "citations": ["testimonials", "case studies"],
        "key_phrases": ["...", "..."]
      },
      "revenue_opportunities": ["...", "...", "..."],
      "estimated_roi": "250% ROI in 4 months"
    }
  },
  "market_opportunities": [
    {
      "opportunity": "Underserved market segment X",
      "market_size": "$50M addressable market",
      "competition_level": "Low",
      "revenue_potential": "$2M annual revenue",
      "implementation_effort": "Medium",
      "timeline": "3-6 months"
    }
  ],
  "revenue_recommendations": [
    {
      "priority": "High",
      "action": "Launch premium tier targeting enterprise customers",
      "expected_revenue_impact": "+$500K annual revenue",
      "implementation_cost": "$50K",
      "timeline": "2-3 months",
      "roi_estimate": "900% ROI"
    }
  ]
}
`;
  }
}

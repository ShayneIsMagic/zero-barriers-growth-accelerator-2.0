/**
 * Revenue-Focused Google Trends Analysis Service
 * Identifies underserved market demand and emerging revenue opportunities
 */

import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface RevenueTrendsResult {
  success: boolean;
  url: string;
  data: {
    market_opportunity_score: number;
    underserved_demand_identified: boolean;
    revenue_opportunity_brief: {
      subject: string;
      identified_topic: string;
      market_size_estimate: string;
      competition_level: 'Low' | 'Medium' | 'High';
      growth_potential: 'High' | 'Medium' | 'Low';
      revenue_opportunities: Array<{
        content_title: string;
        target_audience: string;
        search_volume_estimate: string;
        revenue_potential: string;
        implementation_effort: 'Low' | 'Medium' | 'High';
        timeline_to_revenue: string;
        estimated_roi: string;
      }>;
    };
    market_gaps: Array<{
      gap: string;
      search_intent: string;
      current_competition: string;
      opportunity_size: string;
      content_angle: string;
      revenue_potential: string;
    }>;
    content_strategy: {
      primary_focus: string;
      secondary_opportunities: string[];
      content_calendar_suggestions: Array<{
        content_type: string;
        topic: string;
        target_audience: string;
        expected_traffic: string;
        revenue_impact: string;
      }>;
    };
    competitive_analysis: {
      market_leaders: string[];
      content_gaps: string[];
      differentiation_opportunities: string[];
      pricing_opportunities: string[];
    };
  };
  error?: string;
}

export class RevenueTrendsAnalysisService {
  private static genAI: GoogleGenerativeAI;

  static initialize() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Analyze website for revenue opportunities using Google Trends data
   */
  static async analyzeWebsite(url: string): Promise<RevenueTrendsResult> {
    try {
      console.log(`💰 Starting Revenue-Focused Trends analysis for: ${url}`);

      // Step 1: Scrape website content
      console.log('📊 Step 1: Scraping website content...');
      const scrapedData = await scrapeWebsiteContent(url);

      // Step 2: Extract core keywords and topics
      console.log('🔍 Step 2: Extracting core keywords and topics...');
      const coreKeywords = this.extractCoreKeywords(scrapedData);

      // Step 3: Run revenue-focused trends analysis
      console.log('🤖 Step 3: Running Revenue-Focused Trends AI analysis...');
      const analysisResult = await this.runRevenueTrendsAnalysis(scrapedData, coreKeywords, url);

      console.log(`✅ Revenue-Focused Trends analysis completed for: ${url}`);

      return {
        success: true,
        _url,
        data: analysisResult
      };

    } catch (error) {
      console.error('Revenue-Focused Trends analysis failed:', error);
      return {
        success: false,
        _url,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  /**
   * Extract core keywords and topics from website content
   */
  private static extractCoreKeywords(scrapedData: any): string[] {
    const keywords: string[] = [];

    // Extract from title
    if (scrapedData.title) {
      const titleWords = scrapedData.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      keywords.push(...titleWords);
    }

    // Extract from headings
    if (scrapedData.headings) {
      const headingWords = scrapedData.headings
        .join(' ')
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      keywords.push(...headingWords);
    }

    // Extract from content
    if (scrapedData.cleanText) {
      const contentWords = scrapedData.cleanText
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 4);
      keywords.push(...contentWords);
    }

    // Get unique keywords and return top 20
    const uniqueKeywords = [...new Set(keywords)];
    return uniqueKeywords.slice(0, 20);
  }

  /**
   * Run revenue-focused trends analysis using Gemini AI
   */
  private static async runRevenueTrendsAnalysis(scrapedData: any, coreKeywords: string[], url: string): Promise<any> {
    if (!this.genAI) {
      this.initialize();
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = this.buildRevenueTrendsPrompt(scrapedData, coreKeywords, url);

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
      console.error('Gemini Revenue-Focused Trends analysis failed:', error);
      throw new Error('AI analysis failed');
    }
  }

  /**
   * Build revenue-focused trends prompt
   */
  private static buildRevenueTrendsPrompt(scrapedData: any, coreKeywords: string[], url: string): string {
    return `
You are a Senior Content Strategy Director. Your goal is to find underserved market demand for the client and identify revenue opportunities through content strategy.

WEBSITE CONTENT:
URL: ${url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}

CORE KEYWORDS IDENTIFIED:
${coreKeywords.join(', ')}

REVENUE-FOCUSED TRENDS ANALYSIS:

TASK: Analyze the core keywords and website content to identify one high-growth/low-competition topic and generate three specific, revenue-driving content ideas that directly address emerging search intent.

MARKET OPPORTUNITY IDENTIFICATION:
1. Analyze the core keywords for market gaps and underserved demand
2. Identify emerging topics that the client can quickly dominate
3. Look for high-growth, low-competition opportunities
4. Focus on search intent that drives revenue, not just traffic

REVENUE OPPORTUNITY BRIEF:
Create a "Client Revenue Opportunity Brief" with:
- Clear Subject (what market opportunity this addresses)
- Identified Topic (specific high-growth/low-competition topic)
- Market size estimate (addressable market size)
- Competition level (Low/Medium/High)
- Growth potential (High/Medium/Low)

CONTENT STRATEGY:
For each content idea, provide:
- Content title (specific, revenue-focused)
- Target audience (e.g., "Beginner B2B", "Enterprise CTOs", "SMB Owners")
- Search volume estimate (Low/Medium/High)
- Revenue potential (specific dollar estimate or percentage)
- Implementation effort (Low/Medium/High)
- Timeline to revenue (specific timeframe)
- Estimated ROI (percentage or multiplier)

MARKET GAPS ANALYSIS:
Identify 3-5 specific market gaps where:
- Search intent exists but content is lacking
- Competition is low but demand is growing
- Client can quickly establish authority
- Revenue potential is high

COMPETITIVE ANALYSIS:
Analyze the competitive landscape for:
- Market leaders in this space
- Content gaps competitors are missing
- Differentiation opportunities
- Pricing opportunities (premium positioning)

CONTENT CALENDAR SUGGESTIONS:
Provide 5-7 specific content ideas with:
- Content type (blog post, video, guide, tool, etc.)
- Topic (specific, searchable topic)
- Target audience (who will pay for this)
- Expected traffic (Low/Medium/High)
- Revenue impact (how this drives sales)

IMPORTANT:
- Focus on revenue opportunities, not just traffic
- Identify underserved demand and market gaps
- Prioritize high-impact, low-competition opportunities
- Be specific with revenue estimates and timelines
- Think like a content strategist, not just a marketer

Return response as valid JSON with this structure:
{
  "market_opportunity_score": 85,
  "underserved_demand_identified": true,
  "revenue_opportunity_brief": {
    "subject": "AI-Powered Business Analysis for SMBs",
    "identified_topic": "automated business framework analysis",
    "market_size_estimate": "$2.5B addressable market",
    "competition_level": "Low",
    "growth_potential": "High",
    "revenue_opportunities": [
      {
        "content_title": "The Complete Guide to AI-Powered Business Analysis for Small Businesses",
        "target_audience": "SMB Owners, Business Consultants",
        "search_volume_estimate": "Medium",
        "revenue_potential": "$50K+ annual revenue",
        "implementation_effort": "Medium",
        "timeline_to_revenue": "3-4 months",
        "estimated_roi": "400% ROI"
      },
      {
        "content_title": "How to Use Golden Circle Framework to Double Your Revenue in 90 Days",
        "target_audience": "Entrepreneurs, Business Coaches",
        "search_volume_estimate": "High",
        "revenue_potential": "$100K+ annual revenue",
        "implementation_effort": "Low",
        "timeline_to_revenue": "2-3 months",
        "estimated_roi": "600% ROI"
      },
      {
        "content_title": "The B2B Value Elements Calculator: Find Your $1M Revenue Opportunity",
        "target_audience": "B2B Sales Teams, Marketing Directors",
        "search_volume_estimate": "Medium",
        "revenue_potential": "$75K+ annual revenue",
        "implementation_effort": "High",
        "timeline_to_revenue": "4-6 months",
        "estimated_roi": "300% ROI"
      }
    ]
  },
  "market_gaps": [
    {
      "gap": "AI-powered business analysis tools for non-technical users",
      "search_intent": "business analysis automation",
      "current_competition": "High-end consulting firms only",
      "opportunity_size": "$500M market gap",
      "content_angle": "Democratizing business analysis through AI",
      "revenue_potential": "$200K+ annual revenue"
    }
  ],
  "content_strategy": {
    "primary_focus": "AI-powered business analysis for SMBs",
    "secondary_opportunities": [
      "Business framework automation",
      "Revenue optimization through AI",
      "Competitive analysis tools"
    ],
    "content_calendar_suggestions": [
      {
        "content_type": "Comprehensive Guide",
        "topic": "AI Business Analysis: Complete SMB Guide",
        "target_audience": "Small Business Owners",
        "expected_traffic": "High",
        "revenue_impact": "$25K+ monthly revenue"
      }
    ]
  },
  "competitive_analysis": {
    "market_leaders": ["McKinsey", "Bain", "BCG"],
    "content_gaps": ["SMB-focused content", "AI automation", "Self-service tools"],
    "differentiation_opportunities": ["AI-powered", "Self-service", "Affordable"],
    "pricing_opportunities": ["Freemium model", "SMB pricing", "Value-based pricing"]
  }
}
`;
  }
}

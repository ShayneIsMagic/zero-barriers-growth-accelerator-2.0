/**
 * Comprehensive Analysis Service
 * Combines direct tool access + Puppeteer scraping for complete analysis
 * Implements the hybrid approach: Option 1 (direct tools) + Option 2 (scraping)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';

export interface ComprehensiveAnalysisResult {
  success: boolean;
  url: string;
  data: {
    // Direct Tool Access (Option 1)
    direct_tools: {
      google_trends_link: string;
      google_analytics_link: string;
      search_console_link: string;
      pagespeed_link: string;
      lighthouse_link: string;
      gtmetrix_link: string;
      webpage_test_link: string;
    };
    
    // Scraped Content Analysis (Option 2)
    content_analysis: {
      golden_circle: any;
      elements_value_b2c: any;
      elements_value_b2b: any;
      clifton_strengths: any;
    };
    
    // Combined Report
    comprehensive_report: {
      quick_wins: Array<{
        category: string;
        action: string;
        impact: 'High' | 'Medium' | 'Low';
        effort: 'Low' | 'Medium' | 'High';
        timeline: string;
        revenue_potential: string;
      }>;
      long_term_wins: Array<{
        category: string;
        strategy: string;
        impact: 'High' | 'Medium' | 'Low';
        effort: 'Low' | 'Medium' | 'High';
        timeline: string;
        revenue_potential: string;
      }>;
      overall_score: number;
      priority_recommendations: string[];
    };
  };
  error?: string;
}

export class ComprehensiveAnalysisService {
  private static genAI: GoogleGenerativeAI;

  static initialize() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Run comprehensive analysis using hybrid approach
   */
  static async analyzeWebsite(url: string): Promise<ComprehensiveAnalysisResult> {
    try {
      console.log(`🔍 Starting comprehensive analysis for: ${url}`);

      // Step 1: Generate direct tool links (Option 1)
      const directTools = this.generateDirectToolLinks(url);

      // Step 2: Scrape content for analysis (Option 2)
      console.log('📊 Step 2: Scraping website content...');
      const scrapedData = await scrapeWebsiteContent(url);

      // Step 3: Run content analysis using PTCF framework
      console.log('🤖 Step 3: Running content analysis...');
      const contentAnalysis = await this.runContentAnalysis(scrapedData, url);

      // Step 4: Generate comprehensive report
      console.log('📋 Step 4: Generating comprehensive report...');
      const comprehensiveReport = await this.generateComprehensiveReport(
        contentAnalysis,
        directTools,
        url
      );

      console.log(`✅ Comprehensive analysis completed for: ${url}`);

      return {
        success: true,
        url,
        data: {
          direct_tools: directTools,
          content_analysis: contentAnalysis,
          comprehensive_report: comprehensiveReport
        }
      };

    } catch (error) {
      console.error('Comprehensive analysis failed:', error);
      return {
        success: false,
        url,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  /**
   * Generate direct tool links (Option 1)
   */
  private static generateDirectToolLinks(url: string): any {
    const domain = this.extractDomain(url);
    const keywords = this.extractKeywordsFromUrl(url);

    return {
      google_trends_link: `https://trends.google.com/trends/explore?q=${encodeURIComponent(keywords)}`,
      google_analytics_link: `https://analytics.google.com/analytics/web/`,
      search_console_link: `https://search.google.com/search-console/performance/search-analytics?resource_id=${encodeURIComponent(`sc-domain:${domain}`)}`,
      pagespeed_link: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`,
      lighthouse_link: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`,
      gtmetrix_link: `https://gtmetrix.com/analyze.html?url=${encodeURIComponent(url)}`,
      webpage_test_link: `https://www.webpagetest.org/result/?url=${encodeURIComponent(url)}`
    };
  }

  /**
   * Run content analysis using PTCF framework (Option 2)
   */
  private static async runContentAnalysis(scrapedData: any, url: string): Promise<any> {
    if (!this.genAI) {
      this.initialize();
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Run all analyses in parallel
    const [goldenCircle, elementsB2C, elementsB2B, cliftonStrengths] = await Promise.all([
      this.runGoldenCircleAnalysis(scrapedData, url, model),
      this.runElementsValueB2CAnalysis(scrapedData, url, model),
      this.runElementsValueB2BAnalysis(scrapedData, url, model),
      this.runCliftonStrengthsAnalysis(scrapedData, url, model)
    ]);

    return {
      golden_circle: goldenCircle,
      elements_value_b2c: elementsB2C,
      elements_value_b2b: elementsB2B,
      clifton_strengths: cliftonStrengths
    };
  }

  /**
   * Run Golden Circle analysis using PTCF
   */
  private static async runGoldenCircleAnalysis(scrapedData: any, url: string, model: any): Promise<any> {
    const persona = `You are a Senior Business Model Architect and Revenue Growth Strategist. Your expertise is in identifying core business drivers and translating them into specific, high-impact revenue opportunities.`;
    
    const task = `Analyze the provided website content to identify the client's Golden Circle (Why, How, What, Who). For each component, assess current strengths, identify revenue opportunities, and calculate potential ROI.`;
    
    const context = `WEBSITE CONTENT TO ANALYZE:
URL: ${url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}`;
    
    const format = `Return as JSON with: overall_revenue_potential, market_opportunity_score, revenue_drivers (why, how, what, who), market_opportunities, revenue_recommendations`;

    const prompt = `${persona}\n\n${task}\n\n${context}\n\n${format}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Golden Circle analysis failed:', error);
      return { error: 'Golden Circle analysis failed' };
    }
  }

  /**
   * Run Elements of Value B2C analysis using PTCF
   */
  private static async runElementsValueB2CAnalysis(scrapedData: any, url: string, model: any): Promise<any> {
    const persona = `You are a Customer Value Expert specializing in B2C value elements. Your goal is to identify which value elements drive the most revenue and customer satisfaction.`;
    
    const task = `Analyze the website content against the 30 B2C Elements of Value. Identify current strengths, revenue opportunities, and recommendations for each element.`;
    
    const context = `WEBSITE CONTENT TO ANALYZE:
URL: ${url}
Title: ${scrapedData.title}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}`;
    
    const format = `Return as JSON with: overall_score, functional_score, emotional_score, life_changing_score, social_impact_score, revenue_opportunities, recommendations`;

    const prompt = `${persona}\n\n${task}\n\n${context}\n\n${format}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Elements B2C analysis failed:', error);
      return { error: 'Elements B2C analysis failed' };
    }
  }

  /**
   * Run Elements of Value B2B analysis using PTCF
   */
  private static async runElementsValueB2BAnalysis(scrapedData: any, url: string, model: any): Promise<any> {
    const persona = `You are a B2B Value Strategy Expert specializing in enterprise value elements. Your goal is to identify which value elements drive the most revenue in B2B contexts.`;
    
    const task = `Analyze the website content against the 40 B2B Elements of Value. Identify current strengths, revenue opportunities, and recommendations for each element.`;
    
    const context = `WEBSITE CONTENT TO ANALYZE:
URL: ${url}
Title: ${scrapedData.title}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}`;
    
    const format = `Return as JSON with: overall_score, table_stakes_score, functional_score, ease_of_doing_business_score, individual_score, inspirational_score, revenue_opportunities, recommendations`;

    const prompt = `${persona}\n\n${task}\n\n${context}\n\n${format}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Elements B2B analysis failed:', error);
      return { error: 'Elements B2B analysis failed' };
    }
  }

  /**
   * Run CliftonStrengths analysis using PTCF
   */
  private static async runCliftonStrengthsAnalysis(scrapedData: any, url: string, model: any): Promise<any> {
    const persona = `You are an Organizational Excellence Expert specializing in CliftonStrengths. Your goal is to identify the organization's core strengths and how they drive business success.`;
    
    const task = `Analyze the website content against the 34 CliftonStrengths themes. Identify the top 5-7 strengths and how they can be leveraged for revenue growth.`;
    
    const context = `WEBSITE CONTENT TO ANALYZE:
URL: ${url}
Title: ${scrapedData.title}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}`;
    
    const format = `Return as JSON with: top_strengths, strength_categories, revenue_opportunities, recommendations`;

    const prompt = `${persona}\n\n${task}\n\n${context}\n\n${format}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('CliftonStrengths analysis failed:', error);
      return { error: 'CliftonStrengths analysis failed' };
    }
  }

  /**
   * Generate comprehensive report combining all analyses
   */
  private static async generateComprehensiveReport(
    contentAnalysis: any,
    directTools: any,
    url: string
  ): Promise<any> {
    if (!this.genAI) {
      this.initialize();
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const persona = `You are a Senior Growth Strategy Director. Your goal is to synthesize multiple analyses into actionable quick wins and long-term strategies.`;
    
    const task = `Based on the content analysis results, create a comprehensive report with quick wins and long-term wins. Prioritize recommendations by impact and effort.`;
    
    const context = `CONTENT ANALYSIS RESULTS:
${JSON.stringify(contentAnalysis, null, 2)}

DIRECT TOOLS AVAILABLE:
${JSON.stringify(directTools, null, 2)}

WEBSITE URL: ${url}`;
    
    const format = `Return as JSON with: quick_wins (array of actions with impact, effort, timeline, revenue_potential), long_term_wins (array of strategies with impact, effort, timeline, revenue_potential), overall_score (0-100), priority_recommendations (array of top 3 recommendations)`;

    const prompt = `${persona}\n\n${task}\n\n${context}\n\n${format}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Comprehensive report generation failed:', error);
      return { error: 'Comprehensive report generation failed' };
    }
  }

  /**
   * Extract domain from URL
   */
  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  /**
   * Extract keywords from URL
   */
  private static extractKeywordsFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/\.(com|org|net|co|io)$/, '');
      return domain.split(/[.-]/).join(' ');
    } catch {
      return url;
    }
  }
}

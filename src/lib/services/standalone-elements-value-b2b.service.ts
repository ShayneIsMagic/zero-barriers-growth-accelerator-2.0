/**
 * Standalone B2B Elements of Value Analysis Service
 * Uses enhanced analysis with framework knowledge
 */

import { EnhancedAnalysisService } from '@/lib/ai-engines/enhanced-analysis.service';
import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';

export interface B2BAnalysisData {
  overall_value_score: number;
  enterprise_sales_potential: number;
  customer_retention_potential: number;
  deal_size_potential: number;
  value_elements: Array<{
    element: string;
    category: string;
    current_strength: number;
    enterprise_potential: string;
    deal_size_impact: string;
    evidence: string[];
    recommendations: string[];
  }>;
  top_5_enterprise_opportunities: Array<{
    element: string;
    enterprise_impact: string;
    implementation_effort: string;
    roi_estimate: string;
    action_plan: string;
  }>;
  enterprise_sales_strategy: {
    recommended_elements: string[];
    deal_size_increase_potential: string;
    target_enterprise_segments: string[];
    implementation_timeline: string;
  };
  customer_retention_strategy: {
    retention_elements: string[];
    churn_reduction_potential: string;
    implementation_effort: string;
    timeline: string;
  };
  revenue_recommendations: Array<{
    recommendation: string;
    value_element: string;
    enterprise_impact: string;
    effort: string;
    timeline: string;
  }>;
}

export interface B2BAnalysisResult {
  success: boolean;
  url: string;
  data: B2BAnalysisData;
  error?: string;
}

export class StandaloneElementsValueB2BService {
  /**
   * Analyze website using URL (scrapes content first)
   */
  static async analyze(url: string): Promise<B2BAnalysisResult> {
    try {
      console.log(`🏢 Starting B2B Elements of Value analysis for: ${url}`);

      // Scrape website content
      console.log('🕷️ Scraping website content...');
      const scrapedData = await scrapeWebsiteContent(url);

      if (!scrapedData) {
        throw new Error('Failed to scrape website content');
      }

      console.log('✅ Content scraped successfully');

      // Analyze with scraped content
      return await this.analyzeWithScrapedContent(url, scrapedData);

    } catch (error) {
      console.error('B2B Elements of Value analysis failed:', error);
      return {
        success: false,
        url,
        data: {} as B2BAnalysisData,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  /**
   * Analyze website using pre-scraped content
   */
  static async analyzeWithScrapedContent(url: string, scrapedData: any): Promise<B2BAnalysisResult> {
    try {
      console.log(`🏢 Starting B2B Elements of Value analysis with framework knowledge for: ${url}`);

      // Use enhanced analysis with framework integration
      console.log('🧠 Running enhanced analysis with B2B Elements of Value framework...');
      const enhancedResult = await EnhancedAnalysisService.analyzeWithFramework(
        'elements-value-b2b',
        scrapedData,
        url
      );

      if (!enhancedResult.success) {
        throw new Error(enhancedResult.error || 'Enhanced analysis failed');
      }

      console.log(`✅ B2B Elements of Value analysis completed for: ${url}`);
      console.log(`🎯 Framework used: ${enhancedResult.frameworkUsed}`);
      console.log(`📊 Validation score: ${enhancedResult.validation.score}`);

      return {
        success: true,
        url,
        data: enhancedResult.analysis
      };

    } catch (error) {
      console.error('B2B Elements of Value analysis failed:', error);
      return {
        success: false,
        url,
        data: {} as B2BAnalysisData,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }
}

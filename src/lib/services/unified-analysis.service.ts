/**
 * Unified Analysis Service
 * Runs multiple assessments from a single website scrape
 */

import { EnhancedAnalysisService } from '@/lib/ai-engines/enhanced-analysis.service';
import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';

export interface UnifiedAnalysisResult {
  success: boolean;
  url: string;
  scrapedData: any;
  analyses: {
    goldenCircle?: any;
    elementsValueB2C?: any;
    elementsValueB2B?: any;
    cliftonStrengths?: any;
  };
  errors: { [key: string]: string };
  completedAnalyses: string[];
  failedAnalyses: string[];
}

export interface AnalysisOptions {
  includeGoldenCircle?: boolean;
  includeElementsValueB2C?: boolean;
  includeElementsValueB2B?: boolean;
  includeCliftonStrengths?: boolean;
}

export class UnifiedAnalysisService {
  /**
   * Run multiple analyses from a single website scrape
   */
  static async analyzeWebsite(
    url: string,
    options: AnalysisOptions = {
      includeGoldenCircle: true,
      includeElementsValueB2C: true,
      includeElementsValueB2B: true,
      includeCliftonStrengths: true,
    }
  ): Promise<UnifiedAnalysisResult> {
    try {
      console.log(`🌐 Starting unified analysis for: ${url}`);

      // Step 1: Scrape website content once
      console.log('🕷️ Step 1: Scraping website content...');
      const scrapedData = await scrapeWebsiteContent(url);

      if (!scrapedData) {
        throw new Error('Failed to scrape website content');
      }

      console.log('✅ Content scraped successfully');
      console.log(
        `📊 Content length: ${scrapedData.cleanText?.length || 0} characters`
      );

      // Step 2: Run multiple analyses in parallel
      console.log('🧠 Step 2: Running multiple analyses in parallel...');

      const analyses: any = {};
      const errors: { [key: string]: string } = {};
      const completedAnalyses: string[] = [];
      const failedAnalyses: string[] = [];

      // Create analysis promises
      const analysisPromises: Array<{ name: string; promise: Promise<any> }> =
        [];

      if (options.includeGoldenCircle) {
        analysisPromises.push({
          name: 'goldenCircle',
          promise: this.runSingleAnalysis('golden-circle', scrapedData, url),
        });
      }

      if (options.includeElementsValueB2C) {
        analysisPromises.push({
          name: 'elementsValueB2C',
          promise: this.runSingleAnalysis(
            'elements-value-b2c',
            scrapedData,
            url
          ),
        });
      }

      if (options.includeElementsValueB2B) {
        analysisPromises.push({
          name: 'elementsValueB2B',
          promise: this.runSingleAnalysis(
            'elements-value-b2b',
            scrapedData,
            url
          ),
        });
      }

      if (options.includeCliftonStrengths) {
        analysisPromises.push({
          name: 'cliftonStrengths',
          promise: this.runSingleAnalysis(
            'clifton-strengths',
            scrapedData,
            url
          ),
        });
      }

      // Run all analyses in parallel
      const results = await Promise.allSettled(
        analysisPromises.map((ap) => ap.promise)
      );

      // Process results
      results.forEach((result, index) => {
        const analysisName = analysisPromises[index].name;

        if (result.status === 'fulfilled' && result.value.success) {
          analyses[analysisName] = result.value.analysis;
          completedAnalyses.push(analysisName);
          console.log(`✅ ${analysisName} analysis completed`);
        } else {
          const error =
            result.status === 'rejected'
              ? result.reason?.message || 'Unknown error'
              : result.value.error || 'Analysis failed';

          errors[analysisName] = error;
          failedAnalyses.push(analysisName);
          console.error(`❌ ${analysisName} analysis failed:`, error);
        }
      });

      console.log(`🎉 Unified analysis completed for: ${url}`);
      console.log(`✅ Completed: ${completedAnalyses.join(', ')}`);
      console.log(`❌ Failed: ${failedAnalyses.join(', ')}`);

      return {
        success: completedAnalyses.length > 0,
        url,
        scrapedData,
        analyses,
        errors,
        completedAnalyses,
        failedAnalyses,
      };
    } catch (error) {
      console.error('Unified analysis failed:', error);
      return {
        success: false,
        url,
        scrapedData: null,
        analyses: {},
        errors: {
          general: error instanceof Error ? error.message : 'Analysis failed',
        },
        completedAnalyses: [],
        failedAnalyses: ['all'],
      };
    }
  }

  /**
   * Run a single analysis type
   */
  private static async runSingleAnalysis(
    assessmentType: string,
    scrapedData: any,
    url: string
  ): Promise<{ success: boolean; analysis: any; error?: string }> {
    try {
      const result = await EnhancedAnalysisService.analyzeWithFramework(
        assessmentType,
        scrapedData,
        url
      );

      return {
        success: result.success,
        analysis: result.analysis,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        analysis: null,
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  /**
   * Get analysis summary
   */
  static getAnalysisSummary(result: UnifiedAnalysisResult): {
    totalAnalyses: number;
    completedCount: number;
    failedCount: number;
    successRate: number;
    availableAnalyses: string[];
  } {
    const totalAnalyses =
      result.completedAnalyses.length + result.failedAnalyses.length;
    const completedCount = result.completedAnalyses.length;
    const failedCount = result.failedAnalyses.length;
    const successRate =
      totalAnalyses > 0 ? (completedCount / totalAnalyses) * 100 : 0;

    return {
      totalAnalyses,
      completedCount,
      failedCount,
      successRate,
      availableAnalyses: result.completedAnalyses,
    };
  }

  /**
   * Generate comprehensive report from all analyses
   */
  static generateComprehensiveReport(result: UnifiedAnalysisResult): {
    executiveSummary: string;
    keyFindings: string[];
    recommendations: string[];
    revenueOpportunities: string[];
    nextSteps: string[];
  } {
    const findings: string[] = [];
    const recommendations: string[] = [];
    const revenueOpportunities: string[] = [];

    // Process Golden Circle results
    if (result.analyses.goldenCircle) {
      const gc = result.analyses.goldenCircle;
      if (gc.overall_revenue_potential) {
        findings.push(
          `Golden Circle analysis shows ${gc.overall_revenue_potential}% revenue potential`
        );
      }
      if (gc.revenue_recommendations) {
        gc.revenue_recommendations.forEach((rec: any) => {
          recommendations.push(`Golden Circle: ${rec.recommendation}`);
        });
      }
    }

    // Process B2C Elements of Value results
    if (result.analyses.elementsValueB2C) {
      const b2c = result.analyses.elementsValueB2C;
      if (b2c.overall_value_score) {
        findings.push(
          `B2C Elements of Value score: ${b2c.overall_value_score}%`
        );
      }
      if (b2c.top_5_opportunities) {
        b2c.top_5_opportunities.forEach((opp: any) => {
          revenueOpportunities.push(
            `B2C: ${opp.element} - ${opp.revenue_impact}`
          );
        });
      }
    }

    // Process B2B Elements of Value results
    if (result.analyses.elementsValueB2B) {
      const b2b = result.analyses.elementsValueB2B;
      if (b2b.overall_value_score) {
        findings.push(
          `B2B Elements of Value score: ${b2b.overall_value_score}%`
        );
      }
      if (b2b.top_5_enterprise_opportunities) {
        b2b.top_5_enterprise_opportunities.forEach((opp: any) => {
          revenueOpportunities.push(
            `B2B: ${opp.element} - ${opp.enterprise_impact}`
          );
        });
      }
    }

    // Process CliftonStrengths results
    if (result.analyses.cliftonStrengths) {
      const cs = result.analyses.cliftonStrengths;
      if (cs.overall_score) {
        findings.push(`CliftonStrengths overall score: ${cs.overall_score}%`);
      }
      if (cs.top_5_themes) {
        findings.push(
          `Top strengths: ${cs.top_5_themes.map((t: any) => t.theme_name).join(', ')}`
        );
      }
    }

    return {
      executiveSummary: `Analysis completed for ${result.url} with ${result.completedAnalyses.length} successful assessments`,
      keyFindings: findings,
      recommendations: recommendations,
      revenueOpportunities: revenueOpportunities,
      nextSteps: [
        'Review detailed analysis results for each framework',
        'Prioritize high-impact revenue opportunities',
        'Develop implementation plan for top recommendations',
        'Monitor progress and adjust strategy based on results',
      ],
    };
  }
}

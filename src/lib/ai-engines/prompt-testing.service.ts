/**
 * Prompt Testing Service
 * A/B tests prompts between Gemini and Claude to determine which performs better
 */

import { analyzeWithGemini, analyzeWithClaude } from '@/lib/free-ai-analysis';

export interface PromptTestResult {
  engine: 'gemini' | 'claude';
  assessmentType: string;
  success: boolean;
  responseTime: number;
  qualityScore: number;
  error?: string;
  analysis?: any;
}

export interface AssessmentRules {
  assessment_name: string;
  version: string;
  description: string;
  persona: string;
  task: string;
  context_template: string;
  format: string;
  max_tokens: number;
  temperature: number;
  client_identifier_template: string;
  success_criteria: string[];
}

export class PromptTestingService {
  /**
   * Load assessment rules from JSON file
   */
  static async loadAssessmentRules(assessmentType: string): Promise<AssessmentRules> {
    try {
      const rules = await import(`./assessment-rules/${assessmentType}-rules.json`);
      return rules.default;
    } catch (error) {
      throw new Error(`Failed to load assessment rules for ${assessmentType}: ${error}`);
    }
  }

  /**
   * Build prompt from rules and data
   */
  static buildPrompt(rules: AssessmentRules, scrapedData: any, url: string): string {
    const context = rules.context_template
      .replace('{url}', url)
      .replace('{title}', scrapedData.title || '')
      .replace('{metaDescription}', scrapedData.metaDescription || '')
      .replace('{content}', scrapedData.cleanText?.substring(0, 4000) || '')
      .replace('{headings}', JSON.stringify(scrapedData.headings || []))
      .replace('{proposedContent}', scrapedData.proposedContent || '')
      .replace('{keywords}', scrapedData.keywords || '')
      .replace('{trendsData}', JSON.stringify(scrapedData.trends || {}))
      .replace('{pageSpeedData}', JSON.stringify(scrapedData.pageSpeed || {}))
      .replace('{searchConsoleData}', JSON.stringify(scrapedData.searchConsole || {}))
      .replace('{analyticsData}', JSON.stringify(scrapedData.analytics || {}));

    return `${rules.persona}\n\n${rules.task}\n\n${context}\n\n${rules.format}`;
  }

  /**
   * Test a single prompt with both engines
   */
  static async testPrompt(
    assessmentType: string,
    scrapedData: any,
    url: string
  ): Promise<{
    gemini: PromptTestResult;
    claude: PromptTestResult;
    comparison: {
      winner: 'gemini' | 'claude' | 'tie';
      geminiAdvantages: string[];
      claudeAdvantages: string[];
      recommendation: string;
    };
  }> {
    const rules = await this.loadAssessmentRules(assessmentType);
    const prompt = this.buildPrompt(rules, scrapedData, url);

    console.log(`🧪 Testing ${assessmentType} prompt with both engines...`);

    // Test Gemini
    const geminiResult = await this.testWithEngine('gemini', prompt, assessmentType);

    // Test Claude (placeholder - would need Claude API integration)
    const claudeResult = await this.testWithEngine('claude', prompt, assessmentType);

    // Compare results
    const comparison = this.compareResults(geminiResult, claudeResult);

    return {
      gemini: geminiResult,
      claude: claudeResult,
      comparison
    };
  }

  /**
   * Test prompt with specific engine
   */
  private static async testWithEngine(
    engine: 'gemini' | 'claude',
    prompt: string,
    assessmentType: string
  ): Promise<PromptTestResult> {
    const startTime = Date.now();

    try {
      let analysis;

      if (engine === 'gemini') {
        const result = await analyzeWithGemini(prompt, 'gemini');
        if (!result.success) {
          throw new Error(result.error || 'Gemini analysis failed');
        }
        analysis = JSON.parse(result.analysis);
      } else {
        // Placeholder for Claude integration
        // In real implementation, this would call Claude API
        analysis = {
          error: 'Claude integration not yet implemented',
          placeholder: true
        };
      }

      const responseTime = Date.now() - startTime;
      const qualityScore = this.calculateQualityScore(analysis, assessmentType);

      return {
        engine,
        assessmentType,
        success: true,
        responseTime,
        qualityScore,
        analysis
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        engine,
        assessmentType,
        success: false,
        responseTime,
        qualityScore: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate quality score based on analysis completeness
   */
  private static calculateQualityScore(analysis: any, assessmentType: string): number {
    if (!analysis || analysis.placeholder) return 0;

    let score = 0;
    const maxScore = 100;

    // Basic structure check
    if (typeof analysis === 'object' && analysis !== null) {
      score += 20;
    }

    // Assessment-specific scoring
    switch (assessmentType) {
      case 'golden-circle':
        if (analysis.overall_revenue_potential !== undefined) score += 20;
        if (analysis.revenue_drivers) score += 20;
        if (analysis.market_opportunities) score += 20;
        if (analysis.revenue_recommendations) score += 20;
        break;

      case 'elements-value-b2c':
        if (analysis.overall_value_score !== undefined) score += 20;
        if (analysis.value_elements) score += 20;
        if (analysis.top_5_opportunities) score += 20;
        if (analysis.premium_pricing_strategy) score += 20;
        if (analysis.revenue_recommendations) score += 20;
        break;

      case 'clifton-strengths':
        if (analysis.overall_score !== undefined) score += 20;
        if (analysis.top_5_themes) score += 20;
        if (analysis.all_themes) score += 20;
        if (analysis.organizational_culture_insights) score += 20;
        if (analysis.recommendations) score += 20;
        break;

      default:
        // Generic scoring
        if (analysis.recommendations) score += 30;
        if (analysis.opportunities) score += 30;
        if (analysis.insights) score += 40;
    }

    return Math.min(score, maxScore);
  }

  /**
   * Compare results between engines
   */
  private static compareResults(
    gemini: PromptTestResult,
    claude: PromptTestResult
  ): {
    winner: 'gemini' | 'claude' | 'tie';
    geminiAdvantages: string[];
    claudeAdvantages: string[];
    recommendation: string;
  } {
    const geminiAdvantages: string[] = [];
    const claudeAdvantages: string[] = [];

    // Compare success rates
    if (gemini.success && !claude.success) {
      geminiAdvantages.push('Reliable execution');
    } else if (!gemini.success && claude.success) {
      claudeAdvantages.push('Reliable execution');
    }

    // Compare response times
    if (gemini.responseTime < claude.responseTime) {
      geminiAdvantages.push('Faster response time');
    } else if (claude.responseTime < gemini.responseTime) {
      claudeAdvantages.push('Faster response time');
    }

    // Compare quality scores
    if (gemini.qualityScore > claude.qualityScore) {
      geminiAdvantages.push('Higher quality analysis');
    } else if (claude.qualityScore > gemini.qualityScore) {
      claudeAdvantages.push('Higher quality analysis');
    }

    // Determine winner
    let winner: 'gemini' | 'claude' | 'tie' = 'tie';
    if (geminiAdvantages.length > claudeAdvantages.length) {
      winner = 'gemini';
    } else if (claudeAdvantages.length > geminiAdvantages.length) {
      winner = 'claude';
    }

    // Generate recommendation
    let recommendation = '';
    if (winner === 'gemini') {
      recommendation = 'Gemini shows better performance for this assessment type. Consider using Gemini as the primary engine.';
    } else if (winner === 'claude') {
      recommendation = 'Claude shows better performance for this assessment type. Consider using Claude as the primary engine.';
    } else {
      recommendation = 'Both engines perform similarly. Consider using Gemini for reliability or Claude for specific use cases.';
    }

    return {
      winner,
      geminiAdvantages,
      claudeAdvantages,
      recommendation
    };
  }

  /**
   * Run comprehensive testing across all assessment types
   */
  static async runComprehensiveTest(
    scrapedData: any,
    url: string
  ): Promise<{
    [assessmentType: string]: {
      gemini: PromptTestResult;
      claude: PromptTestResult;
      comparison: any;
    };
  }> {
    const assessmentTypes = [
      'golden-circle',
      'elements-value-b2c',
      'elements-value-b2b',
      'clifton-strengths',
      'content-comparison',
      'google-tools'
    ];

    const results: any = {};

    for (const assessmentType of assessmentTypes) {
      try {
        console.log(`🧪 Testing ${assessmentType}...`);
        results[assessmentType] = await this.testPrompt(assessmentType, scrapedData, url);
      } catch (error) {
        console.error(`❌ Failed to test ${assessmentType}:`, error);
        results[assessmentType] = {
          error: error instanceof Error ? error.message : 'Test failed'
        };
      }
    }

    return results;
  }
}

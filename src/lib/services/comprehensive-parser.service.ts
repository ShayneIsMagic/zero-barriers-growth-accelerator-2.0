/**
 * Comprehensive Analysis Parser Service
 * Parses comprehensive analysis results to create individual assessment views
 */

export interface ParsedAssessment {
  type: 'golden-circle' | 'b2c-elements' | 'b2b-elements' | 'clifton-strengths' | 'lighthouse' | 'seo';
  data: any;
  score: number;
  status: 'completed' | 'failed' | 'pending';
  error?: string;
}

export class ComprehensiveParserService {
  /**
   * Parse comprehensive analysis results into individual assessments
   */
  static parseComprehensiveResults(comprehensiveData: any): Record<string, ParsedAssessment> {
    const results: Record<string, ParsedAssessment> = {};

    try {
      // Parse Golden Circle Analysis
      if (comprehensiveData.goldenCircle) {
        results['golden-circle'] = {
          type: 'golden-circle',
          data: comprehensiveData.goldenCircle,
          score: comprehensiveData.goldenCircle.overallScore || 0,
          status: 'completed'
        };
      }

      // Parse B2C Elements of Value
      if (comprehensiveData.elementsOfValue) {
        results['b2c-elements'] = {
          type: 'b2c-elements',
          data: comprehensiveData.elementsOfValue,
          score: comprehensiveData.elementsOfValue.overallScore || 0,
          status: 'completed'
        };
      }

      // Parse B2B Elements of Value
      if (comprehensiveData.b2bElements) {
        results['b2b-elements'] = {
          type: 'b2b-elements',
          data: comprehensiveData.b2bElements,
          score: comprehensiveData.b2bElements.overallScore || 0,
          status: 'completed'
        };
      }

      // Parse CliftonStrengths
      if (comprehensiveData.cliftonStrengths) {
        results['clifton-strengths'] = {
          type: 'clifton-strengths',
          data: comprehensiveData.cliftonStrengths,
          score: comprehensiveData.cliftonStrengths.overallScore || 0,
          status: 'completed'
        };
      }

      // Parse Lighthouse Analysis
      if (comprehensiveData.lighthouseAnalysis) {
        results['lighthouse'] = {
          type: 'lighthouse',
          data: comprehensiveData.lighthouseAnalysis,
          score: this.calculateLighthouseScore(comprehensiveData.lighthouseAnalysis),
          status: 'completed'
        };
      }

      // Parse SEO Analysis
      if (comprehensiveData.pageAuditAnalysis) {
        results['seo'] = {
          type: 'seo',
          data: comprehensiveData.pageAuditAnalysis,
          score: this.calculateSEOScore(comprehensiveData.pageAuditAnalysis),
          status: 'completed'
        };
      }

    } catch (error) {
      console.error('Error parsing comprehensive results:', error);
      // Mark all as failed if parsing fails
      Object.keys(results).forEach(key => {
        results[key].status = 'failed';
        results[key].error = 'Failed to parse comprehensive results';
      });
    }

    return results;
  }

  /**
   * Calculate overall Lighthouse score
   */
  private static calculateLighthouseScore(lighthouseData: any): number {
    if (!lighthouseData) return 0;
    
    const scores = [
      lighthouseData.performance || 0,
      lighthouseData.accessibility || 0,
      lighthouseData.bestPractices || 0,
      lighthouseData.seo || 0
    ];
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  /**
   * Calculate overall SEO score
   */
  private static calculateSEOScore(seoData: any): number {
    if (!seoData) return 0;
    
    const scores = [
      seoData.performance || 0,
      seoData.accessibility || 0,
      seoData.bestPractices || 0,
      seoData.seo || 0
    ];
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  /**
   * Get individual assessment by type
   */
  static getIndividualAssessment(comprehensiveData: any, assessmentType: string): ParsedAssessment | null {
    const parsed = this.parseComprehensiveResults(comprehensiveData);
    return parsed[assessmentType] || null;
  }

  /**
   * Get all available assessment types from comprehensive data
   */
  static getAvailableAssessments(comprehensiveData: any): string[] {
    const parsed = this.parseComprehensiveResults(comprehensiveData);
    return Object.keys(parsed);
  }
}

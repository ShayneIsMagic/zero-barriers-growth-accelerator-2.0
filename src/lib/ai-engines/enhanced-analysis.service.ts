/**
 * Enhanced Analysis Service
 * Uses actual framework knowledge for better analysis
 */

import { analyzeWithGemini } from '@/lib/free-ai-analysis';
import { FrameworkIntegrationService } from './framework-integration.service';

export interface EnhancedAnalysisResult {
  success: boolean;
  url: string;
  assessmentType: string;
  analysis: any;
  frameworkUsed: string;
  validation: {
    isValid: boolean;
    score: number;
    missingElements: string[];
    recommendations: string[];
  };
  error?: string;
}

export class EnhancedAnalysisService {
  /**
   * Run analysis with actual framework knowledge
   * Now supports Google Analytics/GA4 best practices and conversion flow optimization
   */
  static async analyzeWithFramework(
    assessmentType: string,
    scrapedData: any,
    url: string,
    options?: {
      selectedPages?: string[];
      includeGoogleAnalytics?: boolean;
      includeConversionFlow?: boolean;
      siteGoals?: string[];
      selectedArchetype?: string;
      selectedAudience?: string;
    }
  ): Promise<EnhancedAnalysisResult> {
    try {
      console.log(
        `🧠 Starting enhanced analysis with framework knowledge for: ${url}`
      );
      console.log(`📊 Assessment type: ${assessmentType}`);
      if (options) {
        console.log(`⚙️ Options:`, JSON.stringify(options, null, 2));
      }

      // Build enhanced prompt with framework knowledge and options
      const enhancedPrompt =
        await FrameworkIntegrationService.buildEnhancedPrompt(
          assessmentType,
          scrapedData,
          url,
          options
        );

      console.log(`📝 Enhanced prompt built with framework knowledge`);

      // Run AI analysis
      const aiResponse = await analyzeWithGemini(
        enhancedPrompt,
        assessmentType
      );

      if (typeof aiResponse.error === 'string' && !aiResponse.analysis) {
        throw new Error(aiResponse.error);
      }

      // Parse the analysis
      let analysis: Record<string, unknown>;
      if (typeof aiResponse.analysis === 'string') {
        try {
          analysis = JSON.parse(aiResponse.analysis) as Record<string, unknown>;
        } catch (parseError) {
          throw new Error(
            `Failed to parse AI response JSON: ${parseError instanceof Error ? parseError.message : 'unknown parse error'}`
          );
        }
      } else if (
        typeof aiResponse.analysis === 'object' &&
        aiResponse.analysis !== null
      ) {
        analysis = aiResponse.analysis;
      } else {
        analysis = aiResponse;
      }

      // Validate against framework criteria
      const validation = await FrameworkIntegrationService.validateAnalysis(
        assessmentType,
        analysis
      );

      console.log(`✅ Enhanced analysis completed for: ${url}`);
      console.log(`🎯 Framework validation score: ${validation.score}`);

      return {
        success: true,
        url,
        assessmentType,
        analysis,
        frameworkUsed: this.getFrameworkName(assessmentType),
        validation,
      };
    } catch (error) {
      console.error('Enhanced analysis failed:', error);
      return {
        success: false,
        url,
        assessmentType,
        analysis: null,
        frameworkUsed: this.getFrameworkName(assessmentType),
        validation: {
          isValid: false,
          score: 0,
          missingElements: [],
          recommendations: [],
        },
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  /**
   * Get framework name from assessment type
   */
  private static getFrameworkName(assessmentType: string): string {
    const frameworkMap: { [key: string]: string } = {
      'golden-circle': 'Golden Circle Framework',
      'elements-value-b2c': 'B2C Elements of Value Framework',
      'elements-value-b2b': 'B2B Elements of Value Framework',
      'clifton-strengths': 'CliftonStrengths Framework',
      'content-comparison': 'Content Comparison Framework',
      'google-tools': 'Google Tools Analysis Framework',
    };

    return frameworkMap[assessmentType] || 'Unknown Framework';
  }

  /**
   * Test framework integration
   */
  static async testFrameworkIntegration(assessmentType: string): Promise<{
    frameworkLoaded: boolean;
    elementsCount: number;
    frameworkName: string;
    error?: string;
  }> {
    try {
      const frameworkName = this.getFrameworkName(assessmentType);
      const elements =
        await FrameworkIntegrationService.getFrameworkElements(assessmentType);

      let elementsCount = 0;
      if (elements) {
        // Count elements based on framework structure
        if (elements.functional_elements?.elements) {
          elementsCount += elements.functional_elements.elements.length;
        }
        if (elements.emotional_elements?.elements) {
          elementsCount += elements.emotional_elements.elements.length;
        }
        if (elements.life_changing_elements?.elements) {
          elementsCount += elements.life_changing_elements.elements.length;
        }
        if (elements.structure) {
          // For frameworks like Golden Circle
          elementsCount = Object.keys(elements.structure).length;
        }
      }

      return {
        frameworkLoaded: true,
        elementsCount,
        frameworkName,
      };
    } catch (error) {
      return {
        frameworkLoaded: false,
        elementsCount: 0,
        frameworkName: 'Unknown',
        error: error instanceof Error ? error.message : 'Framework test failed',
      };
    }
  }
}

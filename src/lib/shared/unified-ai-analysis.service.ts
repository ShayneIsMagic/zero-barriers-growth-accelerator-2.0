/**
 * Unified AI Analysis Service
 * App-wide approach for handling AI analysis uniformly across all assessment frameworks
 * Based on the content-comparison pattern with robust error handling
 */

import { StandardizedDataCollector, StandardizedProposedData, StandardizedWebsiteData } from './standardized-data-collector';

export interface AnalysisFramework {
  name: string;
  description: string;
  elements: string[];
  categories: Record<string, string[]>;
  analysisType: string;
}

export interface AnalysisResult {
  success: boolean;
  data: any;
  error?: string;
  metadata: {
    framework: string;
    analysis_type: 'ai_generated' | 'structured_fallback';
    generated_at: string;
    processing_time_ms: number;
  };
}

export class UnifiedAIAnalysisService {
  /**
   * Run analysis for any framework using the content-comparison approach
   */
  static async runAnalysis(
    framework: AnalysisFramework,
    url: string,
    proposedContent?: string
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      console.log(`🔍 Starting ${framework.name} analysis for: ${url}`);

      // Step 1: Collect standardized website data
      console.log('📊 Step 1: Collecting standardized website data...');
      const existingData = await StandardizedDataCollector.collectWebsiteData(url);

      // Step 2: Process proposed content (if provided)
      let proposedData: StandardizedProposedData | null = null;
      if (proposedContent && proposedContent.trim().length > 0) {
        console.log('📝 Step 2: Processing proposed content...');
        proposedData = StandardizedDataCollector.processProposedContent(proposedContent);
      }

      // Step 3: Generate framework-specific analysis
      console.log(`🤖 Step 3: Running ${framework.name} analysis...`);
      const analysis = await this.generateAnalysis(framework, existingData, proposedData);

      const processingTime = Date.now() - startTime;
      console.log(`✅ ${framework.name} analysis completed in ${processingTime}ms`);

      return {
        success: true,
        data: {
          existing: this.formatExistingData(existingData),
          proposed: proposedData,
          analysis: analysis,
          url,
          framework: framework.name
        },
        metadata: {
          framework: framework.name,
          analysis_type: 'ai_generated',
          generated_at: new Date().toISOString(),
          processing_time_ms: processingTime
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ ${framework.name} analysis failed:`, error);

      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Analysis failed',
        metadata: {
          framework: framework.name,
          analysis_type: 'structured_fallback',
          generated_at: new Date().toISOString(),
          processing_time_ms: processingTime
        }
      };
    }
  }

  /**
   * Generate analysis using AI with proper error handling - NO FALLBACKS
   */
  private static async generateAnalysis(
    framework: AnalysisFramework,
    existingData: StandardizedWebsiteData,
    proposedData: StandardizedProposedData | null
  ): Promise<any> {
    const prompt = StandardizedDataCollector.generateAssessmentPrompt(
      framework.name,
      framework.description,
      framework.elements,
      framework.categories,
      existingData,
      proposedData
    );

    const { analyzeWithGemini } = await import('@/lib/free-ai-analysis');

    // Add timeout wrapper for Gemini API call
    const aiResult = await Promise.race([
      analyzeWithGemini(prompt, framework.analysisType),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI analysis timeout after 20 seconds')), 20000)
      )
    ]);

    return aiResult;
  }


  /**
   * Format existing data for frontend consumption
   */
  private static formatExistingData(existingData: StandardizedWebsiteData) {
    return {
      title: existingData.title,
      metaDescription: existingData.metaDescription,
      wordCount: existingData.wordCount,
      extractedKeywords: existingData.extractedKeywords,
      headings: existingData.headings,
      cleanText: existingData.cleanText,
      url: existingData.url
    };
  }

  /**
   * Format existing data for frontend consumption
   */
  private static formatExistingData(existingData: StandardizedWebsiteData) {
    return {
      title: existingData.title,
      metaDescription: existingData.metaDescription,
      wordCount: existingData.wordCount,
      extractedKeywords: existingData.extractedKeywords,
      headings: existingData.headings,
      cleanText: existingData.cleanText,
      url: existingData.url
    };
  }
}

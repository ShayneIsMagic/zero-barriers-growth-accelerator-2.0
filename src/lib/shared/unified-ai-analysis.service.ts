/**
 * Unified AI Analysis Service
 * App-wide approach for handling AI analysis uniformly across all assessment frameworks
 * Based on the content-comparison pattern with robust error handling
 */

import {
  StandardizedDataCollector,
  StandardizedProposedData,
  StandardizedWebsiteData,
} from './standardized-data-collector';

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

      // Step 1: Scrape website data using the same approach as content-comparison
      console.log('📊 Step 1: Scraping website content...');
      const { UniversalPuppeteerScraper } = await import(
        '@/lib/universal-puppeteer-scraper'
      );
      const scrapedData = await UniversalPuppeteerScraper.scrapeWebsite(url);

      // Transform to standardized format
      const existingData: StandardizedWebsiteData = {
        url,
        title: scrapedData.title || 'Untitled',
        metaDescription: scrapedData.metaDescription || '',
        wordCount: scrapedData.wordCount || 0,
        cleanText: scrapedData.cleanText || '',
        extractedKeywords: scrapedData.seo?.extractedKeywords || [],
        headings: scrapedData.seo?.headings || { h1: [], h2: [], h3: [] },
        seo: {
          metaTitle: scrapedData.title || '',
          metaDescription: scrapedData.metaDescription || '',
          extractedKeywords: scrapedData.seo?.extractedKeywords || [],
          headings: scrapedData.seo?.headings || { h1: [], h2: [], h3: [] },
        },
        business: {
          industry: 'Unknown',
          confidence: 0.5,
          tags: [],
        },
        technical: {
          images: 0,
          links: 0,
          schemaTypes: 0,
        },
        scrapedAt: new Date().toISOString(),
        analysisId: `${framework.name}-${Date.now()}`,
      };

      // Step 2: Process proposed content (if provided)
      let proposedData: StandardizedProposedData | null = null;
      if (proposedContent && proposedContent.trim().length > 0) {
        console.log('📝 Step 2: Processing proposed content...');
        proposedData = {
          cleanText: proposedContent.trim(),
          wordCount: proposedContent.trim().split(/\s+/).length,
          title: UnifiedAIAnalysisService.extractTitle(proposedContent),
          metaDescription:
            UnifiedAIAnalysisService.extractMetaDescription(proposedContent),
          extractedKeywords:
            UnifiedAIAnalysisService.extractKeywordsFromText(proposedContent),
          headings: UnifiedAIAnalysisService.extractHeadings(proposedContent),
        };
      }

      // Step 3: Generate framework-specific analysis
      console.log(`🤖 Step 3: Running ${framework.name} analysis...`);
      const analysis = await this.generateAnalysis(
        framework,
        existingData,
        proposedData
      );

      const processingTime = Date.now() - startTime;
      console.log(
        `✅ ${framework.name} analysis completed in ${processingTime}ms`
      );

      return {
        success: true,
        data: {
          existing: this.formatExistingData(existingData),
          proposed: proposedData,
          analysis: analysis,
          url,
          framework: framework.name,
        },
        metadata: {
          framework: framework.name,
          analysis_type: 'ai_generated',
          generated_at: new Date().toISOString(),
          processing_time_ms: processingTime,
        },
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
          processing_time_ms: processingTime,
        },
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
        setTimeout(
          () => reject(new Error('AI analysis timeout after 20 seconds')),
          20000
        )
      ),
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
      url: existingData.url,
    };
  }

  // Helper methods for proposed content processing
  private static extractTitle(content: string): string {
    const lines = content.split('\n');
    return lines[0]?.trim().substring(0, 60) || 'Proposed Title';
  }

  private static extractMetaDescription(content: string): string {
    const lines = content.split('\n');
    return (
      lines.slice(0, 3).join(' ').trim().substring(0, 160) ||
      'Proposed description'
    );
  }

  private static extractKeywordsFromText(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 4);

    const wordCount: { [key: string]: number } = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private static extractHeadings(content: string) {
    const lines = content.split('\n');
    const h1 = lines
      .filter((line) => line.trim().startsWith('# '))
      .map((line) => line.trim().replace(/^#+\s*/, ''));
    const h2 = lines
      .filter((line) => line.trim().startsWith('## '))
      .map((line) => line.trim().replace(/^#+\s*/, ''));
    const h3 = lines
      .filter((line) => line.trim().startsWith('### '))
      .map((line) => line.trim().replace(/^#+\s*/, ''));

    return {
      h1: h1.slice(0, 10),
      h2: h2.slice(0, 10),
      h3: h3.slice(0, 10),
    };
  }
}

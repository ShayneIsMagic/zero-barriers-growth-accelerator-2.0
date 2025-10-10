/**
 * Three-Phase Website Analysis System
 *
 * Phase 1: Data Collection Foundation
 * - Website scraping and content extraction
 * - PageAudit technical analysis
 * - Lighthouse performance analysis
 * - Generate Phase 1 consolidated report
 *
 * Phase 2: Framework Analysis
 * - Golden Circle analysis (Why, How, What, Who)
 * - Elements of Value analysis (B2C & B2B)
 * - CliftonStrengths analysis
 * - Generate Phase 2 consolidated report
 *
 * Phase 3: Strategic Analysis
 * - Comprehensive insights and recommendations
 * - Performance optimization recommendations
 * - SEO and metadata improvements
 * - Lead generation and sales optimization
 * - Generate Final comprehensive report
 */

import { ProductionExtractionResult } from './production-content-extractor';
import { WebsiteEvaluationFramework } from './website-evaluation-framework';

export interface Phase1Report {
  phase: 'Phase 1: Data Collection Foundation';
  url: string;
  timestamp: string;
  scrapedContent: ProductionExtractionResult;
  pageAuditData: any;
  lighthouseData: any;
  seoAnalysis: any; // Google SEO tools analysis (Search Console, Keyword Planner, Google Trends)
  summary: {
    totalWords: number;
    totalImages: number;
    totalLinks: number;
    seoScore: number;
    performanceScore: number;
    accessibilityScore: number;
    technicalIssues: string[];
    contentIssues: string[];
  };
}

export interface Phase2Report {
  phase: 'Phase 2: Framework Analysis';
  url: string;
  timestamp: string;
  phase1Data: Phase1Report;
  goldenCircle: any;
  elementsOfValue: any;
  b2bElements: any;
  cliftonStrengths: any;
  summary: {
    goldenCircleScore: number;
    elementsOfValueScore: number;
    b2bElementsScore: number;
    cliftonStrengthsScore: number;
    overallFrameworkScore: number;
    keyStrengths: string[];
    keyWeaknesses: string[];
    valueCentricLanguage: string[];
    functionalLanguage: string[];
  };
}

export interface Phase3Report {
  phase: 'Phase 3: Strategic Analysis';
  url: string;
  timestamp: string;
  phase1Data: Phase1Report;
  phase2Data: Phase2Report;
  comprehensiveAnalysis: any;
  finalReport: any;
  summary: {
    overallScore: number;
    primaryRecommendations: string[];
    quickWins: string[];
    longTermImprovements: string[];
    performanceOptimizations: string[];
    seoImprovements: string[];
    leadGenerationImprovements: string[];
    salesOptimizations: string[];
  };
}

export class ThreePhaseAnalyzer {
  private url: string;
  private onProgressUpdate?: (phase: string, step: string, progress: number) => void;

  constructor(url: string, onProgressUpdate?: (phase: string, step: string, progress: number) => void) {
    this.url = url;
    this.onProgressUpdate = onProgressUpdate || (() => {});
  }

  /**
   * Execute the complete 3-phase analysis
   */
  async execute(): Promise<Phase3Report> {
    console.log(`🚀 Starting 3-Phase Analysis for: ${this.url}`);

    // Phase 1: Data Collection Foundation
    const phase1Report = await this.executePhase1();

    // Phase 2: Framework Analysis
    const phase2Report = await this.executePhase2(phase1Report);

    // Phase 3: Strategic Analysis
    const phase3Report = await this.executePhase3(phase1Report, phase2Report);

    console.log(`✅ 3-Phase Analysis completed for: ${this.url}`);
    return phase3Report;
  }

  /**
   * Phase 1: Content Collection ONLY
   * Fast and reliable - just collects website content for Phase 2
   */
  private async executePhase1(): Promise<Phase1Report> {
    console.log('📊 Phase 1: Content Collection (35 seconds)');
    this.onProgressUpdate?.('Phase 1', 'Starting content collection', 0);

    // Step 1: Scrape content (ONLY step in Phase 1 now!)
    this.onProgressUpdate?.('Phase 1', 'Extracting website content and keywords', 30);
    const scrapedContent = await this.scrapeWebsiteContent();

    // Step 2: Quick structure analysis (no external tools)
    this.onProgressUpdate?.('Phase 1', 'Analyzing content structure', 80);
    const contentIssues = this.extractContentIssues(scrapedContent, null);

    // Generate Phase 1 report
    this.onProgressUpdate?.('Phase 1', 'Phase 1 complete', 100);
    const phase1Report: Phase1Report = {
      phase: 'Phase 1: Data Collection Foundation',
      url: this.url,
      timestamp: new Date().toISOString(),
      scrapedContent,
      pageAuditData: null,
      lighthouseData: null, // Moved to Phase 3
      seoAnalysis: null, // Moved to Phase 3
      summary: {
        totalWords: scrapedContent.wordCount || 0,
        totalImages: scrapedContent.imageCount || 0,
        totalLinks: scrapedContent.linkCount || 0,
        seoScore: 0, // Will be in Phase 3 if Lighthouse is run
        performanceScore: 0, // Will be in Phase 3 if Lighthouse is run
        accessibilityScore: 0, // Will be in Phase 3 if Lighthouse is run
        technicalIssues: [],
        contentIssues
      }
    };

    console.log(`✅ Phase 1 completed - Collected ${scrapedContent.wordCount} words, ${scrapedContent.extractedKeywords?.length || 0} keywords`);
    return phase1Report;
  }

  /**
   * Phase 2: Framework Analysis
   */
  private async executePhase2(phase1Report: Phase1Report): Promise<Phase2Report> {
    console.log('🎯 Phase 2: Framework Analysis');
    this.onProgressUpdate?.('Phase 2', 'Starting framework analysis', 0);

    // Step 1: Golden Circle Analysis
    this.onProgressUpdate?.('Phase 2', 'Analyzing Golden Circle', 20);
    const goldenCircle = await this.analyzeGoldenCircle(phase1Report);

    // Step 2: Elements of Value Analysis
    this.onProgressUpdate?.('Phase 2', 'Analyzing Elements of Value', 40);
    const elementsOfValue = await this.analyzeElementsOfValue(phase1Report);

    // Step 3: B2B Elements Analysis
    this.onProgressUpdate?.('Phase 2', 'Analyzing B2B Elements', 60);
    const b2bElements = await this.analyzeB2BElements(phase1Report);

    // Step 4: CliftonStrengths Analysis
    this.onProgressUpdate?.('Phase 2', 'Analyzing CliftonStrengths', 80);
    const cliftonStrengths = await this.analyzeCliftonStrengths(phase1Report);

    // Generate Phase 2 report
    this.onProgressUpdate?.('Phase 2', 'Generating Phase 2 report', 90);
    const phase2Report: Phase2Report = {
      phase: 'Phase 2: Framework Analysis',
      url: this.url,
      timestamp: new Date().toISOString(),
      phase1Data: phase1Report,
      goldenCircle,
      elementsOfValue,
      b2bElements,
      cliftonStrengths,
      summary: {
        goldenCircleScore: goldenCircle?.overallScore || 0,
        elementsOfValueScore: elementsOfValue?.overallScore || 0,
        b2bElementsScore: b2bElements?.overallScore || 0,
        cliftonStrengthsScore: cliftonStrengths?.overallScore || 0,
        overallFrameworkScore: this.calculateOverallFrameworkScore(goldenCircle, elementsOfValue, b2bElements, cliftonStrengths),
        keyStrengths: this.extractKeyStrengths(goldenCircle, elementsOfValue, b2bElements, cliftonStrengths),
        keyWeaknesses: this.extractKeyWeaknesses(goldenCircle, elementsOfValue, b2bElements, cliftonStrengths),
        valueCentricLanguage: this.extractValueCentricLanguage(phase1Report.scrapedContent),
        functionalLanguage: this.extractFunctionalLanguage(phase1Report.scrapedContent)
      }
    };

    this.onProgressUpdate?.('Phase 2', 'Phase 2 completed', 100);
    console.log('✅ Phase 2 completed');
    return phase2Report;
  }

  /**
   * Phase 3: Strategic Analysis + Optional Performance & SEO Data
   * Tries to get Lighthouse and Google Trends via APIs (graceful failure)
   */
  private async executePhase3(phase1Report: Phase1Report, phase2Report: Phase2Report): Promise<Phase3Report> {
    console.log('🎯 Phase 3: Strategic Analysis with optional Lighthouse & Google Tools');
    this.onProgressUpdate?.('Phase 3', 'Starting strategic analysis', 0);

    // Step 1: Try to get Lighthouse data via PageSpeed Insights API (graceful failure)
    this.onProgressUpdate?.('Phase 3', 'Collecting Lighthouse performance data (optional)', 15);
    let lighthouseData = null;
    try {
      console.log('⚡ Trying PageSpeed Insights API for Lighthouse...');
      const lighthouseResponse = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(this.url)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`);
      if (lighthouseResponse.ok) {
        const lighthouseResult = await lighthouseResponse.json();
        const lhr = lighthouseResult.lighthouseResult;
        lighthouseData = {
          scores: {
            performance: Math.round((lhr.categories.performance?.score || 0) * 100),
            accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
            bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
            seo: Math.round((lhr.categories.seo?.score || 0) * 100)
          }
        };
        console.log(`✅ Lighthouse data collected - Performance: ${lighthouseData.scores.performance}/100`);
      }
    } catch (error) {
      console.log('⚠️ Lighthouse not available - will generate recommendations without it');
    }

    // Step 2: Try to get Google Trends data (graceful failure)
    this.onProgressUpdate?.('Phase 3', 'Collecting Google Trends SEO data (optional)', 30);
    let trendsData = null;
    try {
      if (phase1Report.scrapedContent.extractedKeywords && phase1Report.scrapedContent.extractedKeywords.length > 0) {
        console.log('🔍 Trying Google Trends API...');
        const googleTrends = require('google-trends-api');
        const keyword = phase1Report.scrapedContent.extractedKeywords[0];
        
        // Get related queries
        const relatedQueriesResult = await googleTrends.relatedQueries({
          keyword,
          startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        });
        
        const relatedParsed = JSON.parse(relatedQueriesResult);
        const topQueries = relatedParsed.default?.rankedList?.[0]?.rankedKeyword || [];
        const risingQueries = relatedParsed.default?.rankedList?.[1]?.rankedKeyword || [];
        
        trendsData = {
          keyword,
          relatedQueries: topQueries.slice(0, 5).map((q: any) => q.topic?.title || q.query),
          risingQueries: risingQueries.slice(0, 5).map((q: any) => q.topic?.title || q.query),
          overallScore: 75 // Placeholder score
        };
        
        console.log(`✅ Google Trends data collected - ${trendsData.relatedQueries.length} related queries found`);
      }
    } catch (error) {
      console.log('⚠️ Google Trends not available - will generate recommendations without it');
    }

    // Step 3: Create enhanced Phase 1 report with optional data
    const enhancedPhase1Report = {
      ...phase1Report,
      lighthouseData,
      seoAnalysis: trendsData
    };

    // Step 4: Generate Comprehensive Analysis
    this.onProgressUpdate?.('Phase 3', 'Generating comprehensive strategic analysis', 60);
    const comprehensiveAnalysis = await this.generateComprehensiveAnalysis(enhancedPhase1Report, phase2Report);

    // Step 5: Generate Final Report
    this.onProgressUpdate?.('Phase 3', 'Generating final strategic report', 85);
    const finalReport = await this.generateFinalReport(enhancedPhase1Report, phase2Report, comprehensiveAnalysis);

    const phase3Report: Phase3Report = {
      phase: 'Phase 3: Strategic Analysis',
      url: this.url,
      timestamp: new Date().toISOString(),
      phase1Data: enhancedPhase1Report,
      phase2Data: phase2Report,
      comprehensiveAnalysis,
      finalReport,
      summary: {
        overallScore: this.calculateOverallScore(enhancedPhase1Report, phase2Report),
        primaryRecommendations: comprehensiveAnalysis?.primaryRecommendations || [],
        quickWins: comprehensiveAnalysis?.quickWins || [],
        longTermImprovements: comprehensiveAnalysis?.longTermImprovements || [],
        performanceOptimizations: comprehensiveAnalysis?.performanceOptimizations || [],
        seoImprovements: comprehensiveAnalysis?.seoImprovements || [],
        leadGenerationImprovements: comprehensiveAnalysis?.leadGenerationImprovements || [],
        salesOptimizations: comprehensiveAnalysis?.salesOptimizations || []
      }
    };

    this.onProgressUpdate?.('Phase 3', 'Phase 3 completed', 100);
    
    const dataStatus = lighthouseData ? '✅ with Lighthouse' : '⚠️ framework-only';
    console.log(`✅ Phase 3 completed ${dataStatus}`);
    
    return phase3Report;
  }

  // Helper methods for data collection
  private async scrapeWebsiteContent(): Promise<ProductionExtractionResult> {
    console.log(`📊 Step 1: Gathering website content and meta tags...`);

    try {
      // Use reliable Puppeteer-based scraper
      const { scrapeWebsiteContent } = await import('./reliable-content-scraper');
      const scrapedData = await scrapeWebsiteContent(this.url);

      // Convert to ProductionExtractionResult format
      return {
        content: scrapedData.cleanText,
        title: scrapedData.title,
        metaDescription: scrapedData.metaDescription,
        wordCount: scrapedData.wordCount,
        imageCount: scrapedData.imageCount,
        linkCount: scrapedData.linkCount,
        headingCount: (scrapedData.headings?.h1?.length || 0) +
                     (scrapedData.headings?.h2?.length || 0) +
                     (scrapedData.headings?.h3?.length || 0),
        paragraphCount: Math.floor(scrapedData.wordCount / 50),
        listCount: 0,
        formCount: 0,
        videoCount: 0,
        socialMediaLinks: [],
        contactInfo: { phone: [], email: [], address: [] },
        technicalInfo: {
          loadTime: scrapedData.loadTime,
          hasSSL: scrapedData.hasSSL,
          mobileFriendly: true,
          hasSchema: scrapedData.schemaTypes.length > 0,
          viewport: { width: 1920, height: 1080 }
        },
        extractedAt: scrapedData.timestamp,
        method: 'fetch',
        // Add new fields for better analysis
        metaKeywords: scrapedData.metaKeywords,
        extractedKeywords: scrapedData.extractedKeywords,
        topicClusters: scrapedData.topicClusters,
        headings: scrapedData.headings,
        ogTitle: scrapedData.ogTitle,
        ogDescription: scrapedData.ogDescription,
        schemaTypes: scrapedData.schemaTypes
      } as any;

    } catch (error) {
      console.error('❌ Content scraping failed:', error);
      throw new Error(`Failed to gather website content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run Lighthouse performance analysis
   */
  private async runLighthouseAnalysis(): Promise<any> {
    try {
      console.log('🔍 Running Lighthouse analysis...');
      const scriptPath = path.join(process.cwd(), 'scripts', 'lighthouse-per-page.js');
      const command = `node "${scriptPath}" "${this.url}"`;

      const { stdout } = await this.execAsync(command, {
        timeout: 120000,
        maxBuffer: 1024 * 1024 * 10
      });

      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log(`✅ Lighthouse completed - Performance: ${result.scores?.performance || 'N/A'}`);
        return result;
      }

      console.warn('Lighthouse: No valid JSON output');
      return null;
    } catch (error) {
      console.error('Lighthouse failed:', error);
      return null;
    }
  }

  /**
   * Collect Google Tools data (Search Console, Trends, etc.)
   * Uses basic scraping - manual prompts provided if fails
   */
  private async collectGoogleToolsData(): Promise<any> {
    try {
      console.log('🔍 Collecting Google Tools data...');

      // Basic keyword extraction from content
      const scrapedContent = await this.scrapeWebsiteContent();
      const keywords = this.extractKeywordsFromContent(scrapedContent);

      return {
        keywords: keywords,
        overallScore: 0,
        note: 'Use manual Google Tools prompts for full data',
        extractedKeywords: keywords
      };
    } catch (error) {
      console.error('Google Tools data collection failed:', error);
      return null;
    }
  }

  /**
   * Extract keywords from content for Google Tools
   */
  private extractKeywordsFromContent(content: ProductionExtractionResult): string[] {
    const keywords: string[] = [];

    if (content.title) {
      const titleWords = content.title.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
      keywords.push(...titleWords);
    }

    if (content.metaDescription) {
      const descWords = content.metaDescription.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
      keywords.push(...descWords);
    }

    const uniqueKeywords = [...new Set(keywords)];
    return uniqueKeywords.slice(0, 20);
  }

  private async execAsync(command: string, options: any): Promise<any> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    return execAsync(command, options);
  }

  private async runScript(scriptPath: string, args: string[]): Promise<any> {
    const { spawn } = require('child_process');
    return new Promise((resolve, reject) => {
      const child = spawn('node', [scriptPath, ...args], { stdio: 'pipe' });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      child.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      child.on('close', (code: number) => {
        if (code === 0) {
          try {
            // Find the JSON output in the script output
            const lines = output.split('\n');
            const jsonLine = lines.find(line => line.trim().startsWith('{'));

            if (jsonLine) {
              const result = JSON.parse(jsonLine);
              resolve(result);
            } else {
              console.warn('No valid JSON found in script output');
              resolve({ error: 'No valid JSON output found', rawOutput: output });
            }
          } catch (error) {
            console.warn(`Failed to parse script output: ${error}`);
            resolve({ error: 'Failed to parse output', rawOutput: output });
          }
        } else {
          console.warn(`Script failed with code ${code}: ${errorOutput}`);
          resolve({ error: errorOutput, code });
        }
      });
    });
  }

  // Helper methods for analysis
  private async analyzeGoldenCircle(phase1Report: Phase1Report): Promise<any> {
    const { analyzeWithGemini } = await import('./free-ai-analysis');
    const prompt = this.createGoldenCirclePrompt(phase1Report);
    return await analyzeWithGemini(prompt, 'golden-circle');
  }

  private async analyzeElementsOfValue(phase1Report: Phase1Report): Promise<any> {
    const { analyzeWithGemini } = await import('./free-ai-analysis');
    const prompt = this.createElementsOfValuePrompt(phase1Report);
    return await analyzeWithGemini(prompt, 'elements-of-value');
  }

  private async analyzeB2BElements(phase1Report: Phase1Report): Promise<any> {
    const { analyzeWithGemini } = await import('./free-ai-analysis');
    const prompt = this.createB2BElementsPrompt(phase1Report);
    return await analyzeWithGemini(prompt, 'b2b-elements');
  }

  private async analyzeCliftonStrengths(phase1Report: Phase1Report): Promise<any> {
    const { analyzeWithGemini } = await import('./free-ai-analysis');
    const prompt = this.createCliftonStrengthsPrompt(phase1Report);
    return await analyzeWithGemini(prompt, 'clifton-strengths');
  }

  private async generateComprehensiveAnalysis(phase1Report: Phase1Report, phase2Report: Phase2Report): Promise<any> {
    console.log('🎯 Running comprehensive website evaluation framework...');

    // Use the comprehensive evaluation framework
    const evaluator = new WebsiteEvaluationFramework(
      this.url,
      phase1Report.scrapedContent,
      phase1Report.lighthouseData,
      phase1Report.pageAuditData
    );

    const evaluationResult = await evaluator.evaluate();

    // Combine with Gemini analysis for deeper insights
    try {
      const { analyzeWithGemini } = await import('./free-ai-analysis');
      const prompt = this.createComprehensiveAnalysisPrompt(phase1Report, phase2Report);
      const geminiInsights = await analyzeWithGemini(prompt, 'comprehensive-analysis');

      return {
        evaluationFramework: evaluationResult,
        geminiInsights: geminiInsights,
        combinedRecommendations: this.combineRecommendations(evaluationResult, geminiInsights)
      };
    } catch (error) {
      console.warn('Gemini analysis failed, using evaluation framework only:', error);
      return {
        evaluationFramework: evaluationResult,
        geminiInsights: null,
        combinedRecommendations: evaluationResult.priorityRecommendations
      };
    }
  }

  private async generateFinalReport(phase1Report: Phase1Report, phase2Report: Phase2Report, comprehensiveAnalysis: any): Promise<any> {
    const evaluationResult = comprehensiveAnalysis?.evaluationFramework;

    return {
      url: this.url,
      timestamp: new Date().toISOString(),
      phase1: phase1Report,
      phase2: phase2Report,
      comprehensiveAnalysis,
      evaluationFramework: evaluationResult,
      overallScore: evaluationResult?.overallScore || this.calculateOverallScore(phase1Report, phase2Report),
      rating: evaluationResult?.rating || 'Not Rated',
      executiveSummary: this.generateExecutiveSummary(phase1Report, phase2Report, comprehensiveAnalysis),
      detailedScores: {
        firstImpression: evaluationResult?.categoryScores?.firstImpression?.score || 0,
        coreMessaging: evaluationResult?.categoryScores?.coreMessaging?.score || 0,
        technicalPerformance: evaluationResult?.categoryScores?.technicalPerformance?.score || 0,
        accessibility: evaluationResult?.categoryScores?.accessibility?.score || 0,
        conversionOptimization: evaluationResult?.categoryScores?.conversionOptimization?.score || 0,
        contentQuality: evaluationResult?.categoryScores?.contentQuality?.score || 0,
        userExperience: evaluationResult?.categoryScores?.userExperience?.score || 0,
        socialPresence: evaluationResult?.categoryScores?.socialPresence?.score || 0,
        analyticsTracking: evaluationResult?.categoryScores?.analyticsTracking?.score || 0,
        securityCompliance: evaluationResult?.categoryScores?.securityCompliance?.score || 0
      }
    };
  }

  // Prompt creation methods
  private createGoldenCirclePrompt(phase1Report: Phase1Report): string {
    const { scrapedContent } = phase1Report;
    return `
Analyze the website content for Golden Circle framework (Why, How, What, Who):

URL: ${this.url}
Content: ${scrapedContent.content?.substring(0, 2000)}...
Title: ${scrapedContent.title}
Meta Description: ${scrapedContent.metaDescription}

Extract:
1. WHY (dominant purpose) - exact quotes from website
2. HOW (unique methodology) - exact quotes about their approach
3. WHAT (products/services) - exact list of offerings
4. WHO (target audience) - exact quotes about their market

Return JSON format with specific quotes and evidence.
    `.trim();
  }

  private createElementsOfValuePrompt(phase1Report: Phase1Report): string {
    const { scrapedContent } = phase1Report;
    return `
Analyze the website content for B2C Elements of Value (30 elements):

URL: ${this.url}
Content: ${scrapedContent.content?.substring(0, 2000)}...

Evaluate each of the 30 B2C Elements of Value and provide specific evidence from the content.

Return JSON format with scores and evidence for each element.
    `.trim();
  }

  private createB2BElementsPrompt(phase1Report: Phase1Report): string {
    const { scrapedContent } = phase1Report;
    return `
Analyze the website content for B2B Elements of Value (40 elements):

URL: ${this.url}
Content: ${scrapedContent.content?.substring(0, 2000)}...

Evaluate each of the 40 B2B Elements of Value and provide specific evidence from the content.

Return JSON format with scores and evidence for each element.
    `.trim();
  }

  private createCliftonStrengthsPrompt(phase1Report: Phase1Report): string {
    const { scrapedContent } = phase1Report;
    return `
Analyze the website content for CliftonStrengths (34 themes):

URL: ${this.url}
Content: ${scrapedContent.content?.substring(0, 2000)}...

Evaluate each of the 34 CliftonStrengths themes and provide specific evidence from the content.

Return JSON format with scores and evidence for each theme.
    `.trim();
  }

  private createComprehensiveAnalysisPrompt(phase1Report: Phase1Report, phase2Report: Phase2Report): string {
    return `
Comprehensive Strategic Analysis:

Phase 1 Data:
- SEO Score: ${phase1Report.summary.seoScore}/100
- Performance Score: ${phase1Report.summary.performanceScore}/100
- Content: ${phase1Report.summary.totalWords} words, ${phase1Report.summary.totalImages} images

Phase 2 Data:
- Golden Circle Score: ${phase2Report.summary.goldenCircleScore}/100
- Elements of Value Score: ${phase2Report.summary.elementsOfValueScore}/100
- B2B Elements Score: ${phase2Report.summary.b2bElementsScore}/100
- CliftonStrengths Score: ${phase2Report.summary.cliftonStrengthsScore}/100

Provide comprehensive recommendations for:
1. Performance optimization
2. SEO improvements
3. Lead generation improvements
4. Sales optimization
5. Overall business growth

Return JSON format with specific, actionable recommendations.
    `.trim();
  }

  // Helper methods for calculations and extractions
  private extractContentIssues(scrapedContent: ProductionExtractionResult, pageAuditData: any): string[] {
    const issues = [];
    if (!scrapedContent.metaDescription) issues.push('Missing meta description');
    if (!scrapedContent.title) issues.push('Missing title');
    if (scrapedContent.wordCount < 300) issues.push('Low word count');
    return issues;
  }

  private calculateOverallFrameworkScore(goldenCircle: any, elementsOfValue: any, b2bElements: any, cliftonStrengths: any): number {
    const scores = [
      goldenCircle?.overallScore || 0,
      elementsOfValue?.overallScore || 0,
      b2bElements?.overallScore || 0,
      cliftonStrengths?.overallScore || 0
    ];
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  private extractKeyStrengths(goldenCircle: any, elementsOfValue: any, b2bElements: any, cliftonStrengths: any): string[] {
    const strengths = [];
    if (goldenCircle?.overallScore > 70) strengths.push('Strong Golden Circle clarity');
    if (elementsOfValue?.overallScore > 70) strengths.push('Strong Elements of Value alignment');
    if (b2bElements?.overallScore > 70) strengths.push('Strong B2B value proposition');
    if (cliftonStrengths?.overallScore > 70) strengths.push('Strong CliftonStrengths alignment');
    return strengths;
  }

  private extractKeyWeaknesses(goldenCircle: any, elementsOfValue: any, b2bElements: any, cliftonStrengths: any): string[] {
    const weaknesses = [];
    if (goldenCircle?.overallScore < 50) weaknesses.push('Weak Golden Circle clarity');
    if (elementsOfValue?.overallScore < 50) weaknesses.push('Weak Elements of Value alignment');
    if (b2bElements?.overallScore < 50) weaknesses.push('Weak B2B value proposition');
    if (cliftonStrengths?.overallScore < 50) weaknesses.push('Weak CliftonStrengths alignment');
    return weaknesses;
  }

  private extractValueCentricLanguage(scrapedContent: ProductionExtractionResult): string[] {
    const content = scrapedContent.content?.toLowerCase() || '';
    const valueWords = ['transform', 'empower', 'growth', 'success', 'impact', 'achieve', 'fulfill', 'purpose', 'meaning', 'connection', 'belonging', 'hope', 'motivation', 'wellness', 'rewards', 'entertainment', 'attractiveness'];
    return valueWords.filter(word => content.includes(word));
  }

  private extractFunctionalLanguage(scrapedContent: ProductionExtractionResult): string[] {
    const content = scrapedContent.content?.toLowerCase() || '';
    const functionalWords = ['service', 'product', 'feature', 'function', 'capability', 'tool', 'system', 'platform', 'software', 'solution'];
    return functionalWords.filter(word => content.includes(word));
  }

  private calculateOverallScore(phase1Report: Phase1Report, phase2Report: Phase2Report): number {
    const phase1Score = (phase1Report.summary.seoScore + phase1Report.summary.performanceScore) / 2;
    const phase2Score = phase2Report.summary.overallFrameworkScore;
    return Math.round((phase1Score + phase2Score) / 2);
  }

  private combineRecommendations(evaluationResult: any, geminiInsights: any): string[] {
    const recommendations = [];

    // Add evaluation framework recommendations
    if (evaluationResult?.priorityRecommendations) {
      recommendations.push(...evaluationResult.priorityRecommendations);
    }

    // Add Gemini insights if available
    if (geminiInsights?.primaryRecommendations) {
      recommendations.push(...geminiInsights.primaryRecommendations);
    }

    // Remove duplicates and return
    return [...new Set(recommendations)];
  }

  private generateExecutiveSummary(phase1Report: Phase1Report, phase2Report: Phase2Report, comprehensiveAnalysis: any): string {
    const evaluationResult = comprehensiveAnalysis?.evaluationFramework;
    const overallScore = evaluationResult?.overallScore || 0;
    const rating = evaluationResult?.rating || 'Not Rated';

    return `
Executive Summary for ${this.url}:

OVERALL RATING: ${rating} (${overallScore}/100)

Phase 1 Results:
- SEO Score: ${phase1Report.summary.seoScore}/100
- Performance Score: ${phase1Report.summary.performanceScore}/100
- Content: ${phase1Report.summary.totalWords} words

Phase 2 Results:
- Overall Framework Score: ${phase2Report.summary.overallFrameworkScore}/100
- Key Strengths: ${phase2Report.summary.keyStrengths.join(', ')}
- Key Weaknesses: ${phase2Report.summary.keyWeaknesses.join(', ')}

Comprehensive Evaluation:
- First Impression: ${evaluationResult?.categoryScores?.firstImpression?.score || 'N/A'}/100
- Core Messaging: ${evaluationResult?.categoryScores?.coreMessaging?.score || 'N/A'}/100
- Technical Performance: ${evaluationResult?.categoryScores?.technicalPerformance?.score || 'N/A'}/100
- Conversion Optimization: ${evaluationResult?.categoryScores?.conversionOptimization?.score || 'N/A'}/100

Priority Recommendations:
${comprehensiveAnalysis?.combinedRecommendations?.slice(0, 5).map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n') || 'Analysis in progress'}
    `.trim();
  }

}

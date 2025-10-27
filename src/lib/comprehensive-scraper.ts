/**
 * Comprehensive Website Scraper and Analysis Pipeline
 * Uses existing QA tools to scrape content, then walks through each analysis step
 */

import { WebsiteAnalysisResult } from '@/types/analysis';
import { runLighthouseAnalysis } from './lighthouse-service';
import {
  extractWithProduction,
  ProductionExtractionResult,
} from './production-content-extractor';

export interface ComprehensiveAnalysisStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  result?: any;
  error?: string;
}

export interface ComprehensiveAnalysisPipelineData {
  url: string;
  steps: ComprehensiveAnalysisStep[];
  overallProgress: number;
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  finalReport?: RawAnalysisReport;
}

export interface RawAnalysisReport {
  // Scraped Content
  scrapedContent: ProductionExtractionResult;

  // AI Framework Analysis
  goldenCircleAnalysis: any;
  elementsOfValueAnalysis: any;
  b2bElementsAnalysis: any;
  cliftonStrengthsAnalysis: any;

  // Technical Analysis
  lighthouseAnalysis: any;
  pageAuditAnalysis: any;

  // Gemini Deep Analysis
  geminiInsights: any;

  // Metadata
  analysisTimestamp: string;
  totalAnalysisTime: number;
  url: string;
}

/**
 * Comprehensive Analysis Pipeline
 * Steps through each analysis type and generates a raw report
 */
export class ComprehensiveAnalysisPipeline {
  private url: string;
  private steps: ComprehensiveAnalysisStep[];
  private startTime: string;
  private onProgressUpdate?: (progress: number, currentStep: string) => void;

  constructor(
    url: string,
    onProgressUpdate?: (progress: number, currentStep: string) => void
  ) {
    this.url = url;
    this.startTime = new Date().toISOString();
    this.onProgressUpdate = onProgressUpdate || (() => {});

    this.steps = [
      // Phase 1: Data Collection Foundation
      {
        id: 'scrape_content',
        name: 'Content & SEO Scraping',
        description:
          'Extract website content, metadata, and SEO data using QA tools',
        status: 'pending',
      },
      {
        id: 'pageaudit',
        name: 'PageAudit Analysis',
        description: 'Run PageAudit.com technical and content analysis',
        status: 'pending',
      },
      {
        id: 'lighthouse',
        name: 'Lighthouse Performance',
        description: 'Run Lighthouse performance, accessibility, and SEO audit',
        status: 'pending',
      },
      {
        id: 'phase1_report',
        name: 'Generate Phase 1 Report',
        description:
          'Consolidate all data collection results into Phase 1 report',
        status: 'pending',
      },
      // Phase 2: Framework Analysis (using Phase 1 report)
      {
        id: 'golden_circle',
        name: 'Golden Circle Analysis',
        description: 'Analyze Why, How, What, and Who using Phase 1 data',
        status: 'pending',
      },
      {
        id: 'elements_of_value',
        name: 'Elements of Value Analysis',
        description: 'Evaluate 30 B2C Elements of Value framework',
        status: 'pending',
      },
      {
        id: 'b2b_elements',
        name: 'B2B Elements Analysis',
        description: 'Evaluate 40 B2B Elements of Value framework',
        status: 'pending',
      },
      {
        id: 'clifton_strengths',
        name: 'CliftonStrengths Analysis',
        description: 'Analyze 34 CliftonStrengths themes and domains',
        status: 'pending',
      },
      {
        id: 'phase2_report',
        name: 'Generate Phase 2 Report',
        description: 'Consolidate framework analysis into Phase 2 report',
        status: 'pending',
      },
      // Phase 3: Strategic Analysis (using Phase 1 & 2 reports)
      {
        id: 'comprehensive_analysis',
        name: 'Comprehensive Strategic Analysis',
        description:
          'Generate comprehensive insights using all previous reports',
        status: 'pending',
      },
      {
        id: 'final_report',
        name: 'Generate Final Report',
        description:
          'Compile all analysis results into comprehensive final report',
        status: 'pending',
      },
    ];
  }

  /**
   * Execute the complete analysis pipeline
   */
  async execute(): Promise<RawAnalysisReport> {
    console.log(`🚀 Starting comprehensive analysis pipeline for: ${this.url}`);
    console.log(`📊 Total steps: ${this.steps.length}`);

    let scrapedContent: ProductionExtractionResult | undefined;
    let aiAnalysis: WebsiteAnalysisResult | undefined;
    let lighthouseResults: any = undefined;
    let pageAuditResults: any = undefined;

    // Step 1: Scrape Content & SEO
    await this.executeStep('scrape_content', async () => {
      console.log('🔍 Step 1: Scraping website content and SEO data...');
      scrapedContent = await extractWithProduction(this.url);
      console.log(
        `✅ Scraped ${scrapedContent.wordCount} words, ${scrapedContent.imageCount} images`
      );
      return scrapedContent;
    });

    // Step 2: PageAudit Analysis (Early in Phase 1 for technical foundation)
    await this.executeStep('pageaudit', async () => {
      console.log('🔧 Step 2: Running PageAudit technical analysis...');
      pageAuditResults = await this.runPageAuditAnalysis();
      console.log(
        `✅ PageAudit completed - SEO Score: ${pageAuditResults.seoScore}/100`
      );
      return pageAuditResults;
    });

    // Step 3: Lighthouse Performance Analysis
    await this.executeStep('lighthouse', async () => {
      console.log('🏗️ Step 3: Running Lighthouse performance analysis...');
      lighthouseResults = await runLighthouseAnalysis(this.url);
      console.log(
        `✅ Lighthouse completed - Performance: ${lighthouseResults?.scores?.performance || 'N/A'}/100`
      );
      return lighthouseResults;
    });

    // Phase 2: AI Framework Analysis (using ALL collected data from Phase 1)
    console.log(
      '🎯 Starting Phase 2: AI Framework Analysis with complete dataset...'
    );
    console.log(
      `📊 Dataset ready: ${scrapedContent?.wordCount || 0} words, PageAudit SEO: ${pageAuditResults?.seoScore || 'N/A'}/100, Lighthouse: ${lighthouseResults?.scores?.overall || 'N/A'}/100`
    );

    // Step 4: AI Framework Analysis (using collected data from Phase 1)
    await this.executeStep('golden_circle', async () => {
      console.log(
        '🧠 Step 4: Running AI framework analysis with complete dataset...'
      );

      // Create AI analysis using ALL the collected data from Phase 1
      if (!scrapedContent) {
        throw new Error('Scraped content not available');
      }
      aiAnalysis = await this.performAIAnalysisWithData(
        scrapedContent,
        pageAuditResults,
        lighthouseResults
      );
      console.log(
        `✅ AI analysis completed with score: ${aiAnalysis?.overallScore || 'N/A'}/100`
      );
      return aiAnalysis;
    });

    // Step 5: Elements of Value Analysis (extract from AI analysis)
    await this.executeStep('elements_of_value', async () => {
      console.log(
        '💎 Step 5: Extracting Elements of Value from AI analysis...'
      );
      return aiAnalysis?.elementsOfValue;
    });

    // Step 6: B2B Elements Analysis (extract from AI analysis)
    await this.executeStep('b2b_elements', async () => {
      console.log('🏢 Step 6: Extracting B2B Elements from AI analysis...');
      return aiAnalysis?.b2bElements;
    });

    // Step 7: CliftonStrengths Analysis (extract from AI analysis)
    await this.executeStep('clifton_strengths', async () => {
      console.log('💪 Step 7: Extracting CliftonStrengths from AI analysis...');
      return aiAnalysis?.cliftonStrengths;
    });

    // Step 8: Gemini Deep Analysis (using ALL collected data from Phases 1 & 2)
    let geminiInsights: any;
    await this.executeStep('gemini_insights', async () => {
      console.log(
        '🤖 Step 8: Generating Gemini deep insights using all collected data...'
      );
      console.log(
        `📊 Data sources: Scraped content (${scrapedContent?.wordCount || 0} words), PageAudit (SEO: ${pageAuditResults?.seoScore || 'N/A'}/100), Lighthouse (Performance: ${lighthouseResults?.scores?.performance || 'N/A'}/100), AI Frameworks (${aiAnalysis?.overallScore || 'N/A'}/100)`
      );

      if (!scrapedContent || !aiAnalysis) {
        throw new Error('Required data not available for Gemini insights');
      }
      geminiInsights = await this.generateGeminiInsights(
        scrapedContent,
        aiAnalysis,
        lighthouseResults,
        pageAuditResults
      );
      console.log(
        '✅ Gemini insights generated with comprehensive data integration'
      );
      return geminiInsights;
    });

    // Step 9: Generate Final Report
    let finalReport: RawAnalysisReport;
    await this.executeStep('generate_report', async () => {
      console.log('📋 Step 9: Generating comprehensive raw report...');
      if (!scrapedContent || !aiAnalysis) {
        throw new Error('Required data not available for report generation');
      }
      finalReport = await this.generateRawReport(
        scrapedContent,
        aiAnalysis,
        lighthouseResults,
        pageAuditResults,
        geminiInsights
      );
      console.log('✅ Raw report generated successfully');
      return finalReport;
    });

    console.log('🎉 Comprehensive analysis pipeline completed!');
    return finalReport!;
  }

  /**
   * Execute a single step in the pipeline
   */
  private async executeStep(
    stepId: string,
    stepFunction: () => Promise<any>
  ): Promise<void> {
    const step = this.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }

    step.status = 'running';
    step.startTime = new Date().toISOString();

    this.updateProgress();

    try {
      console.log(`\n🔄 Executing: ${step.name}`);
      console.log(`📝 ${step.description}`);

      const result = await stepFunction();

      step.status = 'completed';
      step.endTime = new Date().toISOString();
      step.duration =
        new Date(step.endTime).getTime() - new Date(step.startTime).getTime();
      step.result = result;

      console.log(`✅ ${step.name} completed in ${step.duration}ms`);
    } catch (error) {
      step.status = 'failed';
      step.endTime = new Date().toISOString();
      step.duration =
        new Date(step.endTime).getTime() - new Date(step.startTime).getTime();
      step.error = error instanceof Error ? error.message : 'Unknown error';

      console.error(`❌ ${step.name} failed:`, step.error);

      // NEVER use mock data - fail if real analysis is not available
      if (step.id === 'lighthouse' || step.id === 'pageaudit') {
        console.log(`❌ Step failed: ${step.name} - Real analysis required`);
        step.status = 'failed';
        step.error = `Real analysis required for ${step.name} - no mock data allowed`;
        return;
      }

      throw error;
    }

    this.updateProgress();
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(): void {
    const completedSteps = this.steps.filter(
      (s) => s.status === 'completed'
    ).length;
    const progress = (completedSteps / this.steps.length) * 100;

    const currentStep = this.steps.find((s) => s.status === 'running');
    const currentStepName = currentStep ? currentStep.name : 'Completed';

    if (this.onProgressUpdate) {
      this.onProgressUpdate(progress, currentStepName);
    }
  }

  /**
   * Run PageAudit-style analysis using existing script
   */
  private async runPageAuditAnalysis(): Promise<any> {
    try {
      // Import and use the existing PageAudit analysis function
      const { spawn } = require('child_process');
      const path = require('path');

      return new Promise((resolve, reject) => {
        const scriptPath = path.join(
          process.cwd(),
          'scripts',
          'pageaudit-analysis.js'
        );
        const child = spawn('node', [scriptPath, this.url], {
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe'],
        });

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
              // Parse the JSON output from the script
              const lines = output.split('\n');
              const jsonLine = lines.find((line) =>
                line.trim().startsWith('{')
              );
              if (jsonLine) {
                const result = JSON.parse(jsonLine);
                resolve(result);
              } else {
                // NEVER use mock data - fail if real analysis is not available
                reject(
                  new Error(
                    'Failed to parse PageAudit output - real analysis required'
                  )
                );
              }
            } catch (parseError) {
              console.error('Failed to parse PageAudit output:', parseError);
              reject(
                new Error('PageAudit parsing failed - real analysis required')
              );
            }
          } else {
            console.error('PageAudit script failed. Error:', errorOutput);
            reject(
              new Error('PageAudit analysis failed - real analysis required')
            );
          }
        });
      });
    } catch (error) {
      console.error('PageAudit analysis failed:', error);
      throw new Error('PageAudit analysis failed - real analysis required');
    }
  }

  // NO MOCK DATA FUNCTIONS - REAL ANALYSIS ONLY
  // All mock data functions have been removed to ensure only real analysis is used

  /**
   * Perform AI analysis using collected data from Phase 1
   */
  private async performAIAnalysisWithData(
    scrapedContent: ProductionExtractionResult,
    pageAuditData: any,
    lighthouseData: any
  ): Promise<WebsiteAnalysisResult> {
    try {
      // Import the AI analysis function
      const { analyzeWithGemini, analyzeWithClaude } = await import(
        './free-ai-analysis'
      );

      // Prepare comprehensive content for AI analysis with enhanced Golden Circle extraction
      const contentForAI = this.prepareEnhancedGoldenCircleAnalysis(
        scrapedContent,
        pageAuditData,
        lighthouseData
      );

      let analysisResult;
      try {
        console.log(
          '🤖 Analyzing with Google Gemini using enhanced Golden Circle extraction...'
        );
        analysisResult = await analyzeWithGemini(
          contentForAI,
          'golden-circle-focused'
        );
      } catch (geminiError) {
        console.log('⚠️ Gemini failed, trying Claude...');
        if (
          process.env.CLAUDE_API_KEY &&
          process.env.CLAUDE_API_KEY !== 'your-real-key-here'
        ) {
          analysisResult = await analyzeWithClaude(
            contentForAI,
            'golden-circle-focused'
          );
        } else {
          throw new Error(
            'Gemini analysis failed and Claude API key not configured'
          );
        }
      }

      // Create comprehensive result
      const result: any = {
        id: this.generateId(),
        url: this.url,
        timestamp: new Date(),
        overallScore: analysisResult.overallScore || 75,
        executiveSummary:
          analysisResult.executiveSummary ||
          'Analysis completed with comprehensive data',
        goldenCircle: analysisResult.goldenCircle,
        elementsOfValue: analysisResult.elementsOfValue,
        b2bElements: analysisResult.b2bElements,
        cliftonStrengths: analysisResult.cliftonStrengths,
        transformation: analysisResult.transformation,
        recommendations: analysisResult.recommendations || {
          immediate: [],
          shortTerm: [],
          longTerm: [],
        },
        socialMediaStrategy: analysisResult.socialMediaStrategy || {
          postTypes: [],
          contentCalendar: {},
        },
        successMetrics: analysisResult.successMetrics || {
          currentKPIs: [],
          targetImprovements: [],
          abTestingOpportunities: [],
        },
        lighthouseAnalysis: lighthouseData,
        createdAt: new Date().toISOString(),
      };

      return result;
    } catch (error) {
      console.error('AI analysis with collected data failed:', error);
      throw new Error(
        `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Prepare enhanced Golden Circle analysis with specific extraction requirements
   */
  private prepareEnhancedGoldenCircleAnalysis(
    scrapedContent: ProductionExtractionResult,
    pageAuditData: any,
    lighthouseData: any
  ): string {
    // Safely handle arrays and objects
    const safeJoin = (arr: any, separator: string = ', ') => {
      if (Array.isArray(arr)) {
        return arr.join(separator);
      }
      return arr ? String(arr) : 'None found';
    };

    const content = `
ENHANCED GOLDEN CIRCLE ANALYSIS - SPECIFIC EXTRACTION REQUIRED
URL: ${this.url}

=== WEBSITE CONTENT TO ANALYZE ===
Title: ${scrapedContent.title || 'N/A'}
Meta Description: ${scrapedContent.metaDescription || 'N/A'}
Full Content: ${scrapedContent.content || 'No content extracted'}

=== SUPPORTING DATA ===
Word Count: ${scrapedContent.wordCount || 0}
Images: ${scrapedContent.imageCount || 0}
Links: ${scrapedContent.linkCount || 0}
Forms: ${scrapedContent.formCount || 0}
Contact Info: ${safeJoin(scrapedContent.contactInfo)}
Social Media: ${safeJoin(scrapedContent.socialMediaLinks)}

PageAudit SEO Score: ${pageAuditData?.seoScore || 'N/A'}/100
Lighthouse Performance: ${lighthouseData?.scores?.performance || 'N/A'}/100

=== ANALYSIS REQUIREMENTS ===

Extract the EXACT content from the website for each Golden Circle element with VALUE-CENTRIC LANGUAGE ANALYSIS:

1. WHY (Dominant Purpose) - VALUE-CENTRIC LANGUAGE FOCUS:
   - What is the company's core mission, purpose, or driving belief?
   - What is their "why" - the reason they exist beyond making money?
   - Look for mission statements, "about us" content, hero section messaging
   - Quote the exact phrases used on the website
   - **VALUE ANALYSIS**: Identify language that speaks to emotional, life-changing, or social impact elements
   - **BENEFIT-CENTRIC LANGUAGE**: Look for words about transformation, empowerment, growth, success, impact

2. HOW (How Are They Unique?) - VALUE & UNIQUENESS FOCUS:
   - What makes them different from competitors?
   - What is their unique methodology, process, or approach?
   - What is their unique value proposition or differentiator?
   - Quote specific methods, frameworks, or processes mentioned
   - **VALUE ANALYSIS**: Identify how their uniqueness creates value beyond functional benefits
   - **SPECIALIZATION LANGUAGE**: Look for expertise, specialization, and value-creation language

3. WHAT (What Do They Do & What Are They Asking Clients To Do?) - FUNCTIONAL FOCUS:
   - What specific products or services do they offer?
   - What are they asking clients/customers to do (calls to action)?
   - What specific actions do they want visitors to take?
   - Quote exact service descriptions and call-to-action buttons/text
   - **FUNCTIONAL ANALYSIS**: Focus on services, products, and functional elements
   - **ACTION-ORIENTED LANGUAGE**: Look for "do this" vs "be this" language

4. WHO (Who Do They Say Is Their Client/Market?) - VALUE-DRIVEN TESTIMONIALS:
   - Who is their target audience according to the website?
   - What specific client types, industries, or demographics do they mention?
   - What testimonials, case studies, or client examples are shown?
   - Quote specific client names, company names, or target market descriptions
   - **VALUE TESTIMONIAL ANALYSIS**: Extract testimonials that show emotional, life-changing, or social impact
   - **SUCCESS STORY LANGUAGE**: Look for transformation stories, not just functional results

Return your analysis in this EXACT JSON format:
{
  "goldenCircle": {
    "why": {
      "dominantPurpose": "exact quote from website about their core mission/purpose",
      "drivingBelief": "exact quote about what drives them beyond profit",
      "missionStatement": "exact mission statement if found",
      "valueCentricLanguage": ["ALL words/phrases showing emotional, life-changing, or social impact - extract every instance found"],
      "benefitCentricWords": ["ALL words about transformation, empowerment, growth, success, impact, achievement, fulfillment, purpose, meaning, connection, belonging, hope, motivation, self-actualization, wellness, rewards, nostalgia, design, entertainment, attractiveness, anxiety reduction, fun, belonging, access, life-changing benefits"],
      "evidence": ["specific quotes or phrases from the website that support this"]
    },
    "how": {
      "uniqueMethodology": "exact quote about their unique approach or method",
      "differentiator": "exact quote about what makes them different",
      "uniqueValue": "exact quote about their unique value proposition",
      "valueCreationLanguage": ["ALL words/phrases showing how they create value beyond functional benefits - extract every instance found"],
      "specializationWords": ["ALL words about expertise, specialization, unique, different, better, superior, advanced, innovative, proven, certified, experienced, professional, expert, leader, pioneer, breakthrough, cutting-edge, state-of-the-art, world-class, industry-leading, best-in-class"],
      "evidence": ["specific quotes or phrases from the website that support this"]
    },
    "what": {
      "productsServices": ["exact list of products/services mentioned on website"],
      "clientActions": ["exact calls to action found on the website"],
      "specificOfferings": ["exact service descriptions or offerings"],
      "functionalLanguage": ["ALL words/phrases focusing on services, products, and functional elements - extract every instance found"],
      "actionOrientedWords": ["ALL action words: do, get, buy, sign up, contact, schedule, purchase, order, download, subscribe, register, book, call, email, start, begin, try, test, demo, learn, discover, find, search, browse, compare, choose, select, apply, submit, send, receive, access, use, implement, deploy, install, configure, setup, manage, monitor, track, analyze, report, optimize, improve, enhance, upgrade, scale, grow, expand, develop, build, create, design, customize, personalize, automate, streamline, simplify, accelerate, reduce, save, cut, lower, increase, boost, maximize, minimize"],
      "evidence": ["specific quotes or phrases from the website that support this"]
    },
    "who": {
      "targetMarket": "exact quote about who their target audience is",
      "clientTypes": ["exact client types or industries mentioned"],
      "testimonials": ["exact client names and companies from testimonials"],
      "valueDrivenTestimonials": ["testimonials showing emotional, life-changing, or social impact"],
      "transformationStories": ["stories about client transformation, not just functional results"],
      "evidence": ["specific quotes or phrases from the website that support this"]
    }
  },
  "valueLanguageAnalysis": {
    "whySpaceIndicator": "percentage of content that uses value-centric vs functional language",
    "elementsOfValueAlignment": {
      "functionalElements": ["specific functional elements mentioned"],
      "emotionalElements": ["specific emotional elements mentioned"],
      "lifeChangingElements": ["specific life-changing elements mentioned"],
      "socialImpactElements": ["specific social impact elements mentioned"]
    },
    "competitiveAdvantageLanguage": ["specific phrases showing competitive advantage"],
    "specializationLanguage": ["specific phrases showing specialization and expertise"]
  },
  "overallScore": 85,
  "summary": "Brief summary of the Golden Circle analysis findings with value-centric language insights"
}

IMPORTANT:
- Extract ONLY content that actually appears on the website
- Use exact quotes and phrases from the website
- Do not make assumptions or add generic content
- If information is not found on the website, state "Not explicitly stated on website"
- Base all analysis on the actual website content provided
    `.trim();

    return content;
  }

  /**
   * Prepare comprehensive content for AI analysis (legacy method)
   */
  private prepareContentForAI(
    scrapedContent: ProductionExtractionResult,
    pageAuditData: any,
    lighthouseData: any
  ): string {
    // Safely handle arrays and objects
    const safeJoin = (arr: any, separator: string = ', ') => {
      if (Array.isArray(arr)) {
        return arr.join(separator);
      }
      return arr ? String(arr) : 'None found';
    };

    const content = `
WEBSITE CONTENT ANALYSIS:
URL: ${this.url}

SCRAPED CONTENT:
- Title: ${scrapedContent.title || 'N/A'}
- Meta Description: ${scrapedContent.metaDescription || 'N/A'}
- Word Count: ${scrapedContent.wordCount || 0}
- Image Count: ${scrapedContent.imageCount || 0}
- Link Count: ${scrapedContent.linkCount || 0}
- Heading Count: ${scrapedContent.headingCount || 0}
- Paragraph Count: ${scrapedContent.paragraphCount || 0}
- Form Count: ${scrapedContent.formCount || 0}
- Video Count: ${scrapedContent.videoCount || 0}
- Social Media Links: ${safeJoin(scrapedContent.socialMediaLinks)}
- Contact Info: ${safeJoin(scrapedContent.contactInfo)}
- Technical Info: ${safeJoin(scrapedContent.technicalInfo)}

PAGEAUDIT ANALYSIS:
- SEO Score: ${pageAuditData?.seoScore || 'N/A'}/100
- Technical Score: ${pageAuditData?.technicalScore || 'N/A'}/100
- Content Score: ${pageAuditData?.contentScore || 'N/A'}/100
- Accessibility Score: ${pageAuditData?.accessibilityScore || 'N/A'}/100
- Issues: ${safeJoin(pageAuditData?.issues)}
- Recommendations: ${safeJoin(pageAuditData?.recommendations)}

LIGHTHOUSE ANALYSIS:
- Performance: ${lighthouseData?.scores?.performance || 'N/A'}/100
- Accessibility: ${lighthouseData?.scores?.accessibility || 'N/A'}/100
- Best Practices: ${lighthouseData?.scores?.bestPractices || 'N/A'}/100
- SEO: ${lighthouseData?.scores?.seo || 'N/A'}/100
- Overall: ${lighthouseData?.scores?.overall || 'N/A'}/100

CONTENT TO ANALYZE:
${scrapedContent.content || 'No content extracted'}
    `.trim();

    return content;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate comprehensive Gemini insights using all raw data
   */
  private async generateGeminiInsights(
    content: ProductionExtractionResult,
    aiAnalysis: WebsiteAnalysisResult,
    lighthouse: any,
    pageAudit: any
  ): Promise<any> {
    try {
      // Import Gemini analysis function
      const { analyzeWithGemini } = await import('./free-ai-analysis');

      // Prepare comprehensive analysis prompt with all raw data
      const analysisPrompt = this.createPatternAnalysisPrompt(
        content,
        aiAnalysis,
        lighthouse,
        pageAudit
      );

      console.log(
        '🤖 Generating comprehensive pattern analysis with Gemini...'
      );
      const geminiInsights = await analyzeWithGemini(
        analysisPrompt,
        'pattern-analysis'
      );

      return geminiInsights;
    } catch (error) {
      console.warn(
        'Gemini pattern analysis failed, using fallback insights:',
        error
      );
      return this.getFallbackInsights(
        content,
        aiAnalysis,
        lighthouse,
        pageAudit
      );
    }
  }

  /**
   * Create comprehensive pattern analysis prompt for Gemini
   */
  private createPatternAnalysisPrompt(
    content: ProductionExtractionResult,
    aiAnalysis: WebsiteAnalysisResult,
    lighthouse: any,
    pageAudit: any
  ): string {
    return `
COMPREHENSIVE WEBSITE ANALYSIS - PATTERN IDENTIFICATION & RECOMMENDATIONS

URL: ${this.url}

=== RAW DATA FROM ALL ASSESSMENT TOOLS ===

1. CONTENT SCRAPING DATA:
- Title: ${content.title || 'N/A'}
- Meta Description: ${content.metaDescription || 'N/A'}
- Word Count: ${content.wordCount || 0}
- Images: ${content.imageCount || 0}
- Links: ${content.linkCount || 0}
- Headings: ${content.headingCount || 0}
- Paragraphs: ${content.paragraphCount || 0}
- Forms: ${content.formCount || 0}
- Videos: ${content.videoCount || 0}
- Social Media Links: ${Array.isArray(content.socialMediaLinks) ? content.socialMediaLinks.join(', ') : 'None'}
- Contact Info: ${Array.isArray(content.contactInfo) ? content.contactInfo.join(', ') : 'None'}
- Technical Info: ${Array.isArray(content.technicalInfo) ? content.technicalInfo.join(', ') : 'None'}

2. PAGEAUDIT ANALYSIS RAW DATA:
- SEO Score: ${pageAudit?.seoScore || 'N/A'}/100
- Technical Score: ${pageAudit?.technicalScore || 'N/A'}/100
- Content Score: ${pageAudit?.contentScore || 'N/A'}/100
- Accessibility Score: ${pageAudit?.accessibilityScore || 'N/A'}/100
- Identified Issues: ${Array.isArray(pageAudit?.issues) ? pageAudit.issues.join(', ') : 'None'}
- Recommendations: ${Array.isArray(pageAudit?.recommendations) ? pageAudit.recommendations.join(', ') : 'None'}

3. LIGHTHOUSE PERFORMANCE RAW DATA:
- Performance Score: ${lighthouse?.scores?.performance || 'N/A'}/100
- Accessibility Score: ${lighthouse?.scores?.accessibility || 'N/A'}/100
- Best Practices Score: ${lighthouse?.scores?.bestPractices || 'N/A'}/100
- SEO Score: ${lighthouse?.scores?.seo || 'N/A'}/100
- Overall Score: ${lighthouse?.scores?.overall || 'N/A'}/100

4. GOLDEN CIRCLE ANALYSIS RAW DATA:
- WHY (Purpose): ${aiAnalysis?.goldenCircle?.why || 'N/A'}
- HOW (Methodology): ${aiAnalysis?.goldenCircle?.how || 'N/A'}
- WHAT (Offerings): ${aiAnalysis?.goldenCircle?.what || 'N/A'}
- WHO (Target Audience): ${aiAnalysis?.goldenCircle?.who || 'N/A'}
- Golden Circle Score: ${aiAnalysis?.goldenCircle?.overallScore || 'N/A'}/100

5. ELEMENTS OF VALUE ANALYSIS RAW DATA:
- Functional Elements Score: ${aiAnalysis?.elementsOfValue?.overallScore || 'N/A'}/100
- Emotional Elements Score: ${aiAnalysis?.elementsOfValue?.overallScore || 'N/A'}/100
- Life-Changing Elements Score: ${aiAnalysis?.elementsOfValue?.overallScore || 'N/A'}/100
- Social Impact Elements Score: ${aiAnalysis?.elementsOfValue?.overallScore || 'N/A'}/100

6. B2B ELEMENTS ANALYSIS RAW DATA:
- B2B Elements Overall Score: ${aiAnalysis?.b2bElements?.overallScore || 'N/A'}/100

7. CLIFTONSTRENGTHS ANALYSIS RAW DATA:
- Strategic Thinking Score: ${aiAnalysis?.cliftonStrengths?.overallScore || 'N/A'}/100
- Executing Score: ${aiAnalysis?.cliftonStrengths?.overallScore || 'N/A'}/100
- Influencing Score: ${aiAnalysis?.cliftonStrengths?.overallScore || 'N/A'}/100
- Relationship Building Score: ${aiAnalysis?.cliftonStrengths?.overallScore || 'N/A'}/100

=== ANALYSIS REQUIREMENTS ===

Based on ALL the raw data above, provide a comprehensive analysis with:

1. PATTERN IDENTIFICATION:
   - What patterns do you see across all assessment tools?
   - Which metrics are consistently high/low across tools?
   - What correlations exist between technical performance and content quality?

2. WHAT IS WORKING:
   - Identify specific strengths based on actual data scores
   - Highlight areas where multiple tools show positive results
   - Note any standout performance metrics

3. WHAT IS NOT WORKING:
   - Identify specific weaknesses based on actual data scores
   - Highlight areas where multiple tools show negative results
   - Note any critical performance gaps

4. DATA-DRIVEN RECOMMENDATIONS:
   - Prioritize recommendations based on actual score gaps
   - Suggest specific actions based on identified issues
   - Recommend quick wins vs. long-term improvements
   - Provide specific metrics to track improvement

5. COMPETITIVE ADVANTAGE OPPORTUNITIES:
   - Identify unique strengths that could be leveraged
   - Suggest differentiation strategies based on data
   - Recommend areas for innovation

Return your analysis in this EXACT JSON format:
{
  "patternAnalysis": {
    "crossToolCorrelations": ["specific correlations found"],
    "consistentStrengths": ["strengths shown across multiple tools"],
    "consistentWeaknesses": ["weaknesses shown across multiple tools"],
    "performanceGaps": ["specific gaps identified"]
  },
  "whatIsWorking": {
    "technicalStrengths": ["specific technical strengths with scores"],
    "contentStrengths": ["specific content strengths with evidence"],
    "strategicStrengths": ["specific strategic strengths with data"],
    "competitiveAdvantages": ["unique advantages identified"]
  },
  "whatIsNotWorking": {
    "technicalIssues": ["specific technical problems with scores"],
    "contentIssues": ["specific content problems with evidence"],
    "strategicGaps": ["specific strategic gaps with data"],
    "criticalFailures": ["critical issues requiring immediate attention"]
  },
  "dataDrivenRecommendations": {
    "immediateActions": [
      {
        "priority": "high|medium|low",
        "action": "specific action to take",
        "expectedImpact": "expected improvement",
        "dataSource": "which tool identified this issue"
      }
    ],
    "quickWins": [
      {
        "effort": "low|medium|high",
        "impact": "low|medium|high",
        "action": "specific quick win action",
        "metric": "metric to track improvement"
      }
    ],
    "longTermImprovements": [
      {
        "timeline": "1-3 months|3-6 months|6+ months",
        "action": "specific improvement action",
        "investment": "estimated effort required",
        "roi": "expected return on investment"
      }
    ]
  },
  "competitiveOpportunities": {
    "uniqueStrengths": ["strengths to leverage competitively"],
    "differentiationStrategies": ["strategies based on data"],
    "innovationAreas": ["areas for innovation based on gaps"]
  },
  "successMetrics": {
    "currentBaseline": "current overall performance baseline",
    "targetImprovements": ["specific metrics to improve"],
    "trackingStrategy": "how to track progress",
    "successCriteria": "criteria for determining success"
  }
}

IMPORTANT: Base all analysis on the ACTUAL RAW DATA provided. Use specific scores, metrics, and evidence from the assessment tools. Do not make generic recommendations.
    `.trim();
  }

  /**
   * Fallback insights when Gemini analysis fails
   */
  private getFallbackInsights(
    content: ProductionExtractionResult,
    aiAnalysis: WebsiteAnalysisResult,
    lighthouse: any,
    pageAudit: any
  ): any {
    return {
      patternAnalysis: {
        crossToolCorrelations: [
          'Limited data available for correlation analysis',
        ],
        consistentStrengths: ['Content structure appears solid'],
        consistentWeaknesses: ['Technical performance needs improvement'],
        performanceGaps: ['SEO and performance optimization required'],
      },
      whatIsWorking: {
        technicalStrengths: ['Basic content structure in place'],
        contentStrengths: [`${content.wordCount} words of content available`],
        strategicStrengths: ['Website has clear purpose'],
        competitiveAdvantages: ['Unique positioning potential'],
      },
      whatIsNotWorking: {
        technicalIssues: ['Performance optimization needed'],
        contentIssues: ['SEO optimization required'],
        strategicGaps: ['Brand messaging could be stronger'],
        criticalFailures: ['No critical failures identified'],
      },
      dataDrivenRecommendations: {
        immediateActions: [
          {
            priority: 'high',
            action: 'Optimize page performance based on Lighthouse scores',
            expectedImpact: 'Improved user experience and SEO rankings',
            dataSource: 'Lighthouse analysis',
          },
        ],
        quickWins: [
          {
            effort: 'low',
            impact: 'medium',
            action: 'Add meta descriptions and optimize images',
            metric: 'SEO score improvement',
          },
        ],
        longTermImprovements: [
          {
            timeline: '3-6 months',
            action: 'Implement comprehensive content strategy',
            investment: 'medium',
            roi: 'improved user engagement and conversions',
          },
        ],
      },
      competitiveOpportunities: {
        uniqueStrengths: ['Content depth and structure'],
        differentiationStrategies: ['Focus on technical excellence'],
        innovationAreas: ['Performance optimization and user experience'],
      },
      successMetrics: {
        currentBaseline: `${pageAudit?.seoScore || 'N/A'}/100 SEO, ${lighthouse?.scores?.performance || 'N/A'}/100 Performance`,
        targetImprovements: ['SEO score >80', 'Performance score >90'],
        trackingStrategy: 'Monthly analysis with same tools',
        successCriteria: '20% improvement in overall scores within 3 months',
      },
    };
  }

  /**
   * Generate comprehensive raw report
   */
  private async generateRawReport(
    scrapedContent: ProductionExtractionResult,
    aiAnalysis: WebsiteAnalysisResult,
    lighthouse: any,
    pageAudit: any,
    geminiInsights: any
  ): Promise<RawAnalysisReport> {
    const endTime = new Date().toISOString();
    const totalDuration =
      new Date(endTime).getTime() - new Date(this.startTime).getTime();

    return {
      scrapedContent,
      goldenCircleAnalysis: aiAnalysis.goldenCircle,
      elementsOfValueAnalysis: aiAnalysis.elementsOfValue,
      b2bElementsAnalysis: aiAnalysis.b2bElements,
      cliftonStrengthsAnalysis: aiAnalysis.cliftonStrengths,
      lighthouseAnalysis: lighthouse,
      pageAuditAnalysis: pageAudit,
      geminiInsights,
      analysisTimestamp: endTime,
      totalAnalysisTime: totalDuration,
      url: this.url,
    };
  }

  /**
   * Get current progress
   */
  getProgress(): {
    progress: number;
    currentStep: string;
    steps: ComprehensiveAnalysisStep[];
  } {
    const completedSteps = this.steps.filter(
      (s) => s.status === 'completed'
    ).length;
    const progress = (completedSteps / this.steps.length) * 100;

    const currentStep = this.steps.find((s) => s.status === 'running');
    const currentStepName = currentStep ? currentStep.name : 'Completed';

    return {
      progress,
      currentStep: currentStepName,
      steps: this.steps,
    };
  }
}

/**
 * Factory function to create and execute comprehensive analysis
 */
export async function runComprehensiveAnalysis(
  url: string,
  onProgressUpdate?: (progress: number, currentStep: string) => void
): Promise<RawAnalysisReport> {
  const pipeline = new ComprehensiveAnalysisPipeline(url, onProgressUpdate);
  return await pipeline.execute();
}

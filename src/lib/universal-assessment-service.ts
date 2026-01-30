/**
 * Universal Assessment Service
 * Uses single Puppeteer scraper for all assessment types
 * Maps keywords to database tables and runs Gemini analysis
 */

import {
  UniversalPuppeteerScraper,
  UniversalScrapedData,
} from './universal-puppeteer-scraper';

export interface AssessmentConfig {
  keywords: string[];
  tables: string[];
  geminiPrompt: string;
  analysisType: string;
  description: string;
}

export const ASSESSMENT_CONFIGS: Record<string, AssessmentConfig> = {
  'content-comparison': {
    keywords: [
      'compare',
      'comparison',
      'versus',
      'vs',
      'difference',
      'improvement',
    ],
    tables: ['analyses', 'content_comparisons'],
    geminiPrompt: 'content-comparison',
    analysisType: 'comparison',
    description: 'Compare existing vs proposed content',
  },
  'golden-circle': {
    keywords: [
      'why',
      'how',
      'what',
      'who',
      'purpose',
      'mission',
      'vision',
      'values',
    ],
    tables: ['analyses', 'golden_circle_analyses'],
    geminiPrompt: 'golden-circle',
    analysisType: 'golden-circle',
    description: 'Simon Sinek Golden Circle analysis',
  },
  'elements-value-b2c': {
    keywords: [
      'functional',
      'emotional',
      'life-changing',
      'social-impact',
      'value',
      'benefit',
      'customer',
    ],
    tables: ['analyses', 'elements_of_value_b2c'],
    geminiPrompt: 'b2c-elements',
    analysisType: 'elements-value-b2c',
    description: 'B2C Elements of Value analysis',
  },
  'elements-value-b2b': {
    keywords: [
      'functional',
      'emotional',
      'life-changing',
      'social-impact',
      'business',
      'enterprise',
      'corporate',
    ],
    tables: ['analyses', 'elements_of_value_b2b'],
    geminiPrompt: 'b2b-elements',
    analysisType: 'elements-value-b2b',
    description: 'B2B Elements of Value analysis',
  },
  'clifton-strengths': {
    keywords: [
      'executing',
      'influencing',
      'relationship-building',
      'strategic-thinking',
      'strengths',
      'talents',
    ],
    tables: ['analyses', 'clifton_strengths_analyses'],
    geminiPrompt: 'clifton-strengths',
    analysisType: 'clifton-strengths',
    description: 'CliftonStrengths analysis',
  },
  comprehensive: {
    keywords: [
      'comprehensive',
      'complete',
      'full',
      'detailed',
      'thorough',
      'analysis',
    ],
    tables: ['analyses', 'comprehensive_analyses'],
    geminiPrompt: 'comprehensive',
    analysisType: 'comprehensive',
    description: 'Comprehensive multi-framework analysis',
  },
  'seo-analysis': {
    keywords: [
      'seo',
      'search',
      'optimization',
      'ranking',
      'keywords',
      'meta',
      'title',
      'description',
    ],
    tables: ['analyses', 'seo_analyses'],
    geminiPrompt: 'seo-analysis',
    analysisType: 'seo',
    description: 'SEO and search optimization analysis',
  },
  'lighthouse-performance': {
    keywords: [
      'performance',
      'speed',
      'lighthouse',
      'core-web-vitals',
      'loading',
      'optimization',
    ],
    tables: ['analyses', 'lighthouse_analyses'],
    geminiPrompt: 'lighthouse-performance',
    analysisType: 'lighthouse',
    description: 'Lighthouse performance analysis',
  },
};

export class UniversalAssessmentService {
  /**
   * Run any assessment type using universal scraper
   */
  static async runAssessment(
    url: string,
    assessmentType: string,
    additionalData?: any
  ): Promise<{
    success: boolean;
    data: UniversalScrapedData;
    analysis: any;
    assessmentType: string;
    message: string;
  }> {
    try {
      console.log(`🚀 Starting ${assessmentType} assessment for: ${url}`);

      // Get assessment configuration
      const config = ASSESSMENT_CONFIGS[assessmentType];
      if (!config) {
        throw new Error(`Unknown assessment type: ${assessmentType}`);
      }

      // Step 1: Scrape website with comprehensive data
      console.log('📊 Step 1: Scraping website with universal scraper...');
      const scrapedData = await UniversalPuppeteerScraper.scrapeWebsite(url);

      // Step 2: Extract relevant keywords for this assessment
      console.log('🔍 Step 2: Extracting relevant keywords...');
      const relevantKeywords = this.extractRelevantKeywords(
        scrapedData,
        config.keywords
      );

      // Step 3: Run Gemini analysis
      console.log('🤖 Step 3: Running Gemini analysis...');
      const analysis = await this.runGeminiAnalysis(
        scrapedData,
        config.geminiPrompt,
        additionalData
      );

      // Step 4: Map to database tables
      console.log('💾 Step 4: Mapping to database tables...');
      const mappedData = this.mapToDatabaseTables(
        scrapedData,
        analysis,
        config.tables
      );

      console.log(`✅ ${assessmentType} assessment completed successfully`);

      return {
        success: true,
        data: scrapedData,
        analysis: {
          ...analysis,
          relevantKeywords,
          mappedData,
          assessmentType: config.analysisType,
          description: config.description,
        },
        assessmentType: config.analysisType,
        message: `${config.description} completed successfully`,
      };
    } catch (error) {
      console.error(`${assessmentType} assessment failed:`, error);
      return {
        success: false,
        data: {} as UniversalScrapedData,
        analysis: {},
        assessmentType,
        message: `Assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Extract keywords relevant to the assessment type
   */
  private static extractRelevantKeywords(
    scrapedData: UniversalScrapedData,
    assessmentKeywords: string[]
  ): string[] {
    const allKeywords = [
      ...scrapedData.seo.extractedKeywords,
      ...scrapedData.contentTags.topics,
      ...scrapedData.businessData.services,
      ...scrapedData.businessData.products,
    ];

    // Find keywords that match assessment type
    const relevantKeywords = allKeywords.filter((keyword) =>
      assessmentKeywords.some(
        (assessmentKeyword) =>
          keyword.toLowerCase().includes(assessmentKeyword.toLowerCase()) ||
          assessmentKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    return [...new Set(relevantKeywords)].slice(0, 20);
  }

  /**
   * Run Gemini analysis based on assessment type
   */
  private static async runGeminiAnalysis(
    scrapedData: UniversalScrapedData,
    promptType: string,
    additionalData?: any
  ): Promise<any> {
    try {
      const { analyzeWithGemini } = await import('./free-ai-analysis');

      const prompt = this.buildAssessmentPrompt(
        scrapedData,
        promptType,
        additionalData
      );
      const result = await analyzeWithGemini(prompt, promptType);

      return result;
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      throw new Error(`Assessment analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build assessment-specific prompt for Gemini
   */
  private static buildAssessmentPrompt(
    scrapedData: UniversalScrapedData,
    promptType: string,
    additionalData?: any
  ): string {
    const basePrompt = `
Analyze this website using the ${promptType} framework:

URL: ${scrapedData.url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.seo.metaDescription}
Word Count: ${scrapedData.wordCount}
Business Type: ${scrapedData.contentTags.businessType} (${scrapedData.contentTags.businessTypeConfidence}% confidence)
Industry: ${scrapedData.contentTags.industry.join(', ')}
Technologies: ${scrapedData.contentTags.technologies.join(', ')}

Content: ${scrapedData.cleanText.substring(0, 3000)}

SEO Data:
- Keywords: ${scrapedData.seo.extractedKeywords.slice(0, 20).join(', ')}
- Headings: H1(${scrapedData.seo.headings.h1.length}), H2(${scrapedData.seo.headings.h2.length}), H3(${scrapedData.seo.headings.h3.length})
- Images: ${scrapedData.seo.images.length} (${scrapedData.seo.images.filter((img) => !img.alt).length} missing alt text)
- Internal Links: ${scrapedData.seo.internalLinks.length}
- External Links: ${scrapedData.seo.externalLinks.length}

Business Data:
- Company: ${scrapedData.businessData.companyName}
- Services: ${scrapedData.businessData.services.join(', ')}
- Products: ${scrapedData.businessData.products.join(', ')}
- Contact: ${scrapedData.businessData.contactInfo.phone.join(', ')} | ${scrapedData.businessData.contactInfo.email.join(', ')}

Structured Data:
- Schema Types: ${scrapedData.structuredData.schemaTypes.join(', ')}
- JSON-LD: ${scrapedData.structuredData.jsonLd.length} items

Performance:
- Load Time: ${scrapedData.performance.loadTime}ms
- DOM Size: ${scrapedData.performance.domSize} elements
- CSS Files: ${scrapedData.performance.cssFiles}
- JS Files: ${scrapedData.performance.jsFiles}
`;

    switch (promptType) {
      case 'content-comparison':
        return `${basePrompt}

Compare the existing content with any proposed changes. Provide:
1. Content quality analysis
2. SEO impact assessment
3. User experience evaluation
4. Conversion optimization opportunities
5. Specific recommendations for improvement

${additionalData ? `Proposed Content: ${additionalData.proposedContent}` : ''}`;

      case 'golden-circle':
        return `${basePrompt}

Analyze using Simon Sinek's Golden Circle framework:
1. WHY: What is the company's purpose, cause, or belief?
2. HOW: What is the company's unique approach or methodology?
3. WHAT: What products/services does the company offer?
4. WHO: Who is the target audience (B2B, B2C, or both)?

Provide scores (1-10) and specific evidence for each dimension.`;

      case 'b2c-elements':
        return `${basePrompt}

Analyze using Bain & Company's 30 Elements of Value for B2C:
- Functional (8 elements): Saves Time, Simplifies, Reduces Cost, etc.
- Emotional (9 elements): Reduces Anxiety, Rewards Me, Provides Access, etc.
- Life Changing (8 elements): Self-Actualization, Motivation, Affiliation, etc.
- Social Impact (5 elements): Self-Transcendence, Hope, Social Impact, etc.

Identify which elements are present and score each (1-10).`;

      case 'b2b-elements':
        return `${basePrompt}

Analyze using Bain & Company's 40 Elements of Value for B2B:
- Functional (10 elements): Reduces Risk, Organizes, Integrates, etc.
- Emotional (10 elements): Reduces Anxiety, Rewards Me, Provides Access, etc.
- Life Changing (10 elements): Self-Actualization, Motivation, Affiliation, etc.
- Social Impact (10 elements): Self-Transcendence, Hope, Social Impact, etc.

Identify which elements are present and score each (1-10).`;

      case 'clifton-strengths':
        return `${basePrompt}

Analyze using Gallup's CliftonStrengths framework across 4 domains:
- Executing: Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative
- Influencing: Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo
- Relationship Building: Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator
- Strategic Thinking: Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic

Identify top 5 strengths and provide evidence.`;

      case 'comprehensive':
        return `${basePrompt}

Provide a comprehensive analysis including:
1. Executive Summary
2. Golden Circle Analysis
3. Elements of Value (B2C & B2B)
4. CliftonStrengths Assessment
5. SEO Analysis
6. Performance Analysis
7. Competitive Positioning
8. Strategic Recommendations
9. Implementation Roadmap
10. Success Metrics`;

      case 'seo-analysis':
        return `${basePrompt}

Analyze SEO performance:
1. Technical SEO issues
2. Content optimization opportunities
3. Keyword strategy
4. Link building potential
5. Schema markup opportunities
6. Core Web Vitals impact
7. Mobile optimization
8. Local SEO (if applicable)

Provide specific, actionable recommendations.`;

      case 'lighthouse-performance':
        return `${basePrompt}

Analyze performance metrics:
1. Core Web Vitals (LCP, FID, CLS)
2. Performance score breakdown
3. Resource optimization opportunities
4. Image optimization
5. JavaScript/CSS optimization
6. Caching strategies
7. CDN recommendations
8. Server optimization

Provide specific performance improvements.`;

      default:
        return `${basePrompt}

Provide a general analysis of this website including strengths, weaknesses, and recommendations.`;
    }
  }

  /**
   * Map scraped data to database tables
   */
  private static mapToDatabaseTables(
    scrapedData: UniversalScrapedData,
    analysis: any,
    _tables: string[]
  ): any {
    return {
      main_analysis: {
        url: scrapedData.url,
        title: scrapedData.title,
        meta_description: scrapedData.seo.metaDescription,
        word_count: scrapedData.wordCount,
        business_type: scrapedData.contentTags.businessType,
        industry: scrapedData.contentTags.industry,
        technologies: scrapedData.contentTags.technologies,
        analysis_result: analysis,
        scraped_at: scrapedData.scrapedAt,
      },
      seo_data: {
        keywords: scrapedData.seo.extractedKeywords,
        keyword_density: scrapedData.seo.keywordDensity,
        headings: scrapedData.seo.headings,
        meta_tags: {
          title: scrapedData.seo.metaTitle,
          description: scrapedData.seo.metaDescription,
          keywords: scrapedData.seo.metaKeywords,
          robots: scrapedData.seo.metaRobots,
          canonical: scrapedData.seo.canonicalUrl,
        },
        social_media: {
          og_title: scrapedData.seo.ogTitle,
          og_description: scrapedData.seo.ogDescription,
          og_image: scrapedData.seo.ogImage,
          twitter_card: scrapedData.seo.twitterCard,
        },
        links: {
          internal: scrapedData.seo.internalLinks,
          external: scrapedData.seo.externalLinks,
        },
        images: scrapedData.seo.images,
        forms: scrapedData.seo.forms,
        ctas: scrapedData.seo.ctas,
      },
      structured_data: {
        json_ld: scrapedData.structuredData.jsonLd,
        microdata: scrapedData.structuredData.microdata,
        schema_types: scrapedData.structuredData.schemaTypes,
        breadcrumbs: scrapedData.structuredData.breadcrumbs,
      },
      performance_data: {
        load_time: scrapedData.performance.loadTime,
        dom_size: scrapedData.performance.domSize,
        dom_depth: scrapedData.performance.domDepth,
        css_files: scrapedData.performance.cssFiles,
        js_files: scrapedData.performance.jsFiles,
        render_blocking: scrapedData.performance.renderBlockingResources,
      },
      business_data: {
        company_name: scrapedData.businessData.companyName,
        tagline: scrapedData.businessData.tagline,
        about_content: scrapedData.businessData.aboutContent,
        mission_statement: scrapedData.businessData.missionStatement,
        value_proposition: scrapedData.businessData.valueProposition,
        services: scrapedData.businessData.services,
        products: scrapedData.businessData.products,
        contact_info: scrapedData.businessData.contactInfo,
        social_media: scrapedData.businessData.contactInfo.socialMedia,
      },
    };
  }

  // Removed getFallbackAnalysis() - we only use real collected data

  /**
   * Calculate basic SEO score
   */
  private static calculateBasicSEOScore(
    scrapedData: UniversalScrapedData
  ): number {
    let score = 0;

    if (scrapedData.seo.metaTitle) score += 20;
    if (scrapedData.seo.metaDescription) score += 20;
    if (scrapedData.seo.headings.h1.length > 0) score += 20;
    if (scrapedData.seo.images.filter((img) => img.alt).length > 0) score += 20;
    if (scrapedData.structuredData.schemaTypes.length > 0) score += 20;

    return score;
  }

  /**
   * Calculate basic performance score
   */
  private static calculateBasicPerformanceScore(
    scrapedData: UniversalScrapedData
  ): number {
    let score = 100;

    if (scrapedData.performance.loadTime > 3000) score -= 30;
    if (scrapedData.performance.domSize > 1000) score -= 20;
    if (scrapedData.performance.cssFiles > 10) score -= 20;
    if (scrapedData.performance.jsFiles > 20) score -= 20;
    if (scrapedData.performance.renderBlockingResources.length > 5) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Get available assessment types
   */
  static getAvailableAssessments(): Array<{
    type: string;
    description: string;
    keywords: string[];
  }> {
    return Object.entries(ASSESSMENT_CONFIGS).map(([type, config]) => ({
      type,
      description: config.description,
      keywords: config.keywords,
    }));
  }

  /**
   * Health check for assessment service
   */
  static async healthCheck(): Promise<{
    status: string;
    message: string;
    assessments: number;
  }> {
    try {
      const scraperHealth = await UniversalPuppeteerScraper.healthCheck();
      return {
        status: scraperHealth.status,
        message: `Assessment service: ${scraperHealth.message}`,
        assessments: Object.keys(ASSESSMENT_CONFIGS).length,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Assessment service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        assessments: 0,
      };
    }
  }
}

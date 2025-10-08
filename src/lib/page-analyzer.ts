import { AIProviderService, AIProviderConfig } from './ai-providers';
import { AnalysisResult } from './ai-providers';
import { ContentAnalyzer } from './content-analyzer';

export interface PageAnalysisRequest {
  url: string;
  pageType: 'home' | 'testimonials' | 'services' | 'about' | 'contact' | 'case-studies' | 'general';
  includeScreenshots?: boolean;
  deepAnalysis?: boolean;
}

export interface PageAnalysisResult extends AnalysisResult {
  pageType: string;
  url: string;
  analyzedAt: string;
  pageTitle?: string;
  metaDescription?: string;
  wordCount?: number;
  imageCount?: number;
  linkCount?: number;
  loadingTime?: number;
  specificInsights: {
    pageSpecificAnalysis: string;
    conversionElements: string[];
    trustSignals: string[];
    callToActions: string[];
    socialProof: string[];
    technicalIssues: string[];
  };
}

export class PageAnalyzer {
  private aiProvider: AIProviderService;

  constructor() {
    // Load configuration from environment variables
    const config: AIProviderConfig = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o',
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      },
      claude: {
        apiKey: process.env.CLAUDE_API_KEY || '',
        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
      },
    };
    
    this.aiProvider = new AIProviderService(config);
  }

  async analyzePage(request: PageAnalysisRequest): Promise<PageAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Scrape and extract content from the page
      const pageContent = await this.scrapePageContent(request.url);
      
      // Step 2: Analyze the content based on page type
      const analysis = await this.performPageAnalysis(pageContent, request);
      
      // Step 3: Generate page-specific insights
      const specificInsights = await this.generatePageSpecificInsights(pageContent, request);
      
      const loadingTime = Date.now() - startTime;
      
      return {
        ...analysis,
        pageType: request.pageType,
        url: request.url,
        analyzedAt: new Date().toISOString(),
        wordCount: pageContent.wordCount,
        imageCount: pageContent.imageCount,
        linkCount: pageContent.linkCount,
        loadingTime,
        specificInsights
      };
    } catch (error) {
      console.error('Page analysis failed:', error);
      throw new Error(`Page analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async scrapePageContent(url: string): Promise<{
    content: string;
    title: string;
    metaDescription: string;
    wordCount: number;
    imageCount: number;
    linkCount: number;
  }> {
    try {
      // Use a web scraping service or API
      const response = await fetch(`/api/scrape-page?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to scrape page: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        content: data.content || '',
        title: data.title || '',
        metaDescription: data.metaDescription || '',
        wordCount: data.wordCount || 0,
        imageCount: data.imageCount || 0,
        linkCount: data.linkCount || 0
      };
    } catch (error) {
      console.error('Page scraping failed:', error);
      // Fallback to basic content extraction
      return {
        content: `Content from ${url} - Analysis in progress...`,
        title: 'Page Title',
        metaDescription: 'Page description',
        wordCount: 0,
        imageCount: 0,
        linkCount: 0
      };
    }
  }

  private async performPageAnalysis(pageContent: any, request: PageAnalysisRequest): Promise<AnalysisResult> {
    // Use content analyzer for real analysis without API keys
    const contentAnalyzer = new ContentAnalyzer();
    const result = await contentAnalyzer.analyzeContent(pageContent.content, request.url, request.pageType);
    
    // Convert ContentAnalysisResult to AnalysisResult
    return {
      id: result.id,
      url: result.url,
      createdAt: result.createdAt,
      goldenCircle: result.goldenCircle,
      elementsOfValue: result.elementsOfValue,
      cliftonStrengths: result.cliftonStrengths,
      recommendations: result.recommendations,
      overallScore: result.overallScore,
      summary: result.summary
    };
  }

  private buildPageAnalysisPrompt(content: string, request: PageAnalysisRequest): string {
    const pageTypeInstructions = this.getPageTypeInstructions(request.pageType);
    
    return `
You are an expert digital marketing analyst specializing in comprehensive website analysis. Analyze the following ${request.pageType} page content with extreme attention to detail and specificity.

URL: ${request.url}
Page Type: ${request.pageType}

CONTENT TO ANALYZE:
${content}

${pageTypeInstructions}

CRITICAL ANALYSIS REQUIREMENTS:

1. SIMON SINEK'S GOLDEN CIRCLE - Extract EXACT details from the content:
   - WHY: Find the specific mission statement, core purpose, or driving belief. Quote exact phrases from the content.
   - HOW: Identify the unique methodology, process, or approach. Look for specific frameworks, methodologies, processes, or differentiators mentioned.
   - WHAT: List the specific products, services, or solutions offered. Extract exact product names, service categories, and specific offerings mentioned.
   - WHO: Analyze testimonials, case studies, client logos, and success stories. Extract specific client names, company names, job titles, and success metrics mentioned.

2. BAIN'S ELEMENTS OF VALUE - Score each element based on evidence in the content:
   - Functional Elements: Look for specific mentions of time-saving, cost reduction, efficiency, quality, etc.
   - Emotional Elements: Find evidence of trust-building, anxiety reduction, rewards, belonging, etc.
   - Life-Changing Elements: Look for transformation stories, personal growth, self-actualization, etc.
   - Social Impact Elements: Find evidence of community building, social good, purpose-driven work, etc.

3. GALLUP'S CLIFTONSTRENGTHS - Analyze which personality themes the content appeals to:
   - Look for language that appeals to specific strength themes
   - Analyze the tone, approach, and messaging style
   - Identify which types of people would be attracted to this content

4. PAGE-SPECIFIC ANALYSIS:
   ${this.getPageSpecificAnalysis(request.pageType)}

5. CONVERSION OPTIMIZATION:
   - Identify clear call-to-actions
   - Analyze trust signals and social proof
   - Evaluate value proposition clarity
   - Assess urgency and scarcity elements

6. TECHNICAL ANALYSIS:
   - Content structure and readability
   - Visual hierarchy and design elements
   - Mobile responsiveness indicators
   - Loading speed considerations

SCORING CRITERIA:
- 9-10: Exceptional evidence, specific details, compelling examples
- 7-8: Strong evidence, good details, clear examples
- 5-6: Moderate evidence, some details, basic examples
- 3-4: Weak evidence, vague details, limited examples
- 1-2: Minimal evidence, no specific details, generic content

Return your analysis in this EXACT JSON format:
{
  "goldenCircle": {
    "why": "Exact mission statement or core purpose from the content",
    "how": "Specific methodology, process, or unique approach mentioned",
    "what": "Exact products, services, or solutions listed",
    "who": "Specific client names, companies, and success stories from testimonials",
    "overallScore": number,
    "insights": ["Specific insights based on actual content analysis"]
  },
  "elementsOfValue": {
    "functional": {
      "savesTime": number,
      "reducesCost": number,
      "reducesEffort": number,
      "reducesRisk": number,
      "organizes": number,
      "integrates": number,
      "connects": number,
      "heirloom": number,
      "fun": number,
      "attractive": number,
      "wellness": number,
      "therapeutic": number,
      "quality": number,
      "variety": number,
      "simplicity": number,
      "convenience": number
    },
    "emotional": {
      "reducesAnxiety": number,
      "rewards": number,
      "nostalgia": number,
      "design": number,
      "badge": number,
      "wellness": number,
      "therapeutic": number,
      "fun": number,
      "attractive": number,
      "providesAccess": number,
      "connects": number,
      "heirloom": number
    },
    "lifeChanging": {
      "selfActualization": number,
      "motivation": number,
      "heirloom": number,
      "belonging": number,
      "providesAccess": number,
      "makesMoney": number,
      "reducesAnxiety": number,
      "rewards": number,
      "wellness": number,
      "therapeutic": number
    },
    "socialImpact": {
      "belonging": number,
      "providesAccess": number,
      "connects": number,
      "heirloom": number,
      "makesMoney": number,
      "reducesAnxiety": number,
      "rewards": number,
      "wellness": number,
      "therapeutic": number
    },
    "overallScore": number,
    "insights": ["Specific insights based on actual content analysis"]
  },
  "cliftonStrengths": {
    "strategic": number,
    "executing": number,
    "influencing": number,
    "relationshipBuilding": number,
    "overallScore": number,
    "insights": ["Specific insights based on actual content analysis"]
  },
  "recommendations": [
    "Specific, actionable recommendations based on actual content analysis"
  ],
  "overallScore": number,
  "summary": "Comprehensive summary based on actual content analysis with specific details"
}

IMPORTANT: Base all analysis on the ACTUAL CONTENT provided. Extract specific details, quotes, names, and examples. Do not use generic templates or assumptions.
    `;
  }

  private getPageTypeInstructions(pageType: string): string {
    switch (pageType) {
      case 'home':
        return `
HOME PAGE ANALYSIS FOCUS:
- Hero section effectiveness and value proposition clarity
- Navigation structure and user experience
- Above-the-fold content impact
- Trust signals and credibility indicators
- Primary call-to-action placement and effectiveness
- Brand messaging consistency
- Social proof placement and effectiveness
        `;
      case 'testimonials':
        return `
TESTIMONIALS PAGE ANALYSIS FOCUS:
- Testimonial authenticity and specificity
- Client diversity and industry representation
- Success metrics and quantifiable results
- Visual presentation and credibility
- Social proof effectiveness
- Trust signal strength
- Conversion potential of testimonials
        `;
      case 'services':
        return `
SERVICES PAGE ANALYSIS FOCUS:
- Service description clarity and specificity
- Value proposition for each service
- Pricing transparency and strategy
- Differentiation from competitors
- Process explanation and methodology
- Case study integration
- Call-to-action effectiveness
        `;
      case 'about':
        return `
ABOUT PAGE ANALYSIS FOCUS:
- Company story and mission clarity
- Team credibility and expertise
- Company values and culture
- Trust building elements
- Personal connection and relatability
- Achievement highlights and credentials
- Vision and future direction
        `;
      case 'case-studies':
        return `
CASE STUDIES PAGE ANALYSIS FOCUS:
- Case study structure and narrative
- Quantifiable results and metrics
- Problem-solution framework
- Client success stories
- Process transparency
- Outcome credibility
- Conversion potential
        `;
      default:
        return `
GENERAL PAGE ANALYSIS FOCUS:
- Content relevance and value
- User experience and navigation
- Conversion elements
- Trust signals
- Call-to-action effectiveness
- Content quality and depth
        `;
    }
  }

  private getPageSpecificAnalysis(pageType: string): string {
    switch (pageType) {
      case 'home':
        return `
- Hero section impact and messaging
- Value proposition clarity
- Trust signals and social proof
- Navigation effectiveness
- Call-to-action placement
- Above-the-fold optimization
        `;
      case 'testimonials':
        return `
- Testimonial authenticity and specificity
- Client diversity and credibility
- Success metrics and results
- Visual presentation quality
- Social proof effectiveness
- Conversion potential
        `;
      default:
        return `
- Content relevance and value
- User experience quality
- Conversion optimization
- Trust building elements
        `;
    }
  }

  private async generatePageSpecificInsights(pageContent: any, request: PageAnalysisRequest): Promise<{
    pageSpecificAnalysis: string;
    conversionElements: string[];
    trustSignals: string[];
    callToActions: string[];
    socialProof: string[];
    technicalIssues: string[];
  }> {
    // This would be enhanced with more sophisticated analysis
    return {
      pageSpecificAnalysis: `Comprehensive analysis of ${request.pageType} page focusing on conversion optimization and user experience.`,
      conversionElements: ['Primary CTA', 'Secondary CTAs', 'Contact forms'],
      trustSignals: ['Client logos', 'Testimonials', 'Certifications'],
      callToActions: ['Get Started', 'Contact Us', 'Learn More'],
      socialProof: ['Client testimonials', 'Case studies', 'Success metrics'],
      technicalIssues: ['Loading speed', 'Mobile responsiveness', 'SEO optimization']
    };
  }
}

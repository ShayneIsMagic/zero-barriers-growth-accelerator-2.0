/**
 * Standalone Golden Circle Analysis Service
 * Uses Content-Comparison pattern: Direct AI analysis without database dependencies
 */

import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EnhancedAnalysisService } from '@/lib/ai-engines/enhanced-analysis.service';

export interface GoldenCircleResult {
  success: boolean;
  url: string;
  data: {
    overall_score: number;
    alignment_score: number;
    clarity_score: number;
    why: {
      statement: string;
      clarity_rating: number;
      authenticity_rating: number;
      emotional_resonance_rating: number;
      differentiation_rating: number;
      evidence: {
        citations: string[];
        key_phrases: string[];
      };
      recommendations: string[];
    };
    how: {
      statement: string;
      uniqueness_rating: number;
      clarity_rating: number;
      credibility_rating: number;
      specificity_rating: number;
      evidence: {
        citations: string[];
        key_phrases: string[];
      };
      recommendations: string[];
    };
    what: {
      statement: string;
      clarity_rating: number;
      completeness_rating: number;
      value_articulation_rating: number;
      cta_clarity_rating: number;
      evidence: {
        citations: string[];
        key_phrases: string[];
      };
      recommendations: string[];
    };
    who: {
      statement: string;
      target_personas: string[];
      specificity_rating: number;
      resonance_rating: number;
      accessibility_rating: number;
      conversion_path_rating: number;
      evidence: {
        citations: string[];
        key_phrases: string[];
      };
      recommendations: string[];
    };
  };
  error?: string;
}

export class StandaloneGoldenCircleService {
  private static genAI: GoogleGenerativeAI;

  static initialize() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Analyze website using Golden Circle framework
   * Follows Content-Comparison pattern: Scrape → AI Analysis → Return
   */
  static async analyzeWebsite(url: string): Promise<GoldenCircleResult> {
    try {
      console.log(`🔄 Starting Golden Circle analysis with framework knowledge for: ${url}`);

      // Step 1: Scrape website content
      console.log('📊 Step 1: Scraping website content...');
      const scrapedData = await scrapeWebsiteContent(url);

      if (!scrapedData) {
        throw new Error('Failed to scrape website content');
      }

      console.log('✅ Content scraped successfully');

      // Step 2: Use enhanced analysis with framework integration
      console.log('🧠 Step 2: Running enhanced Golden Circle analysis with framework knowledge...');
      const enhancedResult = await EnhancedAnalysisService.analyzeWithFramework(
        'golden-circle',
        scrapedData,
        url
      );

      if (!enhancedResult.success) {
        throw new Error(enhancedResult.error || 'Enhanced analysis failed');
      }

      console.log(`✅ Golden Circle analysis completed for: ${url}`);
      console.log(`🎯 Framework used: ${enhancedResult.frameworkUsed}`);
      console.log(`📊 Validation score: ${enhancedResult.validation.score}`);

      return {
        success: true,
        _url,
        data: enhancedResult.analysis
      };

    } catch (error) {
      console.error('Golden Circle analysis failed:', error);
      return {
        success: false,
        _url,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  /**
   * Run Golden Circle analysis using Gemini AI
   */
  private static async runGoldenCircleAnalysis(scrapedData: any, url: string): Promise<any> {
    if (!this.genAI) {
      this.initialize();
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = this.buildGoldenCirclePrompt(scrapedData, url);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Handle JSON wrapped in markdown code blocks
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Gemini Golden Circle analysis failed:', error);
      throw new Error('AI analysis failed');
    }
  }

  /**
   * Build comprehensive Golden Circle prompt
   */
  private static buildGoldenCirclePrompt(scrapedData: any, url: string): string {
    return `
Analyze this website using the Golden Circle framework. Provide detailed analysis for all 4 dimensions:

WEBSITE CONTENT:
URL: ${url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}

ANALYZE THE FOLLOWING DIMENSIONS:

1. WHY - Purpose & Belief
   - What is their core purpose/belief?
   - Why does this organization exist beyond making money?
   - Rate clarity (1-10): How clearly is the WHY communicated?
   - Rate authenticity (1-10): Does it feel genuine?
   - Rate emotional resonance (1-10): Does it inspire emotion?
   - Rate differentiation (1-10): Is it unique vs competitors?
   - Provide evidence with specific citations from content
   - Give 3-5 recommendations for improvement

   SYNONYM GUIDANCE FOR WHY:
   Look for these terms and concepts that indicate purpose/belief:
   - Mission language: "mission", "vision", "purpose", "cause", "passion", "drive"
   - Problem-solving: "solve", "address", "tackle", "fight against", "overcome"
   - Change-making: "transform", "revolutionize", "improve", "make better", "enhance"
   - Values: "integrity", "excellence", "innovation", "service", "care", "quality"
   - Belief statements: "We believe", "Our mission", "We exist to", "We're passionate about"

2. HOW - Unique Process/Approach
   - How do they deliver on their WHY?
   - What makes their approach unique?
   - Rate uniqueness (1-10): How different is their approach?
   - Rate clarity (1-10): Is the HOW clearly explained?
   - Rate credibility (1-10): Is it believable/proven?
   - Rate specificity (1-10): How specific vs vague?
   - Provide evidence with citations
   - Give 3-5 recommendations

   SYNONYM GUIDANCE FOR HOW:
   Look for these terms and concepts that indicate process/approach:
   - Methodology: "approach", "method", "process", "system", "framework", "strategy"
   - Values: "principles", "standards", "ethics", "values", "philosophy", "culture"
   - Uniqueness: "unique", "different", "innovative", "proprietary", "exclusive", "distinctive"
   - Quality: "rigorous", "thorough", "meticulous", "precise", "expert", "professional"
   - Experience: "expertise", "experience", "knowledge", "skill", "proven", "tested"

3. WHAT - Products/Services
   - What do they actually offer?
   - Are offerings clearly described?
   - Rate clarity (1-10): How clear are the offerings?
   - Rate completeness (1-10): Full picture of what they do?
   - Rate value articulation (1-10): Benefits clearly stated?
   - Rate CTA clarity (1-10): Clear calls-to-action?
   - Provide evidence with citations
   - Give 3-5 recommendations

   SYNONYM GUIDANCE FOR WHAT:
   Look for these terms and concepts that indicate offerings:
   - Products: "product", "solution", "service", "offering", "platform", "tool"
   - Features: "feature", "capability", "function", "resource", "option", "choice"
   - Benefits: "benefit", "advantage", "value", "outcome", "result", "impact"
   - Delivery: "provide", "deliver", "offer", "supply", "give", "enable"

4. WHO - Target Audience
   - Who is their ideal customer?
   - How specific is their targeting?
   - Rate specificity (1-10): How well-defined is the audience?
   - Rate resonance (1-10): Does content speak to this audience?
   - Rate accessibility (1-10): Can target audience find/understand it?
   - Rate conversion path (1-10): Clear path for audience to act?
   - List 3-5 specific target personas
   - Provide evidence with citations
   - Give 3-5 recommendations

   SYNONYM GUIDANCE FOR WHO:
   Look for these terms and concepts that indicate target audience:
   - Demographics: "customers", "clients", "users", "audience", "members", "visitors"
   - Segments: "professionals", "businesses", "individuals", "organizations", "teams"
   - Industries: specific industry names, "sectors", "markets", "fields", "verticals"
   - Characteristics: "busy", "growing", "established", "innovative", "quality-focused", "successful"

IMPORTANT:
- Calculate an overall score (0-100) for Golden Circle alignment
- Calculate alignment score (how well WHY/HOW/WHAT/WHO align)
- Calculate clarity score (how clearly communicated)
- Look for both explicit statements AND implicit indicators
- Focus on underlying meaning and intent, not just exact keyword matches
- Be specific with citations (which page, which section)

Return response as valid JSON with this structure:
{
  "overall_score": 85,
  "alignment_score": 90,
  "clarity_score": 80,
  "why": {
    "statement": "...",
    "clarity_rating": 9.0,
    "authenticity_rating": 8.5,
    "emotional_resonance_rating": 9.0,
    "differentiation_rating": 8.0,
    "evidence": {
      "citations": ["homepage hero", "about page"],
      "key_phrases": ["...", "..."]
    },
    "recommendations": ["...", "...", "..."]
  },
  "how": { ... },
  "what": { ... },
  "who": {
    "statement": "...",
    "target_personas": ["Persona 1", "Persona 2", "Persona 3"],
    ...
  }
}
`;
  }
}

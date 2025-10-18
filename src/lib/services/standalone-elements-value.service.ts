/**
 * Standalone Elements of Value Analysis Service
 * Uses Content-Comparison pattern: Direct AI analysis without database dependencies
 */

import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ElementsOfValueResult {
  success: boolean;
  url: string;
  data: {
    b2c: {
      overall_score: number;
      functional_score: number;
      emotional_score: number;
      life_changing_score: number;
      social_impact_score: number;
      elements: Record<string, { present: boolean; strength: number; evidence: string[] }>;
      recommendations: string[];
    };
    b2b: {
      overall_score: number;
      table_stakes_score: number;
      functional_score: number;
      ease_of_doing_business_score: number;
      individual_score: number;
      inspirational_score: number;
      elements: Record<string, { present: boolean; strength: number; evidence: string[] }>;
      recommendations: string[];
    };
  };
  error?: string;
}

export class StandaloneElementsOfValueService {
  private static genAI: GoogleGenerativeAI;

  static initialize() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Analyze website using Elements of Value frameworks
   * Follows Content-Comparison pattern: Scrape → AI Analysis → Return
   */
  static async analyzeWebsite(url: string): Promise<ElementsOfValueResult> {
    try {
      console.log(`🔄 Starting Elements of Value analysis for: ${url}`);

      // Step 1: Scrape website content (like Content-Comparison)
      console.log('📊 Step 1: Scraping website content...');
      const scrapedData = await scrapeWebsiteContent(url);

      // Step 2: Run AI analysis (like Content-Comparison)
      console.log('🤖 Step 2: Running Elements of Value AI analysis...');
      const analysisResult = await this.runElementsOfValueAnalysis(scrapedData, url);

      console.log(`✅ Elements of Value analysis completed for: ${url}`);

      return {
        success: true,
        _url,
        data: analysisResult
      };

    } catch (error) {
      console.error('Elements of Value analysis failed:', error);
      return {
        success: false,
        _url,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  /**
   * Run Elements of Value analysis using Gemini AI
   */
  private static async runElementsOfValueAnalysis(scrapedData: any, url: string): Promise<any> {
    if (!this.genAI) {
      this.initialize();
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = this.buildElementsOfValuePrompt(scrapedData, url);

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
      console.error('Gemini Elements of Value analysis failed:', error);
      throw new Error('AI analysis failed');
    }
  }

  /**
   * Build comprehensive Elements of Value prompt
   */
  private static buildElementsOfValuePrompt(scrapedData: any, url: string): string {
    return `
Analyze this website for B2C and B2B Elements of Value. Provide detailed analysis for both frameworks:

WEBSITE CONTENT:
URL: ${url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}

B2C ELEMENTS OF VALUE (30 Elements):

FUNCTIONAL ELEMENTS (1-12):
1. saves_time - "fast", "quick", "instant", "automated", "efficient", "time-saving", "speedy"
2. simplifies - "simple", "easy", "straightforward", "streamlined", "user-friendly", "intuitive"
3. reduces_cost - "affordable", "cheap", "budget", "cost-effective", "inexpensive", "value"
4. reduces_risk - "safe", "secure", "guaranteed", "risk-free", "protected", "reliable"
5. organizes - "organized", "structured", "systematic", "orderly", "tidy", "neat"
6. integrates - "connects", "integrates", "unified", "seamless", "compatible", "works with"
7. connects - "connect", "link", "network", "community", "social", "together"
8. reduces_effort - "effortless", "easy", "simple", "no effort", "minimal effort"
9. avoids_hassles - "hassle-free", "convenient", "smooth", "trouble-free", "painless"
10. quality - "quality", "premium", "excellent", "superior", "high-end", "top-notch"
11. variety - "variety", "options", "choices", "selection", "diverse", "multiple"
12. sensory_appeal - "beautiful", "stunning", "elegant", "sleek", "modern", "stylish"

EMOTIONAL ELEMENTS (13-24):
13. provides_access - "exclusive", "membership", "VIP", "special", "privileged", "insider"
14. fun_entertainment - "fun", "entertaining", "enjoyable", "exciting", "thrilling", "amusing"
15. motivates - "motivating", "inspiring", "encouraging", "empowering", "energizing"
16. reduces_anxiety - "calming", "soothing", "reassuring", "comforting", "peaceful"
17. badge_value - "status", "prestige", "exclusive", "elite", "premium", "luxury"
18. wellness - "healthy", "wellness", "fitness", "well-being", "health", "vitality"
19. therapeutic - "healing", "therapeutic", "relaxing", "stress-relief", "calming"
20. attractiveness - "beautiful", "attractive", "stunning", "gorgeous", "elegant"
21. nostalgia - "nostalgic", "memories", "retro", "classic", "vintage", "throwback"
22. design_aesthetics - "beautiful", "stunning", "elegant", "sleek", "modern", "stylish"
23. rewards_me - "rewards", "incentives", "bonuses", "perks", "benefits", "gifts"
24. informs - "informative", "educational", "insights", "knowledge", "learning", "understanding"

LIFE CHANGING ELEMENTS (25-29):
25. provides_hope - "hope", "future", "potential", "possibility", "dream", "aspiration"
26. self_actualization - "potential", "growth", "development", "achievement", "success"
27. motivation - "motivating", "inspiring", "encouraging", "empowering", "driving"
28. heirloom - "legacy", "lasting", "timeless", "permanent", "enduring", "heritage"
29. affiliation - "belonging", "community", "family", "group", "team", "together"

SOCIAL IMPACT ELEMENTS (30):
30. self_transcendence - "greater good", "impact", "change", "difference", "contribution", "purpose"

B2B ELEMENTS OF VALUE (40 Elements):

TABLE STAKES (1-4):
1. meeting_specifications - "meets requirements", "specifications", "standards", "compliance"
2. acceptable_price - "competitive", "affordable", "value", "pricing", "cost-effective"
3. regulatory_compliance - "compliant", "certified", "approved", "regulated", "standards"
4. ethical_standards - "ethical", "responsible", "integrity", "transparent", "honest"

FUNCTIONAL (5-9):
5. improved_top_line - "revenue", "growth", "sales", "profit", "income", "returns"
6. cost_reduction - "savings", "reduce costs", "efficiency", "optimization", "cut expenses"
7. product_quality - "quality", "reliable", "durable", "premium", "excellent", "superior"
8. scalability - "scalable", "expandable", "grows with you", "flexible", "adaptable"
9. innovation - "innovative", "cutting-edge", "advanced", "breakthrough", "revolutionary"

EASE OF DOING BUSINESS (10-28):
10. time_savings - "time-saving", "efficient", "quick", "fast", "streamlined", "rapid"
11. reduced_effort - "effortless", "easy", "simple", "straightforward", "minimal effort"
12. decreased_hassles - "hassle-free", "smooth", "seamless", "trouble-free", "painless"
13. information - "insights", "data", "analytics", "reporting", "visibility", "transparency"
14. transparency - "transparent", "clear", "open", "honest", "visible", "accountable"
15. organization - "organized", "structured", "systematic", "orderly", "methodical"
16. simplification - "simple", "streamlined", "unified", "consolidated", "integrated"
17. connection - "connect", "integrate", "unify", "link", "bridge", "network"
18. integration - "seamless", "compatible", "works with", "connects", "unified"
19. availability - "available", "accessible", "24/7", "always on", "reliable"
20. variety - "options", "choices", "flexible", "customizable", "diverse", "multiple"
21. configurability - "configurable", "customizable", "flexible", "adaptable", "tailored"
22. responsiveness - "responsive", "quick", "fast", "immediate", "prompt", "reactive"
23. expertise - "expert", "specialized", "knowledgeable", "skilled", "professional"
24. commitment - "committed", "dedicated", "loyal", "reliable", "consistent", "devoted"
25. stability - "stable", "reliable", "consistent", "dependable", "secure", "solid"
26. cultural_fit - "culture", "values", "alignment", "compatibility", "partnership"
27. risk_reduction - "risk-free", "safe", "secure", "protected", "guaranteed", "reliable"
28. reach - "reach", "scale", "global", "worldwide", "extensive", "broad"

INDIVIDUAL (29-35):
29. network_expansion - "network", "connections", "relationships", "partnerships", "community"
30. marketability - "marketable", "credible", "reputable", "recognized", "established"
31. reputational_assurance - "reputation", "trusted", "reliable", "credible", "established"
32. design_aesthetics - "beautiful", "stunning", "elegant", "professional", "polished"
33. growth_development - "growth", "development", "learning", "improvement", "advancement"
34. reduced_anxiety - "peace of mind", "confidence", "reassurance", "security", "comfort"
35. fun_perks - "enjoyable", "fun", "engaging", "exciting", "rewarding", "satisfying"

INSPIRATIONAL (36-40):
36. purpose - "purpose", "mission", "meaning", "impact", "contribution", "significance"
37. vision - "vision", "future", "potential", "possibility", "aspiration", "dream"
38. hope - "hope", "optimism", "confidence", "belief", "faith", "trust"
39. social_responsibility - "responsible", "sustainable", "ethical", "impact", "contribution"
40. self_transcendence - "greater good", "impact", "change", "difference", "legacy"

IMPORTANT: Look for both explicit statements AND implicit indicators. The content may express these concepts using different words, metaphors, or indirect language. Focus on the underlying meaning and intent, not just exact keyword matches.

Return response as valid JSON with this structure:
{
  "b2c": {
    "overall_score": 75,
    "functional_score": 80,
    "emotional_score": 70,
    "life_changing_score": 60,
    "social_impact_score": 50,
    "elements": {
      "saves_time": { "present": true, "strength": 8, "evidence": ["homepage", "features"] },
      "simplifies": { "present": true, "strength": 7, "evidence": ["how it works"] }
    },
    "recommendations": ["Improve emotional connection", "Add more life-changing elements"]
  },
  "b2b": {
    "overall_score": 70,
    "table_stakes_score": 85,
    "functional_score": 75,
    "ease_of_doing_business_score": 65,
    "individual_score": 60,
    "inspirational_score": 55,
    "elements": {
      "meeting_specifications": { "present": true, "strength": 9, "evidence": ["compliance page"] },
      "cost_reduction": { "present": true, "strength": 6, "evidence": ["pricing"] }
    },
    "recommendations": ["Enhance ease of doing business", "Add inspirational elements"]
  }
}
`;
  }
}

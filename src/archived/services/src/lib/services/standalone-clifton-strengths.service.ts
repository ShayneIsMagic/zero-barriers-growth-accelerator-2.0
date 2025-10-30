/**
 * Standalone CliftonStrengths Analysis Service
 * Uses Content-Comparison pattern: Direct AI analysis without database dependencies
 */

import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CliftonStrengthsResult {
  success: boolean;
  url: string;
  data: {
    overall_score: number;
    strategic_thinking_score: number;
    executing_score: number;
    influencing_score: number;
    relationship_building_score: number;
    themes: {
      strategic_thinking: Record<
        string,
        { present: boolean; strength: number; evidence: string[] }
      >;
      executing: Record<
        string,
        { present: boolean; strength: number; evidence: string[] }
      >;
      influencing: Record<
        string,
        { present: boolean; strength: number; evidence: string[] }
      >;
      relationship_building: Record<
        string,
        { present: boolean; strength: number; evidence: string[] }
      >;
    };
    top_themes: Array<{
      theme: string;
      domain: string;
      strength: number;
      evidence: string[];
    }>;
    recommendations: string[];
  };
  error?: string;
}

export class StandaloneCliftonStrengthsService {
  private static genAI: GoogleGenerativeAI;

  static initialize() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Analyze website using CliftonStrengths framework
   * Follows Content-Comparison pattern: Scrape → AI Analysis → Return
   */
  static async analyzeWebsite(url: string): Promise<CliftonStrengthsResult> {
    try {
      console.log(`🔄 Starting CliftonStrengths analysis for: ${url}`);

      // Step 1: Scrape website content (like Content-Comparison)
      console.log('📊 Step 1: Scraping website content...');
      const scrapedData = await scrapeWebsiteContent(url);

      // Step 2: Run AI analysis (like Content-Comparison)
      console.log('🤖 Step 2: Running CliftonStrengths AI analysis...');
      const analysisResult = await this.runCliftonStrengthsAnalysis(
        scrapedData,
        url
      );

      console.log(`✅ CliftonStrengths analysis completed for: ${url}`);

      return {
        success: true,
        url,
        data: analysisResult,
      };
    } catch (error) {
      console.error('CliftonStrengths analysis failed:', error);
      return {
        success: false,
        url,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  /**
   * Run CliftonStrengths analysis using Gemini AI
   */
  private static async runCliftonStrengthsAnalysis(
    scrapedData: any,
    url: string
  ): Promise<any> {
    if (!this.genAI) {
      this.initialize();
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = this.buildCliftonStrengthsPrompt(scrapedData, url);

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
      console.error('Gemini CliftonStrengths analysis failed:', error);
      throw new Error('AI analysis failed');
    }
  }

  /**
   * Build comprehensive CliftonStrengths prompt
   */
  private static buildCliftonStrengthsPrompt(
    scrapedData: any,
    url: string
  ): string {
    return `
Analyze this website to identify the dominant CliftonStrengths themes (34 themes across 4 domains) of the organization or individual represented.

WEBSITE CONTENT:
URL: ${url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}

CLIFTONSTRENGTHS THEMES (34 Total):

STRATEGIC THINKING DOMAIN (8 themes):
1. Analytical - "data", "analysis", "research", "evidence", "metrics", "insights", "break down", "examine"
2. Context - "history", "background", "story", "journey", "evolution", "past", "heritage", "legacy"
3. Futuristic - "future", "vision", "ahead", "tomorrow", "next", "forward", "innovation", "breakthrough"
4. Ideation - "ideas", "creative", "innovative", "unique", "different", "imagination", "brainstorm", "concept"
5. Input - "collect", "gather", "research", "learn", "discover", "explore", "investigate", "study"
6. Intellection - "think", "reflect", "consider", "ponder", "philosophy", "intellectual", "deep", "complex"
7. Learner - "learn", "grow", "develop", "improve", "master", "study", "education", "knowledge"
8. Strategic - "strategy", "plan", "approach", "methodology", "framework", "systematic", "organized", "structured"

EXECUTING DOMAIN (9 themes):
9. Achiever - "achieve", "accomplish", "success", "results", "goals", "targets", "deliver", "complete"
10. Arranger - "organize", "coordinate", "manage", "arrange", "structure", "system", "process", "workflow"
11. Belief - "values", "principles", "ethics", "mission", "purpose", "beliefs", "standards", "integrity"
12. Consistency - "consistent", "reliable", "stable", "predictable", "uniform", "standard", "regular", "steady"
13. Deliberative - "careful", "thoughtful", "cautious", "thorough", "precise", "meticulous", "detailed", "considered"
14. Discipline - "disciplined", "focused", "structured", "routine", "systematic", "methodical", "organized", "controlled"
15. Focus - "focus", "concentrate", "prioritize", "target", "direct", "specific", "clear", "sharp"
16. Responsibility - "responsible", "accountable", "commitment", "dependable", "reliable", "ownership", "duty", "obligation"
17. Restorative - "solve", "fix", "repair", "restore", "heal", "improve", "correct", "resolve"

INFLUENCING DOMAIN (8 themes):
18. Activator - "action", "start", "begin", "launch", "initiate", "move", "execute", "implement"
19. Command - "lead", "direct", "control", "authority", "decisive", "confident", "bold", "assertive"
20. Communication - "communicate", "explain", "present", "speak", "write", "express", "articulate", "convey"
21. Competition - "compete", "win", "beat", "challenge", "rival", "opponent", "victory", "success"
22. Maximizer - "maximize", "optimize", "excel", "best", "superior", "excellence", "perfect", "outstanding"
23. Self-Assurance - "confident", "certain", "sure", "belief", "trust", "faith", "conviction", "assurance"
24. Significance - "important", "matter", "impact", "influence", "difference", "meaningful", "valuable", "essential"
25. Woo - "connect", "relate", "charm", "persuade", "influence", "engage", "attract", "win over"

RELATIONSHIP BUILDING DOMAIN (9 themes):
26. Adaptability - "adapt", "flexible", "adjust", "change", "versatile", "responsive", "accommodating", "open"
27. Connectedness - "connect", "link", "relate", "unite", "together", "bond", "relationship", "network"
28. Developer - "develop", "grow", "improve", "mentor", "coach", "nurture", "cultivate", "enhance"
29. Empathy - "understand", "feel", "care", "compassion", "sensitive", "supportive", "kind", "gentle"
30. Harmony - "harmony", "balance", "peace", "calm", "smooth", "cooperative", "collaborative", "unified"
31. Includer - "include", "welcome", "embrace", "accept", "open", "diverse", "inclusive", "belong"
32. Individualization - "unique", "individual", "personal", "custom", "specific", "tailored", "personalized", "distinct"
33. Positivity - "positive", "optimistic", "cheerful", "enthusiastic", "upbeat", "bright", "hopeful", "energetic"
34. Relator - "relate", "connect", "bond", "relationship", "trust", "intimacy", "close", "personal"

ANALYSIS INSTRUCTIONS:
1. Identify which themes are most prominent in the website's messaging, tone, and offerings
2. For each theme, provide a score (0-10) indicating its presence and manifestation
3. Describe how each theme manifests in the website's content
4. Focus on the top 5-10 most prominent themes
5. Look for both explicit statements AND implicit indicators
6. Consider the overall brand personality and approach

IMPORTANT: Look for both explicit statements AND implicit indicators. The content may express these themes using different words, metaphors, or indirect language. Focus on the underlying meaning and intent, not just exact keyword matches.

Return response as valid JSON with this structure:
{
  "overall_score": 75,
  "strategic_thinking_score": 80,
  "executing_score": 70,
  "influencing_score": 65,
  "relationship_building_score": 75,
  "themes": {
    "strategic_thinking": {
      "analytical": { "present": true, "strength": 8, "evidence": ["data section", "metrics page"] },
      "futuristic": { "present": true, "strength": 7, "evidence": ["vision statement", "future goals"] }
    },
    "executing": {
      "achiever": { "present": true, "strength": 9, "evidence": ["results page", "success stories"] },
      "focus": { "present": true, "strength": 6, "evidence": ["clear objectives"] }
    },
    "influencing": {
      "communication": { "present": true, "strength": 8, "evidence": ["clear messaging", "blog posts"] }
    },
    "relationship_building": {
      "empathy": { "present": true, "strength": 7, "evidence": ["customer stories", "support section"] }
    }
  },
  "top_themes": [
    { "theme": "achiever", "domain": "executing", "strength": 9, "evidence": ["results page", "success stories"] },
    { "theme": "analytical", "domain": "strategic_thinking", "strength": 8, "evidence": ["data section", "metrics"] }
  ],
  "recommendations": ["Leverage analytical strength more", "Develop influencing themes"]
}
`;
  }
}

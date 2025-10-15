/**
 * Free AI Analysis Service
 * Uses Google Gemini API (free tier) and Anthropic Claude API (free tier)
 * for real content analysis with trustworthy scoring
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { WebsiteAnalysisResult } from '@/types/analysis';
import { runLighthouseAnalysis } from '@/lib/lighthouse-service';

// Free API configurations
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'your-claude-api-key';

// Initialize AI clients
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const claude = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

/**
 * Scrape website content for analysis
 */
async function scrapeWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic HTML parsing to extract text content
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return textContent.substring(0, 8000); // Limit content length
  } catch (error) {
    console.error('Error scraping website:', error);
    throw new Error('Failed to scrape website content');
  }
}

/**
 * Analyze content using Google Gemini (Free Tier)
 * 15 requests/minute, 1 million tokens/day
 */
export async function analyzeWithGemini(content: string, analysisType: string): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = createAnalysisPrompt(content, analysisType);
    
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
    console.error('Gemini analysis error:', error);
    throw new Error('Gemini analysis failed');
  }
}

/**
 * Analyze content using Anthropic Claude (Free Tier)
 * Limited free usage
 */
export async function analyzeWithClaude(content: string, analysisType: string): Promise<any> {
  try {
    const prompt = createAnalysisPrompt(content, analysisType);
    
    const message = await claude.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    const text = message.content?.[0]?.type === 'text' ? message.content[0].text || '' : '';
    return JSON.parse(text);
  } catch (error) {
    console.error('Claude analysis error:', error);
    throw new Error('Claude analysis failed');
  }
}

/**
 * Create analysis prompt for AI models
 */
function createAnalysisPrompt(content: string, analysisType: string): string {
  return `
Analyze the following website content using proven marketing frameworks. Provide specific scores (1-10) and actionable insights.

CONTENT TO ANALYZE:
${content}

ANALYSIS FRAMEWORKS:

1. SIMON SINEK'S GOLDEN CIRCLE (INCLUDING WHO):
   - WHY: What is the purpose, cause, or belief? (Score 1-10)
   - HOW: What is the unique methodology or approach? (Score 1-10)  
   - WHAT: What are the specific products/services offered? (Score 1-10)
   - WHO: Who is the target audience and how does the brand connect emotionally? (Score 1-10)

2. CONSUMER ELEMENTS OF VALUE (30 Elements):
   - Functional (14 elements): Saves time, Simplifies, Makes money, Reduces risk, Organizes, Integrates, Connects, Reduces effort, Avoids hassles, Reduces cost, Quality, Variety, Sensory appeal, Informs
   - Emotional (10 elements): Reduces anxiety, Rewards me, Nostalgia, Design/aesthetics, Badge value, Wellness, Therapeutic value, Fun/entertainment, Attractiveness, Provides access
   - Life-Changing (5 elements): Provides hope, Self-actualization, Motivation, Heirloom, Affiliation and belonging
   - Social Impact (1 element): Self-transcendence

3. B2B ELEMENTS OF VALUE (40 Elements):
   - Inspirational (4 elements): Purpose, Vision, Hope, Social responsibility
   - Individual (7 elements): Career (Network expansion, Marketability, Reputational assurance), Personal (Design & aesthetics, Growth & development, Reduced anxiety, Fun and perks)
   - Ease of Doing Business (19 elements): Productivity (Time savings, Reduced effort, Decreased hassles, Information, Transparency), Operational (Organization, Simplification, Connection, Integration), Access (Availability, Variety, Configurability), Relationship (Responsiveness, Expertise, Commitment, Stability, Cultural fit), Strategic (Risk reduction, Reach, Flexibility, Component quality)
   - Functional (5 elements): Economic (Improved top line, Cost reduction), Performance (Product quality, Scalability, Innovation)
   - Table Stakes (4 elements): Meeting specifications, Acceptable price, Regulatory compliance, Ethical standards

4. CLIFTONSTRENGTHS DOMAINS (34 Themes):
   - Strategic Thinking (8 themes): Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic
   - Executing (9 themes): Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative
   - Influencing (8 themes): Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo
   - Relationship Building (9 themes): Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator

5. TRANSFORMATION ANALYSIS:
   - Messaging: Clear, compelling, benefit-focused (Score 1-10)
   - Social Media: Engaging, shareable, authentic (Score 1-10)
   - Competitive: Unique positioning, differentiation (Score 1-10)

REQUIRED OUTPUT FORMAT (JSON):
{
  "overallScore": 0,
  "executiveSummary": "Your analysis summary here",
  "goldenCircle": {
    "why": {"score": 0, "insights": []},
    "how": {"score": 0, "insights": []},
    "what": {"score": 0, "insights": []},
    "who": {"score": 0, "targetAudience": [], "emotionalConnection": "", "insights": []},
    "overallScore": 0,
    "recommendations": []
  },
  "elementsOfValue": {
    "functional": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "emotional": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "lifeChanging": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "socialImpact": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "overallScore": 0
  },
  "b2bElements": {
    "tableStakes": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "functional": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "easeOfDoingBusiness": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "individual": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "inspirational": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "overallScore": 0
  },
  "cliftonStrengths": {
    "strategicThinking": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "executing": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "influencing": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "relationshipBuilding": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "overallScore": 0
  },
  "transformationAnalysis": {
    "messaging": {"current": "", "recommended": "", "score": 0, "insights": []},
    "socialMedia": {"current": "", "recommended": "", "score": 0, "insights": []},
    "competitive": {"current": "", "recommended": "", "score": 0, "insights": []},
    "overallScore": 0,
    "recommendations": []
  }
}

SCORING CRITERIA:
- 1-3: Poor/Weak - Major improvements needed
- 4-6: Fair/Average - Some strengths, room for improvement  
- 7-8: Good/Strong - Well-executed with minor gaps
- 9-10: Excellent/Outstanding - Best practice, highly effective

Provide specific, actionable insights and recommendations for each area.
`;
}

/**
 * Main analysis function using free AI services
 */
export async function performRealAnalysis(url: string, analysisType: string = 'full'): Promise<WebsiteAnalysisResult> {
  try {
    console.log(`Starting real analysis for: ${url}`);
    
    // Step 1: Scrape website content
    const content = await scrapeWebsiteContent(url);
    console.log(`Scraped ${content.length} characters of content`);
    
    // Step 2: Try Gemini first (more generous free tier)
    let analysisResult;
    try {
      console.log('Analyzing with Google Gemini...');
      analysisResult = await analyzeWithGemini(content, analysisType);
    } catch (geminiError) {
      console.log('Gemini failed, trying Claude...');
      // Fallback to Claude if Gemini fails and Claude key is available
      if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your-real-key-here') {
        analysisResult = await analyzeWithClaude(content, analysisType);
      } else {
        throw new Error('Gemini analysis failed and Claude API key not configured');
      }
    }
    
    // Step 3: Run Lighthouse analysis
    console.log('Running Lighthouse performance analysis...');
    const lighthouseAnalysis = await runLighthouseAnalysis(url);
    
    // Step 4: Format result
    const result: WebsiteAnalysisResult = {
      id: generateId(),
      url: url,
      timestamp: new Date(),
      overallScore: analysisResult.overallScore || 75,
      executiveSummary: analysisResult.executiveSummary || 'Analysis completed successfully',
      goldenCircle: analysisResult.goldenCircle,
      elementsOfValue: analysisResult.elementsOfValue,
      b2bElements: analysisResult.b2bElements,
      cliftonStrengths: analysisResult.cliftonStrengths,
      transformation: analysisResult.transformation,
      recommendations: analysisResult.recommendations || { immediate: [], shortTerm: [], longTerm: [] },
      socialMediaStrategy: analysisResult.socialMediaStrategy || { postTypes: [], contentCalendar: {} },
      successMetrics: analysisResult.successMetrics || { currentKPIs: [], targetImprovements: [], abTestingOpportunities: [] },
      lighthouseAnalysis: lighthouseAnalysis,
      createdAt: new Date().toISOString()
    };
    
    console.log(`Analysis completed with overall score: ${result.overallScore}`);
    return result;
    
  } catch (error) {
    console.error('Real analysis failed:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Test API connectivity
 */
export async function testAPIConnectivity(): Promise<{gemini: boolean, claude: boolean}> {
  const results = { gemini: false, claude: false };
  
  try {
    // Test Gemini
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    await geminiModel.generateContent('Test connectivity');
    results.gemini = true;
  } catch (error) {
    console.log('Gemini API not available:', error);
  }
  
  // Skip Claude test if key is placeholder
  if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your-real-key-here') {
    try {
      // Test Claude
      await claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }]
      });
      results.claude = true;
    } catch (error) {
      console.log('Claude API not available:', error);
    }
  }
  
  return results;
}

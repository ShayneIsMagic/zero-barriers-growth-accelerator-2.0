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
  "overallScore": 75,
  "executiveSummary": "Brief summary of findings",
  "goldenCircle": {
    "why": {"score": 7, "insights": ["insight1", "insight2"]},
    "how": {"score": 8, "insights": ["insight1", "insight2"]},
    "what": {"score": 9, "insights": ["insight1", "insight2"]},
    "who": {"score": 8, "targetAudience": ["audience1", "audience2"], "emotionalConnection": "connection description", "insights": ["insight1", "insight2"]},
    "overallScore": 80,
    "recommendations": ["rec1", "rec2"]
  },
  "elementsOfValue": {
    "functional": {
      "score": 8,
      "elements": {
        "savesTime": true,
        "simplifies": true,
        "makesMoney": false,
        "reducesRisk": true,
        "organizes": true,
        "integrates": false,
        "connects": true,
        "reducesEffort": true,
        "avoidsHassles": true,
        "reducesCost": false,
        "quality": true,
        "variety": false,
        "sensoryAppeal": false,
        "informs": true
      },
      "recommendations": ["rec1", "rec2"]
    },
    "emotional": {
      "score": 6,
      "elements": {
        "reducesAnxiety": true,
        "rewardsMe": false,
        "nostalgia": false,
        "designAesthetics": true,
        "badgeValue": false,
        "wellness": false,
        "therapeuticValue": false,
        "funEntertainment": false,
        "attractiveness": true,
        "providesAccess": true
      },
      "recommendations": ["rec1", "rec2"]
    },
    "lifeChanging": {
      "score": 5,
      "elements": {
        "providesHope": true,
        "selfActualization": false,
        "motivation": true,
        "heirloom": false,
        "affiliationBelonging": false
      },
      "recommendations": ["rec1", "rec2"]
    },
    "socialImpact": {
      "score": 4,
      "elements": {
        "selfTranscendence": false
      },
      "recommendations": ["rec1", "rec2"]
    },
    "overallScore": 6
  },
  "b2bElements": {
    "inspirational": {
      "score": 6,
      "elements": {
        "purpose": true,
        "vision": false,
        "hope": true,
        "socialResponsibility": false
      },
      "recommendations": ["rec1", "rec2"]
    },
    "individual": {
      "score": 7,
      "career": {
        "networkExpansion": true,
        "marketability": true,
        "reputationalAssurance": false
      },
      "personal": {
        "designAesthetics": true,
        "growthDevelopment": true,
        "reducedAnxiety": true,
        "funPerks": false
      },
      "recommendations": ["rec1", "rec2"]
    },
    "easeOfDoingBusiness": {
      "score": 8,
      "productivity": {
        "timeSavings": true,
        "reducedEffort": true,
        "decreasedHassles": true,
        "information": true,
        "transparency": false
      },
      "operational": {
        "organization": true,
        "simplification": true,
        "connection": true,
        "integration": false
      },
      "access": {
        "availability": true,
        "variety": false,
        "configurability": false
      },
      "relationship": {
        "responsiveness": true,
        "expertise": true,
        "commitment": true,
        "stability": true,
        "culturalFit": false
      },
      "strategic": {
        "riskReduction": true,
        "reach": false,
        "flexibility": true,
        "componentQuality": true
      },
      "recommendations": ["rec1", "rec2"]
    },
    "functional": {
      "score": 8,
      "economic": {
        "improvedTopLine": true,
        "costReduction": true
      },
      "performance": {
        "productQuality": true,
        "scalability": true,
        "innovation": false
      },
      "recommendations": ["rec1", "rec2"]
    },
    "tableStakes": {
      "score": 9,
      "elements": {
        "meetingSpecifications": true,
        "acceptablePrice": true,
        "regulatoryCompliance": true,
        "ethicalStandards": true
      },
      "recommendations": ["rec1", "rec2"]
    },
    "overallScore": 8
  },
  "cliftonStrengths": {
    "strategicThinking": {
      "score": 8,
      "elements": {
        "analytical": true,
        "context": true,
        "futuristic": false,
        "ideation": true,
        "input": true,
        "intellection": true,
        "learner": true,
        "strategic": true
      },
      "recommendations": ["rec1", "rec2"]
    },
    "executing": {
      "score": 7,
      "elements": {
        "achiever": true,
        "arranger": true,
        "belief": false,
        "consistency": true,
        "deliberative": true,
        "discipline": true,
        "focus": true,
        "responsibility": true,
        "restorative": false
      },
      "recommendations": ["rec1", "rec2"]
    },
    "influencing": {
      "score": 6,
      "elements": {
        "activator": false,
        "command": false,
        "communication": true,
        "competition": false,
        "maximizer": true,
        "selfAssurance": true,
        "significance": false,
        "woo": false
      },
      "recommendations": ["rec1", "rec2"]
    },
    "relationshipBuilding": {
      "score": 5,
      "elements": {
        "adaptability": true,
        "connectedness": false,
        "developer": true,
        "empathy": true,
        "harmony": false,
        "includer": false,
        "individualization": true,
        "positivity": false,
        "relator": false
      },
      "recommendations": ["rec1", "rec2"]
    },
    "overallScore": 65
  },
  "transformationAnalysis": {
    "messaging": {"current": "current state", "recommended": "improved state", "score": 6, "insights": ["insight1"]},
    "socialMedia": {"current": "current state", "recommended": "improved state", "score": 5, "insights": ["insight1"]},
    "competitive": {"current": "current state", "recommended": "improved state", "score": 7, "insights": ["insight1"]},
    "overallScore": 60,
    "recommendations": ["rec1", "rec2"]
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

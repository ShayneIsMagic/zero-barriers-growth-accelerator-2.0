import OpenAI from 'openai';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export interface AnalysisResult {
  goldenCircle: {
    why: string;
    how: string;
    what: string;
    overallScore: number;
    insights: string[];
  };
  elementsOfValue: {
    functional: { [key: string]: number };
    emotional: { [key: string]: number };
    lifeChanging: { [key: string]: number };
    socialImpact: { [key: string]: number };
    overallScore: number;
    insights: string[];
  };
  cliftonStrengths: {
    themes: { [key: string]: number };
    recommendations: string[];
    overallScore: number;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    actionItems: string[];
  }[];
  overallScore: number;
  summary: string;
}

export class AIService {
  static async analyzeWebsite(url: string): Promise<AnalysisResult> {
    if (!openai) {
      throw new Error(
        'OpenAI API key is not configured. Please contact support.'
      );
    }

    try {
      // First, fetch the website content
      const websiteContent = await this.fetchWebsiteContent(url);

      // Then analyze the content
      return await this.analyzeContent(websiteContent, 'website');
    } catch (error) {
      console.error('Website analysis error:', error);
      throw new Error(
        `Website analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static async analyzeContent(
    content: string,
    contentType: 'website' | 'text' | 'document' = 'text'
  ): Promise<AnalysisResult> {
    if (!openai) {
      throw new Error(
        'OpenAI API key is not configured. Please contact support.'
      );
    }

    try {
      const prompt = this.buildAnalysisPrompt(content, contentType);

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert business analyst specializing in content analysis using proven frameworks. Analyze the provided content using Simon Sinek's Golden Circle, Bain's Elements of Value, and Gallup's CliftonStrengths principles. Return your analysis in valid JSON format.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No analysis returned from OpenAI');
      }

      // Parse the JSON response
      const analysis = JSON.parse(analysisText);

      // Validate and structure the response
      return this.validateAndStructureAnalysis(analysis);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error(
        `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private static async fetchWebsiteContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ZeroBarriersBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch website: ${response.status} ${response.statusText}`
        );
      }

      const html = await response.text();

      // Extract text content from HTML (basic implementation)
      const textContent = html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return textContent.substring(0, 8000); // Limit content length
    } catch (error) {
      throw new Error(
        `Failed to fetch website content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private static buildAnalysisPrompt(
    content: string,
    contentType: string
  ): string {
    return `
Analyze the following ${contentType} content using three proven business frameworks:

CONTENT TO ANALYZE:
${content}

Please provide a comprehensive analysis in the following JSON format:

{
  "goldenCircle": {
    "why": "The purpose, cause, or belief that drives this content (1-2 sentences)",
    "how": "The process or method used to deliver the value (1-2 sentences)",
    "what": "The specific product, service, or outcome being offered (1-2 sentences)",
    "overallScore": 85,
    "insights": ["Key insight 1", "Key insight 2", "Key insight 3"]
  },
  "elementsOfValue": {
    "functional": {
      "savesTime": 8,
      "reducesRisk": 7,
      "simplifies": 9,
      "reducesEffort": 8,
      "avoidsHassles": 6,
      "organizes": 7,
      "integrates": 5,
      "connects": 8,
      "reducesCost": 7,
      "quality": 9
    },
    "emotional": {
      "reducesAnxiety": 7,
      "rewardsMe": 8,
      "nostalgia": 4,
      "designAesthetics": 9,
      "wellness": 6,
      "therapeuticValue": 5,
      "fun": 8,
      "entertainment": 7,
      "providesAccess": 8,
      "badgeValue": 6
    },
    "lifeChanging": {
      "motivation": 8,
      "selfActualization": 7,
      "hope": 9,
      "heirloom": 3,
      "selfTranscendence": 6
    },
    "socialImpact": {
      "belonging": 7,
      "makesMeBetter": 8
    },
    "overallScore": 78,
    "insights": ["Element insight 1", "Element insight 2", "Element insight 3"]
  },
  "cliftonStrengths": {
    "themes": {
      "achiever": 8,
      "activator": 7,
      "adaptability": 6,
      "analytical": 9,
      "arranger": 7,
      "belief": 8,
      "command": 5,
      "communication": 8,
      "competition": 6,
      "connectedness": 7,
      "consistency": 7,
      "context": 8,
      "deliberative": 8,
      "developer": 7,
      "discipline": 8,
      "empathy": 7,
      "focus": 8,
      "futuristic": 7,
      "harmony": 6,
      "ideation": 8,
      "includer": 6,
      "individualization": 7,
      "input": 8,
      "intellection": 9,
      "learner": 8,
      "maximizer": 7,
      "positivity": 7,
      "relator": 6,
      "responsibility": 8,
      "restorative": 7,
      "self-assurance": 7,
      "significance": 6,
      "strategic": 8,
      "woo": 5
    },
    "recommendations": ["Strength recommendation 1", "Strength recommendation 2"],
    "overallScore": 75
  },
  "recommendations": [
    {
      "priority": "high",
      "category": "Content Strategy",
      "description": "Specific recommendation description",
      "actionItems": ["Action 1", "Action 2", "Action 3"]
    }
  ],
  "overallScore": 79,
  "summary": "Comprehensive summary of the analysis findings and key recommendations."
}

Focus on:
1. Golden Circle: How well does the content communicate WHY it exists, HOW it delivers value, and WHAT it offers?
2. Elements of Value: Which of the 30 elements are most present and how strongly?
3. CliftonStrengths: What themes and strengths are evident in the content approach?
4. Provide actionable recommendations with specific priority levels and action items.
5. Score everything on a 1-10 scale (10 being excellent).

Be specific, actionable, and focus on business value and growth potential.
    `;
  }

  private static validateAndStructureAnalysis(analysis: any): AnalysisResult {
    // Validate and provide defaults for missing fields
    return {
      goldenCircle: {
        why: analysis.goldenCircle?.why || 'Analysis not available',
        how: analysis.goldenCircle?.how || 'Analysis not available',
        what: analysis.goldenCircle?.what || 'Analysis not available',
        overallScore: analysis.goldenCircle?.overallScore || 0,
        insights: analysis.goldenCircle?.insights || ['No insights available'],
      },
      elementsOfValue: {
        functional: analysis.elementsOfValue?.functional || {},
        emotional: analysis.elementsOfValue?.emotional || {},
        lifeChanging: analysis.elementsOfValue?.lifeChanging || {},
        socialImpact: analysis.elementsOfValue?.socialImpact || {},
        overallScore: analysis.elementsOfValue?.overallScore || 0,
        insights: analysis.elementsOfValue?.insights || [
          'No insights available',
        ],
      },
      cliftonStrengths: {
        themes: analysis.cliftonStrengths?.themes || {},
        recommendations: analysis.cliftonStrengths?.recommendations || [
          'No recommendations available',
        ],
        overallScore: analysis.cliftonStrengths?.overallScore || 0,
      },
      recommendations: analysis.recommendations || [],
      overallScore: analysis.overallScore || 0,
      summary: analysis.summary || 'Analysis summary not available',
    };
  }
}

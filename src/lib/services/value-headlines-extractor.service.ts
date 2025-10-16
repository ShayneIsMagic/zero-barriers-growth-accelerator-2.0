/**
 * Value-Centric Headlines Extractor Service
 * Extracts top 10 Why statements and How we are unique statements from scraped content
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ValueHeadlinesResult {
  success: boolean;
  url: string;
  data: {
    why_statements: Array<{
      statement: string;
      confidence: number;
      source: string;
      category: string;
    }>;
    how_statements: Array<{
      statement: string;
      confidence: number;
      source: string;
      category: string;
    }>;
    top_headlines: Array<{
      headline: string;
      type: 'why' | 'how';
      confidence: number;
      source: string;
    }>;
  };
  error?: string;
}

export class ValueHeadlinesExtractorService {
  private static genAI: GoogleGenerativeAI;

  static initialize() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Extract value-centric headlines from scraped content
   */
  static async extractHeadlines(scrapedData: any, url: string): Promise<ValueHeadlinesResult> {
    try {
      console.log(`📰 Starting value-centric headlines extraction for: ${url}`);

      if (!this.genAI) {
        this.initialize();
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      // PERSONA: Define the expert role
      const persona = `You are a Senior Brand Strategy Expert and Copywriter. Your expertise is in identifying compelling value propositions, unique selling points, and brand positioning statements from website content.`;

      // TASK: Define the specific analytical objective
      const task = `Analyze the provided website content to extract the top 10 most compelling "Why" statements (purpose, mission, beliefs) and "How we are unique" statements (differentiation, unique value propositions). Focus on statements that would resonate with customers and drive business growth.`;

      // CONTEXT: Provide the data to analyze
      const context = `WEBSITE CONTENT TO ANALYZE:
URL: ${url}
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Content: ${scrapedData.cleanText.substring(0, 4000)}
Headings: ${JSON.stringify(scrapedData.headings)}

FOCUS AREAS:
- Mission statements and purpose declarations
- Unique value propositions and differentiators
- Brand positioning statements
- Customer benefit statements
- Competitive advantage claims
- Value-driven headlines and taglines`;

      // FORMAT: Define the exact output structure
      const format = `Return your analysis as a valid JSON object with this exact structure:
{
  "why_statements": [
    {
      "statement": "string - the actual Why statement found",
      "confidence": number (0-10) - how confident you are this is a Why statement,
      "source": "string - where in the content this was found (e.g., 'hero section', 'about page')",
      "category": "string - type of Why statement (e.g., 'mission', 'purpose', 'belief', 'vision')"
    }
  ],
  "how_statements": [
    {
      "statement": "string - the actual How statement found",
      "confidence": number (0-10) - how confident you are this is a How statement,
      "source": "string - where in the content this was found",
      "category": "string - type of How statement (e.g., 'unique_value_prop', 'differentiator', 'methodology', 'approach')"
    }
  ],
  "top_headlines": [
    {
      "headline": "string - the most compelling headline/statement",
      "type": "why" or "how",
      "confidence": number (0-10),
      "source": "string - where this was found"
    }
  ]
}`;

      const prompt = `${persona}

${task}

${context}

${format}`;

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

        const analysisResult = JSON.parse(jsonText);

        console.log(`✅ Value-centric headlines extraction completed for: ${url}`);

        return {
          success: true,
          url,
          data: analysisResult
        };

      } catch (error) {
        console.error('Gemini headlines extraction failed:', error);
        throw new Error('AI headlines extraction failed');
      }

    } catch (error) {
      console.error('Value headlines extraction failed:', error);
      return {
        success: false,
        url,
        data: {
          why_statements: [],
          how_statements: [],
          top_headlines: []
        },
        error: error instanceof Error ? error.message : 'Headlines extraction failed'
      };
    }
  }
}

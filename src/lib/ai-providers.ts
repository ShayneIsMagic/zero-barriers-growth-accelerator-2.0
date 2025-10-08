import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { CostMonitor } from './cost-monitor';

export type AIProvider = 'openai' | 'gemini' | 'claude';

export interface AIProviderConfig {
  openai?: {
    apiKey: string;
    model?: string;
  };
  gemini?: {
    apiKey: string;
    model?: string;
  };
  claude?: {
    apiKey: string;
    model?: string;
  };
}

export interface AnalysisRequest {
  content: string;
  url?: string;
  contentType: 'website' | 'text' | 'document';
}

export interface AnalysisResult {
  id: string;
  url: string;
  createdAt: string;
  goldenCircle: {
    why: {
      statement: string;
      source: string;
      score: number;
      insights: string[];
    };
    how: {
      methodology: string;
      framework: string;
      score: number;
      insights: string[];
    };
    what: {
      offerings: string[];
      categories: string[];
      score: number;
      insights: string[];
    };
    who: {
      testimonials: Array<{
        client: string;
        company: string;
        title: string;
        quote: string;
        results: string;
      }>;
      targetAudience: string;
      score: number;
      insights: string[];
    };
    overallScore: number;
    summary: string;
  };
  elementsOfValue: {
    functional: { [key: string]: { score: number; evidence: string } };
    emotional: { [key: string]: { score: number; evidence: string } };
    lifeChanging: { [key: string]: { score: number; evidence: string } };
    socialImpact: { [key: string]: { score: number; evidence: string } };
    overallScore: number;
    topElements: string[];
    summary: string;
  };
  cliftonStrengths: {
    executing: { [key: string]: { score: number; evidence: string } };
    influencing: { [key: string]: { score: number; evidence: string } };
    relationshipBuilding: { [key: string]: { score: number; evidence: string } };
    strategicThinking: { [key: string]: { score: number; evidence: string } };
    overallScore: number;
    topThemes: string[];
    summary: string;
  };
  recommendations: {
    highPriority: Array<{
      category: string;
      title: string;
      description: string;
      actionItems: string[];
      expectedImpact: string;
      effort: string;
      timeline: string;
    }>;
    mediumPriority: Array<{
      category: string;
      title: string;
      description: string;
      actionItems: string[];
      expectedImpact: string;
      effort: string;
      timeline: string;
    }>;
    lowPriority: Array<{
      category: string;
      title: string;
      description: string;
      actionItems: string[];
      expectedImpact: string;
      effort: string;
      timeline: string;
    }>;
    summary: string;
    nextSteps: string[];
  };
  overallScore: number;
  summary: string;
}

export class AIProviderService {
  private config: AIProviderConfig;
  private openai?: OpenAI;
  private gemini?: GoogleGenerativeAI;
  private claude?: Anthropic;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI
    if (this.config.openai?.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.openai.apiKey,
      });
    }

    // Initialize Gemini
    if (this.config.gemini?.apiKey) {
      this.gemini = new GoogleGenerativeAI(this.config.gemini.apiKey);
    }

    // Initialize Claude
    if (this.config.claude?.apiKey) {
      this.claude = new Anthropic({
        apiKey: this.config.claude.apiKey,
      });
    }
  }

  async analyzeWithProvider(
    provider: AIProvider,
    request: AnalysisRequest
  ): Promise<AnalysisResult> {
    // Check cost limits before processing
    const model = this.getModelForProvider(provider);
    const costCheck = CostMonitor.checkCostLimits(provider, model, request.content.length);
    
    if (!costCheck.allowed) {
      throw new Error(`Cost limit exceeded: ${costCheck.reason}`);
    }

    // Record usage for cost tracking
    CostMonitor.recordUsage(provider, model, request.content.length);

    switch (provider) {
      case 'openai':
        return this.analyzeWithOpenAI(request);
      case 'gemini':
        return this.analyzeWithGemini(request);
      case 'claude':
        return this.analyzeWithClaude(request);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  private getModelForProvider(provider: AIProvider): string {
    switch (provider) {
      case 'openai':
        return this.config.openai?.model || 'gpt-4o';
      case 'gemini':
        return this.config.gemini?.model || 'gemini-1.5-flash';
      case 'claude':
        return this.config.claude?.model || 'claude-3-haiku-20240307';
      default:
        return 'unknown';
    }
  }

  private async analyzeWithOpenAI(request: AnalysisRequest): Promise<AnalysisResult> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    // Cost protection: Limit content length
    if (request.content.length > 50000) {
      throw new Error('Content too long. Please reduce content size to under 50,000 characters.');
    }

    const prompt = this.buildAnalysisPrompt(request);
    const model = this.config.openai?.model || 'gpt-4o';

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert business analyst specializing in content analysis using proven frameworks. Analyze the provided content using Simon Sinek's Golden Circle, Bain's Elements of Value, and Gallup's CliftonStrengths principles. Return your analysis in valid JSON format.`
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000, // Cost control
      });

      const rawAnalysis = response.choices[0]?.message?.content;
      if (!rawAnalysis) {
        throw new Error('OpenAI analysis returned no content.');
      }

      try {
        return JSON.parse(rawAnalysis);
      } catch (parseError) {
        console.error('OpenAI JSON parsing failed:', parseError);
        console.error('Raw response:', rawAnalysis.substring(0, 500) + '...');
        throw new Error(`OpenAI returned invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      throw new Error(`OpenAI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async analyzeWithGemini(request: AnalysisRequest): Promise<AnalysisResult> {
    if (!this.gemini) {
      throw new Error('Gemini not configured');
    }

    // Cost protection: Limit content length
    if (request.content.length > 50000) {
      throw new Error('Content too long. Please reduce content size to under 50,000 characters.');
    }

    const prompt = this.buildAnalysisPrompt(request);
    const model = this.config.gemini?.model || 'gemini-1.5-flash';
    const generativeModel = this.gemini.getGenerativeModel({ 
      model,
      generationConfig: {
        maxOutputTokens: 2000, // Cost control
      }
    });

    try {
      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;
      const rawAnalysis = response.text();

      if (!rawAnalysis) {
        throw new Error('Gemini analysis returned no content.');
      }

      // Extract JSON from response (Gemini might include extra text)
      const jsonMatch = rawAnalysis.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      try {
        // Clean the JSON string more aggressively
        let cleanedJson = jsonMatch[0]
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/^[^{]*/, '') // Remove any text before the first {
          .replace(/[^}]*$/, '') // Remove any text after the last }
          .trim();
        
        // Try to fix common JSON issues
        cleanedJson = cleanedJson
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}])/g, ': "$1"$2'); // Quote unquoted string values
        
        console.log('Cleaned JSON preview:', cleanedJson.substring(0, 200) + '...');
        return JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error('Gemini JSON parsing failed:', parseError);
        console.error('Raw response:', rawAnalysis.substring(0, 1000) + '...');
        console.error('Extracted JSON:', jsonMatch[0].substring(0, 1000) + '...');
        throw new Error(`Gemini returned invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      throw new Error(`Gemini analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async analyzeWithClaude(request: AnalysisRequest): Promise<AnalysisResult> {
    if (!this.claude) {
      throw new Error('Claude not configured');
    }

    // Cost protection: Limit content length
    if (request.content.length > 50000) {
      throw new Error('Content too long. Please reduce content size to under 50,000 characters.');
    }

    const prompt = this.buildAnalysisPrompt(request);
    const model = this.config.claude?.model || 'claude-3-haiku-20240307';

    try {
      const response = await this.claude.messages.create({
        model,
        max_tokens: 2000, // Cost control
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const rawAnalysis = response.content[0];
      if (!rawAnalysis || rawAnalysis.type !== 'text') {
        throw new Error('Claude returned non-text response');
      }

      const analysisText = rawAnalysis.text;
      if (!analysisText) {
        throw new Error('Claude analysis returned no content.');
      }

      // Extract JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response');
      }

      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Claude JSON parsing failed:', parseError);
        console.error('Raw JSON:', jsonMatch[0].substring(0, 500) + '...');
        throw new Error(`Claude returned invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Claude analysis failed:', error);
      throw new Error(`Claude analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAnalysisPrompt(request: AnalysisRequest): string {
    const { buildComprehensiveAnalysisPrompt } = require('./analysis-prompts');
    return buildComprehensiveAnalysisPrompt({
      url: request.url || '',
      content: request.content,
      pageType: 'general'
    });
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (this.config.openai?.apiKey) providers.push('openai');
    if (this.config.gemini?.apiKey) providers.push('gemini');
    if (this.config.claude?.apiKey) providers.push('claude');
    return providers;
  }

  isProviderAvailable(provider: AIProvider): boolean {
    return this.getAvailableProviders().includes(provider);
  }
}

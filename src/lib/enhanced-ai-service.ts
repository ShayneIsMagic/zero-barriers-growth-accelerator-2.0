import { AIProviderService, AIProvider, AnalysisRequest, AnalysisResult } from './ai-providers';
import { AI_CONFIG, DEFAULT_AI_PROVIDER } from './ai-config';
import { ContentAnalyzer } from './content-analyzer';

// Initialize AI provider service
const aiProviderService = new AIProviderService(AI_CONFIG);

export class EnhancedAIService {
  static async fetchWebsiteContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch website content: ${response.statusText}`);
      }
      const html = await response.text();
      
      // Simple regex-based HTML parsing for server-side
      // Remove script and style tags
      let cleanHtml = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
      
      // Extract text content by removing HTML tags
      const textContent = cleanHtml
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      return textContent;
    } catch (error) {
      console.error('Error fetching website content:', error);
      throw new Error(`Failed to fetch website content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async analyzeWebsite(
    url: string, 
    provider: AIProvider = DEFAULT_AI_PROVIDER
  ): Promise<AnalysisResult> {
    try {
      // First, fetch the website content
      const websiteContent = await this.fetchWebsiteContent(url);

      // Then analyze the content
      return await this.analyzeContent(websiteContent, 'website', provider, url);
    } catch (error) {
      console.error('Website analysis error:', error);
      throw new Error(`Website analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async analyzeContent(
    content: string, 
    contentType: 'website' | 'text' | 'document' = 'text',
    provider: AIProvider = DEFAULT_AI_PROVIDER,
    url?: string
  ): Promise<AnalysisResult> {
    // Check if any AI provider is available
    const availableProviders = aiProviderService.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      console.warn('No AI providers configured, using content-based analysis');
      return await EnhancedAIService.analyzeWithContentAnalyzer(content, contentType, url);
    }

    // Check if requested provider is available
    if (!aiProviderService.isProviderAvailable(provider)) {
      const fallbackProvider = availableProviders[0];
      if (fallbackProvider) {
        console.warn(`Provider ${provider} not available, using ${fallbackProvider}`);
        provider = fallbackProvider;
      } else {
        console.warn('No AI providers available, using content-based analysis');
        return await EnhancedAIService.analyzeWithContentAnalyzer(content, contentType, url);
      }
    }

    try {
      const request: AnalysisRequest = {
        content,
        contentType,
      };

      const result = await aiProviderService.analyzeWithProvider(provider, request);
      
      // Validate the result has the expected structure
      if (!result || !result.goldenCircle || !result.elementsOfValue) {
        throw new Error('AI analysis returned invalid structure');
      }
      
      return result;
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      // Fall back to content-based analysis
      console.warn('Falling back to content-based analysis due to AI error');
      return await EnhancedAIService.analyzeWithContentAnalyzer(content, contentType, url);
    }
  }

  static getAvailableProviders(): AIProvider[] {
    return aiProviderService.getAvailableProviders();
  }

  static async analyzeWithContentAnalyzer(
    content: string, 
    contentType: 'website' | 'text' | 'document',
    url?: string
  ): Promise<AnalysisResult> {
    const contentAnalyzer = new ContentAnalyzer();
    const result = await contentAnalyzer.analyzeContent(content, url || '', 'general');
    
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

  static isProviderAvailable(provider: AIProvider): boolean {
    return aiProviderService.isProviderAvailable(provider);
  }

  static getProviderInfo(): Array<{
    id: AIProvider;
    name: string;
    available: boolean;
    model?: string;
  }> {
    return [
      {
        id: 'openai',
        name: 'OpenAI GPT-4',
        available: aiProviderService.isProviderAvailable('openai'),
        model: AI_CONFIG.openai.model,
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        available: aiProviderService.isProviderAvailable('gemini'),
        model: AI_CONFIG.gemini.model,
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        available: aiProviderService.isProviderAvailable('claude'),
        model: AI_CONFIG.claude.model,
      },
    ];
  }
}

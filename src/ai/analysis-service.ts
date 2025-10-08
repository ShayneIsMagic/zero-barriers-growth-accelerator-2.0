import { OpenAIProvider } from './providers/openai';
import { FallbackProvider } from './providers/fallback';
import { AnalysisOptions, CompleteAnalysis } from './providers/base';
import { sleep } from '@/lib/utils';

export interface AnalysisServiceConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackEnabled: boolean;
}

export class AIAnalysisService {
  private openaiProvider: OpenAIProvider;
  private fallbackProvider: FallbackProvider;
  private config: AnalysisServiceConfig;

  constructor(config: Partial<AnalysisServiceConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 2000,
      fallbackEnabled: true,
      ...config,
    };

    const apiKey = process.env.OPENAI_API_KEY || '';
    this.openaiProvider = new OpenAIProvider(apiKey);
    this.fallbackProvider = new FallbackProvider();
  }

  async analyzeContent(
    content: string,
    options?: AnalysisOptions
  ): Promise<CompleteAnalysis> {
    let lastError: Error | null = null;

    // Try OpenAI provider with retries
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.openaiProvider.analyze(content, options);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `OpenAI analysis attempt ${attempt} failed: ${error}. Retries left: ${
            this.config.maxRetries - attempt
          }`
        );

        if (attempt < this.config.maxRetries) {
          await sleep(this.config.retryDelay);
        }
      }
    }

    // If all retries failed and fallback is enabled, use fallback provider
    if (this.config.fallbackEnabled) {
      console.warn(
        'All OpenAI retries failed. Falling back to deterministic analysis.'
      );
      try {
        return await this.fallbackProvider.analyze(content, options);
      } catch (fallbackError) {
        throw new Error(
          `Both OpenAI and fallback analysis failed. Last OpenAI error: ${lastError?.message}. Fallback error: ${fallbackError}`
        );
      }
    }

    throw new Error(
      `Analysis failed after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  async healthCheck(): Promise<{
    openai: boolean;
    fallback: boolean;
  }> {
    const openaiHealth = await this.openaiProvider.healthCheck();
    const fallbackHealth = await this.fallbackProvider.healthCheck();

    return {
      openai: openaiHealth,
      fallback: fallbackHealth,
    };
  }

  getCapabilities() {
    return {
      openai: this.openaiProvider.getCapabilities(),
      fallback: this.fallbackProvider.getCapabilities(),
    };
  }
}

// Export a default instance
export const aiAnalysisService = new AIAnalysisService();

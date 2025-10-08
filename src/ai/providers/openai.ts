import OpenAI from 'openai';
import {
  AnalysisProvider,
  AnalysisOptions,
  CompleteAnalysis,
  CompleteAnalysisSchema,
  ProviderCapabilities,
  AnalysisError,
  ValidationError,
  RateLimitError,
  TimeoutError,
  ProviderUnavailableError,
} from './base';

export class OpenAIProvider implements AnalysisProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      maxRetries: 3,
      timeout: 60000, // 60 seconds
    });
  }

  async analyze(
    content: string,
    options?: AnalysisOptions
  ): Promise<CompleteAnalysis> {
    const startTime = Date.now();

    try {
      const prompt = this.buildAnalysisPrompt(content, options);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new AnalysisError(
          'Empty response from OpenAI',
          'EMPTY_RESPONSE',
          this.name
        );
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (error) {
        throw new ValidationError(
          'Invalid JSON response from OpenAI',
          this.name
        );
      }

      // Add metadata
      const analysisResult = {
        ...parsedResponse,
        processingTime: Date.now() - startTime,
        model: 'gpt-4-turbo-preview',
        tokensUsed: completion.usage?.total_tokens || 0,
        confidence: this.calculateConfidence(parsedResponse),
      };

      // Validate the response structure
      const validatedResult = CompleteAnalysisSchema.parse(analysisResult);

      return validatedResult;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new RateLimitError(
            this.name,
            error.headers?.['retry-after'] as number
          );
        }
        if (error.status === 503 || error.status === 502) {
          throw new ProviderUnavailableError(this.name);
        }
        throw new AnalysisError(
          error.message,
          'API_ERROR',
          this.name,
          error.status
        );
      }

      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'TimeoutError'
      ) {
        throw new TimeoutError(this.name, options?.timeout || 45000);
      }

      // Re-throw validation errors
      if (error instanceof ValidationError) {
        throw error;
      }

      throw new AnalysisError(
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR',
        this.name
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });

      return response.choices.length > 0;
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      return false;
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxTokens: 128000, // GPT-4 Turbo context window
      supportsStreaming: true,
      supportsBatch: false,
      rateLimit: {
        requestsPerMinute: 3500, // Tier 1 limit
        tokensPerMinute: 150000,
      },
      reliability: {
        averageUptime: 0.999,
        averageResponseTime: 2500, // 2.5 seconds
      },
    };
  }

  private getSystemPrompt(): string {
    return `You are an expert marketing analyst with deep knowledge of Simon Sinek's Golden Circle, Consumer Elements of Value, B2B Elements of Value, and CliftonStrengths frameworks.

Your task is to analyze marketing content and provide comprehensive insights across all frameworks.

You must respond with a valid JSON object that includes:
1. Golden Circle analysis (WHY, HOW, WHAT scoring and details)
2. Consumer Value Elements analysis (30 elements across 4 categories)
3. B2B Value Elements analysis (40 elements across 5 categories)
4. CliftonStrengths analysis (34 themes across 4 domains)
5. Identified barriers to growth
6. Actionable recommendations

Scoring should be on a 0-100 scale where:
- 90-100: Excellent, market-leading
- 80-89: Good, above average
- 70-79: Average, room for improvement
- 60-69: Below average, needs work
- 0-59: Poor, requires immediate attention

Be specific in your feedback and provide actionable suggestions for improvement.

Ensure all scores are realistic and justified by the content analysis.`;
  }

  private buildAnalysisPrompt(
    content: string,
    options?: AnalysisOptions
  ): string {
    let prompt = `Please analyze the following marketing content using all frameworks:\n\n"${content}"\n\n`;

    if (options) {
      if (options.contentType) {
        prompt += `Content Type: ${options.contentType}\n`;
      }
      if (options.industry) {
        prompt += `Industry: ${options.industry}\n`;
      }
      if (options.targetAudience) {
        prompt += `Target Audience: ${options.targetAudience}\n`;
      }
      if (options.conversionGoal) {
        prompt += `Conversion Goal: ${options.conversionGoal}\n`;
      }
    }

    prompt += `
Provide a comprehensive analysis in JSON format with the following structure:

{
  "goldenCircle": {
    "whyScore": number,
    "howScore": number,
    "whatScore": number,
    "overallScore": number,
    "whyDetails": {
      "clarity": number,
      "emotionalImpact": number,
      "uniqueness": number,
      "authenticity": number,
      "feedback": [string],
      "suggestions": [string]
    },
    "howDetails": { ... same structure ... },
    "whatDetails": { ... same structure ... }
  },
  "consumerValue": {
    "functionalScore": number,
    "emotionalScore": number,
    "lifeChangingScore": number,
    "socialImpactScore": number,
    "overallScore": number,
    "elementScores": { "elementName": score },
    "topElements": [string],
    "detectedElements": [...]
  },
  "b2bValue": { ... similar structure for B2B elements ... },
  "cliftonStrengths": {
    "executingScore": number,
    "influencingScore": number,
    "relationshipBuildingScore": number,
    "strategicThinkingScore": number,
    "overallScore": number,
    "themeScores": { "themeName": score },
    "topThemes": [string],
    "detectedThemes": [...]
  },
  "barriers": {
    "barriers": [
      {
        "name": string,
        "description": string,
        "category": string,
        "severity": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
        "impact": string,
        "solution": string
      }
    ]
  },
  "recommendations": {
    "recommendations": [
      {
        "title": string,
        "description": string,
        "category": string,
        "priority": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
        "impact": string,
        "effort": string,
        "timeframe": string
      }
    ]
  }
}`;

    return prompt;
  }

  private calculateConfidence(analysis: Record<string, unknown>): number {
    // Calculate confidence based on analysis completeness and score consistency
    let confidence = 0.8; // Base confidence

    // Check if all required sections are present
    const requiredSections = [
      'goldenCircle',
      'consumerValue',
      'b2bValue',
      'cliftonStrengths',
      'barriers',
      'recommendations',
    ];
    const presentSections = requiredSections.filter(
      (section) => analysis[section]
    );

    confidence *= presentSections.length / requiredSections.length;

    // Check for reasonable score distributions
    const scores = [
      (analysis.goldenCircle as any)?.overallScore,
      (analysis.consumerValue as any)?.overallScore,
      (analysis.b2bValue as any)?.overallScore,
      (analysis.cliftonStrengths as any)?.overallScore,
    ].filter((score) => typeof score === 'number');

    if (scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance =
        scores.reduce((acc, score) => acc + Math.pow(score - avgScore, 2), 0) /
        scores.length;

      // Lower confidence if scores are too uniform (likely hallucinated)
      if (variance < 10) {
        confidence *= 0.9;
      }
    }

    // Check for presence of detailed feedback
    if (
      (analysis.barriers as any)?.barriers?.length > 0 &&
      (analysis.recommendations as any)?.recommendations?.length > 0
    ) {
      confidence *= 1.1;
    }

    return Math.min(confidence, 1);
  }
}

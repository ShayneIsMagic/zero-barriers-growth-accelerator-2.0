import { z } from 'zod';

// Analysis result schemas
export const GoldenCircleAnalysisSchema = z.object({
  whyScore: z.number().min(0).max(100),
  howScore: z.number().min(0).max(100),
  whatScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  whyDetails: z.object({
    clarity: z.number().min(0).max(100),
    emotionalImpact: z.number().min(0).max(100),
    uniqueness: z.number().min(0).max(100),
    authenticity: z.number().min(0).max(100),
    feedback: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
  howDetails: z.object({
    clarity: z.number().min(0).max(100),
    emotionalImpact: z.number().min(0).max(100),
    uniqueness: z.number().min(0).max(100),
    authenticity: z.number().min(0).max(100),
    feedback: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
  whatDetails: z.object({
    clarity: z.number().min(0).max(100),
    emotionalImpact: z.number().min(0).max(100),
    uniqueness: z.number().min(0).max(100),
    authenticity: z.number().min(0).max(100),
    feedback: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
});

export const ValueElementsAnalysisSchema = z.object({
  functionalScore: z.number().min(0).max(100),
  emotionalScore: z.number().min(0).max(100),
  lifeChangingScore: z.number().min(0).max(100),
  socialImpactScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  elementScores: z.record(z.string(), z.number()),
  topElements: z.array(z.string()),
  detectedElements: z.array(
    z.object({
      name: z.string(),
      category: z.enum([
        'FUNCTIONAL',
        'EMOTIONAL',
        'LIFE_CHANGING',
        'SOCIAL_IMPACT',
      ]),
      score: z.number().min(0).max(100),
      detected: z.boolean(),
      examples: z.array(z.string()),
      suggestions: z.array(z.string()),
    })
  ),
});

export const CliftonStrengthsAnalysisSchema = z.object({
  executingScore: z.number().min(0).max(100),
  influencingScore: z.number().min(0).max(100),
  relationshipBuildingScore: z.number().min(0).max(100),
  strategicThinkingScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  themeScores: z.record(z.string(), z.number()),
  topThemes: z.array(z.string()),
  detectedThemes: z.array(
    z.object({
      name: z.string(),
      domain: z.enum([
        'EXECUTING',
        'INFLUENCING',
        'RELATIONSHIP_BUILDING',
        'STRATEGIC_THINKING',
      ]),
      score: z.number().min(0).max(100),
      detected: z.boolean(),
      languagePatterns: z.array(z.string()),
      appealStrategy: z.array(z.string()),
    })
  ),
});

export const BarriersAnalysisSchema = z.object({
  barriers: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      category: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      impact: z.string(),
      solution: z.string(),
    })
  ),
});

export const RecommendationsSchema = z.object({
  recommendations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      impact: z.string(),
      effort: z.string(),
      timeframe: z.string(),
    })
  ),
});

export const CompleteAnalysisSchema = z.object({
  goldenCircle: GoldenCircleAnalysisSchema,
  consumerValue: ValueElementsAnalysisSchema,
  b2bValue: ValueElementsAnalysisSchema,
  cliftonStrengths: CliftonStrengthsAnalysisSchema,
  barriers: BarriersAnalysisSchema,
  recommendations: RecommendationsSchema,
  confidence: z.number().min(0).max(1),
  processingTime: z.number().positive(),
  model: z.string(),
  tokensUsed: z.number().nonnegative(),
});

export type GoldenCircleAnalysis = z.infer<typeof GoldenCircleAnalysisSchema>;
export type ValueElementsAnalysis = z.infer<typeof ValueElementsAnalysisSchema>;
export type CliftonStrengthsAnalysis = z.infer<
  typeof CliftonStrengthsAnalysisSchema
>;
export type BarriersAnalysis = z.infer<typeof BarriersAnalysisSchema>;
export type RecommendationsAnalysis = z.infer<typeof RecommendationsSchema>;
export type CompleteAnalysis = z.infer<typeof CompleteAnalysisSchema>;

export interface AnalysisProvider {
  name: string;
  analyze(
    content: string,
    options?: AnalysisOptions
  ): Promise<CompleteAnalysis>;
  healthCheck(): Promise<boolean>;
  getCapabilities(): ProviderCapabilities;
}

export interface AnalysisOptions {
  contentType?:
    | 'WEBSITE_COPY'
    | 'MARKETING_COPY'
    | 'SOCIAL_MEDIA'
    | 'EMAIL_SEQUENCE'
    | 'LANDING_PAGE'
    | 'AD_COPY'
    | 'PRODUCT_DESCRIPTION'
    | 'COMPANY_OVERVIEW'
    | 'OTHER';
  industry?: string;
  targetAudience?: string;
  conversionGoal?: string;
  timeout?: number;
}

export interface ProviderCapabilities {
  maxTokens: number;
  supportsStreaming: boolean;
  supportsBatch: boolean;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  reliability: {
    averageUptime: number;
    averageResponseTime: number;
  };
}

export class AnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AnalysisError';
  }
}

export class ValidationError extends AnalysisError {
  constructor(message: string, provider: string) {
    super(message, 'VALIDATION_ERROR', provider, 400);
  }
}

export class RateLimitError extends AnalysisError {
  constructor(provider: string, retryAfter?: number) {
    super(
      `Rate limit exceeded for provider: ${provider}`,
      'RATE_LIMIT_ERROR',
      provider,
      429
    );
    this.retryAfter = retryAfter || undefined;
  }

  retryAfter: number | undefined;
}

export class TimeoutError extends AnalysisError {
  constructor(provider: string, timeout: number) {
    super(
      `Analysis timeout after ${timeout}ms for provider: ${provider}`,
      'TIMEOUT_ERROR',
      provider,
      408
    );
  }
}

export class ProviderUnavailableError extends AnalysisError {
  constructor(provider: string) {
    super(
      `Provider unavailable: ${provider}`,
      'PROVIDER_UNAVAILABLE',
      provider,
      503
    );
  }
}

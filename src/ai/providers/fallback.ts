import {
  AnalysisProvider,
  AnalysisOptions,
  CompleteAnalysis,
  ProviderCapabilities,
  GoldenCircleAnalysis,
  ValueElementsAnalysis,
  CliftonStrengthsAnalysis,
  BarriersAnalysis,
  RecommendationsAnalysis,
} from './base';

/**
 * Fallback provider that uses deterministic analysis when AI providers fail
 * This ensures the system always provides some level of analysis
 */
export class FallbackProvider implements AnalysisProvider {
  name = 'fallback';

  async analyze(
    content: string,
    _options?: AnalysisOptions
  ): Promise<CompleteAnalysis> {
    const startTime = Date.now();

    // Perform deterministic analysis based on content patterns
    const goldenCircle = this.analyzeGoldenCircle(content);
    const consumerValue = this.analyzeConsumerValue(content);
    const b2bValue = this.analyzeB2BValue(content);
    const cliftonStrengths = this.analyzeCliftonStrengths(content);
    const barriers = this.identifyBarriers(
      content,
      goldenCircle,
      consumerValue
    );
    const recommendations = this.generateRecommendations(content, barriers);

    return {
      goldenCircle,
      consumerValue,
      b2bValue,
      cliftonStrengths,
      barriers,
      recommendations,
      confidence: 0.75, // Lower confidence for fallback analysis
      processingTime: Date.now() - startTime,
      model: 'fallback-deterministic',
      tokensUsed: 0,
    };
  }

  async healthCheck(): Promise<boolean> {
    // Fallback provider is always available
    return true;
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxTokens: 100000, // No token limit for deterministic analysis
      supportsStreaming: false,
      supportsBatch: true,
      rateLimit: {
        requestsPerMinute: 1000,
        tokensPerMinute: 1000000,
      },
      reliability: {
        averageUptime: 1.0,
        averageResponseTime: 100, // Very fast
      },
    };
  }

  private analyzeGoldenCircle(content: string): GoldenCircleAnalysis {
    const words = content.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim());

    // WHY analysis - look for purpose/mission language
    const whyKeywords = [
      'why',
      'believe',
      'purpose',
      'mission',
      'vision',
      'passion',
      'cause',
      'values',
    ];
    const whyScore = this.calculateKeywordScore(content, whyKeywords, 0.7);

    // HOW analysis - look for process/differentiator language
    const howKeywords = [
      'how',
      'process',
      'method',
      'approach',
      'unique',
      'different',
      'proprietary',
      'system',
    ];
    const howScore = this.calculateKeywordScore(content, howKeywords, 0.8);

    // WHAT analysis - look for product/service language
    const whatKeywords = [
      'what',
      'product',
      'service',
      'offer',
      'deliver',
      'provide',
      'solution',
      'result',
    ];
    const whatScore = this.calculateKeywordScore(content, whatKeywords, 0.9);

    const overallScore = (whyScore + howScore + whatScore) / 3;

    const baseDetails = {
      clarity: Math.max(60, Math.min(90, sentences.length * 5)),
      emotionalImpact: whyScore,
      uniqueness: howScore,
      authenticity: Math.max(50, Math.min(85, words.length / 10)),
      feedback: this.generateGoldenCircleFeedback(
        whyScore,
        howScore,
        whatScore
      ),
      suggestions: this.generateGoldenCircleSuggestions(
        whyScore,
        howScore,
        whatScore
      ),
    };

    return {
      whyScore,
      howScore,
      whatScore,
      overallScore,
      whyDetails: baseDetails,
      howDetails: baseDetails,
      whatDetails: baseDetails,
    };
  }

  private analyzeConsumerValue(content: string): ValueElementsAnalysis {
    const functionalElements = [
      'saves time',
      'simplifies',
      'makes money',
      'reduces risk',
      'organizes',
      'integrates',
      'connects',
      'reduces effort',
      'avoids hassles',
      'reduces cost',
      'quality',
      'variety',
      'sensory appeal',
      'informs',
    ];

    const emotionalElements = [
      'reduces anxiety',
      'rewards',
      'nostalgia',
      'design',
      'badge value',
      'wellness',
      'therapeutic',
      'fun',
      'attractiveness',
      'provides access',
    ];

    const lifeChangingElements = [
      'provides hope',
      'self-actualization',
      'motivation',
      'heirloom',
      'affiliation',
    ];

    const socialImpactElements = ['self-transcendence'];

    const functionalScore = this.calculateElementScore(
      content,
      functionalElements
    );
    const emotionalScore = this.calculateElementScore(
      content,
      emotionalElements
    );
    const lifeChangingScore = this.calculateElementScore(
      content,
      lifeChangingElements
    );
    const socialImpactScore = this.calculateElementScore(
      content,
      socialImpactElements
    );

    const overallScore =
      (functionalScore +
        emotionalScore +
        lifeChangingScore +
        socialImpactScore) /
      4;

    return {
      functionalScore,
      emotionalScore,
      lifeChangingScore,
      socialImpactScore,
      overallScore,
      elementScores: {
        saves_time: this.calculateKeywordScore(
          content,
          ['fast', 'quick', 'instant', 'immediate'],
          0.7
        ),
        quality: this.calculateKeywordScore(
          content,
          ['quality', 'premium', 'excellence', 'best'],
          0.8
        ),
        reduces_cost: this.calculateKeywordScore(
          content,
          ['affordable', 'cost', 'save', 'budget'],
          0.6
        ),
      },
      topElements: ['quality', 'saves_time', 'reduces_cost'],
      detectedElements: [],
    };
  }

  private analyzeB2BValue(content: string): ValueElementsAnalysis {
    // Similar to consumer analysis but with B2B-specific elements
    const tableStakesScore = 75; // Baseline assumption
    const functionalScore = this.calculateKeywordScore(
      content,
      ['roi', 'efficiency', 'productivity', 'performance'],
      0.8
    );
    const easeOfBusinessScore = this.calculateKeywordScore(
      content,
      ['easy', 'simple', 'support', 'service'],
      0.7
    );
    const individualScore = this.calculateKeywordScore(
      content,
      ['growth', 'development', 'career', 'skills'],
      0.6
    );
    const inspirationalScore = this.calculateKeywordScore(
      content,
      ['vision', 'future', 'innovation', 'transform'],
      0.5
    );

    const overallScore =
      (tableStakesScore +
        functionalScore +
        easeOfBusinessScore +
        individualScore +
        inspirationalScore) /
      5;

    return {
      functionalScore: tableStakesScore,
      emotionalScore: functionalScore,
      lifeChangingScore: easeOfBusinessScore,
      socialImpactScore: individualScore,
      overallScore,
      elementScores: {},
      topElements: [],
      detectedElements: [],
    };
  }

  private analyzeCliftonStrengths(content: string): CliftonStrengthsAnalysis {
    const executingKeywords = [
      'achieve',
      'deliver',
      'complete',
      'finish',
      'execute',
      'results',
    ];
    const influencingKeywords = [
      'lead',
      'inspire',
      'motivate',
      'influence',
      'convince',
      'persuade',
    ];
    const relationshipKeywords = [
      'team',
      'collaborate',
      'together',
      'partnership',
      'relationship',
      'community',
    ];
    const strategicKeywords = [
      'strategy',
      'plan',
      'future',
      'vision',
      'analyze',
      'think',
    ];

    const executingScore = this.calculateKeywordScore(
      content,
      executingKeywords,
      0.8
    );
    const influencingScore = this.calculateKeywordScore(
      content,
      influencingKeywords,
      0.7
    );
    const relationshipBuildingScore = this.calculateKeywordScore(
      content,
      relationshipKeywords,
      0.6
    );
    const strategicThinkingScore = this.calculateKeywordScore(
      content,
      strategicKeywords,
      0.9
    );

    const overallScore =
      (executingScore +
        influencingScore +
        relationshipBuildingScore +
        strategicThinkingScore) /
      4;

    return {
      executingScore,
      influencingScore,
      relationshipBuildingScore,
      strategicThinkingScore,
      overallScore,
      themeScores: {},
      topThemes: [],
      detectedThemes: [],
    };
  }

  private identifyBarriers(
    content: string,
    goldenCircle: GoldenCircleAnalysis,
    consumerValue: ValueElementsAnalysis
  ): BarriersAnalysis {
    const barriers = [];

    if (goldenCircle.whyScore < 70) {
      barriers.push({
        name: 'Unclear Purpose',
        description: 'The WHY (purpose/belief) is not clearly communicated',
        category: 'Golden Circle',
        severity: 'HIGH' as const,
        impact: 'Customers may not emotionally connect with the brand',
        solution:
          'Articulate the fundamental belief that drives your organization',
      });
    }

    if (consumerValue.functionalScore < 60) {
      barriers.push({
        name: 'Limited Functional Value',
        description: 'Not enough functional benefits clearly communicated',
        category: 'Value Proposition',
        severity: 'MEDIUM' as const,
        impact: 'Customers may not see practical reasons to choose you',
        solution:
          'Highlight specific functional benefits like time savings, cost reduction, or quality improvements',
      });
    }

    if (content.length < 100) {
      barriers.push({
        name: 'Insufficient Content',
        description: 'Content is too brief to effectively communicate value',
        category: 'Content',
        severity: 'MEDIUM' as const,
        impact: 'May not provide enough information for decision-making',
        solution:
          'Expand content to include more details about benefits and differentiators',
      });
    }

    return { barriers };
  }

  private generateRecommendations(
    content: string,
    barriers: BarriersAnalysis
  ): RecommendationsAnalysis {
    const recommendations = [];

    barriers.barriers.forEach((barrier) => {
      recommendations.push({
        title: `Address ${barrier.name}`,
        description: barrier.solution,
        category: barrier.category,
        priority: barrier.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        impact: 'Improved clarity and customer engagement',
        effort: 'Medium',
        timeframe: '1-2 weeks',
      });
    });

    // Add general recommendations
    recommendations.push({
      title: 'Enhance Emotional Connection',
      description:
        'Include more emotion-driven language to connect with your audience on a deeper level',
      category: 'Messaging',
      priority: 'MEDIUM' as const,
      impact: 'Increased brand loyalty and customer engagement',
      effort: 'Low',
      timeframe: '1 week',
    });

    return { recommendations };
  }

  private calculateKeywordScore(
    content: string,
    keywords: string[],
    maxScore: number
  ): number {
    const lowerContent = content.toLowerCase();
    const matchCount = keywords.filter((keyword) =>
      lowerContent.includes(keyword)
    ).length;
    const score = Math.min(
      maxScore * 100,
      (matchCount / keywords.length) * 100
    );
    return Math.max(50, score); // Minimum score of 50
  }

  private calculateElementScore(content: string, elements: string[]): number {
    return this.calculateKeywordScore(content, elements, 0.8);
  }

  private generateGoldenCircleFeedback(
    whyScore: number,
    howScore: number,
    whatScore: number
  ): string[] {
    const feedback = [];

    if (whyScore < 70)
      feedback.push('Purpose/belief could be more clearly articulated');
    if (howScore < 70)
      feedback.push('Unique approach/methodology needs more emphasis');
    if (whatScore < 70)
      feedback.push('Products/services could be described more specifically');

    return feedback;
  }

  private generateGoldenCircleSuggestions(
    whyScore: number,
    howScore: number,
    whatScore: number
  ): string[] {
    const suggestions = [];

    if (whyScore < 70)
      suggestions.push('Start with why you believe what you believe');
    if (howScore < 70)
      suggestions.push('Explain your unique process or approach');
    if (whatScore < 70)
      suggestions.push('Be more specific about what you deliver');

    return suggestions;
  }
}

// Analysis types for Zero Barriers Growth Accelerator
export interface WebsiteAnalysisRequest {
  url: string;
  content?: string;
  analysisType: 'full' | 'quick' | 'social-media';
}

export interface GoldenCircleAnalysis {
  why: {
    score: number; // 1-10
    currentState: string;
    issues: string[];
    recommendations: string[];
    transformedMessage: string;
  };
  how: {
    score: number; // 1-10
    currentState: string;
    issues: string[];
    recommendations: string[];
    transformedMessage: string;
  };
  what: {
    score: number; // 1-10
    currentState: string;
    issues: string[];
    recommendations: string[];
    transformedMessage: string;
  };
  who: {
    score: number; // 1-10
    currentState: string;
    targetAudience: string[];
    emotionalConnection: string;
    issues: string[];
    recommendations: string[];
    transformedMessage: string;
  };
  overallScore: number; // 1-10
}

export interface ElementsOfValueAnalysis {
  functional: {
    score: number; // 1-10
    elements: {
      savesTime: boolean;
      simplifies: boolean;
      makesMoney: boolean;
      reducesRisk: boolean;
      organizes: boolean;
      integrates: boolean;
      connects: boolean;
      reducesEffort: boolean;
      avoidsHassles: boolean;
      reducesCost: boolean;
      quality: boolean;
      variety: boolean;
      sensoryAppeal: boolean;
      informs: boolean;
    };
    recommendations: string[];
  };
  emotional: {
    score: number; // 1-10
    elements: {
      reducesAnxiety: boolean;
      rewardsMe: boolean;
      nostalgia: boolean;
      designAesthetics: boolean;
      badgeValue: boolean;
      wellness: boolean;
      therapeuticValue: boolean;
      funEntertainment: boolean;
      attractiveness: boolean;
      providesAccess: boolean;
    };
    recommendations: string[];
  };
  lifeChanging: {
    score: number; // 1-10
    elements: {
      providesHope: boolean;
      selfActualization: boolean;
      motivation: boolean;
      heirloom: boolean;
      affiliationBelonging: boolean;
    };
    recommendations: string[];
  };
  socialImpact: {
    score: number; // 1-10
    elements: {
      selfTranscendence: boolean;
    };
    recommendations: string[];
  };
  overallScore: number; // 1-10
}

export interface B2BElementsAnalysis {
  inspirational: {
    score: number; // 1-10
    elements: {
      purpose: boolean;
      vision: boolean;
      hope: boolean;
      socialResponsibility: boolean;
    };
    recommendations: string[];
  };
  individual: {
    score: number; // 1-10
    career: {
      networkExpansion: boolean;
      marketability: boolean;
      reputationalAssurance: boolean;
    };
    personal: {
      designAesthetics: boolean;
      growthDevelopment: boolean;
      reducedAnxiety: boolean;
      funPerks: boolean;
    };
    recommendations: string[];
  };
  easeOfDoingBusiness: {
    score: number; // 1-10
    productivity: {
      timeSavings: boolean;
      reducedEffort: boolean;
      decreasedHassles: boolean;
      information: boolean;
      transparency: boolean;
    };
    operational: {
      organization: boolean;
      simplification: boolean;
      connection: boolean;
      integration: boolean;
    };
    access: {
      availability: boolean;
      variety: boolean;
      configurability: boolean;
    };
    relationship: {
      responsiveness: boolean;
      expertise: boolean;
      commitment: boolean;
      stability: boolean;
      culturalFit: boolean;
    };
    strategic: {
      riskReduction: boolean;
      reach: boolean;
      flexibility: boolean;
      componentQuality: boolean;
    };
    recommendations: string[];
  };
  functional: {
    score: number; // 1-10
    economic: {
      improvedTopLine: boolean;
      costReduction: boolean;
    };
    performance: {
      productQuality: boolean;
      scalability: boolean;
      innovation: boolean;
    };
    recommendations: string[];
  };
  tableStakes: {
    score: number; // 1-10
    elements: {
      meetingSpecifications: boolean;
      acceptablePrice: boolean;
      regulatoryCompliance: boolean;
      ethicalStandards: boolean;
    };
    recommendations: string[];
  };
  overallScore: number; // 1-10
}

export interface CliftonStrengthsAnalysis {
  strategicThinking: {
    score: number; // 1-10
    elements: {
      analytical: boolean;
      context: boolean;
      futuristic: boolean;
      ideation: boolean;
      input: boolean;
      intellection: boolean;
      learner: boolean;
      strategic: boolean;
    };
    recommendations: string[];
  };
  executing: {
    score: number; // 1-10
    elements: {
      achiever: boolean;
      arranger: boolean;
      belief: boolean;
      consistency: boolean;
      deliberative: boolean;
      discipline: boolean;
      focus: boolean;
      responsibility: boolean;
      restorative: boolean;
    };
    recommendations: string[];
  };
  influencing: {
    score: number; // 1-10
    elements: {
      activator: boolean;
      command: boolean;
      communication: boolean;
      competition: boolean;
      maximizer: boolean;
      selfAssurance: boolean;
      significance: boolean;
      woo: boolean;
    };
    recommendations: string[];
  };
  relationshipBuilding: {
    score: number; // 1-10
    elements: {
      adaptability: boolean;
      connectedness: boolean;
      developer: boolean;
      empathy: boolean;
      harmony: boolean;
      includer: boolean;
      individualization: boolean;
      positivity: boolean;
      relator: boolean;
    };
    recommendations: string[];
  };
  overallScore: number; // 1-10
}

export interface TransformationAnalysis {
  currentMessaging: {
    heroSection: {
      current: string;
      score: number; // 1-10
      issues: string[];
      recommended: string;
    };
    serviceDescriptions: {
      current: string[];
      score: number; // 1-10
      issues: string[];
      recommended: string[];
    };
    testimonials: {
      current: string[];
      score: number; // 1-10
      issues: string[];
      recommended: string[];
    };
    ctaButtons: {
      current: string[];
      score: number; // 1-10
      issues: string[];
      recommended: string[];
    };
  };
  socialMediaAnalysis: {
    currentPosts: string[];
    score: number; // 1-10
    issues: string[];
    recommendedPosts: string[];
  };
  competitiveDifferentiation: {
    currentPositioning: string;
    score: number; // 1-10
    issues: string[];
    recommendedPositioning: string;
  };
  overallScore: number; // 1-10
}

export interface LighthouseAnalysis {
  performance: {
    score: number; // 0-100
    metrics: {
      firstContentfulPaint: number;
      largestContentfulPaint: number;
      totalBlockingTime: number;
      cumulativeLayoutShift: number;
      speedIndex: number;
    };
    opportunities: string[];
    diagnostics: string[];
  };
  accessibility: {
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
  };
  bestPractices: {
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
  };
  seo: {
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
  };
  overallScore: number; // 0-100
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    overall: number;
  };
  executiveSummary: string;
  recommendations: string[];
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    totalBlockingTime: number;
  };
}

export interface WebsiteAnalysisResult {
  id: string;
  url: string;
  timestamp: Date;
  overallScore: number; // 1-10
  executiveSummary?: string;
  goldenCircle: GoldenCircleAnalysis;
  elementsOfValue: ElementsOfValueAnalysis;
  b2bElements: B2BElementsAnalysis;
  cliftonStrengths: CliftonStrengthsAnalysis;
  transformation: TransformationAnalysis;
  recommendations: {
    immediate: string[]; // Week 1-2
    shortTerm: string[]; // Week 3-6
    longTerm: string[]; // Month 2-3
  };
  socialMediaStrategy: {
    postTypes: Array<{
      type: string;
      description: string;
      examples: string[];
    }>;
    contentCalendar: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      weekend: string;
    };
  };
  successMetrics: {
    currentKPIs: string[];
    targetImprovements: string[];
    abTestingOpportunities: string[];
  };
  lighthouseAnalysis?: LighthouseAnalysis;
  createdAt?: string;
}

export interface LighthouseAnalysis {
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    overall: number;
  };
  executiveSummary: string;
  recommendations: string[];
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    totalBlockingTime: number;
  };
}

export interface SEOAnalysis {
  searchConsole: {
    currentRankings: Array<{
      keyword: string;
      position: number;
      impressions: number;
      clicks: number;
      ctr: number;
    }>;
    topPerformingPages: Array<{
      page: string;
      impressions: number;
      clicks: number;
      ctr: number;
      position: number;
    }>;
  };
  keywordResearch: {
    targetKeywords: Array<{
      keyword: string;
      searchVolume: number;
      competition: 'Low' | 'Medium' | 'High';
      opportunity: number; // 1-10
      currentPosition?: number;
    }>;
    contentGaps: Array<{
      keyword: string;
      searchVolume: number;
      competition: string;
      opportunity: string;
    }>;
    trendingKeywords: Array<{
      keyword: string;
      trend: 'Up' | 'Down' | 'Stable';
      changePercentage: number;
      searchVolume: number;
    }>;
  };
  competitiveAnalysis: {
    competitors: Array<{
      domain: string;
      overallScore: number;
      keywordOverlap: number;
      contentGaps: string[];
      opportunities: string[];
    }>;
    keywordComparison: Array<{
      keyword: string;
      targetSite: {
        position: number;
        url: string;
      };
      competitors: Array<{
        domain: string;
        position: number;
        url: string;
      }>;
    }>;
  };
  recommendations: {
    immediateActions: string[];
    contentOpportunities: string[];
    technicalImprovements: string[];
    competitiveAdvantages: string[];
  };
}

export interface AnalysisComparison {
  websites: Array<{
    url: string;
    name: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    transformationPotential: 'Low' | 'Medium' | 'High' | 'Very High';
  }>;
  comparativeAnalysis: {
    messagingComparison: Array<{
      aspect: string;
      website1: string;
      website2: string;
      winner: string;
    }>;
    strengthsWeaknesses: Array<{
      website: string;
      strengths: string[];
      weaknesses: string[];
    }>;
  };
  unifiedRecommendations: {
    transformationFirstMessaging: Array<{
      before: string;
      after: string;
    }>;
    storyDrivenTestimonials: string;
    benefitCentricNavigation: Array<{
      website: string;
      current: string[];
      recommended: string[];
    }>;
    emotionalConnectionPoints: Array<{
      website: string;
      painPoint: string;
      transformation: string;
      outcome: string;
    }>;
  };
}

// Removed duplicate WebsiteAnalysisResult interface - using the first one above instead

export interface ComprehensiveAnalysisResult extends WebsiteAnalysisResult {
  pageAuditAnalysis?: any;
  allPagesLighthouse?: any;
  geminiInsights?: any;
}

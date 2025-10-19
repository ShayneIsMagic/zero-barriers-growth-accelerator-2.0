/**
 * Simple Count-Based Scoring Service
 * Just counts how many elements are present and shows distribution
 */

export interface ElementCount {
  element_name: string;
  category: string;
  subcategory?: string;
  present: boolean;
  evidence?: string;
}

export interface CategoryDistribution {
  category: string;
  total_elements: number;
  present_elements: number;
  percentage: number;
  elements: ElementCount[];
}

export interface SimpleScoringResult {
  framework: 'b2c' | 'b2b';
  total_elements: number;
  present_elements: number;
  overall_percentage: number;
  categories: CategoryDistribution[];
  summary: {
    strong_categories: string[];
    weak_categories: string[];
    missing_categories: string[];
  };
}

export class SimpleCountScoringService {
  private static B2C_CATEGORIES = {
    functional: {
      total: 14,
      elements: [
        'saves_time', 'simplifies', 'makes_money', 'reduces_effort', 'reduces_cost',
        'reduces_risk', 'organizes', 'integrates', 'connects', 'quality', 'variety',
        'informs', 'avoids_hassles', 'sensory_appeal'
      ]
    },
    emotional: {
      total: 10,
      elements: [
        'reduces_anxiety', 'rewards_me', 'nostalgia', 'design_aesthetics', 'badge_value',
        'wellness', 'therapeutic', 'fun_entertainment', 'attractiveness', 'provides_access'
      ]
    },
    life_changing: {
      total: 5,
      elements: [
        'provides_hope', 'self_actualization', 'motivation', 'heirloom', 'affiliation'
      ]
    },
    social_impact: {
      total: 1,
      elements: ['self_transcendence']
    }
  };

  private static B2B_CATEGORIES = {
    table_stakes: {
      total: 4,
      elements: [
        'meeting_specifications', 'acceptable_price', 'regulatory_compliance', 'ethical_standards'
      ]
    },
    functional: {
      total: 9,
      elements: [
        'improved_top_line', 'cost_reduction', 'product_quality', 'scalability', 'innovation',
        'risk_reduction', 'reach', 'flexibility', 'component_quality'
      ]
    },
    ease_of_business: {
      total: 17,
      elements: [
        'time_savings', 'reduced_effort', 'decreased_hassles', 'information', 'transparency',
        'organization', 'simplification', 'connection', 'integration', 'access', 'availability',
        'variety', 'configurability', 'responsiveness', 'expertise', 'commitment', 'stability',
        'cultural_fit'
      ]
    },
    individual: {
      total: 7,
      elements: [
        'network_expansion', 'marketability', 'reputational_assurance', 'design_aesthetics_b2b',
        'growth_development', 'reduced_anxiety_b2b', 'fun_perks'
      ]
    },
    inspirational: {
      total: 2,
      elements: ['vision', 'hope_b2b']
    }
  };

  /**
   * Analyze B2C elements from content
   */
  static analyzeB2C(content: string): SimpleScoringResult {
    const elements = this.detectElements(content, 'b2c');
    return this.buildScoringResult('b2c', elements, this.B2C_CATEGORIES);
  }

  /**
   * Analyze B2B elements from content
   */
  static analyzeB2B(content: string): SimpleScoringResult {
    const elements = this.detectElements(content, 'b2b');
    return this.buildScoringResult('b2b', elements, this.B2B_CATEGORIES);
  }

  /**
   * Detect which elements are present in content
   */
  private static detectElements(content: string, framework: 'b2c' | 'b2b'): ElementCount[] {
    const categories = framework === 'b2c' ? this.B2C_CATEGORIES : this.B2B_CATEGORIES;
    const elements: ElementCount[] = [];

    for (const [categoryName, categoryData] of Object.entries(categories)) {
      for (const elementName of categoryData.elements) {
        const present = this.isElementPresent(content, elementName);
        elements.push({
          element_name: elementName,
          category: categoryName,
          present,
          evidence: present ? this.extractEvidence(content, elementName) : undefined
        });
      }
    }

    return elements;
  }

  /**
   * Check if an element is present in content
   */
  private static isElementPresent(content: string, elementName: string): boolean {
    const keywords = this.getElementKeywords(elementName);
    const lowerContent = content.toLowerCase();
    
    return keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()));
  }

  /**
   * Extract evidence for an element
   */
  private static extractEvidence(content: string, elementName: string): string {
    const keywords = this.getElementKeywords(elementName);
    const sentences = content.split(/[.!?]+/);
    
    const relevantSentences = sentences.filter(sentence => 
      keywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    return relevantSentences.slice(0, 2).join('. ').trim();
  }

  /**
   * Get keywords for each element
   */
  private static getElementKeywords(elementName: string): string[] {
    const keywordMap: Record<string, string[]> = {
      // B2C Functional
      'saves_time': ['fast', 'quick', 'instant', 'automated', 'efficient', 'time-saving', 'speedy'],
      'simplifies': ['simple', 'easy', 'straightforward', 'streamlined', 'user-friendly', 'intuitive'],
      'makes_money': ['earn', 'income', 'profit', 'revenue', 'money', 'financial'],
      'reduces_effort': ['effortless', 'easy', 'simple', 'no effort', 'minimal effort'],
      'reduces_cost': ['affordable', 'cheap', 'budget', 'cost-effective', 'inexpensive', 'value'],
      'reduces_risk': ['safe', 'secure', 'guaranteed', 'risk-free', 'protected', 'reliable'],
      'organizes': ['organized', 'structured', 'systematic', 'orderly', 'tidy', 'neat'],
      'integrates': ['connects', 'integrates', 'unified', 'seamless', 'compatible', 'works with'],
      'connects': ['connect', 'link', 'network', 'community', 'social', 'together'],
      'quality': ['quality', 'premium', 'excellent', 'superior', 'high-end', 'top-notch'],
      'variety': ['variety', 'options', 'choices', 'selection', 'diverse', 'multiple'],
      'informs': ['informative', 'educational', 'insights', 'knowledge', 'learning', 'understanding'],
      'avoids_hassles': ['hassle-free', 'convenient', 'smooth', 'trouble-free', 'painless'],
      'sensory_appeal': ['beautiful', 'stunning', 'elegant', 'sleek', 'modern', 'stylish'],
      
      // B2C Emotional
      'reduces_anxiety': ['calming', 'soothing', 'reassuring', 'comforting', 'peaceful'],
      'rewards_me': ['rewards', 'incentives', 'bonuses', 'perks', 'benefits', 'gifts'],
      'nostalgia': ['nostalgic', 'memories', 'retro', 'classic', 'vintage', 'throwback'],
      'design_aesthetics': ['beautiful', 'stunning', 'elegant', 'stylish', 'design'],
      'badge_value': ['status', 'prestige', 'exclusive', 'elite', 'premium', 'luxury'],
      'wellness': ['healthy', 'wellness', 'fitness', 'well-being', 'health', 'vitality'],
      'therapeutic': ['healing', 'therapeutic', 'relaxing', 'stress-relief', 'calming'],
      'fun_entertainment': ['fun', 'entertaining', 'enjoyable', 'exciting', 'thrilling', 'amusing'],
      'attractiveness': ['beautiful', 'attractive', 'stunning', 'gorgeous', 'elegant'],
      'provides_access': ['exclusive', 'membership', 'VIP', 'special', 'privileged', 'insider'],
      
      // B2C Life Changing
      'provides_hope': ['hope', 'future', 'potential', 'possibility', 'dream', 'aspiration'],
      'self_actualization': ['potential', 'growth', 'development', 'achievement', 'success'],
      'motivation': ['motivating', 'inspiring', 'encouraging', 'empowering', 'driving'],
      'heirloom': ['legacy', 'lasting', 'timeless', 'permanent', 'enduring', 'heritage'],
      'affiliation': ['belonging', 'community', 'family', 'group', 'team', 'together'],
      
      // B2C Social Impact
      'self_transcendence': ['greater good', 'impact', 'change', 'difference', 'contribution', 'purpose'],
      
      // B2B Table Stakes
      'meeting_specifications': ['meets requirements', 'specifications', 'standards', 'compliance'],
      'acceptable_price': ['competitive', 'affordable', 'value', 'pricing', 'cost-effective'],
      'regulatory_compliance': ['compliant', 'certified', 'approved', 'regulated', 'standards'],
      'ethical_standards': ['ethical', 'responsible', 'integrity', 'transparent', 'honest'],
      
      // B2B Functional
      'improved_top_line': ['revenue', 'growth', 'sales', 'profit', 'income', 'returns'],
      'cost_reduction': ['savings', 'reduce costs', 'efficiency', 'optimization', 'cut expenses'],
      'product_quality': ['quality', 'reliable', 'durable', 'premium', 'excellent', 'superior'],
      'scalability': ['scalable', 'expandable', 'grows with you', 'flexible', 'adaptable'],
      'innovation': ['innovative', 'cutting-edge', 'advanced', 'breakthrough', 'revolutionary'],
      'risk_reduction': ['risk-free', 'safe', 'secure', 'protected', 'guaranteed', 'reliable'],
      'reach': ['reach', 'scale', 'global', 'worldwide', 'extensive', 'broad'],
      'flexibility': ['flexible', 'adaptable', 'customizable', 'versatile'],
      'component_quality': ['quality', 'reliable', 'durable', 'premium'],
      
      // B2B Ease of Business
      'time_savings': ['time-saving', 'efficient', 'quick', 'fast', 'streamlined', 'rapid'],
      'reduced_effort': ['effortless', 'easy', 'simple', 'straightforward', 'minimal effort'],
      'decreased_hassles': ['hassle-free', 'smooth', 'seamless', 'trouble-free', 'painless'],
      'information': ['insights', 'data', 'analytics', 'reporting', 'visibility', 'transparency'],
      'transparency': ['transparent', 'clear', 'open', 'honest', 'visible', 'accountable'],
      'organization': ['organized', 'structured', 'systematic', 'orderly', 'methodical'],
      'simplification': ['simple', 'streamlined', 'unified', 'consolidated', 'integrated'],
      'connection': ['connect', 'integrate', 'unify', 'link', 'bridge', 'network'],
      'integration': ['seamless', 'compatible', 'works with', 'connects', 'unified'],
      'access': ['available', 'accessible', '24/7', 'always on', 'reliable'],
      'availability': ['available', 'accessible', '24/7', 'always on', 'reliable'],
      'variety': ['options', 'choices', 'flexible', 'customizable', 'diverse', 'multiple'],
      'configurability': ['configurable', 'customizable', 'flexible', 'adaptable', 'tailored'],
      'responsiveness': ['responsive', 'quick', 'fast', 'immediate', 'prompt', 'reactive'],
      'expertise': ['expert', 'specialized', 'knowledgeable', 'skilled', 'professional'],
      'commitment': ['committed', 'dedicated', 'loyal', 'reliable', 'consistent', 'devoted'],
      'stability': ['stable', 'reliable', 'consistent', 'dependable', 'secure', 'solid'],
      'cultural_fit': ['culture', 'values', 'alignment', 'compatibility', 'partnership'],
      
      // B2B Individual
      'network_expansion': ['network', 'connections', 'relationships', 'partnerships', 'community'],
      'marketability': ['marketable', 'credible', 'reputable', 'recognized', 'established'],
      'reputational_assurance': ['reputation', 'trusted', 'reliable', 'credible', 'established'],
      'design_aesthetics_b2b': ['beautiful', 'stunning', 'elegant', 'professional', 'polished'],
      'growth_development': ['growth', 'development', 'learning', 'improvement', 'advancement'],
      'reduced_anxiety_b2b': ['peace of mind', 'confidence', 'reassurance', 'security', 'comfort'],
      'fun_perks': ['enjoyable', 'fun', 'engaging', 'exciting', 'rewarding', 'satisfying'],
      
      // B2B Inspirational
      'vision': ['vision', 'future', 'potential', 'possibility', 'aspiration', 'dream'],
      'hope_b2b': ['hope', 'optimism', 'confidence', 'belief', 'faith', 'trust']
    };

    return keywordMap[elementName] || [];
  }

  /**
   * Build scoring result from detected elements
   */
  private static buildScoringResult(
    framework: 'b2c' | 'b2b',
    elements: ElementCount[],
    categories: any
  ): SimpleScoringResult {
    const totalElements = Object.values(categories).reduce((sum: number, cat: any) => sum + cat.total, 0);
    const presentElements = elements.filter(e => e.present).length;
    const overallPercentage = Math.round((presentElements / totalElements) * 100);

    const categoryDistributions: CategoryDistribution[] = Object.entries(categories).map(([categoryName, categoryData]: [string, any]) => {
      const categoryElements = elements.filter(e => e.category === categoryName);
      const presentCount = categoryElements.filter(e => e.present).length;
      
      return {
        category: categoryName,
        total_elements: categoryData.total,
        present_elements: presentCount,
        percentage: Math.round((presentCount / categoryData.total) * 100),
        elements: categoryElements
      };
    });

    const strongCategories = categoryDistributions
      .filter(cat => cat.percentage >= 70)
      .map(cat => cat.category);
    
    const weakCategories = categoryDistributions
      .filter(cat => cat.percentage < 30)
      .map(cat => cat.category);
    
    const missingCategories = categoryDistributions
      .filter(cat => cat.percentage === 0)
      .map(cat => cat.category);

    return {
      framework,
      total_elements: totalElements,
      present_elements: presentElements,
      overall_percentage: overallPercentage,
      categories: categoryDistributions,
      summary: {
        strong_categories: strongCategories,
        weak_categories: weakCategories,
        missing_categories: missingCategories
      }
    };
  }
}

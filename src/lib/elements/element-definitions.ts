/**
 * Element Definitions by Category and Sub-Category
 * Clean, simple lists without any hardcoded scoring
 */

export interface ElementDefinition {
  name: string;
  keywords: string[];
  description: string;
}

export interface CategoryDefinition {
  name: string;
  description: string;
  subcategories: SubCategoryDefinition[];
}

export interface SubCategoryDefinition {
  name: string;
  elements: ElementDefinition[];
}

export const B2C_ELEMENTS = {
  name: 'B2C Elements of Value',
  totalElements: 30,
  categories: {
    functional: {
      name: 'Functional',
      description: 'Practical value elements that solve everyday problems',
      subcategories: [
        {
          name: 'Efficiency',
          elements: [
            {
              name: 'saves_time',
              keywords: ['fast', 'quick', 'instant', 'automated', 'efficient', 'time-saving', 'speedy'],
              description: 'Helps complete tasks faster'
            },
            {
              name: 'simplifies',
              keywords: ['simple', 'easy', 'straightforward', 'streamlined', 'user-friendly', 'intuitive'],
              description: 'Makes things easier'
            },
            {
              name: 'reduces_effort',
              keywords: ['effortless', 'easy', 'simple', 'no effort', 'minimal effort'],
              description: 'Minimizes work required'
            },
            {
              name: 'organizes',
              keywords: ['organized', 'structured', 'systematic', 'orderly', 'tidy', 'neat'],
              description: 'Helps structure tasks'
            }
          ]
        },
        {
          name: 'Financial',
          elements: [
            {
              name: 'makes_money',
              keywords: ['earn', 'income', 'profit', 'revenue', 'money', 'financial'],
              description: 'Helps earn income'
            },
            {
              name: 'reduces_cost',
              keywords: ['affordable', 'cheap', 'budget', 'cost-effective', 'inexpensive', 'value'],
              description: 'Saves money'
            }
          ]
        },
        {
          name: 'Risk & Quality',
          elements: [
            {
              name: 'reduces_risk',
              keywords: ['safe', 'secure', 'guaranteed', 'risk-free', 'protected', 'reliable'],
              description: 'Minimizes negative outcomes'
            },
            {
              name: 'quality',
              keywords: ['quality', 'premium', 'excellent', 'superior', 'high-end', 'top-notch'],
              description: 'Superior standards'
            }
          ]
        },
        {
          name: 'Integration & Connection',
          elements: [
            {
              name: 'integrates',
              keywords: ['connects', 'integrates', 'unified', 'seamless', 'compatible', 'works with'],
              description: 'Connects systems'
            },
            {
              name: 'connects',
              keywords: ['connect', 'link', 'network', 'community', 'social', 'together'],
              description: 'Brings people together'
            }
          ]
        },
        {
          name: 'Choice & Information',
          elements: [
            {
              name: 'variety',
              keywords: ['variety', 'options', 'choices', 'selection', 'diverse', 'multiple'],
              description: 'Offers choices'
            },
            {
              name: 'informs',
              keywords: ['informative', 'educational', 'insights', 'knowledge', 'learning', 'understanding'],
              description: 'Provides knowledge'
            }
          ]
        },
        {
          name: 'Convenience',
          elements: [
            {
              name: 'avoids_hassles',
              keywords: ['hassle-free', 'convenient', 'smooth', 'trouble-free', 'painless'],
              description: 'Avoiding or reducing hassles and inconveniences'
            },
            {
              name: 'sensory_appeal',
              keywords: ['beautiful', 'stunning', 'elegant', 'sleek', 'modern', 'stylish'],
              description: 'Appealing in taste, smell, hearing and other senses'
            }
          ]
        }
      ]
    },
    emotional: {
      name: 'Emotional',
      description: 'Value elements that create feelings and emotional connections',
      subcategories: [
        {
          name: 'Well-being',
          elements: [
            {
              name: 'reduces_anxiety',
              keywords: ['calming', 'soothing', 'reassuring', 'comforting', 'peaceful'],
              description: 'Peace of mind'
            },
            {
              name: 'wellness',
              keywords: ['healthy', 'wellness', 'fitness', 'well-being', 'health', 'vitality'],
              description: 'Health promotion'
            },
            {
              name: 'therapeutic',
              keywords: ['healing', 'therapeutic', 'relaxing', 'stress-relief', 'calming'],
              description: 'Stress relief'
            }
          ]
        },
        {
          name: 'Recognition & Rewards',
          elements: [
            {
              name: 'rewards_me',
              keywords: ['rewards', 'incentives', 'bonuses', 'perks', 'benefits', 'gifts'],
              description: 'Incentives/recognition'
            },
            {
              name: 'badge_value',
              keywords: ['status', 'prestige', 'exclusive', 'elite', 'premium', 'luxury'],
              description: 'Status signal'
            }
          ]
        },
        {
          name: 'Aesthetics & Design',
          elements: [
            {
              name: 'design_aesthetics',
              keywords: ['beautiful', 'stunning', 'elegant', 'stylish', 'design'],
              description: 'Visual appeal'
            },
            {
              name: 'attractiveness',
              keywords: ['beautiful', 'attractive', 'stunning', 'gorgeous', 'elegant'],
              description: 'Personal appeal'
            }
          ]
        },
        {
          name: 'Experience & Access',
          elements: [
            {
              name: 'fun_entertainment',
              keywords: ['fun', 'entertaining', 'enjoyable', 'exciting', 'thrilling', 'amusing'],
              description: 'Enjoyment'
            },
            {
              name: 'provides_access',
              keywords: ['exclusive', 'membership', 'VIP', 'special', 'privileged', 'insider'],
              description: 'Exclusive opportunities'
            },
            {
              name: 'nostalgia',
              keywords: ['nostalgic', 'memories', 'retro', 'classic', 'vintage', 'throwback'],
              description: 'Positive memories'
            }
          ]
        }
      ]
    },
    life_changing: {
      name: 'Life Changing',
      description: 'Value elements that transform customer lives',
      subcategories: [
        {
          name: 'Personal Growth',
          elements: [
            {
              name: 'provides_hope',
              keywords: ['hope', 'future', 'potential', 'possibility', 'dream', 'aspiration'],
              description: 'Inspires optimism'
            },
            {
              name: 'self_actualization',
              keywords: ['potential', 'growth', 'development', 'achievement', 'success'],
              description: 'Achieve potential'
            },
            {
              name: 'motivation',
              keywords: ['motivating', 'inspiring', 'encouraging', 'empowering', 'driving'],
              description: 'Inspires action'
            }
          ]
        },
        {
          name: 'Legacy & Belonging',
          elements: [
            {
              name: 'heirloom',
              keywords: ['legacy', 'lasting', 'timeless', 'permanent', 'enduring', 'heritage'],
              description: 'Legacy value'
            },
            {
              name: 'affiliation',
              keywords: ['belonging', 'community', 'family', 'group', 'team', 'together'],
              description: 'Sense of belonging'
            }
          ]
        }
      ]
    },
    social_impact: {
      name: 'Social Impact',
      description: 'Value elements that benefit society',
      subcategories: [
        {
          name: 'Purpose',
          elements: [
            {
              name: 'self_transcendence',
              keywords: ['greater good', 'impact', 'change', 'difference', 'contribution', 'purpose'],
              description: 'Greater good'
            }
          ]
        }
      ]
    }
  }
};

export const B2B_ELEMENTS = {
  name: 'B2B Elements of Value',
  totalElements: 40,
  categories: {
    table_stakes: {
      name: 'Table Stakes',
      description: 'Must-have elements for market entry',
      subcategories: [
        {
          name: 'Requirements',
          elements: [
            {
              name: 'meeting_specifications',
              keywords: ['meets requirements', 'specifications', 'standards', 'compliance'],
              description: 'Conforms to customer\'s internal specifications'
            },
            {
              name: 'acceptable_price',
              keywords: ['competitive', 'affordable', 'value', 'pricing', 'cost-effective'],
              description: 'Provides products/services at acceptable price'
            },
            {
              name: 'regulatory_compliance',
              keywords: ['compliant', 'certified', 'approved', 'regulated', 'standards'],
              description: 'Complies with regulations'
            },
            {
              name: 'ethical_standards',
              keywords: ['ethical', 'responsible', 'integrity', 'transparent', 'honest'],
              description: 'Performs activities in ethical manner'
            }
          ]
        }
      ]
    },
    functional: {
      name: 'Functional',
      description: 'Functional value elements for business operations',
      subcategories: [
        {
          name: 'Economic',
          elements: [
            {
              name: 'improved_top_line',
              keywords: ['revenue', 'growth', 'sales', 'profit', 'income', 'returns'],
              description: 'Helps customer increase revenue'
            },
            {
              name: 'cost_reduction',
              keywords: ['savings', 'reduce costs', 'efficiency', 'optimization', 'cut expenses'],
              description: 'Reduces cost for customer\'s organization'
            }
          ]
        },
        {
          name: 'Performance',
          elements: [
            {
              name: 'product_quality',
              keywords: ['quality', 'reliable', 'durable', 'premium', 'excellent', 'superior'],
              description: 'Provides high-quality goods or services'
            },
            {
              name: 'scalability',
              keywords: ['scalable', 'expandable', 'grows with you', 'flexible', 'adaptable'],
              description: 'Expands easily to additional demand/processes'
            },
            {
              name: 'innovation',
              keywords: ['innovative', 'cutting-edge', 'advanced', 'breakthrough', 'revolutionary'],
              description: 'Provides innovative capabilities'
            }
          ]
        },
        {
          name: 'Strategic',
          elements: [
            {
              name: 'risk_reduction',
              keywords: ['risk-free', 'safe', 'secure', 'protected', 'guaranteed', 'reliable'],
              description: 'Protects customer against loss/risk'
            },
            {
              name: 'reach',
              keywords: ['reach', 'scale', 'global', 'worldwide', 'extensive', 'broad'],
              description: 'Allows customer to operate in more locations'
            },
            {
              name: 'flexibility',
              keywords: ['flexible', 'adaptable', 'customizable', 'versatile'],
              description: 'Moves beyond standard to allow customization'
            },
            {
              name: 'component_quality',
              keywords: ['quality', 'reliable', 'durable', 'premium'],
              description: 'Improves perceived quality of customer\'s products'
            }
          ]
        }
      ]
    },
    ease_of_business: {
      name: 'Ease of Doing Business',
      description: 'Elements that make doing business easier',
      subcategories: [
        {
          name: 'Productivity',
          elements: [
            {
              name: 'time_savings',
              keywords: ['time-saving', 'efficient', 'quick', 'fast', 'streamlined', 'rapid'],
              description: 'Saves time for users/organization'
            },
            {
              name: 'reduced_effort',
              keywords: ['effortless', 'easy', 'simple', 'straightforward', 'minimal effort'],
              description: 'Helps organization get things done with less effort'
            },
            {
              name: 'decreased_hassles',
              keywords: ['hassle-free', 'smooth', 'seamless', 'trouble-free', 'painless'],
              description: 'Helps customer avoid unnecessary hassles'
            }
          ]
        },
        {
          name: 'Information',
          elements: [
            {
              name: 'information',
              keywords: ['insights', 'data', 'analytics', 'reporting', 'visibility', 'transparency'],
              description: 'Helps users become informed'
            },
            {
              name: 'transparency',
              keywords: ['transparent', 'clear', 'open', 'honest', 'visible', 'accountable'],
              description: 'Provides clear view into customer\'s organization'
            }
          ]
        },
        {
          name: 'Operational',
          elements: [
            {
              name: 'organization',
              keywords: ['organized', 'structured', 'systematic', 'orderly', 'methodical'],
              description: 'Helps users become more organized'
            },
            {
              name: 'simplification',
              keywords: ['simple', 'streamlined', 'unified', 'consolidated', 'integrated'],
              description: 'Reduces complexity and keeps things simple'
            },
            {
              name: 'connection',
              keywords: ['connect', 'integrate', 'unify', 'link', 'bridge', 'network'],
              description: 'Connects organizations and users with others'
            },
            {
              name: 'integration',
              keywords: ['seamless', 'compatible', 'works with', 'connects', 'unified'],
              description: 'Helps integrate different facets of business'
            }
          ]
        },
        {
          name: 'Access',
          elements: [
            {
              name: 'access',
              keywords: ['available', 'accessible', '24/7', 'always on', 'reliable'],
              description: 'Provides access to resources/services/capabilities'
            },
            {
              name: 'availability',
              keywords: ['available', 'accessible', '24/7', 'always on', 'reliable'],
              description: 'Available when and where needed'
            },
            {
              name: 'variety',
              keywords: ['options', 'choices', 'flexible', 'customizable', 'diverse', 'multiple'],
              description: 'Provides variety of goods/services to choose from'
            },
            {
              name: 'configurability',
              keywords: ['configurable', 'customizable', 'flexible', 'adaptable', 'tailored'],
              description: 'Can be configured to customer\'s specific needs'
            }
          ]
        },
        {
          name: 'Relationship',
          elements: [
            {
              name: 'responsiveness',
              keywords: ['responsive', 'quick', 'fast', 'immediate', 'prompt', 'reactive'],
              description: 'Responds promptly and professionally'
            },
            {
              name: 'expertise',
              keywords: ['expert', 'specialized', 'knowledgeable', 'skilled', 'professional'],
              description: 'Provides know-how for relevant industry'
            },
            {
              name: 'commitment',
              keywords: ['committed', 'dedicated', 'loyal', 'reliable', 'consistent', 'devoted'],
              description: 'Shows commitment to customer\'s success'
            },
            {
              name: 'stability',
              keywords: ['stable', 'reliable', 'consistent', 'dependable', 'secure', 'solid'],
              description: 'Is stable company for foreseeable future'
            },
            {
              name: 'cultural_fit',
              keywords: ['culture', 'values', 'alignment', 'compatibility', 'partnership'],
              description: 'Fits well with customer\'s culture and people'
            }
          ]
        }
      ]
    },
    individual: {
      name: 'Individual',
      description: 'Personal benefits for decision-makers',
      subcategories: [
        {
          name: 'Career',
          elements: [
            {
              name: 'network_expansion',
              keywords: ['network', 'connections', 'relationships', 'partnerships', 'community'],
              description: 'Helps users expand professional network'
            },
            {
              name: 'marketability',
              keywords: ['marketable', 'credible', 'reputable', 'recognized', 'established'],
              description: 'Makes users more marketable in their field'
            },
            {
              name: 'reputational_assurance',
              keywords: ['reputation', 'trusted', 'reliable', 'credible', 'established'],
              description: 'Does not jeopardize buyer\'s reputation'
            }
          ]
        },
        {
          name: 'Personal',
          elements: [
            {
              name: 'design_aesthetics_b2b',
              keywords: ['beautiful', 'stunning', 'elegant', 'professional', 'polished'],
              description: 'Provides aesthetically pleasing goods/services'
            },
            {
              name: 'growth_development',
              keywords: ['growth', 'development', 'learning', 'improvement', 'advancement'],
              description: 'Helps users develop personally'
            },
            {
              name: 'reduced_anxiety_b2b',
              keywords: ['peace of mind', 'confidence', 'reassurance', 'security', 'comfort'],
              description: 'Helps buyers feel more secure'
            },
            {
              name: 'fun_perks',
              keywords: ['enjoyable', 'fun', 'engaging', 'exciting', 'rewarding', 'satisfying'],
              description: 'Is enjoyable to interact with or rewarding'
            }
          ]
        }
      ]
    },
    inspirational: {
      name: 'Inspirational',
      description: 'Elements that inspire and motivate',
      subcategories: [
        {
          name: 'Vision & Purpose',
          elements: [
            {
              name: 'vision',
              keywords: ['vision', 'future', 'potential', 'possibility', 'aspiration', 'dream'],
              description: 'Helps customer anticipate direction of markets'
            },
            {
              name: 'hope_b2b',
              keywords: ['hope', 'optimism', 'confidence', 'belief', 'faith', 'trust'],
              description: 'Gives buyers hope for future of their organization'
            }
          ]
        }
      ]
    }
  }
};

export const GOLDEN_CIRCLE_ELEMENTS = {
  name: 'Golden Circle Analysis',
  totalElements: 3,
  categories: {
    core: {
      name: 'Core Elements',
      description: 'Simon Sinek\'s Golden Circle framework',
      subcategories: [
        {
          name: 'Purpose',
          elements: [
            {
              name: 'why',
              keywords: ['why', 'purpose', 'belief', 'cause', 'mission', 'reason'],
              description: 'Why does your organization exist?'
            },
            {
              name: 'how',
              keywords: ['how', 'differentiation', 'methodology', 'approach', 'process'],
              description: 'How do you do what you do differently?'
            },
            {
              name: 'what',
              keywords: ['what', 'product', 'service', 'offering', 'solution'],
              description: 'What do you do?'
            }
          ]
        }
      ]
    }
  }
};

export const CLIFTON_STRENGTHS_ELEMENTS = {
  name: 'CliftonStrengths Analysis',
  totalElements: 34,
  categories: {
    executing: {
      name: 'Executing',
      description: 'Themes for getting things done',
      subcategories: [
        {
          name: 'Achievement',
          elements: [
            { name: 'achiever', keywords: ['achievement', 'accomplish', 'complete', 'finish'], description: 'Driven to achieve' },
            { name: 'arranger', keywords: ['organize', 'arrange', 'coordinate', 'manage'], description: 'Can arrange and orchestrate' },
            { name: 'belief', keywords: ['values', 'principles', 'ethics', 'morals'], description: 'Core values that are unchanging' },
            { name: 'consistency', keywords: ['fair', 'equal', 'consistent', 'balanced'], description: 'Balance and evenness' },
            { name: 'deliberative', keywords: ['careful', 'cautious', 'thoughtful', 'prudent'], description: 'Careful and vigilant' },
            { name: 'discipline', keywords: ['routine', 'structure', 'order', 'systematic'], description: 'Enjoy routine and structure' },
            { name: 'focus', keywords: ['prioritize', 'concentrate', 'direct', 'aim'], description: 'Can take direction and follow through' },
            { name: 'responsibility', keywords: ['accountable', 'dependable', 'reliable', 'committed'], description: 'Take psychological ownership' },
            { name: 'restorative', keywords: ['problem-solving', 'fix', 'repair', 'restore'], description: 'Adept at dealing with problems' }
          ]
        }
      ]
    },
    influencing: {
      name: 'Influencing',
      description: 'Themes for taking charge',
      subcategories: [
        {
          name: 'Leadership',
          elements: [
            { name: 'activator', keywords: ['action', 'initiate', 'start', 'begin'], description: 'Can make things happen' },
            { name: 'command', keywords: ['lead', 'direct', 'control', 'manage'], description: 'Have presence and can take control' },
            { name: 'communication', keywords: ['explain', 'describe', 'present', 'articulate'], description: 'Generally find it easy to put thoughts into words' },
            { name: 'competition', keywords: ['compete', 'win', 'victory', 'success'], description: 'Measure progress against others' },
            { name: 'maximizer', keywords: ['excellence', 'strength', 'talent', 'potential'], description: 'Focus on strengths as a way to stimulate personal and group excellence' },
            { name: 'self-assurance', keywords: ['confidence', 'certainty', 'conviction', 'belief'], description: 'Feel confident in ability to manage own life' },
            { name: 'significance', keywords: ['important', 'meaningful', 'impact', 'influence'], description: 'Want to be very important in the eyes of other people' },
            { name: 'woo', keywords: ['win', 'persuade', 'charm', 'influence'], description: 'Love the challenge of meeting new people' }
          ]
        }
      ]
    },
    relationship_building: {
      name: 'Relationship Building',
      description: 'Themes for connecting',
      subcategories: [
        {
          name: 'Connection',
          elements: [
            { name: 'adaptability', keywords: ['flexible', 'adaptable', 'adjust', 'change'], description: 'Prefer to go with the flow' },
            { name: 'connectedness', keywords: ['connected', 'linked', 'related', 'unified'], description: 'Have faith in the links between all things' },
            { name: 'developer', keywords: ['develop', 'grow', 'improve', 'enhance'], description: 'Recognize and cultivate the potential in others' },
            { name: 'empathy', keywords: ['understand', 'feel', 'sense', 'perceive'], description: 'Can sense the feelings of other people' },
            { name: 'harmony', keywords: ['harmony', 'peace', 'agreement', 'consensus'], description: 'Look for consensus' },
            { name: 'includer', keywords: ['include', 'welcome', 'embrace', 'accept'], description: 'Accepting of others' },
            { name: 'individualization', keywords: ['unique', 'individual', 'personal', 'distinct'], description: 'Intrigued by the unique qualities of each person' },
            { name: 'positivity', keywords: ['positive', 'optimistic', 'cheerful', 'upbeat'], description: 'Have an enthusiasm that is contagious' },
            { name: 'relator', keywords: ['relationship', 'bond', 'connection', 'friendship'], description: 'Enjoy close relationships with others' }
          ]
        }
      ]
    },
    strategic_thinking: {
      name: 'Strategic Thinking',
      description: 'Themes for understanding',
      subcategories: [
        {
          name: 'Analysis',
          elements: [
            { name: 'analytical', keywords: ['analyze', 'examine', 'investigate', 'study'], description: 'Search for reasons and causes' },
            { name: 'context', keywords: ['context', 'background', 'history', 'perspective'], description: 'Enjoy thinking about the past' },
            { name: 'futuristic', keywords: ['future', 'vision', 'possibility', 'potential'], description: 'Inspired by the future and what could be' },
            { name: 'ideation', keywords: ['ideas', 'concepts', 'innovation', 'creativity'], description: 'Fascinated by ideas' },
            { name: 'input', keywords: ['collect', 'gather', 'accumulate', 'amass'], description: 'Have a craving to know more' },
            { name: 'intellection', keywords: ['intellectual', 'thinking', 'mental', 'cognitive'], description: 'Characterized by intellectual activity' },
            { name: 'learner', keywords: ['learn', 'study', 'acquire', 'master'], description: 'Have a great desire to learn and continuously improve' },
            { name: 'strategic', keywords: ['strategy', 'plan', 'approach', 'method'], description: 'Create alternative ways to proceed' }
          ]
        }
      ]
    }
  }
};

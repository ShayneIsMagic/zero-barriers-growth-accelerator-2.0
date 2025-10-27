/**
 * Gemini Prompt Templates
 * Clear, optimized prompt summaries for Google Gemini API
 * Used app-wide for consistent framework analysis
 */

/**
 * B2C Elements of Value Prompt Template
 * 30 consumer value elements across 4 categories
 * Based on Bain & Company's Consumer Elements of Value
 */
export const B2C_PROMPT_TEMPLATE = {
  framework: 'B2C Elements of Value (30 Elements - Bain & Company)',
  markdown: `# B2C Elements of Value Framework

## Total Elements: 30

### Functional (14 elements)
1. **saves_time** - Helps complete tasks faster
2. **simplifies** - Makes things easier
3. **makes_money** - Helps earn income
4. **reduces_effort** - Minimizes work required
5. **reduces_cost** - Saves money
6. **reduces_risk** - Minimizes negative outcomes
7. **organizes** - Helps structure tasks
8. **integrates** - Connects systems
9. **connects** - Brings people together
10. **quality** - Superior standards
11. **variety** - Offers choices
12. **informs** - Provides knowledge
13. **avoids_hassles** - Reduces inconveniences
14. **sensory_appeal** - Appealing to senses

### Emotional (10 elements)
15. **reduces_anxiety** - Provides peace of mind
16. **rewards_me** - Incentives and recognition
17. **nostalgia** - Positive memories
18. **design_aesthetics** - Visual appeal
19. **badge_value** - Status signaling
20. **wellness** - Health promotion
21. **therapeutic** - Stress relief
22. **fun_entertainment** - Enjoyment
23. **attractiveness** - Personal appeal
24. **provides_access** - Exclusive opportunities

### Life-Changing (5 elements)
25. **provides_hope** - Inspires optimism
26. **self_actualization** - Achieve potential
27. **motivation** - Inspires action
28. **heirloom** - Legacy value
29. **affiliation_belonging** - Sense of belonging

### Social Impact (1 element)
30. **self_transcendence** - Greater good

## Scoring: Present (1) or Absent (0) for each element`,
  categories: {
    functional: [
      'saves_time', 'simplifies', 'makes_money', 'reduces_effort', 'reduces_cost',
      'reduces_risk', 'organizes', 'integrates', 'connects', 'quality', 'variety',
      'informs', 'avoids_hassles', 'sensory_appeal'
    ],
    emotional: [
      'reduces_anxiety', 'rewards_me', 'nostalgia', 'design_aesthetics', 'badge_value',
      'wellness', 'therapeutic', 'fun_entertainment', 'attractiveness', 'provides_access'
    ],
    lifeChanging: [
      'provides_hope', 'self_actualization', 'motivation', 'heirloom', 'affiliation_belonging'
    ],
    socialImpact: [
      'self_transcendence'
    ]
  },
  totalElements: 30,
  scoreRange: '0-30',
  analysisType: 'Consumer value proposition'
};

/**
 * B2B Elements of Value Prompt Template
 * 42 business value elements across 5 categories
 * Based on Bain & Company's B2B Elements of Value
 */
export const B2B_PROMPT_TEMPLATE = {
  framework: 'B2B Elements of Value (42 Elements)',
  markdown: `# B2B Elements of Value Framework

## Total Elements: 42

### Table Stakes (4 elements)
1. **meeting_specifications** - Meets required specifications
2. **acceptable_price** - Fair pricing
3. **regulatory_compliance** - Meets legal requirements
4. **ethical_standards** - Ethical business practices

### Functional Value (9 elements)

**Economic**:
5. **improved_top_line** - Revenue growth
6. **cost_reduction** - Lowers expenses

**Performance**:
7. **product_quality** - High-quality products/services
8. **scalability** - Grows with business needs
9. **innovation** - Brings new capabilities

**Strategic**:
10. **risk_reduction** - Minimizes business risk
11. **reach** - Expanded market access
12. **flexibility** - Adapts to needs
13. **component_quality** - High-quality components

### Ease of Doing Business Value (18 elements)

**Productivity (5 elements)**:
14. **time_savings** - Saves time
15. **reduced_effort** - Less work required
16. **decreased_hassles** - Fewer problems
17. **information** - Provides valuable data
18. **transparency** - Clear visibility

**Operational (4 elements)**:
19. **organization** - Better structure
20. **simplification** - Simplifies processes
21. **connection** - Connects ecosystems
22. **integration** - Integrates systems

**Access (4 elements)**:
23. **access** - Enables access to resources
24. **availability** - Available when needed
25. **variety** - Offers choices
26. **configurability** - Customizable

**Relationship (5 elements)**:
27. **responsiveness** - Quick to respond
28. **expertise** - Demonstrates expertise
29. **commitment** - Shows dedication
30. **stability** - Reliable and stable
31. **cultural_fit** - Matches company culture

### Individual Value (7 elements)

**Career**:
32. **network_expansion** - Grows professional network
33. **marketability** - Enhances career
34. **reputational_assurance** - Protects reputation

**Personal**:
35. **design_aesthetics_b2b** - Professional design
36. **growth_development** - Personal development
37. **reduced_anxiety_b2b** - Peace of mind
38. **fun_perks** - Enjoyable benefits

### Inspirational Value (4 elements)

**Purpose**:
39. **purpose** - Aligns with customer's organizational purpose
- **vision** - Helps customer anticipate direction of markets
- **hope** - Gives buyers hope for future of their organization
- **social_responsibility** - Helps customer be more socially responsible

## Scoring: Present (1) or Absent (0) for each element`,
  categories: {
    tableStakes: [
      'meeting_specifications', 'acceptable_price', 'regulatory_compliance', 'ethical_standards'
    ],
    functional: [
      'improved_top_line', 'cost_reduction', 'product_quality', 'scalability', 'innovation',
      'risk_reduction', 'reach', 'flexibility', 'component_quality'
    ],
    easeOfDoingBusiness: [
      'time_savings', 'reduced_effort', 'decreased_hassles', 'information', 'transparency',
      'organization', 'simplification', 'connection', 'integration', 'access', 'availability',
      'variety', 'configurability', 'responsiveness', 'expertise', 'commitment', 'stability',
      'cultural_fit'
    ],
    individual: [
      'network_expansion', 'marketability', 'reputational_assurance', 'design_aesthetics_b2b',
      'growth_development', 'reduced_anxiety_b2b', 'fun_perks'
    ],
    inspirational: [
      'purpose', 'vision', 'hope_b2b', 'social_responsibility'
    ]
  },
  totalElements: 42,
  scoreRange: '0-42',
  analysisType: 'Business value proposition'
};

/**
 * CliftonStrengths Prompt Template
 * 34 themes across 4 domains
 * Based on Gallup's CliftonStrengths assessment
 */
export const CLIFTON_PROMPT_TEMPLATE = {
  framework: 'CliftonStrengths (34 Themes - Gallup)',
  markdown: `# CliftonStrengths Framework

## Total Themes: 34

### Strategic Thinking (8 themes)
1. **analytical** - Seeks data and logical reasoning
2. **context** - Understands the past to plan the future
3. **futuristic** - Inspired by what could be
4. **ideation** - Fascinated by ideas
5. **input** - Collects information and resources
6. **intellection** - Enjoys thinking and mental activity
7. **learner** - Has a strong desire to learn
8. **strategic** - Creates alternative ways to proceed

### Executing (9 themes)
9. **achiever** - Works hard and takes satisfaction from being busy
10. **arranger** - Can organize and figure out complex situations
11. **belief** - Has core values that are unchanging
12. **consistency** - Treats all people equally
13. **deliberative** - Takes serious care in making decisions
14. **discipline** - Enjoys routine and structure
15. **focus** - Takes direction and follows through
16. **responsibility** - Takes psychological ownership
17. **restorative** - Enjoys solving problems

### Influencing (8 themes)
18. **activator** - Impatient for action
19. **command** - Has presence and can take control
20. **communication** - Enjoys explaining and describing
21. **competition** - Measures progress against others
22. **maximizer** - Focuses on strengths to stimulate excellence
23. **self_assurance** - Confident in abilities
24. **significance** - Wants to be recognized and heard
25. **woo** - Enjoys meeting new people

### Relationship Building (9 themes)
26. **adaptability** - Prefers to go with the flow
27. **connectedness** - Believes all things happen for a reason
28. **developer** - Recognizes and cultivates potential in others
29. **empathy** - Senses the feelings of others
30. **harmony** - Looks for consensus
31. **includer** - Accepting of others
32. **individualization** - Intrigued by unique qualities
33. **positivity** - Upbeat and can get others excited
34. **relator** - Enjoys close relationships

## Scoring: Present (1) or Absent (0) for each theme`,
  domains: {
    strategicThinking: [
      'analytical', 'context', 'futuristic', 'ideation', 'input', 'intellection', 'learner', 'strategic'
    ],
    executing: [
      'achiever', 'arranger', 'belief', 'consistency', 'deliberative', 'discipline', 'focus',
      'responsibility', 'restorative'
    ],
    influencing: [
      'activator', 'command', 'communication', 'competition', 'maximizer', 'self_assurance',
      'significance', 'woo'
    ],
    relationshipBuilding: [
      'adaptability', 'connectedness', 'developer', 'empathy', 'harmony', 'includer',
      'individualization', 'positivity', 'relator'
    ]
  },
  totalThemes: 34,
  scoreRange: '0-34',
  analysisType: 'Organizational strengths and cultural patterns'
};

/**
 * Golden Circle Prompt Template
 * Why, How, What, WHO framework
 * Based on Simon Sinek's Golden Circle, extended to include WHO
 */
export const GOLDEN_CIRCLE_PROMPT_TEMPLATE = {
  framework: 'Golden Circle (Simon Sinek - Complete with WHO)',
  markdown: `# Golden Circle Framework

## Simon Sinek's Golden Circle + WHO

### WHY - Purpose, Cause, Belief (Score: 0-10)
The organization's deeper purpose and driving belief:
- What is the organization's purpose?
- What cause does it serve?
- What belief drives it?
- Why does it exist beyond making money?
- What is the organization's reason for being?

### HOW - Process, Methodology, Differentiation (Score: 0-10)
The organization's unique approach:
- How does the organization fulfill its purpose?
- What unique process or methodology does it use?
- How is it different from competitors?
- What values guide its actions?
- What is the organization's unique approach?

### WHAT - Products, Services, Features (Score: 0-10)
The tangible offerings:
- What products or services does it offer?
- What specific features or benefits?
- What tangible things does it provide?
- What can customers buy or use?
- What does the organization actually do?

### WHO - Target Audience, People, Relationships (Score: 0-10)
The people connected to the organization:
- Who is their ideal customer?
- Who are they serving?
- Who believes what they believe?
- Who is their target audience?
- Who are the people in their testimonials?
- Who benefits from their WHY?
- Who is their team/community?

## Total Score Range: 0-40 (10 points per element)
## Scoring Criteria: 0 = Not present, 10 = Exceptionally clear`,
  elements: {
    why: {
      title: 'WHY - Purpose, Cause, Belief',
      questions: [
        "What is the organization's purpose?",
        "What cause does it serve?",
        "What belief drives it?",
        "Why does it exist beyond making money?",
        "What is the organization's reason for being?"
      ],
      scoreRange: '0-10'
    },
    how: {
      title: 'HOW - Process, Methodology, Differentiation',
      questions: [
        "How does the organization fulfill its purpose?",
        "What unique process or methodology does it use?",
        "How is it different from competitors?",
        "What values guide its actions?",
        "What is the organization's unique approach?"
      ],
      scoreRange: '0-10'
    },
    what: {
      title: 'WHAT - Products, Services, Features',
      questions: [
        "What products or services does it offer?",
        "What specific features or benefits?",
        "What tangible things does it provide?",
        "What can customers buy or use?",
        "What does the organization actually do?"
      ],
      scoreRange: '0-10'
    },
    who: {
      title: 'WHO - Target Audience, People, Relationships',
      questions: [
        "Who is their ideal customer?",
        "Who are they serving?",
        "Who believes what they believe?",
        "Who is their target audience?",
        "Who are the people in their testimonials?",
        "Who benefits from their WHY?",
        "Who is their team/community?"
      ],
      scoreRange: '0-10'
    }
  },
  totalElements: 4,
  scoreRange: '0-40',
  analysisType: 'Purpose-driven strategy alignment'
};

/**
 * Content Comparison Prompt Template
 * Generic content comparison without specific framework
 */
export const CONTENT_COMPARISON_PROMPT_TEMPLATE = {
  framework: 'Generic Content Comparison',
  analysisAreas: [
    'SEO Impact',
    'Value Proposition',
    'Keywords Targeting',
    'Readability',
    'Call-to-Action',
    'Overall Recommendation'
  ],
  comparisonType: 'Existing vs. Proposed content',
  outputFormat: 'Structured comparison with scores and specific improvements'
};

/**
 * Helper function to build prompts consistently
 */
export function buildFrameworkPrompt(
  framework: 'b2c' | 'b2b' | 'clifton' | 'golden-circle',
  existing: any,
  proposed: any | null,
  url: string
): string {
  const templates = {
    'b2c': B2C_PROMPT_TEMPLATE,
    'b2b': B2B_PROMPT_TEMPLATE,
    'clifton': CLIFTON_PROMPT_TEMPLATE,
    'golden-circle': GOLDEN_CIRCLE_PROMPT_TEMPLATE
  };

  const template = templates[framework];

  return `# Analysis Request: ${template.framework}

## Website URL
${url}

## Existing Content to Analyze
- **Word Count:** ${existing.wordCount || 0}
- **Title:** ${existing.title || 'N/A'}
- **Meta Description:** ${existing.metaDescription || 'N/A'}
- **Keywords:** ${existing.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
- **Content Preview:** ${existing.cleanText?.substring(0, 2000) || 'No content available'}

${proposed ? `
## Proposed Content (Comparison)
- **Word Count:** ${proposed.wordCount || 0}
- **Title:** ${proposed.title || 'N/A'}
- **Meta Description:** ${proposed.metaDescription || 'N/A'}
- **Keywords:** ${proposed.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
- **Content Preview:** ${proposed.cleanText?.substring(0, 2000) || 'No content available'}
` : ''}

---

## Framework Definition
${template.markdown || `Use the ${template.framework} framework for analysis.`}

---

## Analysis Requirements
Provide a structured analysis including:

1. **Overall Score** (${template.scoreRange})
2. **Framework-specific breakdown** with category/domain scores
3. **Present elements/themes** with specific evidence from the content
4. **Missing elements/themes** with recommendations for improvement
5. **Specific, actionable improvements** prioritized by impact

## Output Format
Return a structured JSON analysis with scores, evidence, and actionable insights.`;
}

/**
 * Export all templates for easy access
 */
export const PROMPT_TEMPLATES = {
  b2c: B2C_PROMPT_TEMPLATE,
  b2b: B2B_PROMPT_TEMPLATE,
  cliftonStrengths: CLIFTON_PROMPT_TEMPLATE,
  goldenCircle: GOLDEN_CIRCLE_PROMPT_TEMPLATE,
  contentComparison: CONTENT_COMPARISON_PROMPT_TEMPLATE
};


// Comprehensive Analysis Prompts for AI-Powered Website Analysis
// Based on Simon Sinek's Golden Circle, Bain & Company Elements of Value, and Gallup CliftonStrengths

export interface AnalysisPromptConfig {
  url: string;
  content: string;
  pageType: 'home' | 'testimonials' | 'about' | 'services' | 'contact' | 'general';
}

export function buildGoldenCirclePrompt(config: AnalysisPromptConfig): string {
  return `
# GOLDEN CIRCLE ANALYSIS - SIMON SINEK'S FRAMEWORK

You are an expert business analyst specializing in Simon Sinek's Golden Circle framework. Analyze the following website content to extract the EXACT WHY, HOW, WHAT, and WHO statements.

## WEBSITE INFORMATION
- URL: ${config.url}
- Page Type: ${config.pageType}
- Content Length: ${config.content.length} characters

## CONTENT TO ANALYZE
${config.content}

## CRITICAL EXTRACTION REQUIREMENTS

### 1. WHY (Core Purpose/Mission)
Extract the EXACT mission statement, core purpose, or driving belief. Look for:
- Hero section statements
- About page mission statements
- Value proposition language
- Emotional core messaging
- "We believe..." statements
- "Our mission is..." declarations
- Purpose-driven language

**REQUIRED FORMAT:**
- Quote the EXACT text from the content
- Identify the source location (hero, about, etc.)
- Score 1-10 based on clarity and emotional impact

### 2. HOW (Unique Methodology/Process)
Identify the specific methodology, process, or approach that differentiates this company. Look for:
- Framework names (e.g., "Revenue Growth Methodology")
- Step-by-step processes
- Unique approaches or systems
- Methodology descriptions
- "Our approach..." statements
- Process explanations

**REQUIRED FORMAT:**
- Quote the EXACT methodology description
- Identify the framework name if mentioned
- Score 1-10 based on uniqueness and clarity

### 3. WHAT (Products/Services)
List the specific products, services, or solutions offered. Look for:
- Service categories
- Product names
- Solution descriptions
- Offerings list
- "We provide..." statements
- Service descriptions

**REQUIRED FORMAT:**
- List each offering exactly as stated
- Categorize by type (consulting, software, training, etc.)
- Score 1-10 based on clarity and specificity

### 4. WHO (Target Audience/Testimonials)
Analyze testimonials, case studies, and target audience information. Look for:
- Client names and companies
- Job titles and roles
- Success metrics and results
- Target audience descriptions
- Client logos or mentions
- Case study details

**REQUIRED FORMAT:**
- Extract specific client names and companies
- Quote exact success metrics
- Identify target audience characteristics
- Score 1-10 based on specificity and credibility

## SCORING CRITERIA
- 9-10: Exceptional clarity, specific details, compelling examples
- 7-8: Strong evidence, good details, clear examples
- 5-6: Moderate evidence, some details, basic examples
- 3-4: Weak evidence, vague details, limited examples
- 1-2: Minimal evidence, no specific details, generic content

## OUTPUT FORMAT
Return a JSON object with this exact structure:
{
  "why": {
    "statement": "Exact quote from content",
    "source": "hero|about|services|contact|general",
    "score": number,
    "insights": ["Specific insights about the WHY statement"]
  },
  "how": {
    "methodology": "Exact methodology description",
    "framework": "Framework name if mentioned",
    "score": number,
    "insights": ["Specific insights about the HOW approach"]
  },
  "what": {
    "offerings": ["List of exact offerings"],
    "categories": ["Service categories"],
    "score": number,
    "insights": ["Specific insights about the WHAT offerings"]
  },
  "who": {
    "testimonials": [
      {
        "client": "Client name",
        "company": "Company name",
        "title": "Job title",
        "quote": "Exact testimonial text",
        "results": "Success metrics mentioned"
      }
    ],
    "targetAudience": "Description of target audience",
    "score": number,
    "insights": ["Specific insights about the WHO testimonials"]
  },
  "overallScore": number,
  "summary": "Comprehensive summary of Golden Circle analysis"
}
`;
}

export function buildElementsOfValuePrompt(config: AnalysisPromptConfig): string {
  return `
# BAIN & COMPANY ELEMENTS OF VALUE ANALYSIS

You are an expert business analyst specializing in Bain & Company's Elements of Value framework. Analyze the website content to score each element based on evidence found in the content.

## WEBSITE INFORMATION
- URL: ${config.url}
- Page Type: ${config.pageType}
- Content Length: ${config.content.length} characters

## CONTENT TO ANALYZE
${config.content}

## BAIN ELEMENTS OF VALUE FRAMEWORK

### FUNCTIONAL ELEMENTS (Score 1-10 each)
1. **Saves Time** - Look for time-saving language, efficiency claims, "faster" statements
2. **Simplifies** - Look for "easy," "simple," "streamlined" language
3. **Reduces Cost** - Look for cost reduction claims, "affordable," "ROI" mentions
4. **Reduces Risk** - Look for risk mitigation, "secure," "reliable" language
5. **Organizes** - Look for organization, structure, system language
6. **Integrates** - Look for integration, "connects," "unifies" language
7. **Connects** - Look for networking, community, "brings together" language
8. **Reduces Effort** - Look for "effortless," "automated," "hands-off" language

### EMOTIONAL ELEMENTS (Score 1-10 each)
9. **Reduces Anxiety** - Look for "peace of mind," "worry-free," stress reduction
10. **Rewards Me** - Look for rewards, recognition, achievement language
11. **Fun/Entertainment** - Look for engaging, enjoyable, entertaining language
12. **Attractive** - Look for aesthetic, beautiful, appealing language
13. **Wellness** - Look for health, wellness, well-being language
14. **Access** - Look for "exclusive," "premium," access language
15. **Design/Aesthetics** - Look for design, visual, aesthetic language
16. **Badge Value** - Look for status, prestige, "premium" language

### LIFE-CHANGING ELEMENTS (Score 1-10 each)
17. **Motivation** - Look for motivational, inspiring, "empowering" language
18. **Heirloom** - Look for lasting value, legacy, "investment" language
19. **Self-Actualization** - Look for personal growth, fulfillment language
20. **Provides Hope** - Look for optimistic, future-focused language
21. **Affiliation/Belonging** - Look for community, belonging, "part of" language
22. **Nostalgia** - Look for memory, tradition, "heritage" language

### SOCIAL IMPACT ELEMENTS (Score 1-10 each)
23. **Self-Transcendence** - Look for purpose, meaning, "greater good" language
24. **Environmental** - Look for eco-friendly, sustainable, green language
25. **Social** - Look for social responsibility, community impact language

## SCORING INSTRUCTIONS
- **9-10**: Strong evidence with specific examples and quotes
- **7-8**: Good evidence with clear examples
- **5-6**: Moderate evidence with some examples
- **3-4**: Weak evidence with vague examples
- **1-2**: Minimal or no evidence

## OUTPUT FORMAT
Return a JSON object with this exact structure:
{
  "functional": {
    "savesTime": { "score": number, "evidence": "Quote from content" },
    "simplifies": { "score": number, "evidence": "Quote from content" },
    "reducesCost": { "score": number, "evidence": "Quote from content" },
    "reducesRisk": { "score": number, "evidence": "Quote from content" },
    "organizes": { "score": number, "evidence": "Quote from content" },
    "integrates": { "score": number, "evidence": "Quote from content" },
    "connects": { "score": number, "evidence": "Quote from content" },
    "reducesEffort": { "score": number, "evidence": "Quote from content" }
  },
  "emotional": {
    "reducesAnxiety": { "score": number, "evidence": "Quote from content" },
    "rewardsMe": { "score": number, "evidence": "Quote from content" },
    "funEntertainment": { "score": number, "evidence": "Quote from content" },
    "attractive": { "score": number, "evidence": "Quote from content" },
    "wellness": { "score": number, "evidence": "Quote from content" },
    "access": { "score": number, "evidence": "Quote from content" },
    "designAesthetics": { "score": number, "evidence": "Quote from content" },
    "badgeValue": { "score": number, "evidence": "Quote from content" }
  },
  "lifeChanging": {
    "motivation": { "score": number, "evidence": "Quote from content" },
    "heirloom": { "score": number, "evidence": "Quote from content" },
    "selfActualization": { "score": number, "evidence": "Quote from content" },
    "providesHope": { "score": number, "evidence": "Quote from content" },
    "affiliationBelonging": { "score": number, "evidence": "Quote from content" },
    "nostalgia": { "score": number, "evidence": "Quote from content" }
  },
  "socialImpact": {
    "selfTranscendence": { "score": number, "evidence": "Quote from content" },
    "environmental": { "score": number, "evidence": "Quote from content" },
    "social": { "score": number, "evidence": "Quote from content" }
  },
  "overallScore": number,
  "topElements": ["List of top 5 elements with scores"],
  "summary": "Comprehensive summary of Elements of Value analysis"
}
`;
}

export function buildCliftonStrengthsPrompt(config: AnalysisPromptConfig): string {
  return `
# GALLUP CLIFTONSTRENGTHS ANALYSIS

You are an expert business analyst specializing in Gallup's CliftonStrengths framework. Analyze the website content to identify which of the 34 CliftonStrengths themes the content appeals to and attracts.

## WEBSITE INFORMATION
- URL: ${config.url}
- Page Type: ${config.pageType}
- Content Length: ${config.content.length} characters

## CONTENT TO ANALYZE
${config.content}

## CLIFTONSTRENGTHS THEMES ANALYSIS

### EXECUTING THEMES (Score 1-10 each)
1. **Achiever** - Look for achievement, accomplishment, "getting things done" language
2. **Arranger** - Look for organization, coordination, "bringing order" language
3. **Belief** - Look for values, principles, "what's right" language
4. **Consistency** - Look for fairness, equality, "same rules for all" language
5. **Deliberative** - Look for careful, cautious, "think before acting" language
6. **Discipline** - Look for routine, structure, "order and predictability" language
7. **Focus** - Look for direction, priorities, "staying on track" language
8. **Responsibility** - Look for commitment, ownership, "following through" language
9. **Restorative** - Look for problem-solving, fixing, "making things right" language

### INFLUENCING THEMES (Score 1-10 each)
10. **Activator** - Look for action, urgency, "let's go" language
11. **Command** - Look for leadership, control, "taking charge" language
12. **Communication** - Look for explanation, expression, "making ideas clear" language
13. **Competition** - Look for winning, comparison, "being the best" language
14. **Maximizer** - Look for excellence, improvement, "making good great" language
15. **Self-Assurance** - Look for confidence, certainty, "inner compass" language
16. **Significance** - Look for recognition, importance, "making a difference" language
17. **Woo** - Look for relationship-building, networking, "winning others over" language

### RELATIONSHIP BUILDING THEMES (Score 1-10 each)
18. **Adaptability** - Look for flexibility, "going with the flow" language
19. **Connectedness** - Look for unity, "everything happens for a reason" language
20. **Developer** - Look for growth, potential, "seeing potential in others" language
21. **Empathy** - Look for understanding, feeling, "walking in others' shoes" language
22. **Harmony** - Look for agreement, consensus, "avoiding conflict" language
23. **Includer** - Look for acceptance, "including everyone" language
24. **Individualization** - Look for uniqueness, "one size doesn't fit all" language
25. **Positivity** - Look for optimism, enthusiasm, "seeing the bright side" language
26. **Relator** - Look for deep relationships, "close connections" language

### STRATEGIC THINKING THEMES (Score 1-10 each)
27. **Analytical** - Look for logic, data, "proving it" language
28. **Context** - Look for history, "understanding the past" language
29. **Futuristic** - Look for vision, "what could be" language
30. **Ideation** - Look for creativity, "new ways of thinking" language
31. **Input** - Look for collecting, "gathering information" language
32. **Intellection** - Look for thinking, "mental activity" language
33. **Learner** - Look for growth, "continuous improvement" language
34. **Strategic** - Look for alternatives, "finding the right path" language

## SCORING INSTRUCTIONS
- **9-10**: Strong evidence with specific examples and quotes
- **7-8**: Good evidence with clear examples
- **5-6**: Moderate evidence with some examples
- **3-4**: Weak evidence with vague examples
- **1-2**: Minimal or no evidence

## OUTPUT FORMAT
Return a JSON object with this exact structure:
{
  "executing": {
    "achiever": { "score": number, "evidence": "Quote from content" },
    "arranger": { "score": number, "evidence": "Quote from content" },
    "belief": { "score": number, "evidence": "Quote from content" },
    "consistency": { "score": number, "evidence": "Quote from content" },
    "deliberative": { "score": number, "evidence": "Quote from content" },
    "discipline": { "score": number, "evidence": "Quote from content" },
    "focus": { "score": number, "evidence": "Quote from content" },
    "responsibility": { "score": number, "evidence": "Quote from content" },
    "restorative": { "score": number, "evidence": "Quote from content" }
  },
  "influencing": {
    "activator": { "score": number, "evidence": "Quote from content" },
    "command": { "score": number, "evidence": "Quote from content" },
    "communication": { "score": number, "evidence": "Quote from content" },
    "competition": { "score": number, "evidence": "Quote from content" },
    "maximizer": { "score": number, "evidence": "Quote from content" },
    "selfAssurance": { "score": number, "evidence": "Quote from content" },
    "significance": { "score": number, "evidence": "Quote from content" },
    "woo": { "score": number, "evidence": "Quote from content" }
  },
  "relationshipBuilding": {
    "adaptability": { "score": number, "evidence": "Quote from content" },
    "connectedness": { "score": number, "evidence": "Quote from content" },
    "developer": { "score": number, "evidence": "Quote from content" },
    "empathy": { "score": number, "evidence": "Quote from content" },
    "harmony": { "score": number, "evidence": "Quote from content" },
    "includer": { "score": number, "evidence": "Quote from content" },
    "individualization": { "score": number, "evidence": "Quote from content" },
    "positivity": { "score": number, "evidence": "Quote from content" },
    "relator": { "score": number, "evidence": "Quote from content" }
  },
  "strategicThinking": {
    "analytical": { "score": number, "evidence": "Quote from content" },
    "context": { "score": number, "evidence": "Quote from content" },
    "futuristic": { "score": number, "evidence": "Quote from content" },
    "ideation": { "score": number, "evidence": "Quote from content" },
    "input": { "score": number, "evidence": "Quote from content" },
    "intellection": { "score": number, "evidence": "Quote from content" },
    "learner": { "score": number, "evidence": "Quote from content" },
    "strategic": { "score": number, "evidence": "Quote from content" }
  },
  "overallScore": number,
  "topThemes": ["List of top 10 themes with scores"],
  "summary": "Comprehensive summary of CliftonStrengths analysis"
}
`;
}

export function buildActionableRecommendationsPrompt(config: AnalysisPromptConfig): string {
  return `
# ACTIONABLE RECOMMENDATIONS ANALYSIS

You are an expert business consultant specializing in website optimization and growth acceleration. Based on the Golden Circle, Elements of Value, and CliftonStrengths analysis, provide specific, actionable recommendations.

## WEBSITE INFORMATION
- URL: ${config.url}
- Page Type: ${config.pageType}
- Content Length: ${config.content.length} characters

## CONTENT TO ANALYZE
${config.content}

## RECOMMENDATION FRAMEWORK

### 1. GOLDEN CIRCLE IMPROVEMENTS
Based on the WHY, HOW, WHAT, WHO analysis, provide specific recommendations for:
- Strengthening the WHY statement
- Clarifying the HOW methodology
- Better defining the WHAT offerings
- Enhancing WHO testimonials and target audience

### 2. ELEMENTS OF VALUE OPTIMIZATION
Based on the Bain Elements of Value scores, provide recommendations for:
- Improving low-scoring elements
- Leveraging high-scoring elements
- Adding missing value elements
- Strengthening value proposition

### 3. CLIFTONSTRENGTHS ALIGNMENT
Based on the CliftonStrengths analysis, provide recommendations for:
- Better appealing to target strengths
- Adjusting messaging for different strength themes
- Creating content that resonates with specific personality types

### 4. CONTENT OPTIMIZATION
Provide specific recommendations for:
- Headline improvements
- Call-to-action optimization
- Social proof enhancement
- Trust signal addition
- Conversion optimization

## RECOMMENDATION CATEGORIES
- **HIGH PRIORITY**: Critical issues that must be addressed
- **MEDIUM PRIORITY**: Important improvements that should be made
- **LOW PRIORITY**: Nice-to-have enhancements

## OUTPUT FORMAT
Return a JSON object with this exact structure:
{
  "highPriority": [
    {
      "category": "Golden Circle|Elements of Value|CliftonStrengths|Content|Technical",
      "title": "Specific recommendation title",
      "description": "Detailed description of the recommendation",
      "actionItems": ["Specific action item 1", "Specific action item 2"],
      "expectedImpact": "Expected impact on growth/conversion",
      "effort": "Low|Medium|High",
      "timeline": "Immediate|1-2 weeks|1-3 months"
    }
  ],
  "mediumPriority": [
    {
      "category": "Golden Circle|Elements of Value|CliftonStrengths|Content|Technical",
      "title": "Specific recommendation title",
      "description": "Detailed description of the recommendation",
      "actionItems": ["Specific action item 1", "Specific action item 2"],
      "expectedImpact": "Expected impact on growth/conversion",
      "effort": "Low|Medium|High",
      "timeline": "Immediate|1-2 weeks|1-3 months"
    }
  ],
  "lowPriority": [
    {
      "category": "Golden Circle|Elements of Value|CliftonStrengths|Content|Technical",
      "title": "Specific recommendation title",
      "description": "Detailed description of the recommendation",
      "actionItems": ["Specific action item 1", "Specific action item 2"],
      "expectedImpact": "Expected impact on growth/conversion",
      "effort": "Low|Medium|High",
      "timeline": "Immediate|1-2 weeks|1-3 months"
    }
  ],
  "summary": "Comprehensive summary of all recommendations",
  "nextSteps": ["Immediate next steps to take"]
}
`;
}

export function buildComprehensiveAnalysisPrompt(config: AnalysisPromptConfig): string {
  return `
# COMPREHENSIVE WEBSITE ANALYSIS

You are an expert business analyst specializing in comprehensive website analysis using multiple frameworks. Analyze the following website content using Simon Sinek's Golden Circle, Bain & Company's Elements of Value, and Gallup's CliftonStrengths frameworks.

## WEBSITE INFORMATION
- URL: ${config.url}
- Page Type: ${config.pageType}
- Content Length: ${config.content.length} characters

## CONTENT TO ANALYZE
${config.content}

## ANALYSIS REQUIREMENTS

### 1. GOLDEN CIRCLE ANALYSIS (Simon Sinek)
Extract and score the WHY, HOW, WHAT, and WHO elements with specific quotes and evidence.

### 2. ELEMENTS OF VALUE ANALYSIS (Bain & Company)
Score all 25 elements based on evidence found in the content, with specific quotes.

### 3. CLIFTONSTRENGTHS ANALYSIS (Gallup)
Score all 34 CliftonStrengths themes based on content appeal and language patterns.

### 4. ACTIONABLE RECOMMENDATIONS
Provide specific, prioritized recommendations for improvement.

## CRITICAL REQUIREMENTS
- Base ALL analysis on ACTUAL CONTENT provided
- Quote EXACT text from the content
- Provide SPECIFIC evidence for each score
- Give ACTIONABLE recommendations
- Use the EXACT JSON format specified

## OUTPUT FORMAT
Return a JSON object with this exact structure:
{
  "goldenCircle": {
    "why": {
      "statement": "Exact quote from content",
      "source": "hero|about|services|contact|general",
      "score": number,
      "insights": ["Specific insights about the WHY statement"]
    },
    "how": {
      "methodology": "Exact methodology description",
      "framework": "Framework name if mentioned",
      "score": number,
      "insights": ["Specific insights about the HOW approach"]
    },
    "what": {
      "offerings": ["List of exact offerings"],
      "categories": ["Service categories"],
      "score": number,
      "insights": ["Specific insights about the WHAT offerings"]
    },
    "who": {
      "testimonials": [
        {
          "client": "Client name",
          "company": "Company name",
          "title": "Job title",
          "quote": "Exact testimonial text",
          "results": "Success metrics mentioned"
        }
      ],
      "targetAudience": "Description of target audience",
      "score": number,
      "insights": ["Specific insights about the WHO testimonials"]
    },
    "overallScore": number,
    "summary": "Comprehensive summary of Golden Circle analysis"
  },
  "elementsOfValue": {
    "functional": {
      "savesTime": { "score": number, "evidence": "Quote from content" },
      "simplifies": { "score": number, "evidence": "Quote from content" },
      "reducesCost": { "score": number, "evidence": "Quote from content" },
      "reducesRisk": { "score": number, "evidence": "Quote from content" },
      "organizes": { "score": number, "evidence": "Quote from content" },
      "integrates": { "score": number, "evidence": "Quote from content" },
      "connects": { "score": number, "evidence": "Quote from content" },
      "reducesEffort": { "score": number, "evidence": "Quote from content" }
    },
    "emotional": {
      "reducesAnxiety": { "score": number, "evidence": "Quote from content" },
      "rewardsMe": { "score": number, "evidence": "Quote from content" },
      "funEntertainment": { "score": number, "evidence": "Quote from content" },
      "attractive": { "score": number, "evidence": "Quote from content" },
      "wellness": { "score": number, "evidence": "Quote from content" },
      "access": { "score": number, "evidence": "Quote from content" },
      "designAesthetics": { "score": number, "evidence": "Quote from content" },
      "badgeValue": { "score": number, "evidence": "Quote from content" }
    },
    "lifeChanging": {
      "motivation": { "score": number, "evidence": "Quote from content" },
      "heirloom": { "score": number, "evidence": "Quote from content" },
      "selfActualization": { "score": number, "evidence": "Quote from content" },
      "providesHope": { "score": number, "evidence": "Quote from content" },
      "affiliationBelonging": { "score": number, "evidence": "Quote from content" },
      "nostalgia": { "score": number, "evidence": "Quote from content" }
    },
    "socialImpact": {
      "selfTranscendence": { "score": number, "evidence": "Quote from content" },
      "environmental": { "score": number, "evidence": "Quote from content" },
      "social": { "score": number, "evidence": "Quote from content" }
    },
    "overallScore": number,
    "topElements": ["List of top 5 elements with scores"],
    "summary": "Comprehensive summary of Elements of Value analysis"
  },
  "cliftonStrengths": {
    "executing": {
      "achiever": { "score": number, "evidence": "Quote from content" },
      "arranger": { "score": number, "evidence": "Quote from content" },
      "belief": { "score": number, "evidence": "Quote from content" },
      "consistency": { "score": number, "evidence": "Quote from content" },
      "deliberative": { "score": number, "evidence": "Quote from content" },
      "discipline": { "score": number, "evidence": "Quote from content" },
      "focus": { "score": number, "evidence": "Quote from content" },
      "responsibility": { "score": number, "evidence": "Quote from content" },
      "restorative": { "score": number, "evidence": "Quote from content" }
    },
    "influencing": {
      "activator": { "score": number, "evidence": "Quote from content" },
      "command": { "score": number, "evidence": "Quote from content" },
      "communication": { "score": number, "evidence": "Quote from content" },
      "competition": { "score": number, "evidence": "Quote from content" },
      "maximizer": { "score": number, "evidence": "Quote from content" },
      "selfAssurance": { "score": number, "evidence": "Quote from content" },
      "significance": { "score": number, "evidence": "Quote from content" },
      "woo": { "score": number, "evidence": "Quote from content" }
    },
    "relationshipBuilding": {
      "adaptability": { "score": number, "evidence": "Quote from content" },
      "connectedness": { "score": number, "evidence": "Quote from content" },
      "developer": { "score": number, "evidence": "Quote from content" },
      "empathy": { "score": number, "evidence": "Quote from content" },
      "harmony": { "score": number, "evidence": "Quote from content" },
      "includer": { "score": number, "evidence": "Quote from content" },
      "individualization": { "score": number, "evidence": "Quote from content" },
      "positivity": { "score": number, "evidence": "Quote from content" },
      "relator": { "score": number, "evidence": "Quote from content" }
    },
    "strategicThinking": {
      "analytical": { "score": number, "evidence": "Quote from content" },
      "context": { "score": number, "evidence": "Quote from content" },
      "futuristic": { "score": number, "evidence": "Quote from content" },
      "ideation": { "score": number, "evidence": "Quote from content" },
      "input": { "score": number, "evidence": "Quote from content" },
      "intellection": { "score": number, "evidence": "Quote from content" },
      "learner": { "score": number, "evidence": "Quote from content" },
      "strategic": { "score": number, "evidence": "Quote from content" }
    },
    "overallScore": number,
    "topThemes": ["List of top 10 themes with scores"],
    "summary": "Comprehensive summary of CliftonStrengths analysis"
  },
  "recommendations": {
    "highPriority": [
      {
        "category": "Golden Circle|Elements of Value|CliftonStrengths|Content|Technical",
        "title": "Specific recommendation title",
        "description": "Detailed description of the recommendation",
        "actionItems": ["Specific action item 1", "Specific action item 2"],
        "expectedImpact": "Expected impact on growth/conversion",
        "effort": "Low|Medium|High",
        "timeline": "Immediate|1-2 weeks|1-3 months"
      }
    ],
    "mediumPriority": [
      {
        "category": "Golden Circle|Elements of Value|CliftonStrengths|Content|Technical",
        "title": "Specific recommendation title",
        "description": "Detailed description of the recommendation",
        "actionItems": ["Specific action item 1", "Specific action item 2"],
        "expectedImpact": "Expected impact on growth/conversion",
        "effort": "Low|Medium|High",
        "timeline": "Immediate|1-2 weeks|1-3 months"
      }
    ],
    "lowPriority": [
      {
        "category": "Golden Circle|Elements of Value|CliftonStrengths|Content|Technical",
        "title": "Specific recommendation title",
        "description": "Detailed description of the recommendation",
        "actionItems": ["Specific action item 1", "Specific action item 2"],
        "expectedImpact": "Expected impact on growth/conversion",
        "effort": "Low|Medium|High",
        "timeline": "Immediate|1-2 weeks|1-3 months"
      }
    ],
    "summary": "Comprehensive summary of all recommendations",
    "nextSteps": ["Immediate next steps to take"]
  },
  "overallScore": number,
  "summary": "Comprehensive summary of the entire analysis"
}
`;
}

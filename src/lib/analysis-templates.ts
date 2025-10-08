/**
 * Analysis Templates for Zero Barriers Growth Accelerator
 * Based on proven frameworks: Golden Circle, Elements of Value, CliftonStrengths
 */

export interface AnalysisTemplate {
  framework: string;
  objective: string;
  prompt: string;
  scoringCriteria: string[];
  outputFormat: any;
}

export const ANALYSIS_TEMPLATES: Record<string, AnalysisTemplate> = {
  GOLDEN_CIRCLE: {
    framework: "Simon Sinek's Golden Circle",
    objective: "Extract the core purpose (Why), unique approach (How), and specific offerings (What) from website content",
    prompt: `
ANALYZE THE GOLDEN CIRCLE FRAMEWORK:

1. WHY (Core Purpose/Belief):
   - Extract the specific mission statement, core purpose, or driving belief
   - Look for: "We believe...", "Our mission is...", "We exist to...", "Our purpose is..."
   - Quote exact phrases from hero sections, about pages, mission statements
   - Identify the emotional driver and core belief system

2. HOW (Unique Approach/Methodology):
   - Identify the specific methodology, process, or unique approach
   - Look for: frameworks, methodologies, processes, differentiators
   - Extract exact methodology names, processes, or unique approaches
   - Find what makes them different from competitors

3. WHAT (Products/Services):
   - List the specific products, services, or solutions offered
   - Extract exact product names, service categories, specific offerings
   - Include pricing models, service tiers, or product lines
   - Identify target markets and use cases

4. WHO (Target Audience/Testimonials):
   - Analyze testimonials, case studies, client logos, success stories
   - Extract specific client names, company names, job titles
   - Identify success metrics and specific results mentioned
   - Find target audience indicators and customer segments

SCORING CRITERIA (1-10):
- 9-10: Exceptional clarity, specific details, compelling examples
- 7-8: Strong evidence, good details, clear examples
- 5-6: Moderate evidence, some details, basic examples
- 3-4: Weak evidence, vague details, limited examples
- 1-2: Minimal evidence, no specific details, generic content
`,
    scoringCriteria: [
      "Clarity of purpose statement",
      "Specificity of methodology",
      "Detail of product/service offerings",
      "Quality of testimonials and case studies",
      "Differentiation from competitors"
    ],
    outputFormat: {
      why: "string",
      how: "string", 
      what: "string",
      who: "string",
      overallScore: "number",
      insights: ["string"]
    }
  },

  ELEMENTS_OF_VALUE: {
    framework: "Bain & Company's Elements of Value",
    objective: "Score 30 elements across 4 categories based on evidence in the content",
    prompt: `
ANALYZE THE ELEMENTS OF VALUE FRAMEWORK:

FUNCTIONAL ELEMENTS (0-10 each):
- savesTime: Evidence of time-saving features, efficiency gains
- simplifies: Process simplification, ease of use
- makesMoney: Revenue generation, cost savings, ROI
- reducesRisk: Risk mitigation, security, guarantees
- organizes: Organization tools, structure, systems
- integrates: Integration capabilities, compatibility
- connects: Networking, community, relationships
- reducesEffort: Effort reduction, automation
- avoidsHassle: Problem prevention, smooth experience
- quality: Quality indicators, standards, certifications
- variety: Options, choices, customization
- sensoryAppeal: Visual appeal, design, aesthetics
- informs: Educational content, insights, data
- badge: Status, prestige, recognition
- design: Design quality, user experience
- customization: Personalization, tailored solutions
- reducesCost: Cost reduction, savings
- reducesWaste: Efficiency, waste reduction
- authenticity: Authenticity, trust, transparency
- belonging: Community, inclusion, membership

EMOTIONAL ELEMENTS (0-10 each):
- reducesAnxiety: Stress reduction, peace of mind
- rewards: Rewards, incentives, recognition
- nostalgia: Emotional connection, memories
- designAesthetics: Visual appeal, beauty
- funEntertainment: Enjoyment, entertainment
- attractiveness: Appeal, desirability
- wellness: Health, well-being, self-care
- belonging: Community, inclusion, acceptance
- providesAccess: Access, opportunity, inclusion
- selfActualization: Personal growth, fulfillment
- providesHope: Hope, optimism, future vision
- motivation: Inspiration, drive, encouragement

LIFE_CHANGING ELEMENTS (0-10 each):
- providesHope: Hope, optimism, future vision
- selfActualization: Personal growth, fulfillment
- motivation: Inspiration, drive, encouragement
- [Same as emotional elements but focus on transformative impact]

SOCIAL_IMPACT ELEMENTS (0-10 each):
- selfTranscendence: Making a difference, purpose beyond self
- [Same as life-changing elements but focus on social impact]

EVIDENCE REQUIREMENTS:
- Look for specific mentions, examples, testimonials
- Find quantifiable benefits and results
- Identify emotional language and appeals
- Look for transformation stories and outcomes
`,
    scoringCriteria: [
      "Evidence of functional value delivery",
      "Emotional connection and appeal",
      "Life-changing impact potential",
      "Social impact and purpose",
      "Overall value proposition strength"
    ],
    outputFormat: {
      functional: "object",
      emotional: "object",
      lifeChanging: "object", 
      socialImpact: "object",
      overallScore: "number",
      insights: ["string"]
    }
  },

  CLIFTON_STRENGTHS: {
    framework: "Gallup's CliftonStrengths",
    objective: "Analyze which personality themes the content appeals to and resonates with",
    prompt: `
ANALYZE CLIFTONSTRENGTHS THEMES (0-10 each):

STRATEGIC THINKING THEMES:
- Analytical: Data-driven, logical, systematic
- Context: Historical perspective, learning from past
- Futuristic: Future-focused, visionary, possibilities
- Ideation: Creative, innovative, conceptual
- Input: Curious, information-gathering, learning
- Intellection: Thoughtful, reflective, intellectual
- Learner: Continuous learning, growth mindset
- Strategic: Pattern recognition, alternative paths

EXECUTING THEMES:
- Achiever: Results-oriented, hardworking, productive
- Arranger: Organizing, coordinating, flexible
- Belief: Values-driven, purpose-oriented, principled
- Consistency: Fair, structured, rules-based
- Deliberative: Careful, cautious, thorough
- Discipline: Structured, routine, organized
- Focus: Goal-oriented, priority-driven, directed
- Responsibility: Dependable, accountable, committed
- Restorative: Problem-solving, fixing, improving

INFLUENCING THEMES:
- Activator: Action-oriented, impatient, starter
- Command: Take charge, control, direct
- Communication: Expressing ideas, storytelling, engaging
- Competition: Winning, comparison, achievement
- Maximizer: Excellence, optimization, improvement
- Self-Assurance: Confident, certain, decisive
- Significance: Important, meaningful, impactful
- Woo: Winning others over, relationship building

RELATIONSHIP BUILDING THEMES:
- Adaptability: Flexible, go-with-the-flow, present-moment
- Connectedness: Interconnected, spiritual, meaning
- Developer: Potential, growth, improvement
- Empathy: Understanding others, emotional intelligence
- Harmony: Peace, agreement, avoiding conflict
- Includer: Including others, welcoming, accepting
- Individualization: Unique, different, personalized
- Positivity: Optimistic, enthusiastic, uplifting
- Relator: Deep relationships, close connections

ANALYSIS FOCUS:
- Language patterns and tone
- Content structure and approach
- Call-to-action style
- Value proposition presentation
- Target audience appeal
`,
    scoringCriteria: [
      "Appeal to Strategic Thinking themes",
      "Appeal to Executing themes", 
      "Appeal to Influencing themes",
      "Appeal to Relationship Building themes",
      "Overall personality theme balance"
    ],
    outputFormat: {
      themes: "object",
      recommendations: ["string"],
      overallScore: "number",
      insights: ["string"]
    }
  },

  TESTIMONIAL_ANALYSIS: {
    framework: "Client Testimonials & Case Studies Analysis",
    objective: "Extract and evaluate client testimonials, case studies, and success stories",
    prompt: `
ANALYZE TESTIMONIALS AND CASE STUDIES:

EXTRACT SPECIFIC DETAILS:
- Client names and company names
- Job titles and roles
- Specific success metrics and results
- Industry and company size
- Project duration and scope
- Specific challenges addressed

EVALUATE CREDIBILITY:
- Specificity of details provided
- Quantifiable results mentioned
- Professional context and authority
- Consistency across testimonials
- Recency and relevance

ANALYZE SUCCESS PATTERNS:
- Common success themes
- Recurring value propositions
- Typical client profiles
- Success metrics patterns
- Transformation stories

ASSESS SOCIAL PROOF:
- Number and variety of testimonials
- Industry diversity
- Role diversity (C-level, managers, users)
- Geographic diversity
- Company size diversity

SCORING CRITERIA (1-10):
- 9-10: Highly specific, quantifiable, diverse, recent
- 7-8: Good specificity, some metrics, good variety
- 5-6: Moderate specificity, limited metrics
- 3-4: Vague details, limited credibility
- 1-2: Generic, no specific details, low credibility
`,
    scoringCriteria: [
      "Specificity of client details",
      "Quantifiable success metrics",
      "Diversity of client base",
      "Credibility and authenticity",
      "Recency and relevance"
    ],
    outputFormat: {
      clientNames: ["string"],
      companies: ["string"],
      successMetrics: ["string"],
      credibilityScore: "number",
      insights: ["string"]
    }
  }
};

export function buildComprehensiveAnalysisPrompt(content: string, url?: string): string {
  return `
You are an expert business analyst specializing in comprehensive content analysis using proven frameworks. Analyze the following website content with extreme attention to detail and specificity.

${url ? `URL: ${url}` : ''}

CONTENT TO ANALYZE:
${content}

ANALYSIS REQUIREMENTS:

1. GOLDEN CIRCLE ANALYSIS (Simon Sinek):
   - WHY: Extract the specific mission statement, core purpose, or driving belief. Quote exact phrases from hero sections, about pages, mission statements, and value propositions. Look for emotional core and driving motivation.
   - HOW: Identify the unique methodology, process, or approach. Look for specific frameworks, methodologies, processes, or differentiators mentioned. Extract exact methodology names and systematic approaches.
   - WHAT: List the specific products, services, or solutions offered. Extract exact product names, service categories, and specific offerings mentioned in the content.
   - WHO: Analyze testimonials, case studies, client logos, and success stories. Extract specific client names, company names, job titles, success metrics, and target audience information.

2. ELEMENTS OF VALUE ANALYSIS (Bain & Company):
   Score each of the 30 elements (0-10) based on evidence in the content:
   - Functional Elements: savesTime, simplifies, makesMoney, reducesRisk, organizes, integrates, connects, reducesEffort, avoidsHassle, quality, variety, sensoryAppeal, informs, badge, design, customization, reducesCost, reducesWaste, authenticity, belonging
   - Emotional Elements: reducesAnxiety, rewards, nostalgia, designAesthetics, funEntertainment, attractiveness, wellness, belonging, providesAccess, selfActualization, providesHope, motivation
   - Life-Changing Elements: providesHope, selfActualization, motivation, [same as emotional but focus on transformative impact]
   - Social Impact Elements: selfTranscendence, [same as life-changing but focus on social impact]

3. CLIFTONSTRENGTHS ANALYSIS (Gallup):
   Score each of the 34 themes (0-10) based on content appeal:
   - Strategic Thinking: Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic
   - Executing: Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative
   - Influencing: Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo
   - Relationship Building: Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator

4. TESTIMONIAL & CASE STUDY ANALYSIS:
   - Extract specific client names, companies, and job titles
   - Identify success metrics and specific results mentioned
   - Analyze credibility and specificity of testimonials
   - Look for case study details and specific outcomes

5. UNIQUENESS & DIFFERENTIATION:
   - Identify what makes this company different from competitors
   - Look for unique value propositions, methodologies, or approaches
   - Find specific differentiators mentioned in the content

SCORING CRITERIA:
- 9-10: Exceptional evidence, specific details, compelling examples
- 7-8: Strong evidence, good details, clear examples
- 5-6: Moderate evidence, some details, basic examples
- 3-4: Weak evidence, vague details, limited examples
- 1-2: Minimal evidence, no specific details, generic content

Return your analysis in this EXACT JSON format:
{
  "goldenCircle": {
    "why": "Exact mission statement or core purpose from the content",
    "how": "Specific methodology, process, or unique approach mentioned",
    "what": "Exact products, services, or solutions listed",
    "who": "Specific client names, companies, and success stories from testimonials",
    "overallScore": number,
    "insights": ["Specific insights based on actual content analysis"]
  },
  "elementsOfValue": {
    "functional": { "savesTime": number, "simplifies": number, "makesMoney": number, "reducesRisk": number, "organizes": number, "integrates": number, "connects": number, "reducesEffort": number, "avoidsHassle": number, "quality": number, "variety": number, "sensoryAppeal": number, "informs": number, "badge": number, "design": number, "customization": number, "reducesCost": number, "reducesWaste": number, "authenticity": number, "belonging": number, "funEntertainment": number, "attractiveness": number, "wellness": number, "reducesAnxiety": number, "rewards": number, "nostalgia": number, "designAesthetics": number, "selfActualization": number, "providesHope": number, "motivation": number },
    "emotional": { "reducesAnxiety": number, "rewards": number, "nostalgia": number, "designAesthetics": number, "funEntertainment": number, "attractiveness": number, "wellness": number, "belonging": number, "providesAccess": number, "simplifies": number, "makesMoney": number, "reducesRisk": number, "organizes": number, "integrates": number, "connects": number, "reducesEffort": number, "avoidsHassle": number, "quality": number, "variety": number, "sensoryAppeal": number, "informs": number, "badge": number, "design": number, "customization": number, "reducesCost": number, "reducesWaste": number, "authenticity": number, "selfActualization": number, "providesHope": number, "motivation": number },
    "lifeChanging": { "providesHope": number, "selfActualization": number, "motivation": number, "reducesAnxiety": number, "rewards": number, "nostalgia": number, "designAesthetics": number, "funEntertainment": number, "attractiveness": number, "wellness": number, "belonging": number, "providesAccess": number, "simplifies": number, "makesMoney": number, "reducesRisk": number, "organizes": number, "integrates": number, "connects": number, "reducesEffort": number, "avoidsHassle": number, "quality": number, "variety": number, "sensoryAppeal": number, "informs": number, "badge": number, "design": number, "customization": number, "reducesCost": number, "reducesWaste": number, "authenticity": number },
    "socialImpact": { "selfTranscendence": number, "providesHope": number, "selfActualization": number, "motivation": number, "reducesAnxiety": number, "rewards": number, "nostalgia": number, "designAesthetics": number, "funEntertainment": number, "attractiveness": number, "wellness": number, "belonging": number, "providesAccess": number, "simplifies": number, "makesMoney": number, "reducesRisk": number, "organizes": number, "integrates": number, "connects": number, "reducesEffort": number, "avoidsHassle": number, "quality": number, "variety": number, "sensoryAppeal": number, "informs": number, "badge": number, "design": number, "customization": number, "reducesCost": number, "reducesWaste": number, "authenticity": number },
    "overallScore": number,
    "insights": ["Specific insights based on actual content analysis"]
  },
  "cliftonStrengths": {
    "themes": { "Achiever": number, "Activator": number, "Adaptability": number, "Analytical": number, "Arranger": number, "Belief": number, "Command": number, "Communication": number, "Competition": number, "Connectedness": number, "Consistency": number, "Context": number, "Deliberative": number, "Developer": number, "Discipline": number, "Empathy": number, "Focus": number, "Futuristic": number, "Harmony": number, "Ideation": number, "Includer": number, "Individualization": number, "Input": number, "Intellection": number, "Learner": number, "Maximizer": number, "Positivity": number, "Relator": number, "Responsibility": number, "Restorative": number, "Self-Assurance": number, "Significance": number, "Strategic": number, "Woo": number },
    "recommendations": ["Specific recommendations based on content analysis"],
    "overallScore": number,
    "insights": ["Specific insights based on actual content analysis"]
  },
  "recommendations": [
    {
      "priority": "high|medium|low",
      "category": "string",
      "description": "string",
      "actionItems": ["string"]
    }
  ],
  "overallScore": number,
  "summary": "Comprehensive summary based on actual content analysis with specific details"
}

IMPORTANT: Base all analysis on the ACTUAL CONTENT provided. Extract specific details, quotes, names, and examples. Do not use generic templates or assumptions.
`;
}

/**
 * Framework Fallback Markdown Generator
 * When AI analysis fails (e.g. API key suspended/quota exceeded),
 * generates a Markdown document containing the full analysis prompt
 * so the user can paste it into another AI platform (ChatGPT, Claude, etc.)
 */

interface FallbackInput {
  framework: string;
  url: string;
  existing: {
    title?: string;
    metaDescription?: string;
    wordCount?: number;
    cleanText?: string;
    extractedKeywords?: string[];
    headings?: { h1?: string[]; h2?: string[]; h3?: string[] };
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      extractedKeywords?: string[];
      headings?: { h1?: string[]; h2?: string[]; h3?: string[] };
    };
  };
  proposed?: {
    title?: string;
    metaDescription?: string;
    wordCount?: number;
    cleanText?: string;
    extractedKeywords?: string[];
  } | null;
  errorMessage: string;
}

const FRAMEWORK_LABELS: Record<string, string> = {
  'b2c-elements': 'B2C Elements of Value (Bain & Company)',
  'b2b-elements': 'B2B Elements of Value (Bain & Company)',
  'golden-circle': 'Golden Circle (Simon Sinek)',
  'clifton-strengths': 'CliftonStrengths (Gallup)',
};

export function generateFrameworkFallbackMarkdown(input: FallbackInput): string {
  const { framework, url, existing, proposed, errorMessage } = input;
  const frameworkLabel = FRAMEWORK_LABELS[framework] || framework;
  const now = new Date().toISOString().split('T')[0];

  const keywords =
    existing.extractedKeywords ||
    existing.seo?.extractedKeywords ||
    [];
  const headings = existing.headings || existing.seo?.headings || {
    h1: [],
    h2: [],
    h3: [],
  };

  let md = `# ${frameworkLabel} — Analysis Prompt\n\n`;
  md += `> **Generated:** ${now}  \n`;
  md += `> **URL:** ${url}  \n`;
  md += `> **Reason:** AI analysis could not be completed automatically.  \n`;
  md += `> **Error:** ${errorMessage}  \n\n`;
  md += `---\n\n`;
  md += `## How to Use This Document\n\n`;
  md += `1. Copy the **entire prompt** below.\n`;
  md += `2. Paste it into any AI platform (ChatGPT, Claude, Gemini, etc.).\n`;
  md += `3. The AI will return a complete ${frameworkLabel} analysis.\n`;
  md += `4. You can then use the results in your growth strategy.\n\n`;
  md += `---\n\n`;
  md += `## Collected Website Data\n\n`;
  md += `| Field | Value |\n`;
  md += `|-------|-------|\n`;
  md += `| **Title** | ${existing.title || 'N/A'} |\n`;
  md += `| **Meta Description** | ${existing.metaDescription || existing.seo?.metaDescription || 'N/A'} |\n`;
  md += `| **Word Count** | ${existing.wordCount || 0} |\n`;
  md += `| **Keywords** | ${keywords.slice(0, 10).join(', ') || 'N/A'} |\n`;
  md += `| **H1 Headings** | ${headings.h1?.join(', ') || 'N/A'} |\n`;
  md += `| **H2 Headings** | ${headings.h2?.slice(0, 5).join(', ') || 'N/A'} |\n\n`;

  if (proposed) {
    md += `### Proposed Content\n\n`;
    md += `| Field | Value |\n`;
    md += `|-------|-------|\n`;
    md += `| **Title** | ${proposed.title || 'N/A'} |\n`;
    md += `| **Word Count** | ${proposed.wordCount || 0} |\n`;
    md += `| **Keywords** | ${proposed.extractedKeywords?.slice(0, 10).join(', ') || 'N/A'} |\n\n`;
  }

  md += `---\n\n`;
  md += `## AI Analysis Prompt\n\n`;
  md += `Copy everything below the line and paste into your AI platform:\n\n`;
  md += `---\n\n`;
  md += generatePromptForFramework(framework, url, existing, proposed);

  return md;
}

function generatePromptForFramework(
  framework: string,
  url: string,
  existing: FallbackInput['existing'],
  proposed: FallbackInput['proposed']
): string {
  const contentBlock = buildContentBlock(url, existing, proposed);

  switch (framework) {
    case 'b2c-elements':
      return buildB2CPrompt(contentBlock);
    case 'b2b-elements':
      return buildB2BPrompt(contentBlock);
    case 'golden-circle':
      return buildGoldenCirclePrompt(contentBlock);
    case 'clifton-strengths':
      return buildCliftonStrengthsPrompt(contentBlock);
    default:
      return `Analyze the website at ${url} using the ${framework} framework.\n\n${contentBlock}`;
  }
}

function buildContentBlock(
  url: string,
  existing: FallbackInput['existing'],
  proposed: FallbackInput['proposed']
): string {
  const keywords =
    existing.extractedKeywords ||
    existing.seo?.extractedKeywords ||
    [];

  let block = `URL: ${url}\n\n`;
  block += `EXISTING CONTENT:\n`;
  block += `- Title: ${existing.title || 'N/A'}\n`;
  block += `- Meta Description: ${existing.metaDescription || existing.seo?.metaDescription || 'N/A'}\n`;
  block += `- Word Count: ${existing.wordCount || 0}\n`;
  block += `- Keywords: ${keywords.slice(0, 10).join(', ') || 'None'}\n`;
  block += `- Content:\n${existing.cleanText?.substring(0, 3000) || 'No content extracted'}\n\n`;

  if (proposed) {
    block += `PROPOSED CONTENT:\n`;
    block += `- Title: ${proposed.title || 'N/A'}\n`;
    block += `- Word Count: ${proposed.wordCount || 0}\n`;
    block += `- Keywords: ${proposed.extractedKeywords?.slice(0, 10).join(', ') || 'None'}\n`;
    block += `- Content:\n${proposed.cleanText?.substring(0, 3000) || 'No content'}\n\n`;
  } else {
    block += `No proposed content provided - analyze existing only.\n\n`;
  }

  return block;
}

function buildB2CPrompt(contentBlock: string): string {
  return `Analyze this website using the B2C Elements of Value framework (30 consumer value elements by Bain & Company):

${contentBlock}

B2C ELEMENTS OF VALUE FRAMEWORK (30 Elements):

FUNCTIONAL (14 elements):
1. saves_time, 2. simplifies, 3. makes_money, 4. reduces_effort, 5. reduces_cost,
6. reduces_risk, 7. organizes, 8. integrates, 9. connects, 10. quality,
11. variety, 12. informs, 13. avoids_hassles, 14. sensory_appeal

EMOTIONAL (10 elements):
15. reduces_anxiety, 16. rewards_me, 17. nostalgia, 18. design_aesthetics,
19. badge_value, 20. wellness, 21. therapeutic, 22. fun_entertainment,
23. attractiveness, 24. provides_access

LIFE-CHANGING (5 elements):
25. provides_hope, 26. self_actualization, 27. motivation, 28. heirloom, 29. affiliation_belonging

SOCIAL IMPACT (1 element):
30. self_transcendence

Please provide:
1. Overall B2C Value Score (0-30)
2. Category breakdowns (Functional, Emotional, Life-Changing, Social Impact)
3. Each element scored 0-10 with evidence from the content
4. Missing elements with specific recommendations
5. Top 3 actionable improvements for better consumer value
6. Return as structured JSON`;
}

function buildB2BPrompt(contentBlock: string): string {
  return `Analyze this website using the B2B Elements of Value framework (42 business value elements by Bain & Company):

${contentBlock}

B2B ELEMENTS OF VALUE FRAMEWORK (42 Elements):

TABLE STAKES (4): meeting_specifications, acceptable_price, regulatory_compliance, ethical_standards

FUNCTIONAL (9):
- Economic: improved_top_line, cost_reduction
- Performance: product_quality, scalability, innovation
- Strategic: risk_reduction, reach, flexibility, component_quality

EASE OF DOING BUSINESS (18):
- Productivity: time_savings, reduced_effort, decreased_hassles, information, transparency
- Operational: organization, simplification, connection, integration
- Access: access, availability, variety, configurability
- Relationship: responsiveness, expertise, commitment, stability, cultural_fit

INDIVIDUAL (7):
- Career: network_expansion, marketability, reputational_assurance
- Personal: design_aesthetics_b2b, growth_development, reduced_anxiety_b2b, fun_perks

INSPIRATIONAL (4): purpose, vision, hope_b2b, social_responsibility

Please provide:
1. Overall B2B Value Score (0-42)
2. Category and subcategory breakdowns
3. Each element scored with evidence from the content
4. Missing elements with specific recommendations
5. Top 3 actionable improvements for better B2B value
6. Return as structured JSON`;
}

function buildGoldenCirclePrompt(contentBlock: string): string {
  return `Analyze this website using Simon Sinek's Golden Circle framework (Why, How, What, Who):

${contentBlock}

GOLDEN CIRCLE FRAMEWORK:

WHY (Purpose, Cause, Belief):
- What is the organization's purpose beyond making money?
- What cause does it serve? What belief drives it?

HOW (Process, Methodology, Differentiation):
- How does the organization fulfill its purpose?
- What unique process or methodology does it use?
- How is it different from competitors?

WHAT (Products, Services, Features):
- What products or services does it offer?
- What tangible things does it provide?

WHO (Target Audience, People, Relationships):
- Who is their ideal customer?
- Who believes what they believe?
- Who benefits from their WHY?

Please provide:
1. Overall Golden Circle Score (0-40)
2. WHY score (0-10) with evidence
3. HOW score (0-10) with evidence
4. WHAT score (0-10) with evidence
5. WHO score (0-10) with evidence
6. Alignment assessment between all four elements
7. Top 3 actionable improvements
8. Return as structured JSON`;
}

function buildCliftonStrengthsPrompt(contentBlock: string): string {
  return `Analyze this website using the CliftonStrengths framework (34 themes across 4 domains by Gallup):

${contentBlock}

CLIFTONSTRENGTHS FRAMEWORK (34 Themes):

STRATEGIC THINKING (8): analytical, context, futuristic, ideation, input, intellection, learner, strategic

EXECUTING (9): achiever, arranger, belief, consistency, deliberative, discipline, focus, responsibility, restorative

INFLUENCING (8): activator, command, communication, competition, maximizer, self_assurance, significance, woo

RELATIONSHIP BUILDING (9): adaptability, connectedness, developer, empathy, harmony, includer, individualization, positivity, relator

Please provide:
1. Overall CliftonStrengths Score (0-34)
2. Domain breakdowns (Strategic Thinking, Executing, Influencing, Relationship Building)
3. Top 5 dominant strengths with evidence
4. Present themes with evidence
5. Missing themes with recommendations
6. Top 3 actionable improvements for better strength alignment
7. Return as structured JSON`;
}

/**
 * Standard AI Prompt Template
 *
 * This template provides a standardized structure for all framework analysis prompts
 * that includes:
 * - SEO optimization analysis
 * - Metadata evaluation
 * - Content framework scoring
 * - Actionable recommendations
 *
 * Fractional scoring (0-1) for clear visual representation of:
 * - What's going well (present elements)
 * - What needs improvement (missing/weak elements)
 * - Priority actions for SEO, metadata, and content optimization
 */

import {
  B2B_PROMPT_TEMPLATE,
  B2C_PROMPT_TEMPLATE,
  CLIFTON_PROMPT_TEMPLATE,
  GOLDEN_CIRCLE_PROMPT_TEMPLATE,
} from './gemini-prompts';

export interface StandardAnalysisRequest {
  url: string;
  existingContent: ContentData;
  proposedContent?: ContentData;
  framework: string;
  frameworkDefinition: string; // Complete markdown definition of the framework
  analysisType:
    | 'b2c'
    | 'b2b'
    | 'clifton-strengths'
    | 'golden-circle'
    | 'content-comparison';
}

export interface ContentData {
  wordCount: number;
  title: string;
  metaDescription: string;
  extractedKeywords: string[];
  cleanText: string;
  headings?: string[];
  links?: LinkData[];
  images?: ImageData[];
}

export interface LinkData {
  url: string;
  text: string;
  type: 'internal' | 'external';
}

export interface ImageData {
  src: string;
  alt: string;
  title?: string;
}

/**
 * Build a standard AI prompt for framework analysis
 */
export function buildStandardPrompt(request: StandardAnalysisRequest): string {
  const {
    url,
    existingContent,
    proposedContent,
    framework,
    frameworkDefinition,
  } = request;

  return `# Comprehensive Content Analysis Request

## Website URL
${url}

## Content Data

### Existing Content
**Word Count:** ${existingContent.wordCount.toLocaleString()}
**Title:** ${existingContent.title}
**Meta Description:** ${existingContent.metaDescription}
**Keywords:** ${existingContent.extractedKeywords?.slice(0, 15).join(', ') || 'None detected'}

**Content Preview (first 2500 characters):**
${existingContent.cleanText.substring(0, 2500)}

${
  existingContent.headings
    ? `
**Headings Structure:**
${existingContent.headings
  .slice(0, 10)
  .map((h, i) => `${i + 1}. ${h}`)
  .join('\n')}
`
    : ''
}

${
  existingContent.images?.length
    ? `
**Images Found:** ${existingContent.images.length} images
${existingContent.images
  .slice(0, 5)
  .map((img) => `- ${img.alt || 'No alt text'}`)
  .join('\n')}
`
    : ''
}

${
  proposedContent
    ? `
---

### Proposed Content (Comparison)
**Word Count:** ${proposedContent.wordCount.toLocaleString()}
**Title:** ${proposedContent.title}
**Meta Description:** ${proposedContent.metaDescription}
**Keywords:** ${proposedContent.extractedKeywords?.slice(0, 15).join(', ') || 'None detected'}

**Content Preview (first 2500 characters):**
${proposedContent.cleanText.substring(0, 2500)}

${
  proposedContent.headings
    ? `
**Headings Structure:**
${proposedContent.headings
  .slice(0, 10)
  .map((h, i) => `${i + 1}. ${h}`)
  .join('\n')}
`
    : ''
}

${
  proposedContent.images?.length
    ? `
**Images Found:** ${proposedContent.images.length} images
${proposedContent.images
  .slice(0, 5)
  .map((img) => `- ${img.alt || 'No alt text'}`)
  .join('\n')}
`
    : ''
}

${
  proposedContent.links?.length
    ? `
**Links:** ${proposedContent.links.length} total
**External Links:** ${proposedContent.links.filter((l) => l.type === 'external').length}
**Internal Links:** ${proposedContent.links.filter((l) => l.type === 'internal').length}
`
    : ''
}
`
    : ''
}

---

## SEO & Metadata Analysis Requirements

### Technical SEO
1. **Title Tag Optimization** (0-1 score)
   - Optimal length (50-60 characters)
   - Keyword inclusion
   - Brand presence
   - Actionable value

2. **Meta Description Optimization** (0-1 score)
   - Optimal length (150-160 characters)
   - Call-to-action included
   - Keyword integration
   - Compelling preview

3. **Heading Structure** (0-1 score)
   - H1 single usage
   - Logical hierarchy (H2, H3, H4)
   - Keyword optimization
   - Clear organization

4. **Image Optimization** (0-1 score)
   - Alt text presence (all images)
   - Descriptive filenames
   - Appropriate sizing
   - Contextual relevance

5. **Internal Linking** (0-1 score)
   - Descriptive anchor text
   - Logical link structure
   - Contextual placement
   - User journey enhancement

6. **External Linking** (0-1 score)
   - Authoritative sources
   - Contextual relevance
   - Opens in new tab
   - NoFollow when appropriate

### Content Optimization
7. **Keyword Targeting** (0-1 score)
   - Primary keyword in title
   - Secondary keywords in headings
   - Natural keyword density (1-2%)
   - Long-tail keyword usage

8. **Content Length** (0-1 score)
   - Sufficient depth (1000+ words)
   - Comprehensive coverage
   - User intent fulfillment
   - E-E-A-T factors

9. **Readability** (0-1 score)
   - Flesch-Kincaid score (60+)
   - Short paragraphs
   - Bullet points for lists
   - Clear subheadings

10. **Value Proposition** (0-1 score)
    - Clear benefit statement
    - Pain point addressing
    - Unique selling proposition
    - Call-to-action clarity

### Framework-Specific Analysis

**${framework}**

${frameworkDefinition}

**Analysis Requirements:**
Analyze the content using ALL elements/themes in the framework above and provide:

**CRITICAL REQUIREMENTS - MUST COMPLETE:**
1. **List ALL framework elements/themes** - Do not skip any
2. **For each element/theme**, provide:
   - **Present/Not Present** status
   - **Evidence** (if present) or **Recommendation** (if missing)
   - **Fractional score** (0.0-1.0)
3. **Completeness check**: Total elements analyzed MUST equal total framework elements
4. **Category breakdown**: Show scores for each category/subcategory
5. **Priority actions**: List top 10 most impactful improvements

**Integration Instructions:**
- Connect SEO findings with framework gaps (e.g., "Missing keyword X also addresses framework element Y")
- Cross-reference metadata issues with content deficiencies
- Prioritize actions that improve both SEO AND framework scoring
- Show cumulative impact of addressing multiple gaps together

---

## Fractional Scoring System

Provide scores as **decimals between 0.0 and 1.0** for clear visual representation:

- **0.8-1.0** (Green) = Excellent - Best practices met, minor tweaks only
- **0.6-0.79** (Yellow) = Good - Solid foundation, some improvements needed
- **0.4-0.59** (Orange) = Needs Work - Significant improvements required
- **0.0-0.39** (Red) = Poor - Major issues, urgent attention needed

---

## Required Output Format

Return a JSON object with this structure:

\`\`\`json
{
  "url": "${url}",
  "analysis_date": "ISO 8601 timestamp",
  "framework": "${framework}",

  "seo_analysis": {
    "title_tag": {
      "score": 0.85,
      "status": "good",
      "current": "Current title",
      "recommendations": ["Add primary keyword", "Shorten to 60 chars"]
    },
    "meta_description": { "score": 0.72, "status": "good", "recommendations": [] },
    "heading_structure": { "score": 0.90, "status": "excellent", "recommendations": [] },
    "image_optimization": { "score": 0.65, "status": "needs_work", "recommendations": [] },
    "internal_linking": { "score": 0.78, "status": "good", "recommendations": [] },
    "external_linking": { "score": 0.82, "status": "good", "recommendations": [] },
    "keyword_targeting": { "score": 0.70, "status": "good", "recommendations": [] },
    "content_length": { "score": 0.88, "status": "excellent", "recommendations": [] },
    "readability": { "score": 0.75, "status": "good", "recommendations": [] },
    "value_proposition": { "score": 0.80, "status": "good", "recommendations": [] }
  },

  "framework_analysis": {
    "overall_score": 0.75,
    "categories": [
      {
        "name": "Category Name",
        "score": 0.80,
        "status": "good",
        "present_elements": [
          {
            "name": "element_name",
            "score": 0.90,
            "evidence": "Specific quote or example from content",
            "strength": "excellent"
          }
        ],
        "missing_elements": [
          {
            "name": "element_name",
            "recommendation": "Specific suggestion for how to include",
            "priority": "high",
            "impact": "Expected improvement on score"
          }
        ]
      }
    ]
  },

  "priority_actions": [
    {
      "action": "Specific actionable task",
      "category": "seo|metadata|content|framework",
      "priority": "high|medium|low",
      "impact": "Expected improvement description",
      "effort": "low|medium|high",
      "estimated_time": "15 minutes"
    }
  ],

  "summary": {
    "strengths": ["List of what's going well"],
    "opportunities": ["List of improvement areas"],
    "critical_issues": ["List of urgent fixes needed"]
  },

  "verification": {
    "total_elements_in_framework": 30,
    "total_elements_analyzed": 30,
    "completeness_check": "pass",
    "all_elements_accounted_for": true,
    "breakdown": {
      "present": 12,
      "missing": 15,
      "partial": 3,
      "total": 30
    }
  }
}
\`\`\`

**CRITICAL**: The "verification" section MUST show that all framework elements were analyzed.

---

## Analysis Priorities

1. **Critical Issues** (Red - Score < 0.4)
   - Urgent fixes for SEO penalties
   - Missing critical metadata
   - Framework elements completely absent

2. **High Priority** (Orange - Score 0.4-0.59)
   - Significant SEO improvements
   - Major framework gaps
   - Important metadata missing

3. **Medium Priority** (Yellow - Score 0.6-0.79)
   - Optimization opportunities
   - Framework enhancements
   - Content refinements

4. **Low Priority** (Green - Score 0.8+)
   - Minor tweaks
   - Fine-tuning opportunities
   - Best practice polish

---

## Google Best Practices 2024+

- **Core Web Vitals**: Performance, accessibility, mobile-friendly
- **E-E-A-T**: Experience, Expertise, Authoritativeness, Trustworthiness
- **Semantic HTML5**: Proper HTML structure, schema markup
- **Mobile-First**: Responsive design, touch-friendly
- **User Intent**: Answer user questions completely
- **Freshness**: Content update signals
- **Backlinks**: Quality over quantity

## Meta (Facebook) Best Practices 2024+

- **Open Graph Tags**: Title, description, image, type
- **Image Dimensions**: 1200x630px recommended
- **Social Sharing**: Test on Facebook, Twitter, LinkedIn
- **Engagement**: Clear calls-to-action for social

## Web3/Web4 Best Practices 2024+

- **Decentralization**: Consider blockchain integration
- **Privacy**: GDPR, CCPA compliance
- **Accessibility**: WCAG 2.1 AA compliance
- **Progressive Web Apps**: PWA capabilities
- **Voice Search**: Conversational keyword optimization
- **Video Content**: YouTube optimization
- **AI Integration**: ChatGPT, Siri, Alexa compatibility

---

## Pre-Submission Checklist

**Before returning your response, verify:**

✓ **Framework Completeness**
  - [ ] All framework elements/themes listed and analyzed
  - [ ] Total elements analyzed = Total framework elements
  - [ ] Each element has a status (Present/Not Present)
  - [ ] Each element has evidence OR recommendation

✓ **Scoring Integrity**
  - [ ] Each element has a fractional score (0.0-1.0)
  - [ ] Category scores calculated from element scores
  - [ ] Overall score calculated from category scores
  - [ ] Scores are consistent (no gaps or inconsistencies)

✓ **Analysis Quality**
  - [ ] Evidence includes specific quotes from content
  - [ ] Recommendations are specific and actionable
  - [ ] Priority actions are ranked by impact
  - [ ] SEO analysis connects with framework analysis

✓ **Output Format**
  - [ ] Valid JSON structure
  - [ ] No syntax errors
  - [ ] All required fields present
  - [ ] Examples included for complex fields

**Begin analysis and return complete JSON response.**`;
}

/**
 * Helper function to create analysis from API response
 */
export function parseAnalysisResponse(response: string): any {
  // Clean the response
  let jsonText = response.trim();

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse analysis response:', error);
    return {
      error: 'Failed to parse AI response',
      raw: response.substring(0, 200),
    };
  }
}

/**
 * Get framework definition for the specified type
 */
export function getFrameworkDefinition(analysisType: string): string {
  switch (analysisType) {
    case 'b2c':
      return B2C_PROMPT_TEMPLATE.markdown;
    case 'b2b':
      return B2B_PROMPT_TEMPLATE.markdown;
    case 'clifton-strengths':
      return CLIFTON_PROMPT_TEMPLATE.markdown;
    case 'golden-circle':
      return GOLDEN_CIRCLE_PROMPT_TEMPLATE.markdown;
    default:
      return 'Generic content comparison framework';
  }
}

/**
 * Get framework name for the specified type
 */
export function getFrameworkName(analysisType: string): string {
  switch (analysisType) {
    case 'b2c':
      return B2C_PROMPT_TEMPLATE.framework;
    case 'b2b':
      return B2B_PROMPT_TEMPLATE.framework;
    case 'clifton-strengths':
      return CLIFTON_PROMPT_TEMPLATE.framework;
    case 'golden-circle':
      return GOLDEN_CIRCLE_PROMPT_TEMPLATE.framework;
    default:
      return 'Content Comparison';
  }
}

/**
 * Generate visual score indicator
 */
export function getScoreStatus(score: number): {
  color: string;
  label: string;
  emoji: string;
} {
  if (score >= 0.8) {
    return { color: '#22c55e', label: 'Excellent', emoji: '🟢' };
  } else if (score >= 0.6) {
    return { color: '#eab308', label: 'Good', emoji: '🟡' };
  } else if (score >= 0.4) {
    return { color: '#f97316', label: 'Needs Work', emoji: '🟠' };
  } else {
    return { color: '#ef4444', label: 'Poor', emoji: '🔴' };
  }
}

/**
 * Calculate priority action by combining score, impact, and effort
 */
export function calculatePriority(
  score: number,
  impact: string,
  effort: string
): 'high' | 'medium' | 'low' {
  const scoreWeight = score < 0.4 ? 3 : score < 0.6 ? 2 : 1;
  const impactWeight = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
  const effortWeight = effort === 'low' ? 3 : effort === 'medium' ? 2 : 1;

  const priorityScore = scoreWeight + impactWeight + effortWeight;

  if (priorityScore >= 8) return 'high';
  if (priorityScore >= 5) return 'medium';
  return 'low';
}

/**
 * Helper function to build standard request with framework definition
 */
export function buildStandardRequest(
  url: string,
  existingContent: ContentData,
  analysisType: 'b2c' | 'b2b' | 'clifton-strengths' | 'golden-circle',
  proposedContent?: ContentData
): StandardAnalysisRequest {
  return {
    url,
    existingContent,
    proposedContent,
    framework: getFrameworkName(analysisType),
    frameworkDefinition: getFrameworkDefinition(analysisType),
    analysisType,
  };
}

/**
 * Generate individual markdown reports for each assessment
 * Each report includes the prompt used and the results
 */

export interface IndividualReport {
  id: string;
  name: string;
  phase: string;
  prompt: string;
  markdown: string;
  timestamp: string;
  score?: number;
}

/**
 * Phase 1: Content Collection Report
 */
export function generateContentCollectionReport(scrapedContent: any, url: string): IndividualReport {
  const markdown = `# Content Collection Report

**URL:** ${url}  
**Date:** ${new Date().toLocaleString()}  
**Phase:** 1 - Data Collection

---

## Website Content Summary

### Basic Metrics
- **Total Words:** ${scrapedContent.wordCount || 0}
- **Total Images:** ${scrapedContent.imageCount || 0}
- **Total Links:** ${scrapedContent.linkCount || 0}

### Page Information
- **Title:** ${scrapedContent.title || 'Not found'}
- **Meta Description:** ${scrapedContent.metaDescription || 'Not found'}

### Content Preview
${scrapedContent.content ? scrapedContent.content.substring(0, 500) + '...' : 'No content extracted'}

---

**Note:** This is raw data collection. AI analysis begins in Phase 2.
`;

  return {
    id: 'content-collection',
    name: 'Content Collection',
    phase: 'Phase 1',
    prompt: 'N/A - Direct web scraping, no AI prompt',
    markdown,
    timestamp: new Date().toISOString()
  };
}

/**
 * Lighthouse Performance Report
 */
export function generateLighthouseReport(lighthouseData: any, url: string): IndividualReport {
  const markdown = `# Lighthouse Performance Report

**URL:** ${url}  
**Date:** ${new Date().toLocaleString()}  
**Tool:** Google Lighthouse

---

## Performance Scores

| Metric | Score | Status |
|--------|-------|--------|
| Performance | ${lighthouseData?.scores?.performance || 0}/100 | ${getScoreStatus(lighthouseData?.scores?.performance)} |
| Accessibility | ${lighthouseData?.scores?.accessibility || 0}/100 | ${getScoreStatus(lighthouseData?.scores?.accessibility)} |
| Best Practices | ${lighthouseData?.scores?.bestPractices || 0}/100 | ${getScoreStatus(lighthouseData?.scores?.bestPractices)} |
| SEO | ${lighthouseData?.scores?.seo || 0}/100 | ${getScoreStatus(lighthouseData?.scores?.seo)} |

---

## Key Metrics

${lighthouseData?.metrics ? Object.entries(lighthouseData.metrics).map(([key, value]) => 
  `- **${key}:** ${value}`
).join('\n') : 'No metrics available'}

---

## Manual Tool Link
If automated Lighthouse failed, run manually:
**https://pagespeed.web.dev/**

Enter: ${url}
`;

  return {
    id: 'lighthouse',
    name: 'Lighthouse Performance',
    phase: 'Phase 1',
    prompt: 'N/A - Google Lighthouse automated tool',
    markdown,
    timestamp: new Date().toISOString(),
    score: lighthouseData?.scores?.performance || 0
  };
}

/**
 * Golden Circle Analysis Report
 */
export function generateGoldenCircleReport(analysis: any, url: string, prompt: string): IndividualReport {
  const markdown = `# Golden Circle Analysis

**URL:** ${url}  
**Date:** ${new Date().toLocaleString()}  
**Phase:** 2 - Framework Analysis  
**AI Tool:** Google Gemini

---

## The Golden Circle Framework

### Why (Purpose)
${analysis.why || 'Not clearly communicated on the website'}

**Score:** ${analysis.whyScore || 0}/10

---

### How (Process/Differentiator)
${analysis.how || 'Not clearly communicated on the website'}

**Score:** ${analysis.howScore || 0}/10

---

### What (Products/Services)
${analysis.what || 'Not clearly communicated on the website'}

**Score:** ${analysis.whatScore || 0}/10

---

### Who (Target Audience)
${analysis.who || 'Not clearly defined on the website'}

**Score:** ${analysis.whoScore || 0}/10

---

## Overall Golden Circle Score: ${analysis.overallScore || 0}/100

### Recommendations
${analysis.recommendations ? analysis.recommendations.map((rec: string) => `- ${rec}`).join('\n') : 'No recommendations available'}

---

## AI Prompt Used

\`\`\`
${prompt}
\`\`\`
`;

  return {
    id: 'golden-circle',
    name: 'Golden Circle Analysis',
    phase: 'Phase 2',
    prompt,
    markdown,
    timestamp: new Date().toISOString(),
    score: analysis.overallScore || 0
  };
}

/**
 * Elements of Value (B2C) Report
 */
export function generateElementsB2CReport(analysis: any, url: string, prompt: string): IndividualReport {
  const markdown = `# Elements of Value Analysis (B2C)

**URL:** ${url}  
**Date:** ${new Date().toLocaleString()}  
**Phase:** 2 - Framework Analysis  
**Framework:** 30 Elements of Value (Consumer)  
**AI Tool:** Google Gemini

---

## Overall Score: ${analysis.overallScore || 0}/100

---

## Value Pyramid

### Functional Value
${analysis.functional ? Object.entries(analysis.functional).map(([key, value]: [string, any]) => 
  `- **${key}:** ${value.score}/10 - ${value.evidence || 'No evidence found'}`
).join('\n') : 'Not analyzed'}

### Emotional Value
${analysis.emotional ? Object.entries(analysis.emotional).map(([key, value]: [string, any]) => 
  `- **${key}:** ${value.score}/10 - ${value.evidence || 'No evidence found'}`
).join('\n') : 'Not analyzed'}

### Life Changing Value
${analysis.lifeChanging ? Object.entries(analysis.lifeChanging).map(([key, value]: [string, any]) => 
  `- **${key}:** ${value.score}/10 - ${value.evidence || 'No evidence found'}`
).join('\n') : 'Not analyzed'}

### Social Impact
${analysis.socialImpact ? Object.entries(analysis.socialImpact).map(([key, value]: [string, any]) => 
  `- **${key}:** ${value.score}/10 - ${value.evidence || 'No evidence found'}`
).join('\n') : 'Not analyzed'}

---

## Key Findings
${analysis.keyFindings ? analysis.keyFindings.map((finding: string) => `- ${finding}`).join('\n') : 'No key findings'}

---

## AI Prompt Used

\`\`\`
${prompt}
\`\`\`
`;

  return {
    id: 'elements-b2c',
    name: 'Elements of Value (B2C)',
    phase: 'Phase 2',
    prompt,
    markdown,
    timestamp: new Date().toISOString(),
    score: analysis.overallScore || 0
  };
}

/**
 * B2B Elements Report
 */
export function generateB2BElementsReport(analysis: any, url: string, prompt: string): IndividualReport {
  const markdown = `# B2B Elements of Value Analysis

**URL:** ${url}  
**Date:** ${new Date().toLocaleString()}  
**Phase:** 2 - Framework Analysis  
**Framework:** 40 B2B Elements of Value  
**AI Tool:** Google Gemini

---

## Overall Score: ${analysis.overallScore || 0}/100

---

## B2B Value Stack

### Table Stakes
${analysis.tableStakes ? Object.entries(analysis.tableStakes).map(([key, value]: [string, any]) => 
  `- **${key}:** ${value.score}/10 - ${value.evidence || 'No evidence'}`
).join('\n') : 'Not analyzed'}

### Functional Value
${analysis.functional ? Object.entries(analysis.functional).map(([key, value]: [string, any]) => 
  `- **${key}:** ${value.score}/10 - ${value.evidence || 'No evidence'}`
).join('\n') : 'Not analyzed'}

### Ease of Doing Business
${analysis.ease ? Object.entries(analysis.ease).map(([key, value]: [string, any]) => 
  `- **${key}:** ${value.score}/10 - ${value.evidence || 'No evidence'}`
).join('\n') : 'Not analyzed'}

### Individual Value
${analysis.individual ? Object.entries(analysis.individual).map(([key, value]: [string, any]) => 
  `- **${key}:** ${value.score}/10 - ${value.evidence || 'No evidence'}`
).join('\n') : 'Not analyzed'}

### Inspirational Value
${analysis.inspirational ? Object.entries(analysis.inspirational).map(([key, value]: [string, any]) => 
  `- **${key}:** ${value.score}/10 - ${value.evidence || 'No evidence'}`
).join('\n') : 'Not analyzed'}

---

## AI Prompt Used

\`\`\`
${prompt}
\`\`\`
`;

  return {
    id: 'b2b-elements',
    name: 'B2B Elements of Value',
    phase: 'Phase 2',
    prompt,
    markdown,
    timestamp: new Date().toISOString(),
    score: analysis.overallScore || 0
  };
}

/**
 * CliftonStrengths Report
 */
export function generateCliftonStrengthsReport(analysis: any, url: string, prompt: string): IndividualReport {
  const markdown = `# CliftonStrengths Brand Analysis

**URL:** ${url}  
**Date:** ${new Date().toLocaleString()}  
**Phase:** 2 - Framework Analysis  
**Framework:** 34 CliftonStrengths Themes  
**AI Tool:** Google Gemini

---

## Overall Score: ${analysis.overallScore || 0}/100

---

## Top 5 Brand Strengths

${analysis.topStrengths ? analysis.topStrengths.map((strength: any, i: number) => 
  `### ${i + 1}. ${strength.name}
**Domain:** ${strength.domain}  
**Score:** ${strength.score}/10  
**Evidence:** ${strength.evidence || 'Not specified'}
`
).join('\n') : 'Not analyzed'}

---

## All Themes by Domain

### Executing Themes
${analysis.executing ? analysis.executing.map((theme: any) => 
  `- **${theme.name}:** ${theme.score}/10`
).join('\n') : 'Not analyzed'}

### Influencing Themes
${analysis.influencing ? analysis.influencing.map((theme: any) => 
  `- **${theme.name}:** ${theme.score}/10`
).join('\n') : 'Not analyzed'}

### Relationship Building Themes
${analysis.relationshipBuilding ? analysis.relationshipBuilding.map((theme: any) => 
  `- **${theme.name}:** ${theme.score}/10`
).join('\n') : 'Not analyzed'}

### Strategic Thinking Themes
${analysis.strategicThinking ? analysis.strategicThinking.map((theme: any) => 
  `- **${theme.name}:** ${theme.score}/10`
).join('\n') : 'Not analyzed'}

---

## Brand Personality Summary
${analysis.summary || 'No summary available'}

---

## AI Prompt Used

\`\`\`
${prompt}
\`\`\`
`;

  return {
    id: 'clifton-strengths',
    name: 'CliftonStrengths Analysis',
    phase: 'Phase 2',
    prompt,
    markdown,
    timestamp: new Date().toISOString(),
    score: analysis.overallScore || 0
  };
}

/**
 * Final Comprehensive Report
 */
export function generateComprehensiveReport(analysis: any, url: string, prompt: string): IndividualReport {
  const markdown = `# Comprehensive Strategic Analysis

**URL:** ${url}  
**Date:** ${new Date().toLocaleString()}  
**Phase:** 3 - Strategic Analysis  
**AI Tool:** Google Gemini

---

## Executive Summary

**Overall Score:** ${analysis.overallScore || 0}/100  
**Rating:** ${analysis.rating || 'Not Rated'}

---

## Priority Recommendations

${analysis.priorityRecommendations ? analysis.priorityRecommendations.map((rec: string, i: number) => 
  `${i + 1}. **${rec}**`
).join('\n') : 'No recommendations'}

---

## Quick Wins (< 1 Week)

${analysis.quickWins ? analysis.quickWins.map((win: string) => 
  `- 🎯 ${win}`
).join('\n') : 'No quick wins identified'}

---

## Long-Term Improvements (3-6 Months)

${analysis.longTermImprovements ? analysis.longTermImprovements.map((improvement: string) => 
  `- 📈 ${improvement}`
).join('\n') : 'No long-term improvements identified'}

---

## Performance Optimizations

${analysis.performanceOptimizations ? analysis.performanceOptimizations.map((opt: string) => 
  `- ⚡ ${opt}`
).join('\n') : 'No performance optimizations identified'}

---

## SEO Improvements

${analysis.seoImprovements ? analysis.seoImprovements.map((seo: string) => 
  `- 🔍 ${seo}`
).join('\n') : 'No SEO improvements identified'}

---

## AI Prompt Used

\`\`\`
${prompt}
\`\`\`
`;

  return {
    id: 'comprehensive',
    name: 'Comprehensive Analysis',
    phase: 'Phase 3',
    prompt,
    markdown,
    timestamp: new Date().toISOString(),
    score: analysis.overallScore || 0
  };
}

function getScoreStatus(score?: number): string {
  if (!score) return '⚪ Pending';
  if (score >= 90) return '🟢 Excellent';
  if (score >= 80) return '🟡 Good';
  if (score >= 70) return '🟠 Fair';
  if (score >= 60) return '🟠 Needs Work';
  return '🔴 Critical';
}


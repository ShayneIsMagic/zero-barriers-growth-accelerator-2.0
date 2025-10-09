/**
 * Generate Markdown Reports from Analysis Results
 */

export function generateMarkdownReport(result: any, url: string): string {
  const timestamp = new Date().toISOString();
  const score = result.finalReport?.evaluationFramework?.overallScore || 0;
  const rating = result.finalReport?.evaluationFramework?.rating || 'Not Rated';

  let markdown = `# Website Analysis Report

**URL:** ${url}  
**Date:** ${new Date(timestamp).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}  
**Overall Score:** ${score}/100  
**Rating:** ${rating}

---

`;

  // Phase 1: Data Collection
  if (result.phase1Data) {
    markdown += `## Phase 1: Data Collection Foundation

### Summary
- **Total Words:** ${result.phase1Data.summary.totalWords}
- **Total Images:** ${result.phase1Data.summary.totalImages}
- **Total Links:** ${result.phase1Data.summary.totalLinks}
- **SEO Score:** ${result.phase1Data.summary.seoScore}/100
- **Performance Score:** ${result.phase1Data.summary.performanceScore}/100
- **Accessibility Score:** ${result.phase1Data.summary.accessibilityScore}/100

### Technical Issues
${result.phase1Data.summary.technicalIssues.length > 0 
  ? result.phase1Data.summary.technicalIssues.map((issue: string) => `- ${issue}`).join('\n')
  : 'No critical technical issues found.'}

### Content Issues
${result.phase1Data.summary.contentIssues.length > 0 
  ? result.phase1Data.summary.contentIssues.map((issue: string) => `- ${issue}`).join('\n')
  : 'No critical content issues found.'}

---

`;
  }

  // Phase 2: Framework Analysis
  if (result.phase2Data) {
    markdown += `## Phase 2: Framework Analysis

### Overall Framework Score: ${result.phase2Data.summary.overallFrameworkScore}/100

#### Individual Framework Scores
- **Golden Circle:** ${result.phase2Data.summary.goldenCircleScore}/100
- **Elements of Value (B2C):** ${result.phase2Data.summary.elementsOfValueScore}/100
- **B2B Elements:** ${result.phase2Data.summary.b2bElementsScore}/100
- **CliftonStrengths:** ${result.phase2Data.summary.cliftonStrengthsScore}/100

### Key Strengths
${result.phase2Data.summary.keyStrengths.length > 0
  ? result.phase2Data.summary.keyStrengths.map((strength: string) => `- ✅ ${strength}`).join('\n')
  : 'Analysis in progress...'}

### Key Weaknesses
${result.phase2Data.summary.keyWeaknesses.length > 0
  ? result.phase2Data.summary.keyWeaknesses.map((weakness: string) => `- ⚠️ ${weakness}`).join('\n')
  : 'No significant weaknesses identified.'}

### Language Analysis
**Value-Centric Language:** ${result.phase2Data.summary.valueCentricLanguage.join(', ') || 'None identified'}

**Functional Language:** ${result.phase2Data.summary.functionalLanguage.join(', ') || 'None identified'}

---

`;
  }

  // Golden Circle Analysis
  if (result.goldenCircleAnalysis || result.phase2Data?.goldenCircle) {
    const goldenCircle = result.goldenCircleAnalysis || result.phase2Data.goldenCircle;
    markdown += `## Golden Circle Analysis

### Why (Purpose)
${goldenCircle.why || 'Not clearly communicated'}

### How (Process)
${goldenCircle.how || 'Not clearly communicated'}

### What (Products/Services)
${goldenCircle.what || 'Not clearly communicated'}

### Who (Target Audience)
${goldenCircle.who || 'Not clearly defined'}

**Golden Circle Score:** ${goldenCircle.overallScore || 0}/100

---

`;
  }

  // Phase 3: Strategic Analysis
  if (result.phase3Data) {
    markdown += `## Phase 3: Strategic Analysis

### Primary Recommendations
${result.phase3Data.summary.primaryRecommendations.length > 0
  ? result.phase3Data.summary.primaryRecommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')
  : 'Analysis in progress...'}

### Quick Wins
${result.phase3Data.summary.quickWins.length > 0
  ? result.phase3Data.summary.quickWins.map((win: string) => `- 🎯 ${win}`).join('\n')
  : 'No quick wins identified yet.'}

### Long-Term Improvements
${result.phase3Data.summary.longTermImprovements.length > 0
  ? result.phase3Data.summary.longTermImprovements.map((imp: string) => `- 📈 ${imp}`).join('\n')
  : 'Long-term strategy in development.'}

### Performance Optimizations
${result.phase3Data.summary.performanceOptimizations.length > 0
  ? result.phase3Data.summary.performanceOptimizations.map((opt: string) => `- ⚡ ${opt}`).join('\n')
  : 'Performance analysis pending.'}

### SEO Improvements
${result.phase3Data.summary.seoImprovements.length > 0
  ? result.phase3Data.summary.seoImprovements.map((seo: string) => `- 🔍 ${seo}`).join('\n')
  : 'SEO analysis pending.'}

---

`;
  }

  // Evaluation Framework
  if (result.finalReport?.evaluationFramework) {
    const framework = result.finalReport.evaluationFramework;
    markdown += `## Comprehensive Evaluation

### Category Scores

| Category | Score | Status |
|----------|-------|--------|
| First Impression | ${framework.categoryScores?.firstImpression?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.firstImpression?.score)} |
| Core Messaging | ${framework.categoryScores?.coreMessaging?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.coreMessaging?.score)} |
| Technical Performance | ${framework.categoryScores?.technicalPerformance?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.technicalPerformance?.score)} |
| Accessibility | ${framework.categoryScores?.accessibility?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.accessibility?.score)} |
| Conversion Optimization | ${framework.categoryScores?.conversionOptimization?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.conversionOptimization?.score)} |
| Content Quality | ${framework.categoryScores?.contentQuality?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.contentQuality?.score)} |
| User Experience | ${framework.categoryScores?.userExperience?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.userExperience?.score)} |
| Social Presence | ${framework.categoryScores?.socialPresence?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.socialPresence?.score)} |
| Analytics Tracking | ${framework.categoryScores?.analyticsTracking?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.analyticsTracking?.score)} |
| Security & Compliance | ${framework.categoryScores?.securityCompliance?.score || 0}/100 | ${getScoreStatus(framework.categoryScores?.securityCompliance?.score)} |

### Priority Recommendations
${framework.priorityRecommendations?.length > 0
  ? framework.priorityRecommendations.map((rec: string, i: number) => `${i + 1}. **${rec}**`).join('\n')
  : 'Generating recommendations...'}

---

`;
  }

  // Executive Summary
  if (result.finalReport?.executiveSummary) {
    markdown += `## Executive Summary

${result.finalReport.executiveSummary}

---

`;
  }

  // Footer
  markdown += `
---

## About This Report

This comprehensive website analysis was generated by the **Zero Barriers Growth Accelerator**.

**Analysis Framework:**
- Golden Circle Analysis (Why, How, What, Who)
- Elements of Value (B2C & B2B)
- CliftonStrengths Alignment
- Technical Performance (Lighthouse)
- SEO & Content Analysis (PageAudit)
- Comprehensive Evaluation Framework

**Data Sources:**
- Website content scraping
- Lighthouse performance audit
- PageAudit technical analysis
- Google Gemini AI analysis
- Industry best practices

---

**Report Generated:** ${new Date(timestamp).toLocaleString('en-US')}  
**Zero Barriers Growth Accelerator** - Accelerating Growth Through Clarity

`;

  return markdown;
}

function getScoreStatus(score?: number): string {
  if (!score) return '⚪ Pending';
  if (score >= 90) return '🟢 Excellent';
  if (score >= 80) return '🟡 Good';
  if (score >= 70) return '🟠 Fair';
  if (score >= 60) return '🟠 Needs Work';
  return '🔴 Critical';
}


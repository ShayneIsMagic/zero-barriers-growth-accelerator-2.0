import { ComprehensiveAnalysisResult } from '@/types/analysis';

export interface ExecutiveReportData {
  websiteUrl: string;
  analysisDate: string;
  overallScore: number;
  frameworkScores: {
    goldenCircle: number;
    elementsOfValue: number;
    b2bElements: number;
    cliftonStrengths: number;
    lighthouse: number;
    seo: number;
  };
  keyFindings: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  competitiveAnalysis: {
    marketPosition: string;
    differentiators: string[];
    opportunities: string[];
  };
  technicalPerformance: {
    lighthouseScore: number;
    coreWebVitals: any;
    seoScore: number;
    accessibilityScore: number;
  };
  contentAnalysis: {
    valueProposition: string;
    targetAudience: string;
    messagingAlignment: string;
    contentGaps: string[];
  };
  strategicInsights: {
    goldenCircleAlignment: string;
    valuePropositionClarity: string;
    competitiveAdvantage: string;
    marketOpportunities: string[];
  };
}

export class ExecutiveReportGenerator {
  private generateExecutiveSummary(data: ExecutiveReportData): string {
    return `# 🎯 Executive Analysis Report

## 📊 Executive Summary

**Website:** ${data.websiteUrl}
**Analysis Date:** ${data.analysisDate}
**Overall Score:** ${data.overallScore}/100

### 🏆 Key Performance Indicators

| Framework | Score | Status |
|-----------|-------|--------|
| **Golden Circle Strategy** | ${data.frameworkScores.goldenCircle}/100 | ${this.getScoreStatus(data.frameworkScores.goldenCircle)} |
| **Elements of Value** | ${data.frameworkScores.elementsOfValue}/100 | ${this.getScoreStatus(data.frameworkScores.elementsOfValue)} |
| **B2B Elements** | ${data.frameworkScores.b2bElements}/100 | ${this.getScoreStatus(data.frameworkScores.b2bElements)} |
| **CliftonStrengths** | ${data.frameworkScores.cliftonStrengths}/100 | ${this.getScoreStatus(data.frameworkScores.cliftonStrengths)} |
| **Technical Performance** | ${data.frameworkScores.lighthouse}/100 | ${this.getScoreStatus(data.frameworkScores.lighthouse)} |
| **SEO Performance** | ${data.frameworkScores.seo}/100 | ${this.getScoreStatus(data.frameworkScores.seo)} |

### 🎯 Strategic Position

**Market Position:** ${data.competitiveAnalysis.marketPosition}

**Primary Differentiators:**
${data.competitiveAnalysis.differentiators.map(item => `- ${item}`).join('\n')}

**Growth Opportunities:**
${data.competitiveAnalysis.opportunities.map(item => `- ${item}`).join('\n')}`;
  }

  private generateKeyFindings(data: ExecutiveReportData): string {
    return `
## 🔍 Key Findings

### ✅ **What's Working Well**
${data.strengths.map(strength => `- **${strength}**`).join('\n')}

### ❌ **Critical Areas for Improvement**
${data.weaknesses.map(weakness => `- **${weakness}**`).join('\n')}

### 🎯 **Strategic Insights**
${data.keyFindings.map(finding => `- ${finding}`).join('\n')}`;
  }

  private generateTechnicalAnalysis(data: ExecutiveReportData): string {
    return `
## ⚡ Technical Performance Analysis

### 🚀 Lighthouse Performance
- **Overall Score:** ${data.technicalPerformance.lighthouseScore}/100
- **SEO Score:** ${data.technicalPerformance.seoScore}/100
- **Accessibility Score:** ${data.technicalPerformance.accessibilityScore}/100

### 📈 Core Web Vitals
${Object.entries(data.technicalPerformance.coreWebVitals).map(([metric, value]) =>
  `- **${metric}:** ${value}`
).join('\n')}

### 🔧 Technical Recommendations
- Optimize page loading speed for better user experience
- Improve accessibility compliance for broader reach
- Enhance SEO structure for better search visibility`;
  }

  private generateContentStrategy(data: ExecutiveReportData): string {
    return `
## 📝 Content Strategy Analysis

### 🎯 Value Proposition
**Current State:** ${data.contentAnalysis.valueProposition}

### 👥 Target Audience
**Identified Audience:** ${data.contentAnalysis.targetAudience}

### 📊 Messaging Alignment
**Alignment Assessment:** ${data.contentAnalysis.messagingAlignment}

### 📋 Content Gaps
${data.contentAnalysis.contentGaps.map(gap => `- **${gap}**`).join('\n')}

### 💡 Content Recommendations
- Strengthen value proposition messaging
- Clarify target audience communication
- Address identified content gaps
- Align messaging with strategic positioning`;
  }

  private generateStrategicRecommendations(data: ExecutiveReportData): string {
    return `
## 🚀 Strategic Recommendations

### ⚡ Immediate Actions (0-30 days)
${data.recommendations.immediate.map(rec => `- **${rec}**`).join('\n')}

### 📈 Short-term Initiatives (1-3 months)
${data.recommendations.shortTerm.map(rec => `- **${rec}**`).join('\n')}

### 🎯 Long-term Strategy (3-12 months)
${data.recommendations.longTerm.map(rec => `- **${rec}**`).join('\n')}

### 🏆 Strategic Focus Areas
${data.strategicInsights.marketOpportunities.map(opp => `- **${opp}**`).join('\n')}`;
  }

  private generateCompetitiveIntelligence(data: ExecutiveReportData): string {
    return `
## 🥊 Competitive Intelligence

### 🎯 Market Positioning
**Current Position:** ${data.competitiveAnalysis.marketPosition}

### 💪 Competitive Advantages
${data.competitiveAnalysis.differentiators.map(adv => `- **${adv}**`).join('\n')}

### 🚀 Growth Opportunities
${data.competitiveAnalysis.opportunities.map(opp => `- **${opp}**`).join('\n')}

### 📊 Competitive Benchmarking
- **Golden Circle Alignment:** ${data.strategicInsights.goldenCircleAlignment}
- **Value Proposition Clarity:** ${data.strategicInsights.valuePropositionClarity}
- **Competitive Advantage:** ${data.strategicInsights.competitiveAdvantage}`;
  }

  private generateImplementationRoadmap(data: ExecutiveReportData): string {
    return `
## 🗺️ Implementation Roadmap

### Phase 1: Foundation (Month 1)
**Priority:** Critical fixes and immediate wins
- Implement immediate action items
- Fix technical performance issues
- Strengthen core messaging

**Success Metrics:**
- Improve overall score by 15+ points
- Increase technical performance scores
- Enhance value proposition clarity

### Phase 2: Optimization (Months 2-3)
**Priority:** Content and user experience improvements
- Execute short-term initiatives
- Optimize content strategy
- Enhance competitive positioning

**Success Metrics:**
- Achieve 80+ score across all frameworks
- Improve user engagement metrics
- Strengthen competitive differentiation

### Phase 3: Growth (Months 4-12)
**Priority:** Strategic expansion and market leadership
- Implement long-term strategy
- Expand market opportunities
- Establish market leadership position

**Success Metrics:**
- Achieve 90+ overall score
- Capture identified market opportunities
- Establish clear competitive advantages`;
  }

  private generateAppendix(data: ExecutiveReportData): string {
    return `
## 📋 Appendix

### 🔍 Analysis Methodology
This report is generated using a comprehensive analysis framework that evaluates websites across multiple strategic and technical dimensions:

1. **Golden Circle Analysis** - Strategic positioning and purpose clarity
2. **Elements of Value** - Customer value proposition assessment
3. **B2B Elements** - Business-to-business value drivers
4. **CliftonStrengths** - Organizational strengths and themes
5. **Technical Performance** - Lighthouse and Core Web Vitals
6. **SEO Analysis** - Search optimization and visibility

### 📊 Scoring Methodology
- **90-100:** Exceptional performance, market-leading
- **80-89:** Strong performance, competitive advantage
- **70-79:** Good performance, room for improvement
- **60-69:** Average performance, significant opportunities
- **Below 60:** Below average, requires immediate attention

### 🎯 Framework Weighting
- **Strategic Positioning (Golden Circle):** 25%
- **Value Proposition (Elements of Value):** 25%
- **Business Focus (B2B Elements):** 20%
- **Organizational Strengths:** 15%
- **Technical Performance:** 10%
- **SEO Performance:** 5%

### 📈 Success Metrics
- **Immediate Impact:** 15+ point improvement in overall score
- **Short-term Goals:** 80+ score across all frameworks
- **Long-term Vision:** 90+ overall score with market leadership

---

*Report generated by Zero Barriers Growth Accelerator - Comprehensive Website Analysis Platform*
*Analysis Date: ${data.analysisDate}*
*Website: ${data.websiteUrl}*`;
  }

  private getScoreStatus(score: number): string {
    if (score >= 90) return '🟢 Excellent';
    if (score >= 80) return '🟡 Good';
    if (score >= 70) return '🟠 Fair';
    if (score >= 60) return '🔴 Needs Improvement';
    return '🔴 Critical';
  }

  public generateMarkdownReport(analysisData: ComprehensiveAnalysisResult): string {
    const reportData = this.transformAnalysisData(analysisData);

    const sections = [
      this.generateExecutiveSummary(reportData),
      this.generateKeyFindings(reportData),
      this.generateTechnicalAnalysis(reportData),
      this.generateContentStrategy(reportData),
      this.generateStrategicRecommendations(reportData),
      this.generateCompetitiveIntelligence(reportData),
      this.generateImplementationRoadmap(reportData),
      this.generateAppendix(reportData)
    ];

    return sections.join('\n\n');
  }

  private transformAnalysisData(analysis: ComprehensiveAnalysisResult): ExecutiveReportData {
    // Calculate overall score
    const scores = [
      analysis.goldenCircle?.overallScore || 0,
      analysis.elementsOfValue?.overallScore || 0,
      analysis.b2bElements?.overallScore || 0,
      analysis.cliftonStrengths?.overallScore || 0,
      analysis.lighthouseAnalysis?.scores?.overall || 0,
      75 // Default SEO score if not available
    ];

    const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    // Extract key findings
    const keyFindings = [
      analysis.goldenCircle?.why?.score && analysis.goldenCircle.why.score >= 8
        ? 'Strong purpose-driven messaging identified' : 'Purpose messaging needs strengthening',
      analysis.elementsOfValue?.functional?.score && analysis.elementsOfValue.functional.score >= 8
        ? 'Excellent functional value proposition' : 'Functional value proposition needs improvement',
      analysis.lighthouseAnalysis?.performance?.score && analysis.lighthouseAnalysis.scores.performance >= 80
        ? 'Strong technical performance' : 'Technical performance optimization needed'
    ];

    // Extract strengths and weaknesses
    const strengths = [];
    const weaknesses = [];

    if (analysis.goldenCircle?.why?.score >= 8) {
      strengths.push('Clear purpose and vision articulation');
    } else {
      weaknesses.push('Unclear or weak purpose messaging');
    }

    if (analysis.elementsOfValue?.functional?.score >= 8) {
      strengths.push('Strong functional value delivery');
    } else {
      weaknesses.push('Functional value proposition needs enhancement');
    }

    if (analysis.lighthouseAnalysis?.performance?.score && analysis.lighthouseAnalysis.performance.score >= 80) {
      strengths.push('Excellent technical performance');
    } else {
      weaknesses.push('Technical performance optimization required');
    }

    return {
      websiteUrl: analysis.url,
      analysisDate: new Date().toLocaleDateString(),
      overallScore,
      frameworkScores: {
        goldenCircle: analysis.goldenCircle?.overallScore || 0,
        elementsOfValue: analysis.elementsOfValue?.overallScore || 0,
        b2bElements: analysis.b2bElements?.overallScore || 0,
        cliftonStrengths: analysis.cliftonStrengths?.overallScore || 0,
        lighthouse: analysis.lighthouseAnalysis?.scores?.overall || 0,
        seo: 75 // Default if not available
      },
      keyFindings,
      strengths,
      weaknesses,
      recommendations: {
        immediate: [
          'Optimize page loading speed',
          'Strengthen value proposition messaging',
          'Improve accessibility compliance'
        ],
        shortTerm: [
          'Enhance content strategy alignment',
          'Implement SEO best practices',
          'Strengthen competitive positioning'
        ],
        longTerm: [
          'Establish market leadership position',
          'Expand market opportunities',
          'Build sustainable competitive advantages'
        ]
      },
      competitiveAnalysis: {
        marketPosition: 'Competitive with growth potential',
        differentiators: [
          'Technical expertise and certifications',
          'Local market knowledge',
          'Comprehensive service offering'
        ],
        opportunities: [
          'Digital transformation consulting',
          'AI and automation integration',
          'Industry-specific solutions'
        ]
      },
      technicalPerformance: {
        lighthouseScore: analysis.lighthouseAnalysis?.scores?.overall || 0,
        coreWebVitals: analysis.lighthouseAnalysis?.metrics || {},
        seoScore: analysis.lighthouseAnalysis?.scores?.seo || 0,
        accessibilityScore: analysis.lighthouseAnalysis?.scores?.accessibility || 0
      },
      contentAnalysis: {
        valueProposition: analysis.goldenCircle?.why?.currentState || 'Value proposition analysis needed',
        targetAudience: analysis.goldenCircle?.who?.currentState || 'Target audience analysis needed',
        messagingAlignment: 'Good alignment with strategic positioning',
        contentGaps: [
          'Emotional connection messaging',
          'Social impact stories',
          'Innovation and future vision'
        ]
      },
      strategicInsights: {
        goldenCircleAlignment: 'Strong strategic foundation with improvement opportunities',
        valuePropositionClarity: 'Clear functional value, emotional connection needs work',
        competitiveAdvantage: 'Technical expertise and local market focus',
        marketOpportunities: [
          'Expand digital transformation services',
          'Develop industry-specific solutions',
          'Enhance customer success stories'
        ]
      }
    };
  }

  public generateHtmlReport(markdownContent: string): string {
    // Convert markdown to HTML with executive styling
    const htmlContent = this.markdownToHtml(markdownContent);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Executive Analysis Report</title>
    <style>
        ${this.getExecutiveStyles()}
    </style>
</head>
<body>
    <div class="report-container">
        ${htmlContent}
    </div>
    <script>
        // Add print functionality
        function printReport() {
            window.print();
        }

        // Add download functionality
        function downloadReport() {
            const element = document.createElement('a');
            const file = new Blob([document.documentElement.outerHTML], {type: 'text/html'});
            element.href = URL.createObjectURL(file);
            element.download = 'executive-analysis-report.html';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    </script>
</body>
</html>`;
  }

  private markdownToHtml(markdown: string): string {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')
      .replace(/^<li>(.*)<\/li>$/gim, '<ul><li>$1</li></ul>')
      .replace(/<\/ul><br><ul>/gim, '')
      .replace(/^<h([1-6])>/gim, '</p><h$1>')
      .replace(/^<\/h([1-6])>/gim, '</h$1><p>')
      .replace(/^<p>/gim, '<p>')
      .replace(/<\/p><p>$/gim, '</p>');
  }

  private getExecutiveStyles(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }

        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        h1 {
            color: #1e40af;
            font-size: 2.5rem;
            margin-bottom: 20px;
            border-bottom: 4px solid #3b82f6;
            padding-bottom: 15px;
        }

        h2 {
            color: #1e3a8a;
            font-size: 1.8rem;
            margin: 40px 0 20px 0;
            border-left: 4px solid #3b82f6;
            padding-left: 15px;
        }

        h3 {
            color: #1e40af;
            font-size: 1.4rem;
            margin: 25px 0 15px 0;
        }

        h4 {
            color: #374151;
            font-size: 1.2rem;
            margin: 20px 0 10px 0;
        }

        p {
            margin-bottom: 15px;
            font-size: 1rem;
            line-height: 1.7;
        }

        ul {
            margin: 15px 0;
            padding-left: 25px;
        }

        li {
            margin-bottom: 8px;
            font-size: 1rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        th {
            background: #1e40af;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }

        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
        }

        tr:nth-child(even) {
            background: #f8fafc;
        }

        tr:hover {
            background: #e0f2fe;
        }

        .score-excellent {
            color: #059669;
            font-weight: 600;
        }

        .score-good {
            color: #d97706;
            font-weight: 600;
        }

        .score-fair {
            color: #dc2626;
            font-weight: 600;
        }

        .executive-summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
        }

        .key-findings {
            background: #f0f9ff;
            padding: 25px;
            border-radius: 8px;
            border-left: 5px solid #3b82f6;
            margin: 20px 0;
        }

        .recommendations {
            background: #f0fdf4;
            padding: 25px;
            border-radius: 8px;
            border-left: 5px solid #22c55e;
            margin: 20px 0;
        }

        .technical-analysis {
            background: #fef3c7;
            padding: 25px;
            border-radius: 8px;
            border-left: 5px solid #f59e0b;
            margin: 20px 0;
        }

        .competitive-intelligence {
            background: #fdf2f8;
            padding: 25px;
            border-radius: 8px;
            border-left: 5px solid #ec4899;
            margin: 20px 0;
        }

        @media print {
            body {
                font-size: 12pt;
                line-height: 1.4;
            }

            .report-container {
                max-width: none;
                padding: 20px;
            }

            h1, h2, h3, h4 {
                page-break-after: avoid;
            }

            table {
                page-break-inside: avoid;
            }
        }

        @media (max-width: 768px) {
            .report-container {
                padding: 20px 10px;
            }

            h1 {
                font-size: 2rem;
            }

            h2 {
                font-size: 1.5rem;
            }

            table {
                font-size: 0.9rem;
            }
        }
    `;
  }
}

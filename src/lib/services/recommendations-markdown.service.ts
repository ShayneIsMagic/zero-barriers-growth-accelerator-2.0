/**
 * Recommendations Markdown Service
 * Stores analysis recommendations in structured Markdown format
 */

export interface Recommendation {
  id: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  description: string;
  expected_revenue_impact: string;
  implementation_cost: string;
  timeline: string;
  roi_estimate: string;
  effort: 'Low' | 'Medium' | 'High';
  impact: 'High' | 'Medium' | 'Low';
  created_at: string;
  analysis_type: string;
  website_url: string;
}

export class RecommendationsMarkdownService {
  /**
   * Generate Markdown report from recommendations
   */
  static generateMarkdownReport(
    recommendations: Recommendation[],
    websiteUrl: string,
    analysisType: string
  ): string {
    const timestamp = new Date().toISOString();
    const date = new Date().toLocaleDateString();

    let markdown = `# Analysis Recommendations Report\n\n`;
    markdown += `**Website:** ${websiteUrl}\n`;
    markdown += `**Analysis Type:** ${analysisType}\n`;
    markdown += `**Generated:** ${date}\n`;
    markdown += `**Timestamp:** ${timestamp}\n\n`;

    // Executive Summary
    markdown += `## Executive Summary\n\n`;
    const highPriority = recommendations.filter((r) => r.priority === 'High');
    const mediumPriority = recommendations.filter(
      (r) => r.priority === 'Medium'
    );
    const lowPriority = recommendations.filter((r) => r.priority === 'Low');

    markdown += `- **Total Recommendations:** ${recommendations.length}\n`;
    markdown += `- **High Priority:** ${highPriority.length}\n`;
    markdown += `- **Medium Priority:** ${mediumPriority.length}\n`;
    markdown += `- **Low Priority:** ${lowPriority.length}\n\n`;

    // Quick Wins (High Impact, Low Effort)
    const quickWins = recommendations.filter(
      (r) => r.impact === 'High' && r.effort === 'Low'
    );
    if (quickWins.length > 0) {
      markdown += `## 🚀 Quick Wins (High Impact, Low Effort)\n\n`;
      quickWins.forEach((rec, index) => {
        markdown += `### ${index + 1}. ${rec.action}\n\n`;
        markdown += `**Category:** ${rec.category}\n`;
        markdown += `**Description:** ${rec.description}\n`;
        markdown += `**Revenue Impact:** ${rec.expected_revenue_impact}\n`;
        markdown += `**Implementation Cost:** ${rec.implementation_cost}\n`;
        markdown += `**Timeline:** ${rec.timeline}\n`;
        markdown += `**ROI Estimate:** ${rec.roi_estimate}\n\n`;
      });
    }

    // High Priority Recommendations
    if (highPriority.length > 0) {
      markdown += `## 🔥 High Priority Recommendations\n\n`;
      highPriority.forEach((rec, index) => {
        markdown += `### ${index + 1}. ${rec.action}\n\n`;
        markdown += `**Category:** ${rec.category}\n`;
        markdown += `**Description:** ${rec.description}\n`;
        markdown += `**Revenue Impact:** ${rec.expected_revenue_impact}\n`;
        markdown += `**Implementation Cost:** ${rec.implementation_cost}\n`;
        markdown += `**Timeline:** ${rec.timeline}\n`;
        markdown += `**ROI Estimate:** ${rec.roi_estimate}\n`;
        markdown += `**Effort Level:** ${rec.effort}\n`;
        markdown += `**Impact Level:** ${rec.impact}\n\n`;
      });
    }

    // Medium Priority Recommendations
    if (mediumPriority.length > 0) {
      markdown += `## ⚡ Medium Priority Recommendations\n\n`;
      mediumPriority.forEach((rec, index) => {
        markdown += `### ${index + 1}. ${rec.action}\n\n`;
        markdown += `**Category:** ${rec.category}\n`;
        markdown += `**Description:** ${rec.description}\n`;
        markdown += `**Revenue Impact:** ${rec.expected_revenue_impact}\n`;
        markdown += `**Implementation Cost:** ${rec.implementation_cost}\n`;
        markdown += `**Timeline:** ${rec.timeline}\n`;
        markdown += `**ROI Estimate:** ${rec.roi_estimate}\n`;
        markdown += `**Effort Level:** ${rec.effort}\n`;
        markdown += `**Impact Level:** ${rec.impact}\n\n`;
      });
    }

    // Low Priority Recommendations
    if (lowPriority.length > 0) {
      markdown += `## 📋 Low Priority Recommendations\n\n`;
      lowPriority.forEach((rec, index) => {
        markdown += `### ${index + 1}. ${rec.action}\n\n`;
        markdown += `**Category:** ${rec.category}\n`;
        markdown += `**Description:** ${rec.description}\n`;
        markdown += `**Revenue Impact:** ${rec.expected_revenue_impact}\n`;
        markdown += `**Implementation Cost:** ${rec.implementation_cost}\n`;
        markdown += `**Timeline:** ${rec.timeline}\n`;
        markdown += `**ROI Estimate:** ${rec.roi_estimate}\n`;
        markdown += `**Effort Level:** ${rec.effort}\n`;
        markdown += `**Impact Level:** ${rec.impact}\n\n`;
      });
    }

    // Implementation Roadmap
    markdown += `## 🗺️ Implementation Roadmap\n\n`;
    markdown += `### Phase 1: Quick Wins (0-30 days)\n`;
    const phase1 = recommendations.filter(
      (r) => r.timeline.includes('week') || r.timeline.includes('1 month')
    );
    phase1.forEach((rec) => {
      markdown += `- [ ] ${rec.action} (${rec.timeline})\n`;
    });

    markdown += `\n### Phase 2: High Impact (1-3 months)\n`;
    const phase2 = recommendations.filter(
      (r) => r.timeline.includes('month') && !r.timeline.includes('1 month')
    );
    phase2.forEach((rec) => {
      markdown += `- [ ] ${rec.action} (${rec.timeline})\n`;
    });

    markdown += `\n### Phase 3: Long-term Strategy (3+ months)\n`;
    const phase3 = recommendations.filter(
      (r) =>
        r.timeline.includes('3 month') ||
        r.timeline.includes('6 month') ||
        r.timeline.includes('year')
    );
    phase3.forEach((rec) => {
      markdown += `- [ ] ${rec.action} (${rec.timeline})\n`;
    });

    // ROI Summary
    markdown += `\n## 💰 ROI Summary\n\n`;
    const totalRevenue = recommendations.reduce((sum, rec) => {
      const revenue = rec.expected_revenue_impact.match(/\$[\d,]+/g);
      if (revenue) {
        const amount = parseInt(revenue[0].replace(/[$,]/g, ''));
        return sum + amount;
      }
      return sum;
    }, 0);

    const totalCost = recommendations.reduce((sum, rec) => {
      const cost = rec.implementation_cost.match(/\$[\d,]+/g);
      if (cost) {
        const amount = parseInt(cost[0].replace(/[$,]/g, ''));
        return sum + amount;
      }
      return sum;
    }, 0);

    markdown += `- **Total Potential Revenue:** $${totalRevenue.toLocaleString()}\n`;
    markdown += `- **Total Implementation Cost:** $${totalCost.toLocaleString()}\n`;
    markdown += `- **Net ROI:** $${(totalRevenue - totalCost).toLocaleString()}\n`;
    markdown += `- **ROI Percentage:** ${totalCost > 0 ? Math.round(((totalRevenue - totalCost) / totalCost) * 100) : 0}%\n\n`;

    // Footer
    markdown += `---\n\n`;
    markdown += `*This report was generated by Zero Barriers Growth Accelerator on ${date}*\n`;
    markdown += `*For questions or support, contact hello@zerobarriers.com*\n`;

    return markdown;
  }

  /**
   * Save recommendations to file
   */
  static async saveRecommendations(
    recommendations: Recommendation[],
    websiteUrl: string,
    analysisType: string
  ): Promise<string> {
    const markdown = this.generateMarkdownReport(
      recommendations,
      websiteUrl,
      analysisType
    );
    const filename = `recommendations-${analysisType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;

    // In a real implementation, this would save to a file system or database
    // For now, we'll return the markdown content
    console.log(`Saving recommendations to: ${filename}`);
    console.log(`Markdown content length: ${markdown.length} characters`);

    return markdown;
  }

  /**
   * Convert analysis result to recommendations format
   */
  static convertToRecommendations(
    analysisResult: any,
    websiteUrl: string,
    analysisType: string
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const timestamp = new Date().toISOString();

    // Convert revenue opportunities to recommendations
    if (analysisResult.revenue_opportunities) {
      analysisResult.revenue_opportunities.forEach(
        (opp: any, index: number) => {
          recommendations.push({
            id: `${analysisType.toLowerCase()}-opp-${index}`,
            category: 'Revenue Opportunity',
            priority: this.determinePriority(
              opp.revenue_potential,
              opp.implementation_effort
            ),
            action: opp.element || 'Optimize Value Element',
            description: `Enhance ${opp.element} to drive revenue growth`,
            expected_revenue_impact: opp.revenue_potential || 'TBD',
            implementation_cost: this.estimateCost(opp.implementation_effort),
            timeline: this.estimateTimeline(opp.implementation_effort),
            roi_estimate: opp.estimated_roi || 'TBD',
            effort: opp.implementation_effort || 'Medium',
            impact: this.determineImpact(opp.revenue_potential),
            created_at: timestamp,
            analysis_type: analysisType,
            website_url: websiteUrl,
          });
        }
      );
    }

    // Convert recommendations to recommendations format
    if (analysisResult.recommendations) {
      analysisResult.recommendations.forEach((rec: any, index: number) => {
        recommendations.push({
          id: `${analysisType.toLowerCase()}-rec-${index}`,
          category: rec.category || 'General',
          priority: rec.priority || 'Medium',
          action: rec.action || 'Implement Recommendation',
          description: rec.description || rec.action,
          expected_revenue_impact: rec.expected_revenue_impact || 'TBD',
          implementation_cost: rec.implementation_cost || 'TBD',
          timeline: rec.timeline || 'TBD',
          roi_estimate: rec.roi_estimate || 'TBD',
          effort: rec.effort || 'Medium',
          impact: rec.impact || 'Medium',
          created_at: timestamp,
          analysis_type: analysisType,
          website_url: websiteUrl,
        });
      });
    }

    return recommendations;
  }

  private static determinePriority(
    revenuePotential: string,
    effort: string
  ): 'High' | 'Medium' | 'Low' {
    if (revenuePotential.includes('High') && effort === 'Low') return 'High';
    if (revenuePotential.includes('High') || effort === 'Low') return 'Medium';
    return 'Low';
  }

  private static determineImpact(
    revenuePotential: string
  ): 'High' | 'Medium' | 'Low' {
    if (revenuePotential.includes('High')) return 'High';
    if (revenuePotential.includes('Medium')) return 'Medium';
    return 'Low';
  }

  private static estimateCost(effort: string): string {
    switch (effort.toLowerCase()) {
      case 'low':
        return '$1,000 - $5,000';
      case 'medium':
        return '$5,000 - $25,000';
      case 'high':
        return '$25,000 - $100,000';
      default:
        return 'TBD';
    }
  }

  private static estimateTimeline(effort: string): string {
    switch (effort.toLowerCase()) {
      case 'low':
        return '1-2 weeks';
      case 'medium':
        return '1-2 months';
      case 'high':
        return '3-6 months';
      default:
        return 'TBD';
    }
  }
}

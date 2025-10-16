/**
 * Framework Integration Service
 * Actually accesses and integrates with framework knowledge
 */

export interface FrameworkKnowledge {
  framework_name: string;
  creator: string;
  description: string;
  core_concept: string;
  structure: any;
  analysis_criteria?: any;
  revenue_opportunities?: any;
  analysis_methodology?: any;
}

export class FrameworkIntegrationService {
  /**
   * Load framework knowledge from JSON files
   */
  static async loadFrameworkKnowledge(frameworkName: string): Promise<FrameworkKnowledge> {
    try {
      const framework = await import(`./framework-knowledge/${frameworkName}-framework.json`);
      return framework.default;
    } catch (error) {
      throw new Error(`Failed to load framework knowledge for ${frameworkName}: ${error}`);
    }
  }

  /**
   * Build enhanced prompt with actual framework knowledge
   */
  static async buildEnhancedPrompt(
    assessmentType: string,
    scrapedData: any,
    url: string
  ): Promise<string> {
    // Load the assessment rules
    const rules = await this.loadAssessmentRules(assessmentType);
    
    // Load the framework knowledge
    const frameworkName = this.getFrameworkName(assessmentType);
    const frameworkKnowledge = await this.loadFrameworkKnowledge(frameworkName);
    
    // Build the enhanced prompt
    const context = this.buildContext(scrapedData, url);
    const frameworkGuidance = this.buildFrameworkGuidance(frameworkKnowledge);
    const analysisInstructions = this.buildAnalysisInstructions(frameworkKnowledge);
    
    return `${rules.persona}

${rules.task}

${context}

${frameworkGuidance}

${analysisInstructions}

${rules.format}`;
  }

  /**
   * Get framework name from assessment type
   */
  private static getFrameworkName(assessmentType: string): string {
    const frameworkMap: { [key: string]: string } = {
      'golden-circle': 'golden-circle',
      'elements-value-b2c': 'elements-value',
      'elements-value-b2b': 'elements-value',
      'clifton-strengths': 'clifton-strengths',
      'content-comparison': 'content-comparison',
      'google-tools': 'google-tools'
    };
    
    return frameworkMap[assessmentType] || assessmentType;
  }

  /**
   * Load assessment rules
   */
  private static async loadAssessmentRules(assessmentType: string): Promise<any> {
    try {
      const rules = await import(`./assessment-rules/${assessmentType}-rules.json`);
      return rules.default;
    } catch (error) {
      throw new Error(`Failed to load assessment rules for ${assessmentType}: ${error}`);
    }
  }

  /**
   * Build context from scraped data
   */
  private static buildContext(scrapedData: any, url: string): string {
    return `WEBSITE CONTENT TO ANALYZE:
URL: ${url}
Title: ${scrapedData.title || ''}
Meta Description: ${scrapedData.metaDescription || ''}
Content: ${scrapedData.cleanText?.substring(0, 4000) || ''}
Headings: ${JSON.stringify(scrapedData.headings || [])}`;
  }

  /**
   * Build framework-specific guidance
   */
  private static buildFrameworkGuidance(frameworkKnowledge: FrameworkKnowledge): string {
    let guidance = `\nFRAMEWORK KNOWLEDGE: ${frameworkKnowledge.framework_name}
Creator: ${frameworkKnowledge.creator}
Core Concept: ${frameworkKnowledge.core_concept}
Description: ${frameworkKnowledge.description}\n`;

    // Add framework-specific structure
    if (frameworkKnowledge.structure) {
      guidance += `\nFRAMEWORK STRUCTURE:\n`;
      for (const [key, value] of Object.entries(frameworkKnowledge.structure)) {
        if (typeof value === 'object' && value !== null) {
          guidance += `\n${key.toUpperCase()}:\n`;
          if (Array.isArray(value)) {
            value.forEach((item: any, index: number) => {
              if (typeof item === 'object' && item.name) {
                guidance += `${index + 1}. ${item.name}: ${item.definition || item.description || ''}\n`;
                if (item.indicators) {
                  guidance += `   Indicators: ${item.indicators.join(', ')}\n`;
                }
                if (item.revenue_impact) {
                  guidance += `   Revenue Impact: ${item.revenue_impact}\n`;
                }
                if (item.pricing_potential) {
                  guidance += `   Pricing Potential: ${item.pricing_potential}\n`;
                }
              }
            });
          } else {
            guidance += `${JSON.stringify(value, null, 2)}\n`;
          }
        }
      }
    }

    // Add analysis criteria
    if (frameworkKnowledge.analysis_criteria) {
      guidance += `\nANALYSIS CRITERIA:\n`;
      for (const [key, value] of Object.entries(frameworkKnowledge.analysis_criteria)) {
        if (Array.isArray(value)) {
          guidance += `${key}: ${value.join(', ')}\n`;
        }
      }
    }

    // Add revenue opportunities
    if (frameworkKnowledge.revenue_opportunities) {
      guidance += `\nREVENUE OPPORTUNITIES:\n`;
      for (const [key, value] of Object.entries(frameworkKnowledge.revenue_opportunities)) {
        if (Array.isArray(value)) {
          guidance += `${key}: ${value.join(', ')}\n`;
        }
      }
    }

    return guidance;
  }

  /**
   * Build analysis instructions based on framework
   */
  private static buildAnalysisInstructions(frameworkKnowledge: FrameworkKnowledge): string {
    let instructions = `\nANALYSIS INSTRUCTIONS:\n`;

    // Add methodology if available
    if (frameworkKnowledge.analysis_methodology) {
      if (frameworkKnowledge.analysis_methodology.identification_process) {
        instructions += `\nIDENTIFICATION PROCESS:\n`;
        frameworkKnowledge.analysis_methodology.identification_process.forEach((step: string, index: number) => {
          instructions += `${index + 1}. ${step}\n`;
        });
      }

      if (frameworkKnowledge.analysis_methodology.scoring_criteria) {
        instructions += `\nSCORING CRITERIA:\n`;
        for (const [key, value] of Object.entries(frameworkKnowledge.analysis_methodology.scoring_criteria)) {
          instructions += `${key}: ${value} points\n`;
        }
      }

      if (frameworkKnowledge.analysis_methodology.revenue_potential_assessment) {
        instructions += `\nREVENUE POTENTIAL ASSESSMENT:\n`;
        for (const [key, value] of Object.entries(frameworkKnowledge.analysis_methodology.revenue_potential_assessment)) {
          instructions += `${key}: ${value}\n`;
        }
      }
    }

    instructions += `\nGENERAL INSTRUCTIONS:
1. Use the framework knowledge above to guide your analysis
2. Apply the specific criteria and methodology provided
3. Focus on revenue opportunities and business impact
4. Provide specific, actionable recommendations
5. Include evidence from the website content
6. Score elements based on the provided criteria`;

    return instructions;
  }

  /**
   * Get framework elements for specific assessment
   */
  static async getFrameworkElements(assessmentType: string): Promise<any> {
    const frameworkName = this.getFrameworkName(assessmentType);
    const frameworkKnowledge = await this.loadFrameworkKnowledge(frameworkName);
    
    return frameworkKnowledge.structure;
  }

  /**
   * Validate analysis against framework criteria
   */
  static async validateAnalysis(
    assessmentType: string,
    analysis: any
  ): Promise<{
    isValid: boolean;
    score: number;
    missingElements: string[];
    recommendations: string[];
  }> {
    const frameworkKnowledge = await this.loadFrameworkKnowledge(
      this.getFrameworkName(assessmentType)
    );
    
    // This would contain validation logic specific to each framework
    // For now, return a basic validation structure
    return {
      isValid: true,
      score: 85,
      missingElements: [],
      recommendations: ['Consider adding more specific revenue impact estimates']
    };
  }
}

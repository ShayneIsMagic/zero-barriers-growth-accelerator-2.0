/**
 * Controlled Analysis System
 * Provides precise control over prompts, timing, and thorough analysis with clear deliverables
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  expectedDuration: number; // in milliseconds
  dependencies: string[];
  outputFormat: 'json' | 'text' | 'structured';
}

export interface AnalysisProgress {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export interface ControlledAnalysisConfig {
  _url: string;
  steps: AnalysisStep[];
  onProgressUpdate: (progress: AnalysisProgress) => void;
  timeoutPerStep: number; // milliseconds
  retryAttempts: number;
}

export class ControlledAnalyzer {
  private genAI: GoogleGenerativeAI;
  private config: ControlledAnalysisConfig;
  private currentStep: AnalysisProgress | null = null;

  constructor(config: ControlledAnalysisConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  /**
   * Execute controlled analysis with precise timing and progress tracking
   */
  async execute(): Promise<any> {
    console.log(`🚀 Starting controlled analysis for: ${this.config._url}`);

    const results: any = {};
    const startTime = Date.now();

    for (const step of this.config.steps) {
      try {
        await this.executeStep(step, results);
      } catch (error) {
        console.error(`❌ Step ${step.id} failed:`, error);
        this.updateProgress({
          stepId: step.id,
          stepName: step.name,
          status: 'failed',
          progress: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Decide whether to continue or abort
        if (this.isCriticalStep(step)) {
          throw new Error(`Critical step ${step.id} failed: ${error}`);
        }

        // For non-critical steps, continue with null result
        results[step.id] = null;
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`✅ Controlled analysis completed in ${totalDuration}ms`);

    return {
      url: this.config._url,
      timestamp: new Date().toISOString(),
      totalDuration,
      results,
      summary: this.generateSummary(results),
    };
  }

  /**
   * Execute individual step with controlled timing and progress updates
   */
  private async executeStep(
    step: AnalysisStep,
    previousResults: any
  ): Promise<void> {
    console.log(`📊 Executing step: ${step.name}`);

    this.updateProgress({
      stepId: step.id,
      stepName: step.name,
      status: 'running',
      progress: 0,
      startTime: new Date(),
    });

    // Check dependencies
    for (const dep of step.dependencies) {
      if (!previousResults[dep]) {
        throw new Error(`Dependency ${dep} not completed for step ${step.id}`);
      }
    }

    // Build prompt with previous results
    const prompt = this.buildPrompt(step, previousResults);

    // Execute with timeout
    const result = await this.executeWithTimeout(prompt, step.expectedDuration);

    // Parse result based on expected format
    const parsedResult = this.parseResult(result, step.outputFormat);

    this.updateProgress({
      stepId: step.id,
      stepName: step.name,
      status: 'completed',
      progress: 100,
      endTime: new Date(),
      result: parsedResult,
    });

    previousResults[step.id] = parsedResult;
  }

  /**
   * Execute AI call with timeout control
   */
  private async executeWithTimeout(
    prompt: string,
    timeoutMs: number
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Step timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        // Update progress during execution
        const progressInterval = setInterval(() => {
          if (this.currentStep) {
            this.currentStep.progress = Math.min(
              this.currentStep.progress + 10,
              90
            );
            this.config.onProgressUpdate(this.currentStep);
          }
        }, timeoutMs / 10);

        const model = this.genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        clearInterval(progressInterval);
        clearTimeout(timer);
        resolve(text);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Build prompt for specific step with context from previous results
   */
  private buildPrompt(step: AnalysisStep, previousResults: any): string {
    let prompt = step.promptTemplate;

    // Replace placeholders with actual data
    prompt = prompt.replace('{url}', this.config._url);

    // Add scraped content if available
    if (previousResults.scraped_content) {
      const content = previousResults.scraped_content;
      prompt = prompt.replace('{content}', content.content || '');
      prompt = prompt.replace('{title}', content.title || '');
      prompt = prompt.replace(
        '{metaDescription}',
        content.metaDescription || ''
      );
      prompt = prompt.replace(
        '{wordCount}',
        content.wordCount?.toString() || '0'
      );
    }

    // Add lighthouse data if available
    if (previousResults.lighthouse_analysis) {
      prompt = prompt.replace(
        '{lighthouse}',
        JSON.stringify(previousResults.lighthouse_analysis, null, 2)
      );
    }

    // Add pageaudit data if available
    if (previousResults.pageaudit_analysis) {
      prompt = prompt.replace(
        '{pageaudit}',
        JSON.stringify(previousResults.pageaudit_analysis, null, 2)
      );
    }

    return prompt;
  }

  /**
   * Parse result based on expected format
   */
  private parseResult(
    text: string,
    format: 'json' | 'text' | 'structured'
  ): any {
    switch (format) {
      case 'json':
        // Handle JSON wrapped in markdown code blocks
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        return JSON.parse(jsonText);

      case 'text':
        return text.trim();

      case 'structured':
        // For structured format, try to parse as JSON first, fallback to text
        try {
          return this.parseResult(text, 'json');
        } catch {
          return this.parseResult(text, 'text');
        }

      default:
        return text;
    }
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(progress: AnalysisProgress): void {
    this.currentStep = progress;
    this.config.onProgressUpdate(progress);
  }

  /**
   * Check if step is critical (analysis should fail if this step fails)
   */
  private isCriticalStep(step: AnalysisStep): boolean {
    const criticalSteps = ['scraped_content', 'golden_circle_analysis'];
    return criticalSteps.includes(step.id);
  }

  /**
   * Generate summary of all results
   */
  private generateSummary(results: any): any {
    return {
      totalSteps: this.config.steps.length,
      completedSteps: Object.keys(results).filter(
        (key) => results[key] !== null
      ).length,
      overallScore: this.calculateOverallScore(results),
      keyFindings: this.extractKeyFindings(results),
      priorityRecommendations: this.extractPriorityRecommendations(results),
      nextSteps: this.generateNextSteps(results),
    };
  }

  private calculateOverallScore(results: any): number {
    const scores = [];
    if (results.golden_circle_analysis?.overallScore)
      scores.push(results.golden_circle_analysis.overallScore);
    if (results.elements_of_value_analysis?.overallScore)
      scores.push(results.elements_of_value_analysis.overallScore);
    if (results.b2b_elements_analysis?.overallScore)
      scores.push(results.b2b_elements_analysis.overallScore);
    if (results.clifton_strengths_analysis?.overallScore)
      scores.push(results.clifton_strengths_analysis.overallScore);

    return scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        )
      : 0;
  }

  private extractKeyFindings(results: any): string[] {
    const findings = [];

    // Extract from Golden Circle
    if (results.golden_circle_analysis?.keyFindings) {
      findings.push(...results.golden_circle_analysis.keyFindings);
    }

    // Extract from other analyses
    if (results.comprehensive_analysis?.keyFindings) {
      findings.push(...results.comprehensive_analysis.keyFindings);
    }

    return findings.slice(0, 10); // Top 10 findings
  }

  private extractPriorityRecommendations(results: any): string[] {
    const recommendations: string[] = [];

    // Extract from all analyses
    Object.values(results).forEach((result: any) => {
      if (result?.priorityRecommendations) {
        recommendations.push(...result.priorityRecommendations);
      }
      if (result?.recommendations) {
        recommendations.push(...result.recommendations);
      }
    });

    return [...new Set(recommendations)].slice(0, 15); // Top 15 unique recommendations
  }

  private generateNextSteps(_results: any): string[] {
    return [
      'Review detailed analysis results in each section',
      'Prioritize recommendations based on impact and effort',
      'Create implementation timeline for high-impact changes',
      'Set up monitoring for key performance indicators',
      'Schedule follow-up analysis in 30-60 days',
    ];
  }
}

/**
 * Predefined analysis steps with controlled prompts and timing
 */
export const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'scraped_content',
    name: 'Content Extraction',
    description: 'Extract and analyze website content, metadata, and structure',
    promptTemplate: `Extract and analyze the following website content:

URL: {url}
Content: {content}
Title: {title}
Meta Description: {metaDescription}
Word Count: {wordCount}

Provide a structured analysis of:
1. Content quality and depth
2. SEO optimization level
3. Key messaging themes
4. Target audience indicators
5. Call-to-action effectiveness

Return JSON format with specific scores and evidence.`,
    expectedDuration: 15000, // 15 seconds
    dependencies: [],
    outputFormat: 'json',
  },
  {
    id: 'golden_circle_analysis',
    name: 'Golden Circle Analysis',
    description:
      "Analyze Why, How, What, and Who using Simon Sinek's framework",
    promptTemplate: `Analyze the website using Simon Sinek's Golden Circle framework:

URL: {url}
Content: {content}
Title: {title}

Evaluate each component with specific evidence:

WHY (Purpose/Belief):
- What is the driving purpose or belief?
- How clearly is this communicated?
- Score: 1-10 with specific evidence

HOW (Unique Approach):
- What makes their approach unique?
- How do they differentiate from competitors?
- Score: 1-10 with specific evidence

WHAT (Products/Services):
- What do they offer?
- How clearly are offerings presented?
- Score: 1-10 with specific evidence

WHO (Target Audience):
- Who is their target market?
- How well do they understand their audience?
- Score: 1-10 with specific evidence

Return JSON format with detailed analysis for each component.`,
    expectedDuration: 20000, // 20 seconds
    dependencies: ['scraped_content'],
    outputFormat: 'json',
  },
  {
    id: 'elements_of_value_analysis',
    name: 'B2C Elements of Value Analysis',
    description: 'Evaluate 30 Consumer Elements of Value framework',
    promptTemplate: `Analyze the website using the 30 Consumer Elements of Value framework:

URL: {url}
Content: {content}

Evaluate each of the 30 elements with evidence:

FUNCTIONAL (14 elements):
- Saves time, Simplifies, Makes money, Reduces risk, Organizes, Integrates, Connects, Reduces effort, Avoids hassles, Reduces cost, Quality, Variety, Sensory appeal, Informs

EMOTIONAL (10 elements):
- Reduces anxiety, Rewards me, Nostalgia, Design/aesthetics, Badge value, Wellness, Therapeutic value, Fun/entertainment, Attractiveness, Provides access

LIFE-CHANGING (5 elements):
- Provides hope, Self-actualization, Motivation, Heirloom, Affiliation and belonging

SOCIAL IMPACT (1 element):
- Self-transcendence

For each element, provide:
- Present: true/false
- Evidence: specific quotes or examples
- Score: 1-10

Return JSON format with detailed evaluation.`,
    expectedDuration: 25000, // 25 seconds
    dependencies: ['scraped_content'],
    outputFormat: 'json',
  },
  {
    id: 'b2b_elements_analysis',
    name: 'B2B Elements of Value Analysis',
    description: 'Evaluate 40 B2B Elements of Value framework',
    promptTemplate: `Analyze the website using the 40 B2B Elements of Value framework:

URL: {url}
Content: {content}

Evaluate each of the 40 elements with evidence:

TABLE STAKES (4 elements) - Base Level:
- Regulatory Compliance, Ethical Standards, Meeting Specifications, Acceptable Price

FUNCTIONAL VALUE (6 elements) - Second Level:
- Economic: Cost Reduction, Improved Top Line, Scalability
- Performance: Product Quality, Innovation, Improved Performance

EASE OF DOING BUSINESS (19 elements) - Third Level:
- Productivity: Time Savings, Reduced Effort, Decreased Hassles, Information, Transparency
- Operational: Organization, Simplification, Connection, Integration
- Access: Availability, Variety, Configurability
- Relationship: Responsiveness, Expertise, Commitment, Stability, Cultural Fit
- Strategic: Risk Reduction, Reach

INDIVIDUAL VALUE (7 elements) - Fourth Level:
- Personal: Design & Aesthetics, Growth & Development, Reduced Anxiety, Fun and Perks
- Career: Network Expansion, Marketability, Reputational Assurance

INSPIRATIONAL VALUE (4 elements) - Top Level:
- Purpose, Vision, Hope, Social Responsibility

For each element, provide:
- Present: true/false
- Evidence: specific quotes or examples
- Score: 1-10

Return JSON format with detailed evaluation.`,
    expectedDuration: 30000, // 30 seconds
    dependencies: ['scraped_content'],
    outputFormat: 'json',
  },
  {
    id: 'clifton_strengths_analysis',
    name: 'CliftonStrengths Analysis',
    description: 'Evaluate 34 CliftonStrengths themes across 4 domains',
    promptTemplate: `Analyze the website using the 34 CliftonStrengths themes:

URL: {url}
Content: {content}

Evaluate each domain and its themes:

STRATEGIC THINKING (8 themes):
- Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic

EXECUTING (9 themes):
- Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative

INFLUENCING (8 themes):
- Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo

RELATIONSHIP BUILDING (9 themes):
- Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator

For each domain:
- Score: 1-10
- Present themes: list with evidence
- Missing themes: list with recommendations
- Overall assessment

Return JSON format with detailed analysis.`,
    expectedDuration: 25000, // 25 seconds
    dependencies: ['scraped_content'],
    outputFormat: 'json',
  },
  {
    id: 'comprehensive_analysis',
    name: 'Comprehensive Strategic Analysis',
    description:
      'Generate comprehensive insights and strategic recommendations',
    promptTemplate: `Generate comprehensive strategic analysis based on all previous findings:

URL: {url}

Previous Analysis Results:
- Golden Circle: {golden_circle_analysis}
- Elements of Value: {elements_of_value_analysis}
- B2B Elements: {b2b_elements_analysis}
- CliftonStrengths: {clifton_strengths_analysis}
- Technical Performance: {lighthouse}

Provide:

1. EXECUTIVE SUMMARY:
   - Overall assessment (1-2 paragraphs)
   - Key strengths and weaknesses
   - Strategic positioning

2. COMPETITIVE ANALYSIS:
   - Market positioning
   - Competitive advantages
   - Areas for differentiation

3. GROWTH OPPORTUNITIES:
   - Immediate quick wins (0-30 days)
   - Medium-term improvements (1-6 months)
   - Long-term strategic initiatives (6-12 months)

4. IMPLEMENTATION ROADMAP:
   - Prioritized action items
   - Resource requirements
   - Success metrics

5. RISK ASSESSMENT:
   - Potential challenges
   - Mitigation strategies

Return JSON format with detailed strategic recommendations.`,
    expectedDuration: 35000, // 35 seconds
    dependencies: [
      'golden_circle_analysis',
      'elements_of_value_analysis',
      'b2b_elements_analysis',
      'clifton_strengths_analysis',
    ],
    outputFormat: 'json',
  },
];

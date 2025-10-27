/**
 * Simple Framework Analysis Service
 * Direct AI analysis without complex framework integration
 */

import { analyzeWithGemini } from '@/lib/free-ai-analysis';

export interface SimpleAnalysisResult {
  success: boolean;
  url: string;
  analysis: any;
  error?: string;
}

export class SimpleFrameworkAnalysisService {
  /**
   * Analyze with Golden Circle framework
   */
  static async analyzeGoldenCircle(
    url: string,
    scrapedData: any
  ): Promise<SimpleAnalysisResult> {
    try {
      const prompt = this.buildGoldenCirclePrompt(scrapedData, url);
      const result = await analyzeWithGemini(prompt, 'golden-circle');

      return {
        success: true,
        url,
        analysis: result,
      };
    } catch (error) {
      return {
        success: false,
        url,
        analysis: {},
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  /**
   * Analyze with B2C Elements of Value framework
   */
  static async analyzeB2CElements(
    url: string,
    scrapedData: any
  ): Promise<SimpleAnalysisResult> {
    try {
      const prompt = this.buildB2CElementsPrompt(scrapedData, url);
      const result = await analyzeWithGemini(prompt, 'elements-value-b2c');

      return {
        success: true,
        url,
        analysis: result,
      };
    } catch (error) {
      return {
        success: false,
        url,
        analysis: {},
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  /**
   * Analyze with B2B Elements of Value framework
   */
  static async analyzeB2BElements(
    url: string,
    scrapedData: any
  ): Promise<SimpleAnalysisResult> {
    try {
      const prompt = this.buildB2BElementsPrompt(scrapedData, url);
      const result = await analyzeWithGemini(prompt, 'elements-value-b2b');

      return {
        success: true,
        url,
        analysis: result,
      };
    } catch (error) {
      return {
        success: false,
        url,
        analysis: {},
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  /**
   * Analyze with CliftonStrengths framework
   */
  static async analyzeCliftonStrengths(
    url: string,
    scrapedData: any
  ): Promise<SimpleAnalysisResult> {
    try {
      const prompt = this.buildCliftonStrengthsPrompt(scrapedData, url);
      const result = await analyzeWithGemini(prompt, 'clifton-strengths');

      return {
        success: true,
        url,
        analysis: result,
      };
    } catch (error) {
      return {
        success: false,
        url,
        analysis: {},
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  /**
   * Build Golden Circle prompt
   */
  private static buildGoldenCirclePrompt(
    scrapedData: any,
    url: string
  ): string {
    const content =
      scrapedData.cleanText || scrapedData.content || 'No content available';
    const title = scrapedData.title || 'No title available';

    return `Analyze this website using Simon Sinek's Golden Circle framework:

URL: ${url}
Title: ${title}
Content: ${content.substring(0, 3000)}

Please analyze and identify:

1. WHY - The purpose, cause, or belief that drives the organization
2. HOW - The specific actions, processes, or values that bring the WHY to life
3. WHAT - The products or services the organization offers
4. WHO - The target audience or customer base

For each component, provide:
- A score from 1-100 based on clarity and strength
- Specific evidence from the content
- Recommendations for improvement
- Revenue opportunities

Return your analysis as a structured JSON response.`;
  }

  /**
   * Build B2C Elements of Value prompt
   */
  private static buildB2CElementsPrompt(scrapedData: any, url: string): string {
    const content =
      scrapedData.cleanText || scrapedData.content || 'No content available';
    const title = scrapedData.title || 'No title available';

    return `Analyze this website using the 30 B2C Elements of Value framework:

URL: ${url}
Title: ${title}
Content: ${content.substring(0, 3000)}

The 30 B2C Elements of Value are:
FUNCTIONAL: Saves Time, Simplifies, Reduces Cost, Reduces Risk, Organizes, Integrates, Connects, Reduces Effort, Avoids Hassles, Makes Money, Reduces Anxiety, Rewards Me
EMOTIONAL: Fun/Entertainment, Attractive Appearance, Provides Access, Variety, Therapeutic Value, Nostalgia, Design/Aesthetics, Badge Value, Wellness
LIFE CHANGING: Self-Actualization, Motivation, Heirloom, Affiliation/Belonging

For each element, identify:
- Whether it's currently delivered (score 1-100)
- Revenue potential and pricing opportunities
- Evidence from the content
- Recommendations for improvement

Return your analysis as a structured JSON response.`;
  }

  /**
   * Build B2B Elements of Value prompt
   */
  private static buildB2BElementsPrompt(scrapedData: any, url: string): string {
    const content =
      scrapedData.cleanText || scrapedData.content || 'No content available';
    const title = scrapedData.title || 'No title available';

    return `Analyze this website using the 40 B2B Elements of Value framework:

URL: ${url}
Title: ${title}
Content: ${content.substring(0, 3000)}

The 40 B2B Elements of Value include:
TABLE STAKES: Meeting Specifications, Acceptable Price, Regulatory Compliance, Ethical Standards
FUNCTIONAL: Improved Top Line, Cost Reduction, Product Quality, Scalability, Innovation
EASE OF DOING BUSINESS: Time Savings, Reduced Effort, Decreased Hassles, Information, Transparency, Organization, Simplification, Connection, Integration, Availability, Variety, Responsiveness, Expertise, Commitment, Stability, Cultural Fit, Risk Reduction, Reach, Flexibility
INDIVIDUAL: Network Expansion, Marketability, Reputational Assurance, Growth & Development, Reduced Anxiety
INSPIRATIONAL: Purpose, Vision, Hope, Social Responsibility

For each element, identify:
- Whether it's currently delivered (score 1-100)
- Enterprise sales potential and deal size impact
- Evidence from the content
- Recommendations for improvement

Return your analysis as a structured JSON response.`;
  }

  /**
   * Build CliftonStrengths prompt
   */
  private static buildCliftonStrengthsPrompt(
    scrapedData: any,
    url: string
  ): string {
    const content =
      scrapedData.cleanText || scrapedData.content || 'No content available';
    const title = scrapedData.title || 'No title available';

    return `Analyze this website using the CliftonStrengths framework:

URL: ${url}
Title: ${title}
Content: ${content.substring(0, 3000)}

The 34 CliftonStrengths themes are organized into 4 domains:

STRATEGIC THINKING: Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic
EXECUTING: Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative
INFLUENCING: Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo
RELATIONSHIP BUILDING: Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator

For each domain, identify:
- Which themes are most evident (score 1-100)
- Evidence from the content
- How these strengths manifest in the organization
- Recommendations for leveraging strengths

Return your analysis as a structured JSON response.`;
  }
}

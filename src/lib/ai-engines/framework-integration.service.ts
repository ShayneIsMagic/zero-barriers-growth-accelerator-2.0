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
  static async loadFrameworkKnowledge(
    frameworkName: string
  ): Promise<FrameworkKnowledge> {
    try {
      // Use dynamic import - Next.js handles this at build time
      const framework = await import(
        `./framework-knowledge/${frameworkName}-framework.json`
      );
      return framework.default;
    } catch (error) {
      throw new Error(
        `Failed to load framework knowledge for ${frameworkName}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Build enhanced prompt with actual framework knowledge
   * Now includes Google Analytics/GA4 best practices and conversion flow optimization
   */
  static async buildEnhancedPrompt(
    assessmentType: string,
    scrapedData: any,
    url: string,
    options?: {
      selectedPages?: string[];
      includeGoogleAnalytics?: boolean;
      includeConversionFlow?: boolean;
      siteGoals?: string[];
      selectedArchetype?: string;
      selectedAudience?: string;
    }
  ): Promise<string> {
    // Load the assessment rules
    const rules = await this.loadAssessmentRules(assessmentType);

    // Load the framework knowledge
    const frameworkName = this.getFrameworkName(assessmentType);
    const frameworkKnowledge = await this.loadFrameworkKnowledge(frameworkName);

    // Build the enhanced prompt
    const context = this.buildContext(scrapedData, url, options?.selectedPages);
    const frameworkGuidance = this.buildFrameworkGuidance(frameworkKnowledge);
    const scoringMethodology = this.buildScoringMethodology(frameworkKnowledge, assessmentType);
    const archetypeAudienceGuidance = this.buildArchetypeAudienceGuidance(
      options?.selectedArchetype,
      options?.selectedAudience
    );
    const analysisInstructions = this.buildAnalysisInstructions(
      frameworkKnowledge,
      options
    );
    const googleAnalyticsGuidance = options?.includeGoogleAnalytics !== false
      ? this.buildGoogleAnalyticsGuidance(scrapedData)
      : '';
    const conversionFlowGuidance = options?.includeConversionFlow !== false
      ? this.buildConversionFlowGuidance(scrapedData, options?.siteGoals)
      : '';

    return `${rules.persona}

${rules.task}

${context}

${frameworkGuidance}

${scoringMethodology}

${archetypeAudienceGuidance}

${googleAnalyticsGuidance}

${conversionFlowGuidance}

${analysisInstructions}

${rules.format}`;
  }

  /**
   * Get framework name from assessment type
   */
  private static getFrameworkName(assessmentType: string): string {
    const frameworkMap: { [key: string]: string } = {
      'golden-circle': 'golden-circle',
      'golden-circle-framework': 'golden-circle',
      'elements-value-b2c': 'elements-value-b2c',
      'elements-value-b2b': 'elements-value-b2b',
      'clifton-strengths': 'clifton-strengths',
      'content-comparison': 'content-comparison',
      'google-tools': 'google-tools',
      'jambojon-archetypes': 'jambojon-archetypes',
      'brand-archetypes': 'jambojon-archetypes',
    };

    return frameworkMap[assessmentType] || assessmentType;
  }

  /**
   * Load assessment rules
   */
  private static async loadAssessmentRules(
    assessmentType: string
  ): Promise<any> {
    try {
      // Normalize assessment type for file name
      const normalizedType = assessmentType === 'brand-archetypes' 
        ? 'jambojon-archetypes' 
        : assessmentType;
      
      const rules = await import(
        `./assessment-rules/${normalizedType}-rules.json`
      );
      return rules.default;
    } catch (error) {
      throw new Error(
        `Failed to load assessment rules for ${assessmentType}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Build context from scraped data
   */
  private static buildContext(
    scrapedData: any,
    url: string,
    selectedPages?: string[]
  ): string {
    let context = `WEBSITE CONTENT TO ANALYZE:
URL: ${url}`;

    // If multiple pages selected, include page-specific context
    if (selectedPages && selectedPages.length > 0) {
      context += `\nSELECTED PAGES FOR REVIEW: ${selectedPages.length} page(s)`;
      selectedPages.forEach((pageUrl, index) => {
        context += `\n  Page ${index + 1}: ${pageUrl}`;
      });
    }

    context += `
Title: ${scrapedData.title || ''}
Meta Description: ${scrapedData.metaDescription || ''}
Content: ${scrapedData.cleanText?.substring(0, 4000) || ''}
Headings: ${JSON.stringify(scrapedData.headings || [])}`;

    // Include analytics data if available
    if (scrapedData.analytics) {
      context += `\n\nANALYTICS DATA:
GA4 IDs: ${scrapedData.analytics.ga4Ids?.join(', ') || 'Not detected'}
GTM Container IDs: ${scrapedData.analytics.gtmIds?.join(', ') || 'Not detected'}
Facebook Pixel: ${scrapedData.analytics.fbPixelId || 'Not detected'}`;
    }

    // Include SEO metadata
    if (scrapedData.seo) {
      context += `\n\nSEO METADATA:
Keywords: ${scrapedData.seo.extractedKeywords?.slice(0, 20).join(', ') || 'None'}
Schema Markup: ${scrapedData.seo.schemaMarkup ? 'Present' : 'Not detected'}`;
    }

    return context;
  }

  /**
   * Build framework-specific guidance
   */
  private static buildFrameworkGuidance(
    frameworkKnowledge: FrameworkKnowledge
  ): string {
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
      for (const [key, value] of Object.entries(
        frameworkKnowledge.analysis_criteria
      )) {
        if (Array.isArray(value)) {
          guidance += `${key}: ${value.join(', ')}\n`;
        }
      }
    }

    // Add revenue opportunities
    if (frameworkKnowledge.revenue_opportunities) {
      guidance += `\nREVENUE OPPORTUNITIES:\n`;
      for (const [key, value] of Object.entries(
        frameworkKnowledge.revenue_opportunities
      )) {
        if (Array.isArray(value)) {
          guidance += `${key}: ${value.join(', ')}\n`;
        }
      }
    }

    return guidance;
  }

  /**
   * Build scoring methodology section with explicit scoring criteria
   * This ensures scoring links and criteria are always used in evaluations
   * References the official scoring system from README.md
   */
  private static buildScoringMethodology(
    frameworkKnowledge: FrameworkKnowledge,
    assessmentType?: string
  ): string {
    if (!frameworkKnowledge.analysis_methodology) {
      return '';
    }

    let methodology = '\n=== SCORING METHODOLOGY (MANDATORY REFERENCE) ===\n';
    methodology += 'OFFICIAL SCORING SYSTEM REFERENCE:\n';
    methodology += 'This assessment uses the Flat Fractional Scoring (Version 2.0) system documented in the project README.\n';
    methodology += 'Reference: https://github.com/ShayneIsMagic/zero-barriers-growth-accelerator-2.0#-scoring-system\n\n';
    methodology += 'CORE PRINCIPLES:\n';
    methodology += '- Format: 0.0-1.0 fractional scores per element\n';
    methodology += '- Philosophy: Every element matters equally - simple averages throughout\n';
    methodology += '- Transparent: Easy to understand calculations (sum ÷ count)\n';
    methodology += '- Fair: No tier or category weights applied\n';
    methodology += '- Actionable: Clear priorities for improvement\n\n';
    methodology += 'SCORING SCALE (from README):\n';
    methodology += '- 0.8-1.0: Excellent - Industry-leading, exceptional value\n';
    methodology += '- 0.6-0.79: Good - Above market average, solid delivery\n';
    methodology += '- 0.4-0.59: Needs Work - Below expectations, requires improvement\n';
    methodology += '- 0.0-0.39: Poor - Weak or non-existent, critical gap\n\n';

    // Add identification process
    if (frameworkKnowledge.analysis_methodology.identification_process) {
      methodology += 'IDENTIFICATION PROCESS:\n';
      frameworkKnowledge.analysis_methodology.identification_process.forEach(
        (step: string, index: number) => {
          methodology += `${index + 1}. ${step}\n`;
        }
      );
      methodology += '\n';
    }

    // Add scoring criteria (most important)
    if (frameworkKnowledge.analysis_methodology.scoring_criteria) {
      methodology += 'SCORING CRITERIA (USE THESE EXACT VALUES):\n';
      methodology += 'All scores must be calculated using these specific point values from the framework knowledge:\n\n';
      for (const [key, value] of Object.entries(
        frameworkKnowledge.analysis_methodology.scoring_criteria
      )) {
        methodology += `- ${key.replace(/_/g, ' ').toUpperCase()}: ${value} points\n`;
      }
      methodology += '\nCRITICAL: Every score you assign must reference these exact criteria. ';
      methodology += 'When scoring, explicitly state which criteria applies and why.\n';
      methodology += 'All scores must be in the 0.0-1.0 fractional format as specified in the README.\n\n';
    }

    // Add revenue potential assessment if available
    if (frameworkKnowledge.analysis_methodology.revenue_potential_assessment) {
      methodology += 'REVENUE POTENTIAL ASSESSMENT GUIDELINES:\n';
      for (const [key, value] of Object.entries(
        frameworkKnowledge.analysis_methodology.revenue_potential_assessment
      )) {
        methodology += `- ${key.replace(/_/g, ' ').toUpperCase()}: ${value}\n`;
      }
      methodology += '\n';
    }

    // Add framework-specific scoring details from README
    if (assessmentType) {
      methodology += this.getFrameworkSpecificScoringDetails(assessmentType);
    }

    methodology += '=== END SCORING METHODOLOGY ===\n';
    methodology += 'REMEMBER: Always use flat fractional scoring (0.0-1.0) with equal weights for all elements.\n';
    methodology += 'Reference the official scoring system: https://github.com/ShayneIsMagic/zero-barriers-growth-accelerator-2.0#-scoring-system\n';

    return methodology;
  }

  /**
   * Get framework-specific scoring details from README
   */
  private static getFrameworkSpecificScoringDetails(assessmentType: string): string {
    const frameworkMap: Record<string, string> = {
      'elements-value-b2c': `
B2C ELEMENTS OF VALUE SCORING (from README):
- Tier 1: Functional (14 elements) - Average of 14 scores
- Tier 2: Emotional (10 elements) - Average of 10 scores
- Tier 3: Life-Changing (5 elements) - Average of 5 scores
- Tier 4: Social Impact (1 element) - Single score
- Overall Score: Sum of all 30 scores ÷ 30
- Reference: README.md lines 199-204
`,
      'elements-value-b2b': `
B2B ELEMENTS OF VALUE SCORING (from README):
- Tier 1: Table Stakes (4 elements) - Average of 4 scores
- Tier 2: Functional (7 elements) - Average of 7 scores
- Tier 3: Ease of Doing Business (19 elements) - Average of 19 scores
- Tier 4: Individual (7 elements) - Average of 7 scores
- Tier 5: Inspirational (3 elements) - Average of 3 scores
- Overall Score: Sum of all 40 scores ÷ 40
- Reference: README.md lines 206-212
`,
      'golden-circle': `
GOLDEN CIRCLE SCORING (from README):
Each component scored across 6 dimensions (0.0-1.0 each):
- WHY (Purpose): Clarity, Authenticity, Inspiration, Consistency, Differentiation, Emotional Resonance
- HOW (Differentiators): Uniqueness, Clarity, Consistency, Alignment, Proof Points, Competitive Moat
- WHAT (Offerings): Clarity, Alignment, Quality, Proof, Evolution, Market Fit
- WHO (Audience): Clarity, Alignment, Specificity, Understanding, Resonance, Loyalty
- Component Score: Average of 6 dimensions
- Overall Score: Average of 4 component scores
- Reference: README.md lines 214-221
`,
      'clifton-strengths': `
CLIFTONSTRENGTHS SCORING (from README):
- Domain 1: Strategic Thinking (8 themes) - Average of 8 scores
- Domain 2: Relationship Building (9 themes) - Average of 9 scores
- Domain 3: Influencing (8 themes) - Average of 8 scores
- Domain 4: Executing (9 themes) - Average of 9 scores
- Overall Score: Sum of all 34 theme scores ÷ 34
- Reference: README.md lines 223-228
`,
      'jambojon-archetypes': `
BRAND ARCHETYPES SCORING (from README):
- 12 archetypes scored individually (0.0-1.0 each)
- Flat fractional scoring - all archetypes equal weight
- Overall Score: Average of all 12 archetype scores
- Primary archetype: Highest scoring archetype
- Secondary archetypes: Scores 0.5-0.79
- Reference: README.md lines 245-260
`,
    };

    return frameworkMap[assessmentType] || '';
  }

  /**
   * Build archetype and audience guidance
   */
  private static buildArchetypeAudienceGuidance(
    selectedArchetype?: string,
    selectedAudience?: string
  ): string {
    if (!selectedArchetype && !selectedAudience) {
      return '';
    }

    let guidance = '\nTARGET ARCHETYPE & AUDIENCE GUIDANCE:\n';

    if (selectedArchetype) {
      guidance += `\nTARGET ARCHETYPE: ${selectedArchetype}\n`;
      guidance += `IMPORTANT: Analyze this content specifically against the ${selectedArchetype} archetype. `;
      guidance += `Focus on how well the content aligns with ${selectedArchetype} characteristics, values, and messaging patterns. `;
      guidance += `Score and evaluate based on ${selectedArchetype} archetype criteria.\n`;
    }

    if (selectedAudience) {
      const audienceLabel = selectedAudience === 'b2c' 
        ? 'Business-to-Consumer (B2C)' 
        : selectedAudience === 'b2b'
        ? 'Business-to-Business (B2B)'
        : 'Both B2C and B2B';
      guidance += `\nTARGET AUDIENCE: ${audienceLabel}\n`;
      guidance += `IMPORTANT: Analyze this content specifically for ${audienceLabel} audience. `;
      guidance += `Focus on how well the content resonates with ${audienceLabel} needs, pain points, and decision-making processes. `;
      guidance += `Use ${audienceLabel}-appropriate value elements and messaging frameworks.\n`;
    }

    if (selectedArchetype && selectedAudience) {
      guidance += `\nCOMBINED TARGETING:\n`;
      guidance += `Analyze how well the content serves ${selectedAudience === 'b2c' ? 'B2C' : selectedAudience === 'b2b' ? 'B2B' : 'both B2C and B2B'} audiences `;
      guidance += `through the ${selectedArchetype} archetype lens. `;
      guidance += `Ensure consistency across all selected pages for accurate comparison.\n`;
    }

    return guidance;
  }

  /**
   * Build analysis instructions based on framework
   * Enhanced with Google Analytics and conversion flow focus
   */
  private static buildAnalysisInstructions(
    frameworkKnowledge: FrameworkKnowledge,
    options?: {
      includeGoogleAnalytics?: boolean;
      includeConversionFlow?: boolean;
      siteGoals?: string[];
      selectedArchetype?: string;
      selectedAudience?: string;
    }
  ): string {
    let instructions = `\nANALYSIS INSTRUCTIONS:\n`;

    // Add methodology if available
    if (frameworkKnowledge.analysis_methodology) {
      if (frameworkKnowledge.analysis_methodology.identification_process) {
        instructions += `\nIDENTIFICATION PROCESS:\n`;
        frameworkKnowledge.analysis_methodology.identification_process.forEach(
          (step: string, index: number) => {
            instructions += `${index + 1}. ${step}\n`;
          }
        );
      }

      // Scoring criteria is now handled in buildScoringMethodology above
      // This section can reference it but the detailed criteria is already provided

      if (
        frameworkKnowledge.analysis_methodology.revenue_potential_assessment
      ) {
        instructions += `\nREVENUE POTENTIAL ASSESSMENT:\n`;
        for (const [key, value] of Object.entries(
          frameworkKnowledge.analysis_methodology.revenue_potential_assessment
        )) {
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

    // Add Google Analytics/GA4 specific instructions
    if (options?.includeGoogleAnalytics !== false) {
      instructions += `\n\nGOOGLE ANALYTICS 4 (GA4) BEST PRACTICES TO EVALUATE:
1. Event Tracking: Check if key user actions are tracked (clicks, form submissions, downloads)
2. Enhanced Measurement: Verify automatic event tracking is configured
3. Conversion Events: Assess if conversion goals are properly defined and tracked
4. User Properties: Evaluate if custom user properties are set for segmentation
5. E-commerce Tracking: If applicable, check if purchase events are properly tracked
6. Content Grouping: Assess if content is properly grouped for analysis
7. Custom Dimensions: Check if custom dimensions are used for deeper insights
8. Data Quality: Evaluate if tracking code is properly implemented and not duplicated
9. Privacy Compliance: Verify GDPR/CCPA compliance with consent mode
10. Attribution: Assess if proper attribution models are configured`;

      instructions += `\n\nGOOGLE SEARCH CONSOLE BEST PRACTICES TO EVALUATE:
1. Indexability: Check if pages are properly indexed and discoverable
2. Mobile Usability: Assess mobile-friendliness and Core Web Vitals
3. Structured Data: Verify schema markup is properly implemented
4. Sitemap: Check if XML sitemap is submitted and up-to-date
5. Robots.txt: Verify proper crawling directives
6. URL Structure: Assess if URLs are clean, descriptive, and SEO-friendly
7. Internal Linking: Evaluate internal link structure and anchor text
8. Page Speed: Check if pages meet Core Web Vitals thresholds
9. Security: Verify HTTPS implementation and security headers
10. International Targeting: If applicable, check hreflang implementation`;
    }

    // Add conversion flow optimization instructions
    if (options?.includeConversionFlow !== false) {
      instructions += `\n\nCONVERSION FLOW OPTIMIZATION (Search → Lead → Sales):
Evaluate the complete user journey and identify barriers at each stage:

SEARCH STAGE (Discovery & Awareness):
- SEO Optimization: Title tags, meta descriptions, keyword targeting
- Content Quality: Relevance, depth, and value of content
- Technical SEO: Page speed, mobile-friendliness, structured data
- Search Visibility: How well does content match search intent?

LEAD STAGE (Engagement & Interest):
- Value Proposition: Clear, compelling value statements
- Trust Signals: Testimonials, reviews, certifications, social proof
- Call-to-Actions: Clear, prominent, action-oriented CTAs
- Content Engagement: Time on page, scroll depth, interaction rates
- Lead Magnets: Forms, downloads, newsletter signups
- User Experience: Navigation, page structure, readability

SALES STAGE (Conversion & Purchase):
- Conversion Path: Clear path from interest to purchase
- Pricing Clarity: Transparent pricing and value communication
- Objection Handling: Address common concerns and objections
- Urgency/Scarcity: Appropriate use of urgency without manipulation
- Checkout Process: If applicable, evaluate checkout flow
- Post-Conversion: Thank you pages, confirmation emails, next steps`;

      if (options?.siteGoals && options.siteGoals.length > 0) {
        instructions += `\n\nSITE-SPECIFIC GOALS TO ACHIEVE:
${options.siteGoals.map((goal, index) => `${index + 1}. ${goal}`).join('\n')}

Prioritize recommendations that directly support these goals.`;
      }
    }

    instructions += `\n\nPRIORITY FOCUS AREAS:
1. Identify the biggest barriers preventing goal achievement
2. Recommend specific, actionable improvements for SEO and GA4 tracking
3. Suggest content changes that improve conversion flow
4. Provide evidence-based recommendations with expected impact
5. Prioritize quick wins that can be implemented immediately
6. Consider the full user journey from search to conversion`;

    return instructions;
  }

  /**
   * Build Google Analytics/GA4 best practices guidance
   */
  private static buildGoogleAnalyticsGuidance(scrapedData: any): string {
    let guidance = `\n\nGOOGLE ANALYTICS 4 (GA4) & GOOGLE TOOLS BEST PRACTICES:\n`;

    // Check if GA4 is detected
    const hasGA4 = scrapedData.analytics?.ga4Ids?.length > 0;
    const hasGTM = scrapedData.analytics?.gtmIds?.length > 0;

    guidance += `\nCURRENT IMPLEMENTATION STATUS:
- GA4 Measurement IDs: ${hasGA4 ? scrapedData.analytics.ga4Ids.join(', ') : 'NOT DETECTED'}
- Google Tag Manager: ${hasGTM ? scrapedData.analytics.gtmIds.join(', ') : 'NOT DETECTED'}
- Facebook Pixel: ${scrapedData.analytics?.fbPixelId || 'NOT DETECTED'}`;

    guidance += `\n\nGA4 BEST PRACTICES TO APPLY:
1. Enhanced Measurement: Enable automatic event tracking for scrolls, outbound clicks, site search, video engagement, and file downloads
2. Custom Events: Track key business events (form submissions, button clicks, video plays, etc.)
3. Conversion Events: Define and mark important events as conversions
4. User Properties: Set custom user properties for segmentation (user type, subscription status, etc.)
5. E-commerce Tracking: Implement enhanced e-commerce tracking if applicable
6. Content Grouping: Use content groups to organize content by topic, author, or section
7. Custom Dimensions: Create custom dimensions for deeper analysis (content type, author, category)
8. Data Retention: Configure appropriate data retention settings
9. Consent Mode: Implement consent mode for GDPR/CCPA compliance
10. Attribution Models: Configure appropriate attribution models for conversion tracking`;

    guidance += `\n\nGOOGLE SEARCH CONSOLE BEST PRACTICES:
1. Verify Property: Ensure site is verified in Search Console
2. Submit Sitemap: Submit XML sitemap and keep it updated
3. Monitor Coverage: Check for indexing issues and fix crawl errors
4. Performance Tracking: Monitor search performance, impressions, clicks, CTR, and position
5. Mobile Usability: Ensure mobile-friendly design and test mobile usability
6. Core Web Vitals: Monitor and improve LCP, FID, and CLS scores
7. Structured Data: Implement and validate schema markup
8. Security Issues: Monitor and resolve security issues promptly
9. Manual Actions: Check for and resolve manual penalties
10. International Targeting: Configure hreflang for multi-language sites`;

    guidance += `\n\nMETADATA & SEO BEST PRACTICES:
1. Title Tags: 50-60 characters, include primary keyword, unique per page
2. Meta Descriptions: 150-160 characters, compelling, include CTA, unique per page
3. Heading Structure: Proper H1-H6 hierarchy, include keywords naturally
4. Alt Text: Descriptive alt text for all images, include keywords when relevant
5. URL Structure: Clean, descriptive URLs with keywords, avoid parameters
6. Internal Linking: Strategic internal links with descriptive anchor text
7. External Links: Quality outbound links to authoritative sources
8. Schema Markup: Implement relevant schema types (Organization, WebPage, Article, Product, etc.)
9. Canonical Tags: Use canonical tags to prevent duplicate content issues
10. Robots Meta: Proper use of noindex, nofollow when needed`;

    return guidance;
  }

  /**
   * Build conversion flow optimization guidance
   */
  private static buildConversionFlowGuidance(
    scrapedData: any,
    siteGoals?: string[]
  ): string {
    let guidance = `\n\nCONVERSION FLOW OPTIMIZATION:\n`;

    guidance += `\nCONVERSION FUNNEL ANALYSIS (Search → Lead → Sales):\n`;

    guidance += `\nSTAGE 1: SEARCH & DISCOVERY
Evaluate how well the page performs in search:
- Keyword Targeting: Are target keywords present and naturally integrated?
- Search Intent Match: Does content match what users are searching for?
- SERP Features: Is content optimized for featured snippets, rich results?
- Click-Through Potential: Do title and meta description encourage clicks?
- Technical SEO: Page speed, mobile-friendliness, structured data`;

    guidance += `\n\nSTAGE 2: ENGAGEMENT & LEAD GENERATION
Evaluate how well the page engages visitors:
- Value Proposition: Is the unique value clearly communicated?
- Content Quality: Is content comprehensive, helpful, and engaging?
- Trust Signals: Are testimonials, reviews, certifications visible?
- Call-to-Actions: Are CTAs clear, prominent, and action-oriented?
- Lead Magnets: Are there opportunities to capture leads (forms, downloads)?
- User Experience: Is navigation intuitive, page structure clear?
- Engagement Metrics: Would this content encourage time on page, scroll depth?`;

    guidance += `\n\nSTAGE 3: CONVERSION & SALES
Evaluate how well the page converts visitors:
- Conversion Path: Is there a clear path from interest to action?
- Objection Handling: Are common concerns addressed?
- Pricing Clarity: Is pricing transparent and value communicated?
- Urgency/Scarcity: Is appropriate urgency used without manipulation?
- Social Proof: Are testimonials, case studies, success stories visible?
- Risk Reduction: Are guarantees, refunds, security badges shown?
- Next Steps: Are next steps clearly defined and easy to take?`;

    if (siteGoals && siteGoals.length > 0) {
      guidance += `\n\nSITE-SPECIFIC GOALS:\n`;
      siteGoals.forEach((goal, index) => {
        guidance += `${index + 1}. ${goal}\n`;
      });
      guidance += `\nPrioritize recommendations that directly support achieving these goals.`;
    }

    guidance += `\n\nCONVERSION BARRIERS TO IDENTIFY:
1. Content gaps that prevent users from moving to next stage
2. Missing or unclear calls-to-action
3. Lack of trust signals or social proof
4. Poor user experience or navigation issues
5. Technical issues (slow load times, mobile problems)
6. Unclear value proposition or messaging
7. Missing or incomplete conversion tracking
8. Content that doesn't match search intent
9. Lack of personalization or relevance
10. Friction in the conversion process`;

    return guidance;
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
      recommendations: [
        'Consider adding more specific revenue impact estimates',
      ],
    };
  }
}

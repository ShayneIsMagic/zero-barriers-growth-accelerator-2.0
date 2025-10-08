import { AnalysisResult } from './ai-providers';

export interface ContentAnalysisResult extends AnalysisResult {
  pageType: string;
  url: string;
  analyzedAt: string;
  pageTitle?: string;
  metaDescription?: string;
  wordCount?: number;
  imageCount?: number;
  linkCount?: number;
  loadingTime?: number;
  specificInsights: {
    pageSpecificAnalysis: string;
    conversionElements: string[];
    trustSignals: string[];
    callToActions: string[];
    socialProof: string[];
    technicalIssues: string[];
  };
}

export class ContentAnalyzer {
  async analyzeContent(content: string, url: string, pageType: string = 'general'): Promise<ContentAnalysisResult> {
    const startTime = Date.now();
    
    // Extract basic content metrics
    const wordCount = content.split(/\s+/).length;
    const imageCount = (content.match(/<img[^>]*>/gi) || []).length;
    const linkCount = (content.match(/<a[^>]*href[^>]*>/gi) || []).length;
    
    // Analyze Golden Circle
    const goldenCircle = this.analyzeGoldenCircle(content, pageType);
    
    // Analyze Elements of Value
    const elementsOfValue = this.analyzeElementsOfValue(content);
    
    // Analyze CliftonStrengths
    const cliftonStrengths = this.analyzeCliftonStrengths(content);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(content, pageType);
    
    // Calculate overall score
    const overallScore = Math.round(
      (goldenCircle.overallScore + elementsOfValue.overallScore + cliftonStrengths.overallScore) / 3
    );
    
    // Generate summary
    const summary = this.generateSummary(content, goldenCircle, elementsOfValue, cliftonStrengths);
    
    // Generate page-specific insights
    const specificInsights = this.generatePageSpecificInsights(content, pageType);
    
    const loadingTime = Date.now() - startTime;
    
    return {
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      createdAt: new Date().toISOString(),
      goldenCircle,
      elementsOfValue,
      cliftonStrengths,
      recommendations,
      overallScore,
      summary,
      pageType,
      analyzedAt: new Date().toISOString(),
      wordCount,
      imageCount,
      linkCount,
      loadingTime,
      specificInsights
    };
  }

  private analyzeGoldenCircle(content: string, pageType: string) {
    // Extract WHY - Look for mission statements, purpose, values
    const whyText = this.extractWhy(content, pageType);
    
    // Extract HOW - Look for methodologies, processes, approaches
    const howText = this.extractHow(content, pageType);
    
    // Extract WHAT - Look for products, services, solutions
    const whatText = this.extractWhat(content, pageType);
    
    // Extract WHO - Look for testimonials, clients, target audience
    const whoText = this.extractWho(content, pageType);
    
    // Generate insights
    const insights = this.generateGoldenCircleInsights(whyText, howText, whatText, whoText);
    
    // Calculate score based on clarity and specificity
    const overallScore = this.calculateGoldenCircleScore(whyText, howText, whatText, whoText);
    
    return {
      why: {
        statement: whyText,
        source: 'content-analysis',
        score: Math.round(this.scoreElement(content, ['mission', 'purpose', 'values', 'believe', 'vision'])),
        insights: [whyText.includes('not clearly defined') ? 'Purpose and mission need clarification' : 'Clear purpose statement identified']
      },
      how: {
        methodology: howText,
        framework: howText.includes('methodology') ? 'Identified methodology' : 'No specific framework mentioned',
        score: Math.round(this.scoreElement(content, ['methodology', 'process', 'approach', 'framework', 'system'])),
        insights: [howText.includes('not clearly defined') ? 'Methodology needs better definition' : 'Clear approach identified']
      },
      what: {
        offerings: whatText.includes('not clearly defined') ? [] : [whatText],
        categories: whatText.includes('not clearly defined') ? [] : ['Services'],
        score: Math.round(this.scoreElement(content, ['products', 'services', 'solutions', 'offer', 'provide'])),
        insights: [whatText.includes('not clearly defined') ? 'Product/service descriptions need improvement' : 'Clear offerings identified']
      },
      who: {
        testimonials: whoText.includes('not clearly defined') ? [] : [{
          client: 'Client Name',
          company: 'Company Name',
          title: 'Job Title',
          quote: whoText.substring(0, 100) + '...',
          results: 'Success metrics'
        }],
        targetAudience: whoText.includes('not clearly defined') ? 'Target audience not clearly defined' : whoText,
        score: Math.round(this.scoreElement(content, ['testimonials', 'clients', 'customers', 'success', 'growth'])),
        insights: [whoText.includes('not clearly defined') ? 'Client testimonials and target audience need better definition' : 'Clear target audience identified']
      },
      overallScore,
      summary: `Golden Circle analysis shows ${whyText.includes('not clearly defined') ? 'weak' : 'strong'} WHY, ${howText.includes('not clearly defined') ? 'unclear' : 'clear'} HOW, ${whatText.includes('not clearly defined') ? 'vague' : 'specific'} WHAT, and ${whoText.includes('not clearly defined') ? 'undefined' : 'defined'} WHO elements.`
    };
  }

  private extractWhy(content: string, pageType: string): string {
    // Look for mission statements and purpose in hero sections
    const whyPatterns = [
      /(?:we|our|the|this).{0,50}(?:mission|purpose|believe|vision|values|why).{0,100}/gi,
      /(?:innovative|revolutionary|transform|empower|inspire).{0,100}/gi,
      /(?:making|creating|building|delivering).{0,50}(?:better|easier|simpler|more).{0,50}/gi,
      /(?:specialize|focus|dedicated).{0,50}(?:to|on).{0,100}/gi
    ];
    
    let why = '';
    
    for (const pattern of whyPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // Take the first meaningful match and clean it up
        const cleanMatch = matches[0].replace(/\s+/g, ' ').trim();
        if (cleanMatch.length > 20 && cleanMatch.length < 200) {
          why = cleanMatch;
          break;
        }
      }
    }
    
    // Fallback to looking for company descriptions
    if (!why) {
      const companyDesc = content.match(/(?:apple|company|we|our).{0,100}(?:design|create|develop|build|innovate).{0,50}/gi);
      if (companyDesc && companyDesc.length > 0) {
        why = companyDesc[0].replace(/\s+/g, ' ').trim();
      }
    }
    
    return why || 'Purpose and mission not clearly defined in content';
  }

  private extractHow(content: string, pageType: string): string {
    // Look for methodologies, processes, and approaches
    const howPatterns = [
      /(?:methodology|approach|process|framework|system|method).{0,100}/gi,
      /(?:design|create|develop|build|innovate).{0,50}(?:through|using|with).{0,50}/gi,
      /(?:four-phase|step-by-step|systematic).{0,100}/gi,
      /(?:proven|tested|established).{0,50}(?:method|approach|process).{0,50}/gi
    ];
    
    let how = '';
    
    for (const pattern of howPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const cleanMatch = matches[0].replace(/\s+/g, ' ').trim();
        if (cleanMatch.length > 15 && cleanMatch.length < 150) {
          how = cleanMatch;
          break;
        }
      }
    }
    
    // Look for specific methodologies
    const methodologies = content.match(/(Attitude Cycle|IMPROV Sales Methodology|Purpose-Driven Exercise)[^.]*?\./gi);
    if (methodologies) {
      how = methodologies.join(' ');
    }
    
    return how || 'Methodology and approach not clearly defined in content';
  }

  private extractWhat(content: string, pageType: string): string {
    // Look for products, services, and solutions
    const whatPatterns = [
      /(?:products|services|solutions|offer|provide|deliver).{0,100}/gi,
      /(?:iPhone|iPad|Mac|Watch|AirPods|Apple TV).{0,50}/gi,
      /(?:software|hardware|devices|accessories).{0,50}/gi,
      /(?:custom|specialized|professional).{0,50}(?:solutions|services|products).{0,50}/gi
    ];
    
    let what = '';
    
    for (const pattern of whatPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const cleanMatch = matches[0].replace(/\s+/g, ' ').trim();
        if (cleanMatch.length > 10 && cleanMatch.length < 200) {
          what = cleanMatch;
          break;
        }
      }
    }
    
    // Look for specific services
    const services = content.match(/(Human Transformation|Technology Enablement|Revenue Acceleration)[^.]*?\./gi);
    if (services) {
      what = services.join(' ');
    }
    
    // Look for specific offerings
    const offerings = content.match(/(Custom software development|Salesforce implementation|Sales process optimization)[^.]*?\./gi);
    if (offerings) {
      what = offerings.join(' ');
    }
    
    return what || 'Products and services not clearly defined in content';
  }

  private extractWho(content: string, pageType: string): string {
    let who = '';
    
    // Look for testimonials and client names (limit to first 3)
    const testimonials = content.match(/([A-Z][a-z]+ [A-Z][a-z]+)[^.]*?\./gi);
    if (testimonials && testimonials.length > 0) {
      who = testimonials.slice(0, 3).join(' ');
    }
    
    // Look for success metrics (limit to first 2)
    const successMetrics = content.match(/(\d+% growth|\d+% ROI|\d+% increase)[^.]*?\./gi);
    if (successMetrics && successMetrics.length > 0) {
      who += ' ' + successMetrics.slice(0, 2).join(' ');
    }
    
    // Look for target audience
    const targetAudience = content.match(/(businesses|companies|organizations|customers|users).{0,50}/gi);
    if (targetAudience && targetAudience.length > 0) {
      who += ' ' + targetAudience[0].trim();
    }
    
    // Limit total length to prevent overly long responses
    const cleanWho = who.trim();
    if (cleanWho.length > 300) {
      return cleanWho.substring(0, 300) + '...';
    }
    
    return cleanWho || 'Target audience and client testimonials not clearly defined in content';
  }

  private analyzeElementsOfValue(content: string) {
    // Analyze functional elements
    const functional = {
      savesTime: this.scoreElement(content, ['time-saving', 'efficient', 'streamline', 'automate']),
      reducesCost: this.scoreElement(content, ['cost reduction', 'save money', 'affordable', 'ROI']),
      reducesEffort: this.scoreElement(content, ['simplify', 'easy', 'effortless', 'streamlined']),
      reducesRisk: this.scoreElement(content, ['risk reduction', 'secure', 'safe', 'reliable']),
      organizes: this.scoreElement(content, ['organize', 'structure', 'system', 'framework']),
      integrates: this.scoreElement(content, ['integrate', 'connect', 'unify', 'combine']),
      connects: this.scoreElement(content, ['connect', 'network', 'community', 'relationship']),
      quality: this.scoreElement(content, ['quality', 'excellent', 'premium', 'superior']),
      variety: this.scoreElement(content, ['variety', 'diverse', 'multiple', 'range']),
      simplicity: this.scoreElement(content, ['simple', 'clear', 'straightforward', 'easy']),
      convenience: this.scoreElement(content, ['convenient', 'accessible', 'available', 'ready'])
    };

    // Analyze emotional elements
    const emotional = {
      reducesAnxiety: this.scoreElement(content, ['confidence', 'peace', 'security', 'trust']),
      rewards: this.scoreElement(content, ['reward', 'benefit', 'advantage', 'gain']),
      design: this.scoreElement(content, ['design', 'aesthetic', 'beautiful', 'attractive']),
      fun: this.scoreElement(content, ['fun', 'enjoyable', 'engaging', 'exciting']),
      wellness: this.scoreElement(content, ['wellness', 'health', 'wellbeing', 'thrive']),
      belonging: this.scoreElement(content, ['community', 'belonging', 'family', 'team'])
    };

    // Analyze life-changing elements
    const lifeChanging = {
      selfActualization: this.scoreElement(content, ['potential', 'growth', 'transformation', 'development']),
      motivation: this.scoreElement(content, ['motivation', 'inspire', 'empower', 'drive']),
      makesMoney: this.scoreElement(content, ['revenue', 'profit', 'income', 'financial']),
      providesAccess: this.scoreElement(content, ['access', 'opportunity', 'available', 'reach'])
    };

    // Calculate overall scores
    const functionalScore = Math.round(Object.values(functional).reduce((a, b) => a + b, 0) / Object.keys(functional).length);
    const emotionalScore = Math.round(Object.values(emotional).reduce((a, b) => a + b, 0) / Object.keys(emotional).length);
    const lifeChangingScore = Math.round(Object.values(lifeChanging).reduce((a, b) => a + b, 0) / Object.keys(lifeChanging).length);
    
    const overallScore = Math.round((functionalScore + emotionalScore + lifeChangingScore) / 3);

    return {
      functional: {
        savesTime: { score: functional.savesTime, evidence: 'Time-saving language found in content' },
        reducesCost: { score: functional.reducesCost, evidence: 'Cost reduction mentions found' },
        reducesEffort: { score: functional.reducesEffort, evidence: 'Effort reduction language found' },
        reducesRisk: { score: functional.reducesRisk, evidence: 'Risk mitigation language found' },
        organizes: { score: functional.organizes, evidence: 'Organization language found' },
        integrates: { score: functional.integrates, evidence: 'Integration language found' },
        connects: { score: functional.connects, evidence: 'Connection language found' },
        quality: { score: functional.quality, evidence: 'Quality language found' },
        variety: { score: functional.variety, evidence: 'Variety language found' },
        simplicity: { score: functional.simplicity, evidence: 'Simplicity language found' },
        convenience: { score: functional.convenience, evidence: 'Convenience language found' }
      },
      emotional: {
        reducesAnxiety: { score: emotional.reducesAnxiety, evidence: 'Anxiety reduction language found' },
        rewards: { score: emotional.rewards, evidence: 'Reward language found' },
        design: { score: emotional.design, evidence: 'Design language found' },
        fun: { score: emotional.fun, evidence: 'Fun language found' },
        wellness: { score: emotional.wellness, evidence: 'Wellness language found' },
        belonging: { score: emotional.belonging, evidence: 'Belonging language found' }
      },
      lifeChanging: {
        selfActualization: { score: lifeChanging.selfActualization, evidence: 'Self-actualization language found' },
        motivation: { score: lifeChanging.motivation, evidence: 'Motivation language found' },
        makesMoney: { score: lifeChanging.makesMoney, evidence: 'Financial benefit language found' },
        providesAccess: { score: lifeChanging.providesAccess, evidence: 'Access language found' }
      },
      socialImpact: {
        selfActualization: { score: lifeChanging.selfActualization, evidence: 'Social impact language found' },
        motivation: { score: lifeChanging.motivation, evidence: 'Social motivation language found' },
        makesMoney: { score: lifeChanging.makesMoney, evidence: 'Social financial language found' },
        providesAccess: { score: lifeChanging.providesAccess, evidence: 'Social access language found' }
      },
      overallScore,
      topElements: this.getTopElements({ functional, emotional, lifeChanging }),
      summary: `Elements of Value analysis shows ${overallScore}/100 overall alignment with functional, emotional, life-changing, and social impact elements.`
    };
  }

  private analyzeCliftonStrengths(content: string) {
    // Analyze strategic thinking themes
    const strategic = this.scoreElement(content, ['strategic', 'planning', 'vision', 'future', 'analysis']);
    
    // Analyze executing themes
    const executing = this.scoreElement(content, ['implement', 'execute', 'deliver', 'results', 'action']);
    
    // Analyze influencing themes
    const influencing = this.scoreElement(content, ['influence', 'persuade', 'lead', 'inspire', 'motivate']);
    
    // Analyze relationship building themes
    const relationshipBuilding = this.scoreElement(content, ['relationship', 'connect', 'collaborate', 'team', 'community']);

    const overallScore = Math.round((strategic + executing + influencing + relationshipBuilding) / 4);

    return {
      executing: {
        achiever: { score: this.scoreElement(content, ['achieve', 'accomplish', 'complete', 'finish']), evidence: 'Achievement language found' },
        arranger: { score: this.scoreElement(content, ['arrange', 'organize', 'coordinate', 'structure']), evidence: 'Arrangement language found' },
        belief: { score: this.scoreElement(content, ['believe', 'values', 'principles', 'ethics']), evidence: 'Belief language found' },
        consistency: { score: this.scoreElement(content, ['consistent', 'fair', 'equal', 'standard']), evidence: 'Consistency language found' },
        deliberative: { score: this.scoreElement(content, ['careful', 'cautious', 'thoughtful', 'deliberate']), evidence: 'Deliberation language found' },
        discipline: { score: this.scoreElement(content, ['discipline', 'routine', 'structure', 'order']), evidence: 'Discipline language found' },
        focus: { score: this.scoreElement(content, ['focus', 'concentrate', 'priority', 'direction']), evidence: 'Focus language found' },
        responsibility: { score: this.scoreElement(content, ['responsible', 'accountable', 'commitment', 'ownership']), evidence: 'Responsibility language found' },
        restorative: { score: this.scoreElement(content, ['restore', 'fix', 'repair', 'solve']), evidence: 'Restorative language found' }
      },
      influencing: {
        activator: { score: this.scoreElement(content, ['activate', 'start', 'begin', 'initiate']), evidence: 'Activation language found' },
        command: { score: this.scoreElement(content, ['command', 'lead', 'control', 'authority']), evidence: 'Command language found' },
        communication: { score: this.scoreElement(content, ['communicate', 'explain', 'express', 'share']), evidence: 'Communication language found' },
        competition: { score: this.scoreElement(content, ['compete', 'win', 'best', 'superior']), evidence: 'Competition language found' },
        maximizer: { score: this.scoreElement(content, ['maximize', 'excel', 'improve', 'enhance']), evidence: 'Maximization language found' },
        selfAssurance: { score: this.scoreElement(content, ['confident', 'certain', 'assured', 'decisive']), evidence: 'Self-assurance language found' },
        significance: { score: this.scoreElement(content, ['significant', 'important', 'meaningful', 'impact']), evidence: 'Significance language found' },
        woo: { score: this.scoreElement(content, ['woo', 'charm', 'persuade', 'influence']), evidence: 'Woo language found' }
      },
      relationshipBuilding: {
        adaptability: { score: this.scoreElement(content, ['adapt', 'flexible', 'adjust', 'change']), evidence: 'Adaptability language found' },
        connectedness: { score: this.scoreElement(content, ['connect', 'unite', 'together', 'bond']), evidence: 'Connectedness language found' },
        developer: { score: this.scoreElement(content, ['develop', 'grow', 'potential', 'improve']), evidence: 'Development language found' },
        empathy: { score: this.scoreElement(content, ['empathy', 'understand', 'feel', 'compassion']), evidence: 'Empathy language found' },
        harmony: { score: this.scoreElement(content, ['harmony', 'peace', 'agree', 'consensus']), evidence: 'Harmony language found' },
        includer: { score: this.scoreElement(content, ['include', 'welcome', 'accept', 'embrace']), evidence: 'Inclusion language found' },
        individualization: { score: this.scoreElement(content, ['individual', 'unique', 'personal', 'custom']), evidence: 'Individualization language found' },
        positivity: { score: this.scoreElement(content, ['positive', 'optimistic', 'enthusiastic', 'cheerful']), evidence: 'Positivity language found' },
        relator: { score: this.scoreElement(content, ['relate', 'bond', 'close', 'intimate']), evidence: 'Relator language found' }
      },
      strategicThinking: {
        analytical: { score: this.scoreElement(content, ['analyze', 'logic', 'data', 'evidence']), evidence: 'Analytical language found' },
        context: { score: this.scoreElement(content, ['context', 'history', 'background', 'past']), evidence: 'Context language found' },
        futuristic: { score: this.scoreElement(content, ['future', 'vision', 'ahead', 'tomorrow']), evidence: 'Futuristic language found' },
        ideation: { score: this.scoreElement(content, ['idea', 'creative', 'innovative', 'imagine']), evidence: 'Ideation language found' },
        input: { score: this.scoreElement(content, ['input', 'collect', 'gather', 'information']), evidence: 'Input language found' },
        intellection: { score: this.scoreElement(content, ['think', 'intellectual', 'mental', 'cognitive']), evidence: 'Intellection language found' },
        learner: { score: this.scoreElement(content, ['learn', 'study', 'education', 'knowledge']), evidence: 'Learning language found' },
        strategic: { score: this.scoreElement(content, ['strategic', 'plan', 'strategy', 'approach']), evidence: 'Strategic language found' }
      },
      overallScore,
      topThemes: this.getTopThemes({ themes: { strategic, executing, influencing, relationshipBuilding } }),
      summary: `CliftonStrengths analysis shows ${overallScore}/100 overall appeal across executing, influencing, relationship building, and strategic thinking themes.`
    };
  }

  private scoreElement(content: string, keywords: string[]): number {
    let score = 0;
    const contentLower = content.toLowerCase();
    
    for (const keyword of keywords) {
      const matches = contentLower.match(new RegExp(keyword, 'g'));
      if (matches) {
        score += matches.length * 2; // 2 points per match
      }
    }
    
    // Cap at 10
    return Math.min(score, 10);
  }

  private getTopElements(elements: any): string[] {
    const allElements: Array<{name: string, score: number}> = [];
    
    // Add functional elements
    Object.entries(elements.functional).forEach(([key, value]) => {
      allElements.push({ name: key, score: (value as any).score });
    });
    
    // Add emotional elements
    Object.entries(elements.emotional).forEach(([key, value]) => {
      allElements.push({ name: key, score: (value as any).score });
    });
    
    // Add life-changing elements
    Object.entries(elements.lifeChanging).forEach(([key, value]) => {
      allElements.push({ name: key, score: (value as any).score });
    });
    
    // Sort by score and return top 5
    return allElements
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(el => `${el.name}: ${el.score}/10`);
  }

  private getTopThemes(strengths: any): string[] {
    const allThemes: Array<{name: string, score: number}> = [];
    
    // Add all theme categories
    Object.entries(strengths.executing).forEach(([key, value]) => {
      allThemes.push({ name: key, score: (value as any).score });
    });
    Object.entries(strengths.influencing).forEach(([key, value]) => {
      allThemes.push({ name: key, score: (value as any).score });
    });
    Object.entries(strengths.relationshipBuilding).forEach(([key, value]) => {
      allThemes.push({ name: key, score: (value as any).score });
    });
    Object.entries(strengths.strategicThinking).forEach(([key, value]) => {
      allThemes.push({ name: key, score: (value as any).score });
    });
    
    // Sort by score and return top 10
    return allThemes
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(theme => `${theme.name}: ${theme.score}/10`);
  }

  private generateRecommendations(content: string, pageType: string) {
    const highPriority = [];
    const mediumPriority = [];
    const lowPriority = [];
    
    // Check for missing elements
    if (!content.includes('mission') && !content.includes('purpose')) {
      highPriority.push({
        category: 'Golden Circle',
        title: 'Strengthen WHY Statement',
        description: 'Define a clear, compelling mission statement that explains why the company exists',
        actionItems: ['Write a clear mission statement', 'Add purpose-driven language to hero section'],
        expectedImpact: 'Improved brand clarity and emotional connection',
        effort: 'Medium',
        timeline: '1-2 weeks'
      });
    }
    
    if (!content.includes('methodology') && !content.includes('process')) {
      highPriority.push({
        category: 'Golden Circle',
        title: 'Define HOW Methodology',
        description: 'Create a clear methodology or process that differentiates your approach',
        actionItems: ['Document your unique process', 'Add methodology section to website'],
        expectedImpact: 'Better differentiation and credibility',
        effort: 'Medium',
        timeline: '1-2 weeks'
      });
    }
    
    if (!content.includes('testimonial') && !content.includes('client')) {
      mediumPriority.push({
        category: 'Golden Circle',
        title: 'Add Client Testimonials',
        description: 'Include specific client testimonials and success stories to build trust',
        actionItems: ['Collect client testimonials', 'Add testimonials section'],
        expectedImpact: 'Increased trust and credibility',
        effort: 'Low',
        timeline: 'Immediate'
      });
    }
    
    if (!content.includes('contact') && !content.includes('phone')) {
      mediumPriority.push({
        category: 'Content',
        title: 'Improve Contact Information',
        description: 'Make contact information easily accessible for potential clients',
        actionItems: ['Add contact section', 'Include phone and email'],
        expectedImpact: 'Better lead generation',
        effort: 'Low',
        timeline: 'Immediate'
      });
    }
    
    if (!content.includes('call to action') && !content.includes('get started')) {
      mediumPriority.push({
        category: 'Content',
        title: 'Add Call-to-Action Buttons',
        description: 'Include clear call-to-action buttons to guide visitors to next steps',
        actionItems: ['Add CTA buttons', 'Create conversion paths'],
        expectedImpact: 'Improved conversion rates',
        effort: 'Low',
        timeline: '1-2 weeks'
      });
    }
    
    // Page-specific recommendations
    if (pageType === 'home') {
      lowPriority.push({
        category: 'Content',
        title: 'Optimize Hero Section',
        description: 'Ensure hero section clearly communicates value proposition',
        actionItems: ['Review hero messaging', 'Add value proposition'],
        expectedImpact: 'Better first impression',
        effort: 'Low',
        timeline: '1-2 weeks'
      });
    }
    
    if (pageType === 'testimonials') {
      lowPriority.push({
        category: 'Content',
        title: 'Enhance Testimonials',
        description: 'Include specific metrics and results in testimonials',
        actionItems: ['Add success metrics', 'Include client photos and logos'],
        expectedImpact: 'More credible testimonials',
        effort: 'Low',
        timeline: '1-2 weeks'
      });
    }
    
    return {
      highPriority,
      mediumPriority,
      lowPriority,
      summary: 'Focus on strengthening the WHY statement and defining your methodology for maximum impact.',
      nextSteps: ['Define clear mission statement', 'Document your methodology', 'Add client testimonials']
    };
  }

  private generateSummary(content: string, goldenCircle: any, elementsOfValue: any, cliftonStrengths: any): string {
    const wordCount = content.split(/\s+/).length;
    const hasTestimonials = content.includes('testimonial') || content.includes('client');
    const hasContact = content.includes('contact') || content.includes('phone');
    const hasCTA = content.includes('call to action') || content.includes('get started');
    
    return `This ${wordCount}-word content analysis reveals a ${goldenCircle.overallScore}/100 Golden Circle score with ${elementsOfValue.overallScore}/100 Elements of Value alignment. The content ${hasTestimonials ? 'includes' : 'lacks'} client testimonials, ${hasContact ? 'provides' : 'missing'} contact information, and ${hasCTA ? 'features' : 'needs'} clear call-to-action elements. The messaging appeals to ${cliftonStrengths.overallScore}/100 CliftonStrengths themes, suggesting strong ${cliftonStrengths.executing > 7 ? 'execution-focused' : 'strategic'} positioning.`;
  }

  private generatePageSpecificInsights(content: string, pageType: string) {
    return {
      pageSpecificAnalysis: `Comprehensive analysis of ${pageType} page focusing on conversion optimization and user experience`,
      conversionElements: this.extractConversionElements(content),
      trustSignals: this.extractTrustSignals(content),
      callToActions: this.extractCallToActions(content),
      socialProof: this.extractSocialProof(content),
      technicalIssues: this.identifyTechnicalIssues(content)
    };
  }

  private extractConversionElements(content: string): string[] {
    const elements: string[] = [];
    
    if (content.includes('get started')) elements.push('Get Started button');
    if (content.includes('contact')) elements.push('Contact form');
    if (content.includes('schedule')) elements.push('Schedule consultation');
    if (content.includes('learn more')) elements.push('Learn More links');
    if (content.includes('download')) elements.push('Download resources');
    
    return elements;
  }

  private extractTrustSignals(content: string): string[] {
    const signals: string[] = [];
    
    if (content.includes('certification')) signals.push('Professional certifications');
    if (content.includes('experience')) signals.push('Years of experience');
    if (content.includes('client')) signals.push('Client testimonials');
    if (content.includes('award')) signals.push('Awards and recognition');
    if (content.includes('guarantee')) signals.push('Money-back guarantee');
    
    return signals;
  }

  private extractCallToActions(content: string): string[] {
    const ctas: string[] = [];
    
    const ctaPatterns = [
      /get started/gi,
      /contact us/gi,
      /learn more/gi,
      /schedule/gi,
      /download/gi,
      /sign up/gi
    ];
    
    for (const pattern of ctaPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        ctas.push(...matches.map(m => m.charAt(0).toUpperCase() + m.slice(1)));
      }
    }
    
    return [...new Set(ctas)]; // Remove duplicates
  }

  private extractSocialProof(content: string): string[] {
    const proof: string[] = [];
    
    if (content.includes('testimonial')) proof.push('Client testimonials');
    if (content.includes('case study')) proof.push('Case studies');
    if (content.includes('client logo')) proof.push('Client logos');
    if (content.includes('success story')) proof.push('Success stories');
    if (content.includes('growth')) proof.push('Growth metrics');
    
    return proof;
  }

  private identifyTechnicalIssues(content: string): string[] {
    const issues: string[] = [];
    
    if (!content.includes('meta description')) issues.push('Missing meta description');
    if (!content.includes('alt=')) issues.push('Images missing alt text');
    if (content.length < 300) issues.push('Content too short for SEO');
    if (!content.includes('heading')) issues.push('Missing proper heading structure');
    
    return issues;
  }

  private generateGoldenCircleInsights(why: string, how: string, what: string, who: string): string[] {
    const insights: string[] = [];
    
    if (why.length > 50) insights.push('Strong WHY statement with clear purpose');
    if (how.length > 50) insights.push('Well-defined methodology and approach');
    if (what.length > 50) insights.push('Clear product and service offerings');
    if (who.length > 50) insights.push('Good client testimonials and target audience definition');
    
    return insights;
  }

  private generateElementsOfValueInsights(functional: any, emotional: any, lifeChanging: any): string[] {
    const insights: string[] = [];
    
    if (functional.savesTime > 7) insights.push('Strong time-saving value proposition');
    if (emotional.reducesAnxiety > 7) insights.push('Good anxiety reduction messaging');
    if (lifeChanging.selfActualization > 7) insights.push('Strong transformation messaging');
    
    return insights;
  }

  private generateCliftonStrengthsInsights(strategic: number, executing: number, influencing: number, relationshipBuilding: number): string[] {
    const insights: string[] = [];
    
    if (strategic > 7) insights.push('Appeals to strategic thinkers');
    if (executing > 7) insights.push('Resonates with execution-focused individuals');
    if (influencing > 7) insights.push('Strong influence and leadership appeal');
    if (relationshipBuilding > 7) insights.push('Good relationship-building messaging');
    
    return insights;
  }

  private calculateGoldenCircleScore(why: string, how: string, what: string, who: string): number {
    let score = 0;
    
    if (why.length > 50) score += 25;
    if (how.length > 50) score += 25;
    if (what.length > 50) score += 25;
    if (who.length > 50) score += 25;
    
    return Math.min(score, 100);
  }
}

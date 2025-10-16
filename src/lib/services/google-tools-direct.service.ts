/**
 * Google Tools Direct Service
 * Provides direct links to Google Tools and automated data extraction
 * No APIs needed - uses direct tool access and Puppeteer
 */

export interface GoogleToolLink {
  name: string;
  url: string;
  description: string;
  icon: string;
}

export interface GoogleToolsData {
  trends?: any;
  pageSpeed?: any;
  searchConsole?: any;
  analytics?: any;
}

export class GoogleToolsDirectService {
  /**
   * Get direct links to Google Tools with URL pre-filled
   */
  static getToolLinks(url: string, keywords: string[] = []): GoogleToolLink[] {
    const domain = this.extractDomain(url);
    const keywordString = keywords.length > 0 ? keywords.join(',') : this.extractKeywordsFromUrl(url);

    return [
      {
        name: 'Google Trends',
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(keywordString)}`,
        description: 'Analyze search trends and related queries for market opportunities',
        icon: '📈'
      },
      {
        name: 'PageSpeed Insights',
        url: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`,
        description: 'Check website performance and Core Web Vitals',
        icon: '⚡'
      },
      {
        name: 'Google Search Console',
        url: `https://search.google.com/search-console/performance/search-analytics?resource_id=${encodeURIComponent(`sc-domain:${domain}`)}`,
        description: 'Analyze search performance and ranking data',
        icon: '🔍'
      },
      {
        name: 'Google Analytics',
        url: `https://analytics.google.com/analytics/web/`,
        description: 'View website traffic and conversion data',
        icon: '📊'
      }
    ];
  }

  /**
   * Extract domain from URL
   */
  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  /**
   * Extract keywords from URL (basic implementation)
   */
  private static extractKeywordsFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/\.(com|org|net|co|io)$/, '');
      return domain.split(/[.-]/).join(' ');
    } catch {
      return url;
    }
  }

  /**
   * Get manual data input prompts for each tool
   */
  static getDataInputPrompts(): Record<string, string> {
    return {
      trends: `Please paste the Google Trends data you want analyzed. Include:
- Related queries and their interest levels
- Related topics and their interest levels
- Any specific trends data you want analyzed

Format: You can paste the data in any format - I'll extract the relevant information.`,

      pageSpeed: `Please paste the PageSpeed Insights data you want analyzed. Include:
- Core Web Vitals scores (LCP, FID, CLS)
- Performance score
- Opportunities for improvement
- Any specific metrics you want analyzed

Format: You can paste the data in any format - I'll extract the relevant information.`,

      searchConsole: `Please paste the Google Search Console data you want analyzed. Include:
- Query performance data (queries, impressions, clicks, position)
- Page performance data
- Any specific search data you want analyzed

Format: You can paste the data in any format - I'll extract the relevant information.`,

      analytics: `Please paste the Google Analytics data you want analyzed. Include:
- Landing page performance (sessions, bounce rate, revenue)
- Conversion data
- Traffic sources
- Any specific analytics data you want analyzed

Format: You can paste the data in any format - I'll extract the relevant information.`
    };
  }

  /**
   * Generate PTCF prompts for each tool
   */
  static getPTCFPrompts(): Record<string, any> {
    return {
      trends: {
        persona: `You are a Senior Content Strategy Director. Your goal is to find underserved market demand for the client.`,
        task: `Analyze the "Related Topics" and "Related Queries" data provided. Identify one high-growth/low-competition topic and generate three specific, revenue-driving content ideas that directly address that emerging search intent.`,
        context: `[PASTE Trends Data for Core Keywords & Related Queries/Topics]`,
        format: `Present as a "Client Revenue Opportunity Brief" with a clear Subject, the identified Topic, and a bulleted list of 3 content titles and their primary target audience (e.g., "Beginner B2B").`
      },
      analytics: {
        persona: `You are a Conversion Rate Optimization (CRO) Lead for an e-commerce client.`,
        task: `Analyze the following data (Sessions, Bounce Rate, Revenue per Session). Identify the Top 2 pages where improving the Bounce Rate by 15% would yield the highest revenue lift. For those 2 pages, recommend a specific A/B test hypothesis focused on increasing conversion rate.`,
        context: `[PASTE Landing Page Data Table including Sessions, Bounce Rate, and Revenue/Conversion Rate]`,
        format: `Provide a "High-Impact CRO Priority List." Use a numbered list for the 2 pages. For each, include: 1) Calculated Revenue Lift Potential (e.g., "High"), and 2) The A/B Test Hypothesis (e.g., "Change CTA button color to green to test urgency").`
      },
      searchConsole: {
        persona: `You are a Bottom-of-Funnel SEO Specialist. Your primary objective is to acquire high-intent, paying customers.`,
        task: `Analyze the provided GSC data (Query, Impressions, Clicks, Position). Filter this list to find Top 5 transactional/commercial queries (queries containing words like 'best', 'cost', 'pricing', 'vs') with a Position between 11 and 25. For each query, suggest a specific, revenue-focused page title and a one-sentence content update to push it to Page 1.`,
        context: `[PASTE GSC Queries Table with Clicks, Impressions, and Average Position]`,
        format: `Present the data as a Table with columns for: Query, Current Position, New Revenue-Focused Title, and Proposed Content Update.`
      },
      pageSpeed: {
        persona: `You are a DevOps Lead focused on reducing friction and protecting conversion rates.`,
        task: `Analyze the PageSpeed Insights report and focus on the Largest Contentful Paint (LCP) metric, as this most impacts user perception. Identify the Top 2 "Opportunities" that offer the greatest LCP time saving (as listed in the report) and assign them a development effort level (Low, Medium, High).`,
        context: `[PASTE LCP score, all Core Web Vitals, and the top 5 "Opportunities" with their estimated time savings (if available)]`,
        format: `Provide an "ROI-Prioritized Performance Plan." Use a numbered list for the 2 fixes, including: 1) The Opportunity, 2) Estimated Time Saved (ms), and 3) Estimated Dev Effort (Low/Medium/High).`
      }
    };
  }
}

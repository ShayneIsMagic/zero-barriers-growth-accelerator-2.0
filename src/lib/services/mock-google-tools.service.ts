/**
 * Mock Google Tools Service
 * Provides simulated data for Google Tools when Puppeteer isn't available
 */

export interface GoogleTrendsData {
  relatedQueries: Array<{
    query: string;
    value: number;
    type: 'rising' | 'top';
  }>;
  relatedTopics: Array<{
    topic: string;
    value: number;
    type: 'rising' | 'top';
  }>;
  interestOverTime: Array<{
    date: string;
    value: number;
  }>;
  geoData: Array<{
    location: string;
    value: number;
  }>;
}

export interface PageSpeedData {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  opportunities: Array<{
    title: string;
    description: string;
    impact: string;
    savings: string;
  }>;
  diagnostics: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
}

export interface SearchConsoleData {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export interface AnalyticsData {
  sessions: number;
  users: number;
  pageViews: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: Array<{
    page: string;
    pageViews: number;
    uniquePageViews: number;
    avgTimeOnPage: number;
  }>;
  trafficSources: Array<{
    source: string;
    sessions: number;
    percentage: number;
  }>;
}

export class MockGoogleToolsService {
  /**
   * Generate mock Google Trends data
   */
  static generateTrendsData(keywords: string[]): GoogleTrendsData {
    const baseQueries = [
      'website optimization',
      'digital marketing',
      'online presence',
      'business growth',
      'customer engagement'
    ];

    const relatedQueries = baseQueries.map((query, index) => ({
      query,
      value: Math.floor(Math.random() * 100) + 20,
      type: index < 3 ? 'rising' as const : 'top' as const
    }));

    const relatedTopics = [
      'Digital Marketing',
      'Website Design',
      'SEO',
      'Online Business',
      'E-commerce'
    ].map((topic, index) => ({
      topic,
      value: Math.floor(Math.random() * 100) + 30,
      type: index < 2 ? 'rising' as const : 'top' as const
    }));

    // Generate interest over time data for the last 12 months
    const interestOverTime = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      interestOverTime.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 10
      });
    }

    const geoData = [
      { location: 'United States', value: 85 },
      { location: 'Canada', value: 45 },
      { location: 'United Kingdom', value: 60 },
      { location: 'Australia', value: 35 },
      { location: 'Germany', value: 40 }
    ];

    return {
      relatedQueries,
      relatedTopics,
      interestOverTime,
      geoData
    };
  }

  /**
   * Generate mock PageSpeed data
   */
  static generatePageSpeedData(url: string): PageSpeedData {
    const performanceScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const accessibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const bestPracticesScore = Math.floor(Math.random() * 20) + 80; // 80-100
    const seoScore = Math.floor(Math.random() * 25) + 75; // 75-100

    const opportunities = [
      {
        title: 'Eliminate render-blocking resources',
        description: 'Remove unused CSS and JavaScript to improve page load speed',
        impact: 'High',
        savings: '2.5s'
      },
      {
        title: 'Optimize images',
        description: 'Compress and resize images to reduce file sizes',
        impact: 'Medium',
        savings: '1.2s'
      },
      {
        title: 'Enable text compression',
        description: 'Use gzip or brotli compression for text resources',
        impact: 'Medium',
        savings: '0.8s'
      }
    ];

    const diagnostics = [
      {
        title: 'Avoid large layout shifts',
        description: 'Ensure images and ads have defined dimensions',
        impact: 'Medium'
      },
      {
        title: 'Serve images in next-gen formats',
        description: 'Use WebP or AVIF formats for better compression',
        impact: 'Low'
      }
    ];

    return {
      performanceScore,
      accessibilityScore,
      bestPracticesScore,
      seoScore,
      coreWebVitals: {
        lcp: Math.random() * 2.5 + 1.0, // 1.0-3.5s
        fid: Math.random() * 100 + 10, // 10-110ms
        cls: Math.random() * 0.25 + 0.05 // 0.05-0.30
      },
      opportunities,
      diagnostics
    };
  }

  /**
   * Generate mock Search Console data
   */
  static generateSearchConsoleData(domain: string): SearchConsoleData {
    const totalClicks = Math.floor(Math.random() * 10000) + 1000;
    const totalImpressions = Math.floor(Math.random() * 100000) + 10000;
    const averageCtr = Math.random() * 5 + 1; // 1-6%
    const averagePosition = Math.random() * 20 + 5; // 5-25

    const topQueries = [
      'website design',
      'digital marketing',
      'online business',
      'web development',
      'SEO services'
    ].map((query, index) => ({
      query,
      clicks: Math.floor(Math.random() * 500) + 50,
      impressions: Math.floor(Math.random() * 5000) + 500,
      ctr: Math.random() * 10 + 1,
      position: Math.random() * 15 + 1
    }));

    const topPages = [
      '/',
      '/about',
      '/services',
      '/contact',
      '/blog'
    ].map((page, index) => ({
      page,
      clicks: Math.floor(Math.random() * 300) + 30,
      impressions: Math.floor(Math.random() * 3000) + 300,
      ctr: Math.random() * 8 + 1,
      position: Math.random() * 12 + 1
    }));

    return {
      totalClicks,
      totalImpressions,
      averageCtr,
      averagePosition,
      topQueries,
      topPages
    };
  }

  /**
   * Generate mock Analytics data
   */
  static generateAnalyticsData(domain: string): AnalyticsData {
    const sessions = Math.floor(Math.random() * 5000) + 1000;
    const users = Math.floor(sessions * 0.8);
    const pageViews = Math.floor(sessions * 2.5);
    const bounceRate = Math.random() * 30 + 20; // 20-50%
    const averageSessionDuration = Math.random() * 300 + 60; // 60-360 seconds

    const topPages = [
      { page: '/', pageViews: Math.floor(Math.random() * 1000) + 500, uniquePageViews: Math.floor(Math.random() * 800) + 400, avgTimeOnPage: Math.random() * 180 + 60 },
      { page: '/about', pageViews: Math.floor(Math.random() * 300) + 100, uniquePageViews: Math.floor(Math.random() * 250) + 80, avgTimeOnPage: Math.random() * 120 + 30 },
      { page: '/services', pageViews: Math.floor(Math.random() * 400) + 150, uniquePageViews: Math.floor(Math.random() * 320) + 120, avgTimeOnPage: Math.random() * 150 + 45 },
      { page: '/contact', pageViews: Math.floor(Math.random() * 200) + 50, uniquePageViews: Math.floor(Math.random() * 160) + 40, avgTimeOnPage: Math.random() * 90 + 30 },
      { page: '/blog', pageViews: Math.floor(Math.random() * 600) + 200, uniquePageViews: Math.floor(Math.random() * 480) + 160, avgTimeOnPage: Math.random() * 200 + 60 }
    ];

    const trafficSources = [
      { source: 'Organic Search', sessions: Math.floor(sessions * 0.4), percentage: 40 },
      { source: 'Direct', sessions: Math.floor(sessions * 0.25), percentage: 25 },
      { source: 'Social Media', sessions: Math.floor(sessions * 0.15), percentage: 15 },
      { source: 'Referral', sessions: Math.floor(sessions * 0.12), percentage: 12 },
      { source: 'Email', sessions: Math.floor(sessions * 0.08), percentage: 8 }
    ];

    return {
      sessions,
      users,
      pageViews,
      bounceRate,
      averageSessionDuration,
      topPages,
      trafficSources
    };
  }

  /**
   * Generate all mock Google Tools data
   */
  static generateAllGoogleToolsData(url: string, keywords: string[] = []): {
    trends: GoogleTrendsData;
    pageSpeed: PageSpeedData;
    searchConsole: SearchConsoleData;
    analytics: AnalyticsData;
  } {
    const domain = new URL(url).hostname;
    const keywordArray = keywords.length > 0 ? keywords : this.extractKeywordsFromUrl(url);

    return {
      trends: this.generateTrendsData(keywordArray),
      pageSpeed: this.generatePageSpeedData(url),
      searchConsole: this.generateSearchConsoleData(domain),
      analytics: this.generateAnalyticsData(domain)
    };
  }

  /**
   * Extract keywords from URL
   */
  private static extractKeywordsFromUrl(url: string): string[] {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/\.(com|org|net|co|io)$/, '');
      return domain.split(/[.-]/).filter(word => word.length > 2);
    } catch {
      return ['website', 'business', 'online'];
    }
  }
}

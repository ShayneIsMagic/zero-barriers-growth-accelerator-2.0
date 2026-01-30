import { prisma } from '@/lib/prisma';

export interface StoredContentData {
  id: string;
  url: string;
  title: string | null;
  content: any; // Parsed JSON or string
  metadata: any;
  createdAt: Date;
}

export class ContentStorageService {
  /**
   * Get the latest content snapshot for a URL
   */
  static async getLatestSnapshot(
    url: string,
    userId: string
  ): Promise<StoredContentData | null> {
    try {
      const snapshot = await prisma.contentSnapshot.findFirst({
        where: {
          url,
          userId,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!snapshot) {
        return null;
      }

      return {
        id: snapshot.id,
        url: snapshot.url,
        title: snapshot.title,
        content:
          typeof snapshot.content === 'string'
            ? JSON.parse(snapshot.content)
            : snapshot.content,
        metadata: snapshot.metadata as any,
        createdAt: snapshot.createdAt,
      };
    } catch (error) {
      console.error('Failed to get content snapshot:', error);
      return null;
    }
  }

  /**
   * Store comprehensive scraped data
   */
  static async storeComprehensiveData(
    url: string,
    comprehensiveData: any,
    userId: string,
    title?: string
  ): Promise<string | null> {
    try {
      // Ensure allKeywords is properly typed as string array
      const allKeywordsArray: string[] = Array.from(
        new Set(
          comprehensiveData.pages?.flatMap(
            (p: any) => p.keywords?.allKeywords || []
          ) || []
        )
      ) as string[];

      const metadata = {
        pagesScraped: comprehensiveData.pages?.length || 0,
        totalWords: comprehensiveData.content?.totalWords || 0,
        seoScore: comprehensiveData.seo?.overallScore || 0,
        performanceScore: comprehensiveData.performance?.overallScore || 0,
        ga4Ids: (comprehensiveData.pages
          ?.flatMap(
            (p: any) => p.analytics?.googleAnalytics4?.measurementIds || []
          )
          .filter(Boolean) || []) as string[],
        gtmIds: (comprehensiveData.pages
          ?.flatMap(
            (p: any) =>
              p.analytics?.googleTagManager?.containerIds || []
          )
          .filter(Boolean) || []) as string[],
        allKeywords: allKeywordsArray,
        scrapedAt: new Date().toISOString(),
        collector: 'PuppeteerComprehensiveCollector',
      };

      const snapshot = await prisma.contentSnapshot.create({
        data: {
          url,
          title: title || comprehensiveData.pages?.[0]?.title || url,
          content: JSON.stringify(comprehensiveData),
          metadata: metadata as any, // Prisma Json type - properly typed object
          userId,
        },
      });

      return snapshot.id;
    } catch (error) {
      console.error('Failed to store comprehensive data:', error);
      return null;
    }
  }

  /**
   * Get SEO metadata from stored snapshot
   */
  static async getSEOMetadata(
    url: string,
    userId: string
  ): Promise<{
    metaTags: any;
    keywords: any;
    analytics: any;
  } | null> {
    const snapshot = await this.getLatestSnapshot(url, userId);
    if (!snapshot) return null;

    const firstPage = snapshot.content.pages?.[0];
    return {
      metaTags: firstPage?.metaTags || {},
      keywords: firstPage?.keywords || {},
      analytics: firstPage?.analytics || {},
    };
  }

  /**
   * Get all keywords from stored snapshot
   */
  static async getAllKeywords(
    url: string,
    userId: string
  ): Promise<string[]> {
    const snapshot = await this.getLatestSnapshot(url, userId);
    if (!snapshot) return [];

    return (snapshot.metadata?.allKeywords as string[]) || [];
  }

  /**
   * Get GA4 measurement IDs from stored snapshot
   */
  static async getGA4Ids(url: string, userId: string): Promise<string[]> {
    const snapshot = await this.getLatestSnapshot(url, userId);
    if (!snapshot) return [];

    return (snapshot.metadata?.ga4Ids as string[]) || [];
  }
}


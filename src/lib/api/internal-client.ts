/**
 * Internal API Client
 * Wraps internal API calls within the same Next.js application
 * Uses the WORKING Content Comparison API to avoid duplicate logic
 */

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  'http://localhost:3000';

/**
 * Get scraped content using the working /api/analyze/compare endpoint
 * This prevents code duplication and ensures all routes use the same scraper
 */
export class InternalApiClient {
  /**
   * Get scraped content for a website URL
   * Delegates to the working /api/analyze/compare route
   */
  static async getScrapedContent(
    websiteUrl: string,
    proposedContent?: string
  ): Promise<{
    existingContent: any;
    proposedContent: any | null;
    url: string;
  }> {
    console.log(
      `📞 [InternalAPI] Calling /api/analyze/compare for ${websiteUrl}`
    );

    const startTime = Date.now();

    try {
      // Call the working comparison API
      const response = await fetch(`${baseUrl}/api/analyze/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: websiteUrl,
          proposedContent: proposedContent || '',
          analysisType: 'scrape-only', // Just get scraped content, no AI analysis yet
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get scraped content: ${response.statusText}`
        );
      }

      const data = await response.json();

      const elapsed = Date.now() - startTime;

      console.log(
        `✅ [InternalAPI] Got scraped content in ${elapsed}ms`
      );
      console.log(
        `   → ${data.existing?.wordCount || 0} words, ${data.existing?.title || 'No title'}`
      );

      return {
        existingContent: data.existing,
        proposedContent: data.proposed || null,
        url: websiteUrl,
      };
    } catch (error) {
      console.error('[InternalAPI] Error getting scraped content:', error);
      throw error;
    }
  }

  /**
   * Check if the internal API is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.warn('[InternalAPI] Health check failed:', error);
      return false;
    }
  }
}


// Client-side analysis system - REAL AI ANALYSIS ONLY
export interface AnalysisResult {
  id: string;
  url: string;
  overallScore: number;
  summary: string;
  status: 'completed' | 'running' | 'failed';
  timestamp: string;
  goldenCircle: {
    why: string;
    how: string;
    what: string;
    overallScore: number;
    insights: string[];
  };
  elementsOfValue: {
    functional: { [key: string]: number };
    emotional: { [key: string]: number };
    lifeChanging: { [key: string]: number };
    socialImpact: { [key: string]: number };
    overallScore: number;
    insights: string[];
  };
  cliftonStrengths: {
    themes: string[];
    recommendations: string[];
    overallScore: number;
    insights: string[];
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    actionItems: string[];
  }[];
}

export class AnalysisClient {
  private static readonly STORAGE_KEY = 'zero-barriers-analyses';

  // Get all saved analyses from localStorage
  static getAnalyses(): AnalysisResult[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading analyses:', error);
      return [];
    }
  }

  // Save analysis to localStorage
  static saveAnalysis(analysis: AnalysisResult): void {
    if (typeof window === 'undefined') return;

    try {
      const analyses = this.getAnalyses();
      const existingIndex = analyses.findIndex((a) => a.id === analysis.id);

      if (existingIndex >= 0) {
        analyses[existingIndex] = analysis;
      } else {
        analyses.unshift(analysis); // Add to beginning
      }

      // Keep only last 50 analyses
      const limitedAnalyses = analyses.slice(0, 50);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedAnalyses));
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }

  // Delete analysis from localStorage
  static deleteAnalysis(analysisId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const analyses = this.getAnalyses();
      const filteredAnalyses = analyses.filter((a) => a.id !== analysisId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredAnalyses));
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  }

  // Analyze website with REAL AI ONLY - NO DEMO DATA
  static async analyzeWebsite(url: string): Promise<AnalysisResult> {
    try {
      // Test API connectivity first
      const connectivity = await this.testAPIConnectivity();

      // REQUIRE real AI analysis - NO fallbacks to demo data
      if (!connectivity.gemini && !connectivity.claude) {
        throw new Error(
          'AI_SERVICE_UNAVAILABLE: No AI services available. Please run "npm run setup:ai" to configure AI services.'
        );
      }

      // Fetch website content
      const content = await this.fetchWebsiteContent(url);

      // Use real AI analysis only
      const analysis = await this.analyzeWithAI(url, content);
      this.saveAnalysis(analysis);
      return analysis;
    } catch (error) {
      // NO demo fallbacks - throw error if real AI fails
      console.error('Real AI analysis failed:', error);
      throw new Error(
        `Real AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. No demo data available.`
      );
    }
  }

  // Test API connectivity
  private static async testAPIConnectivity(): Promise<{
    gemini: boolean;
    claude: boolean;
  }> {
    try {
      const response = await fetch('/api/analyze/connectivity');
      if (response.ok) {
        const result = await response.json();
        return result.connectivity || { gemini: false, claude: false };
      }
    } catch (error) {
      console.error('Connectivity test failed:', error);
    }
    return { gemini: false, claude: false };
  }

  // Fetch website content
  private static async fetchWebsiteContent(url: string): Promise<string> {
    try {
      const response = await fetch(
        `/api/scrape?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }
      const data = await response.json();
      return data.content || '';
    } catch (error) {
      console.error('Error fetching website content:', error);
      throw new Error(
        `Failed to fetch website content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Analyze content with REAL AI ONLY
  private static async analyzeWithAI(
    url: string,
    content: string
  ): Promise<AnalysisResult> {
    try {
      // Use real AI analysis only - no demo data allowed
      const { performRealAnalysis } = await import('./free-ai-analysis');
      const websiteResult = await performRealAnalysis(url, 'full');

      // Convert WebsiteAnalysisResult to AnalysisResult
      return {
        id: websiteResult.id,
        url: websiteResult.url,
        overallScore: websiteResult.overallScore,
        summary: websiteResult.executiveSummary || 'Analysis completed',
        status: 'completed' as const,
        timestamp: websiteResult.createdAt || new Date().toISOString(),
        goldenCircle: websiteResult.goldenCircle
          ? {
              why:
                websiteResult.goldenCircle.why?.currentState || 'Not analyzed',
              how:
                websiteResult.goldenCircle.how?.currentState || 'Not analyzed',
              what:
                websiteResult.goldenCircle.what?.currentState || 'Not analyzed',
              overallScore: websiteResult.goldenCircle.overallScore || 0,
              insights: websiteResult.goldenCircle.why?.recommendations || [],
            }
          : {
              why: 'Not analyzed',
              how: 'Not analyzed',
              what: 'Not analyzed',
              overallScore: 0,
              insights: [],
            },
        elementsOfValue: websiteResult.elementsOfValue
          ? {
              functional: {},
              emotional: {},
              lifeChanging: {},
              socialImpact: {},
              overallScore: websiteResult.elementsOfValue.overallScore || 0,
              insights: [],
            }
          : {
              functional: {},
              emotional: {},
              lifeChanging: {},
              socialImpact: {},
              overallScore: 0,
              insights: [],
            },
        cliftonStrengths: websiteResult.cliftonStrengths
          ? {
              themes: [],
              recommendations: [],
              overallScore: websiteResult.cliftonStrengths.overallScore || 0,
              insights: [],
            }
          : {
              themes: [],
              recommendations: [],
              overallScore: 0,
              insights: [],
            },
        recommendations: websiteResult.recommendations
          ? Object.entries(websiteResult.recommendations).map(
              ([category, items]) => ({
                priority:
                  category === 'immediate'
                    ? ('high' as const)
                    : category === 'shortTerm'
                      ? ('medium' as const)
                      : ('low' as const),
                category,
                description: `${category} recommendations`,
                actionItems: items,
              })
            )
          : [],
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error(
        `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

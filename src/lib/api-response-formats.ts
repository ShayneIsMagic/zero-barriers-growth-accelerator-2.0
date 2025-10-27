/**
 * Standardized API Response Formats
 * Ensures consistent JSON structure across all analysis APIs
 */

export interface StandardAnalysisResponse {
  success: boolean;
  existing: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
    url: string;
  };
  proposed?: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
  };
  analysis: string; // The main analysis result as a formatted string
  message: string;
  error?: string;
  details?: string;
}

export interface B2CAnalysisResult {
  success: boolean;
  existing: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
    url: string;
  };
  proposed?: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
  };
  analysis: string;
  message: string;
}

export interface B2BAnalysisResult {
  success: boolean;
  existing: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
    url: string;
  };
  proposed?: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
  };
  analysis: string;
  message: string;
}

export interface CliftonStrengthsAnalysisResult {
  success: boolean;
  existing: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
    url: string;
  };
  proposed?: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
  };
  analysis: string;
  message: string;
}

export interface GoldenCircleAnalysisResult {
  success: boolean;
  existing: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
    url: string;
  };
  proposed?: {
    title: string;
    metaDescription: string;
    wordCount: number;
    extractedKeywords: string[];
    headings: string[];
    cleanText: string;
  };
  analysis: string;
  message: string;
}

/**
 * Create a standardized analysis response
 */
export function createAnalysisResponse(
  existing: any,
  proposed: any,
  analysis: string,
  message: string
): StandardAnalysisResponse {
  return {
    success: true,
    existing: {
      title: existing.title || 'Untitled',
      metaDescription: existing.metaDescription || '',
      wordCount: existing.wordCount || 0,
      extractedKeywords: existing.extractedKeywords || [],
      headings: existing.headings || [],
      cleanText: existing.cleanText || '',
      url: existing.url || ''
    },
    proposed: proposed ? {
      title: proposed.title || 'Untitled',
      metaDescription: proposed.metaDescription || '',
      wordCount: proposed.wordCount || 0,
      extractedKeywords: proposed.extractedKeywords || [],
      headings: proposed.headings || [],
      cleanText: proposed.cleanText || ''
    } : undefined,
    analysis,
    message
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(error: string, details?: string): StandardAnalysisResponse {
  return {
    success: false,
    existing: {
      title: '',
      metaDescription: '',
      wordCount: 0,
      extractedKeywords: [],
      headings: [],
      cleanText: '',
      url: ''
    },
    analysis: '',
    message: '',
    error,
    details
  };
}




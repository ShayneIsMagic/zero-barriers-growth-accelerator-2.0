/**
 * Stability and robustness configuration
 */

export const STABILITY_CONFIG = {
  // API Configuration
  API: {
    TIMEOUT: 15000,
    RETRIES: 3,
    RETRY_DELAY: 1000,
    MAX_RETRY_DELAY: 5000,
  },

  // Error Handling
  ERROR: {
    MAX_ERROR_LOG_SIZE: 100,
    ERROR_REPORTING_ENABLED: process.env.NODE_ENV === 'production',
    FALLBACK_MESSAGE: 'An unexpected error occurred. Please try again.',
  },

  // Loading States
  LOADING: {
    MIN_LOADING_TIME: 500, // Minimum time to show loading state
    DEBOUNCE_DELAY: 300,
  },

  // Data Validation
  VALIDATION: {
    MAX_URL_LENGTH: 2048,
    MAX_CONTENT_LENGTH: 100000,
    ALLOWED_PROTOCOLS: ['http:', 'https:'],
  },

  // Performance
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 1000,
    MAX_CONCURRENT_REQUESTS: 5,
  },
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    'Unable to connect to the server. Please check your connection and try again.',
  TIMEOUT_ERROR: 'The request took too long to complete. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'The server encountered an error. Please try again later.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
  UNAUTHORIZED_ERROR: 'You are not authorized to perform this action.',
  NOT_FOUND_ERROR: 'The requested resource was not found.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};

export const FALLBACK_DATA = {
  ANALYSIS_RESULT: {
    id: 'fallback',
    url: '',
    overallScore: 0,
    executiveSummary: 'Analysis temporarily unavailable',
    goldenCircle: {
      why: {
        score: 0,
        currentState: '',
        issues: [],
        recommendations: [],
        transformedMessage: '',
      },
      how: {
        score: 0,
        currentState: '',
        issues: [],
        recommendations: [],
        transformedMessage: '',
      },
      what: {
        score: 0,
        currentState: '',
        issues: [],
        recommendations: [],
        transformedMessage: '',
      },
      overallScore: 0,
    },
    elementsOfValue: {
      functional: { score: 0, elements: {}, recommendations: [] },
      emotional: { score: 0, elements: {}, recommendations: [] },
      lifeChanging: { score: 0, elements: {}, recommendations: [] },
      overallScore: 0,
    },
    b2bElements: {
      functional: { score: 0, elements: {}, recommendations: [] },
      emotional: { score: 0, elements: {}, recommendations: [] },
      lifeChanging: { score: 0, elements: {}, recommendations: [] },
      overallScore: 0,
    },
    cliftonStrengths: {
      strategicThinking: { score: 0, strengths: [], recommendations: [] },
      executing: { score: 0, strengths: [], recommendations: [] },
      influencing: { score: 0, strengths: [], recommendations: [] },
      relationshipBuilding: { score: 0, strengths: [], recommendations: [] },
      overallScore: 0,
    },
    transformation: {
      heroSection: {
        score: 0,
        currentState: '',
        issues: [],
        recommendations: [],
      },
      socialMedia: {
        score: 0,
        currentState: '',
        issues: [],
        recommendations: [],
      },
      competitivePositioning: {
        score: 0,
        currentState: '',
        issues: [],
        recommendations: [],
      },
      overallScore: 0,
    },
    lighthouseAnalysis: {
      performance: {
        score: 0,
        metrics: {},
        opportunities: [],
        diagnostics: [],
      },
      accessibility: { score: 0, issues: [], recommendations: [] },
      bestPractices: { score: 0, issues: [], recommendations: [] },
      seo: { score: 0, issues: [], recommendations: [] },
      overallScore: 0,
    },
    createdAt: new Date().toISOString(),
  },
};

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return ERROR_MESSAGES.GENERIC_ERROR;
}

export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return STABILITY_CONFIG.VALIDATION.ALLOWED_PROTOCOLS.includes(
      urlObj.protocol
    );
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input.slice(0, maxLength).trim();
}

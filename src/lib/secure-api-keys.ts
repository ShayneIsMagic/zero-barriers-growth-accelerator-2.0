/**
 * Secure API Key Management
 * 
 * This module provides secure handling of API keys with:
 * - Environment variable validation
 * - Key masking for logs
 * - Rate limiting protection
 * - No exposure in client-side code
 */

interface ApiKeyConfig {
  key: string;
  isConfigured: boolean;
  source: 'environment' | 'missing';
}

export class SecureApiKeyManager {
  private static instance: SecureApiKeyManager;
  
  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SecureApiKeyManager {
    if (!SecureApiKeyManager.instance) {
      SecureApiKeyManager.instance = new SecureApiKeyManager();
    }
    return SecureApiKeyManager.instance;
  }

  /**
   * Get Gemini API key securely
   */
  public getGeminiApiKey(): ApiKeyConfig {
    const key = process.env.GEMINI_API_KEY;
    return {
      key: key || '',
      isConfigured: !!key,
      source: key ? 'environment' : 'missing'
    };
  }

  /**
   * Get Google Search Console credentials (OAuth2)
   */
  public getSearchConsoleCredentials(): {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    isConfigured: boolean;
  } {
    return {
      clientId: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || '',
      refreshToken: process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN || '',
      isConfigured: !!(
        process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID &&
        process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET &&
        process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN
      )
    };
  }

  /**
   * Get Google Ads API credentials (OAuth2 + Developer Token)
   */
  public getGoogleAdsCredentials(): {
    clientId: string;
    clientSecret: string;
    developerToken: string;
    refreshToken: string;
    isConfigured: boolean;
  } {
    return {
      clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
      isConfigured: !!(
        process.env.GOOGLE_ADS_CLIENT_ID &&
        process.env.GOOGLE_ADS_CLIENT_SECRET &&
        process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
        process.env.GOOGLE_ADS_REFRESH_TOKEN
      )
    };
  }

  /**
   * Mask API key for logging (show only first 4 and last 4 characters)
   */
  public maskApiKey(key: string): string {
    if (!key || key.length < 8) {
      return '***';
    }
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  /**
   * Validate all required API keys are configured
   */
  public validateApiKeys(): {
    gemini: boolean;
    searchConsole: boolean;
    googleAds: boolean;
    allConfigured: boolean;
    missingKeys: string[];
  } {
    const gemini = this.getGeminiApiKey().isConfigured;
    const searchConsole = this.getSearchConsoleCredentials().isConfigured;
    const googleAds = this.getGoogleAdsCredentials().isConfigured;

    const missingKeys: string[] = [];
    if (!gemini) missingKeys.push('GEMINI_API_KEY');
    if (!searchConsole) missingKeys.push('GOOGLE_SEARCH_CONSOLE_*');
    if (!googleAds) missingKeys.push('GOOGLE_ADS_*');

    return {
      gemini,
      searchConsole,
      googleAds,
      allConfigured: gemini && searchConsole && googleAds,
      missingKeys
    };
  }

  /**
   * Get API key status for health checks (without exposing keys)
   */
  public getApiKeyStatus(): {
    gemini: { configured: boolean; masked: string };
    searchConsole: { configured: boolean };
    googleAds: { configured: boolean };
    totalConfigured: number;
    totalRequired: number;
  } {
    const geminiKey = this.getGeminiApiKey();
    const searchConsoleCreds = this.getSearchConsoleCredentials();
    const googleAdsCreds = this.getGoogleAdsCredentials();

    const configured = [
      geminiKey.isConfigured,
      searchConsoleCreds.isConfigured,
      googleAdsCreds.isConfigured
    ].filter(Boolean).length;

    return {
      gemini: {
        configured: geminiKey.isConfigured,
        masked: this.maskApiKey(geminiKey.key)
      },
      searchConsole: {
        configured: searchConsoleCreds.isConfigured
      },
      googleAds: {
        configured: googleAdsCreds.isConfigured
      },
      totalConfigured: configured,
      totalRequired: 3
    };
  }

  /**
   * Security check - ensure API keys are not exposed in client-side code
   */
  public validateServerSideOnly(): void {
    if (typeof window !== 'undefined') {
      throw new Error('SECURITY ERROR: API keys cannot be accessed in client-side code');
    }
  }

  /**
   * Rate limiting protection for API calls
   */
  private rateLimits = new Map<string, { count: number; resetTime: number }>();

  public checkRateLimit(apiName: string, maxCalls: number, windowMs: number): boolean {
    const now = Date.now();
    const key = apiName;
    const current = this.rateLimits.get(key);

    if (!current || now > current.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= maxCalls) {
      return false;
    }

    current.count++;
    return true;
  }
}

// Export singleton instance
export const apiKeyManager = SecureApiKeyManager.getInstance();

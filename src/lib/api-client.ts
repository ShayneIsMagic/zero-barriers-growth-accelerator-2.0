/**
 * Robust API client with retry logic, error handling, and graceful degradation
 */

interface ApiClientOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private onError?: (error: Error) => void;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.onError = options.onError || (() => {});
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async retryRequest<T>(
    url: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithTimeout(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.warn(`API request attempt ${attempt} failed:`, error);

      if (attempt < this.retries) {
        await this.delay(this.retryDelay * attempt);
        return this.retryRequest<T>(url, options, attempt + 1);
      }

      this.onError?.(error as Error);

      return {
        success: false,
        error: 'NETWORK_ERROR',
        message:
          'Unable to connect to the server. Please check your connection and try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Default API client instance
export const apiClient = new ApiClient({
  timeout: 15000,
  retries: 3,
  retryDelay: 1000,
  onError: (error) => {
    console.error('API Client Error:', error);
    // You can add error reporting here (Sentry, etc.)
  },
});

// Website analysis specific API client
export const analysisApi = {
  async analyzeWebsite(url: string, analysisType: string = 'full') {
    return apiClient.post('/api/analyze/website', {
      url,
      analysisType,
    });
  },

  async testConnectivity() {
    return apiClient.get('/api/analyze/website');
  },
};

export default ApiClient;

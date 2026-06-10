/**
 * Unified API client — AGENTS-app useAPICall / apiCall.js equivalent.
 * Attaches JWT, parses JSON, surfaces errors via toast when enabled.
 */

import { authenticatedFetch } from '@/lib/authenticated-fetch';
import { toast } from 'sonner';

export interface ApiErrorBody {
  success?: false;
  error?: string;
  details?: string;
  message?: string;
}

export interface ApiCallOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Show sonner toast on 4xx/5xx (default: true for mutations) */
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  /** Skip JSON parse — return raw Response (streaming endpoints) */
  rawResponse?: boolean;
}

function resolveErrorMessage(
  status: number,
  body: ApiErrorBody | null
): string {
  if (body?.error) {
    return body.error;
  }
  if (body?.message) {
    return body.message;
  }
  if (status === 401) {
    return 'Authentication required. Please sign in.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  return `Request failed (${status})`;
}

/**
 * Authenticated fetch with consistent error handling.
 */
export async function apiCall<T = unknown>(
  path: string,
  options: ApiCallOptions = {}
): Promise<{ response: Response; data: T | null }> {
  const {
    body,
    showErrorToast = options.method !== undefined && options.method !== 'GET',
    showSuccessToast = false,
    successMessage,
    rawResponse = false,
    headers,
    ...init
  } = options;

  const response = await authenticatedFetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (rawResponse) {
    if (!response.ok && showErrorToast) {
      toast.error(resolveErrorMessage(response.status, null));
    }
    return { response, data: null };
  }

  let data: T | null = null;
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    try {
      data = (await response.json()) as T;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = resolveErrorMessage(
      response.status,
      data as ApiErrorBody | null
    );
    if (showErrorToast) {
      toast.error(message);
    }
    throw new ApiCallError(message, response.status, data);
  }

  if (showSuccessToast && successMessage) {
    toast.success(successMessage);
  }

  return { response, data };
}

export class ApiCallError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = 'ApiCallError';
  }
}

/**
 * Raw authenticated fetch for streaming NDJSON analysis endpoints.
 */
export async function apiCallStream(
  path: string,
  body: Record<string, unknown>
): Promise<Response> {
  const { response } = await apiCall(path, {
    method: 'POST',
    body,
    rawResponse: true,
    showErrorToast: false,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errData = (await response.json()) as ApiErrorBody;
      const message = resolveErrorMessage(response.status, errData);
      toast.error(message);
      throw new ApiCallError(message, response.status, errData);
    }
    const message = resolveErrorMessage(response.status, null);
    toast.error(message);
    throw new ApiCallError(message, response.status, null);
  }

  return response;
}

/**
 * Client-side fetch helper that attaches the JWT from localStorage.
 */

export const AUTH_TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthHeaders(
  extraHeaders?: HeadersInit
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (extraHeaders) {
    if (extraHeaders instanceof Headers) {
      extraHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(extraHeaders)) {
      for (const [key, value] of extraHeaders) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, extraHeaders);
    }
  }

  return headers;
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = getAuthHeaders(init?.headers);

  return fetch(input, {
    ...init,
    headers,
    credentials: init?.credentials ?? 'include',
  });
}

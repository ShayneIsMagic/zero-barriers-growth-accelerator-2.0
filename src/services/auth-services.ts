/**
 * Auth API helpers — AGENTS-app authServices.js equivalent.
 */

import { apiCall } from '@/lib/api-call';
import type { User } from '@/lib/auth';
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '@/lib/authenticated-fetch';

export const getStoredAuthToken = getAuthToken;
export const setStoredAuthToken = setAuthToken;
export const clearStoredAuthToken = clearAuthToken;

interface AuthResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = getStoredAuthToken();
  if (!token) {
    return null;
  }

  try {
    const { data } = await apiCall<MeResponse>('/api/auth/me', {
      method: 'GET',
      showErrorToast: false,
    });
    return data?.user ?? null;
  } catch {
    clearStoredAuthToken();
    return null;
  }
}

export async function signInUser(
  email: string,
  password: string
): Promise<User | null> {
  const { data } = await apiCall<AuthResponse>('/api/auth/signin', {
    method: 'POST',
    body: { email, password },
    showErrorToast: true,
  });

  if (data?.token) {
    setStoredAuthToken(data.token);
  }

  return data?.user ?? null;
}

export async function signUpUser(
  email: string,
  password: string,
  name: string
): Promise<User | null> {
  const { data } = await apiCall<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: { email, password, name },
    showErrorToast: true,
  });

  if (data?.token) {
    setStoredAuthToken(data.token);
  }

  return data?.user ?? null;
}

export async function signOutUser(): Promise<void> {
  try {
    await apiCall('/api/auth/signout', {
      method: 'POST',
      showErrorToast: false,
    });
  } finally {
    clearStoredAuthToken();
  }
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  const { data } = await apiCall<{ success?: boolean; error?: string }>(
    '/api/auth/forgot-password',
    {
      method: 'POST',
      body: { email },
      showErrorToast: false,
    }
  );
  return Boolean(data?.success);
}

export async function updateUserProfile(input: {
  name: string;
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await apiCall('/api/user/profile', {
      method: 'PUT',
      body: input,
      showErrorToast: false,
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update profile';
    return { success: false, error: message };
  }
}

export async function changeUserPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await apiCall('/api/user/change-password', {
      method: 'PUT',
      body: input,
      showErrorToast: false,
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to change password';
    return { success: false, error: message };
  }
}

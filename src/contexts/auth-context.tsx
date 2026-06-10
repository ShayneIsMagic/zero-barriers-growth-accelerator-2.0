'use client';

import { User } from '@/lib/auth';
import {
  fetchCurrentUser,
  signInUser,
  signOutUser,
  signUpUser,
} from '@/services/auth-services';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const signedInUser = await signInUser(email, password);
      if (signedInUser) {
        setUser(signedInUser);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      const signedUpUser = await signUpUser(email, password, name);
      if (signedUpUser) {
        setUser(signedUpUser);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    await signOutUser();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

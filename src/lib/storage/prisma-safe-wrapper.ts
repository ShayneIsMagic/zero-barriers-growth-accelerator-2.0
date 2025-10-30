/**
 * Prisma Safe Wrapper
 * 
 * Provides safe Prisma operations with graceful degradation
 * Syncs to LocalForage for client-side access
 */

import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { ClientStorage } from '@/lib/shared/client-storage';

/**
 * Execute Prisma operation with error handling
 */
export async function safePrisma<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<{ success: boolean; data?: T; error?: string }> {
  if (!isPrismaAvailable()) {
    return {
      success: false,
      error: 'DATABASE_URL not configured',
      data: fallback,
    };
  }

  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Prisma operation failed:', errorMsg);
    return {
      success: false,
      error: errorMsg,
      data: fallback,
    };
  }
}

/**
 * Sync framework results to LocalForage (client-side only)
 */
export async function syncToLocalForage(
  analysisId: string,
  framework: string,
  results: unknown
): Promise<void> {
  if (typeof window === 'undefined') return; // Server-side only

  try {
    await ClientStorage.addFrameworkResult(analysisId, {
      assessmentType: framework,
      createdAtIso: new Date().toISOString(),
      data: results,
    });
  } catch (error) {
    console.warn('LocalForage sync failed:', error);
    // Don't throw - non-critical
  }
}

/**
 * Store analysis with dual storage (Prisma + LocalForage)
 */
export async function storeAnalysisWithSync<T>(params: {
  analysisId: string;
  framework: string;
  results: T;
  prismaOperation: () => Promise<T>;
}): Promise<{ success: boolean; data?: T; source: 'supabase' | 'localforage' | 'none'; error?: string }> {
  const { analysisId, framework, results, prismaOperation } = params;

  // Always sync to LocalForage (client-side)
  await syncToLocalForage(analysisId, framework, results);

  // Try Prisma/Supabase
  const prismaResult = await safePrisma(prismaOperation, results as T);

  if (prismaResult.success) {
    return {
      success: true,
      data: prismaResult.data,
      source: 'supabase',
    };
  }

  // Return LocalForage result if Prisma failed
  return {
    success: true,
    data: results,
    source: 'localforage',
    error: prismaResult.error,
  };
}


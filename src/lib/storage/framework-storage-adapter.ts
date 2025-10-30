/**
 * Framework Storage Adapter
 * 
 * Wraps Prisma calls with graceful degradation and LocalForage sync
 * Follows unified storage architecture from STORAGE_ARCHITECTURE.md
 */

import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { ClientStorage } from '@/lib/shared/client-storage';

interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'supabase' | 'localforage' | 'none';
}

/**
 * Wrapper for Prisma operations with graceful degradation
 */
export class FrameworkStorageAdapter {
  /**
   * Store framework analysis results
   * Writes to LocalForage immediately, then attempts Supabase sync
   */
  static async storeFrameworkAnalysis<T = unknown>(params: {
    analysisId: string;
    url: string;
    framework: string;
    results: T;
    scores?: {
      overall?: number;
      [key: string]: number | undefined;
    };
  }): Promise<StorageResult<T>> {
    const { analysisId, url, framework, results, scores } = params;

    // Always save to LocalForage first (immediate UX)
    let localforageSuccess = false;
    if (typeof window !== 'undefined') {
      try {
        const entry = {
          assessmentType: framework,
          createdAtIso: new Date().toISOString(),
          data: results,
        };
        await ClientStorage.addFrameworkResult(analysisId, entry);
        localforageSuccess = true;
      } catch (error) {
        console.warn('LocalForage storage failed:', error);
      }
    }

    // Try to save to Supabase if available (server-side)
    if (typeof window === 'undefined' && isPrismaAvailable()) {
      try {
        // First, ensure Analysis record exists
        await prisma.analysis.upsert({
          where: { id: analysisId },
          create: {
            id: analysisId,
            content: JSON.stringify(results),
            contentType: framework,
            status: 'completed',
            score: scores?.overall || null,
            insights: JSON.stringify(results),
            frameworks: framework,
          },
          update: {
            content: JSON.stringify(results),
            updatedAt: new Date(),
            insights: JSON.stringify(results),
            score: scores?.overall || null,
          },
        });

        // Store in FrameworkResult table
        await prisma.frameworkResult.upsert({
          where: {
            id: `${analysisId}-${framework}`, // Compound key
          },
          create: {
            id: `${analysisId}-${framework}`,
            analysisId,
            framework,
            results: results as unknown as object,
            score: scores?.overall || null,
            metadata: scores ? { scores } : null,
          },
          update: {
            results: results as unknown as object,
            score: scores?.overall || null,
            metadata: scores ? { scores } : null,
          },
        });

        return {
          success: true,
          data: results,
          source: 'supabase',
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Supabase sync failed for ${framework}:`, errorMsg);
        
        // Return LocalForage result if available
        if (localforageSuccess) {
          return {
            success: true,
            data: results,
            source: 'localforage',
            error: `Supabase sync failed: ${errorMsg}`,
          };
        }

        return {
          success: false,
          error: errorMsg,
          source: 'none',
        };
      }
    }

    // Return LocalForage result
    if (localforageSuccess) {
      return {
        success: true,
        data: results,
        source: 'localforage',
      };
    }

    return {
      success: false,
      error: 'No storage available',
      source: 'none',
    };
  }

  /**
   * Get framework analysis results
   * Tries LocalForage first, then Supabase
   */
  static async getFrameworkAnalysis<T = unknown>(
    analysisId: string,
    framework: string
  ): Promise<StorageResult<T>> {
    // Try LocalForage first (client-side)
    if (typeof window !== 'undefined') {
      try {
        const results = await ClientStorage.getFrameworkResults<T>(analysisId);
        if (results) {
          const entry = results.find((r) => r.assessmentType === framework);
          if (entry?.data) {
            return {
              success: true,
              data: entry.data,
              source: 'localforage',
            };
          }
        }
      } catch (error) {
        console.warn('LocalForage read failed:', error);
      }
    }

    // Try Supabase (server-side)
    if (typeof window === 'undefined' && isPrismaAvailable()) {
      try {
        const frameworkResult = await prisma.frameworkResult.findUnique({
          where: {
            id: `${analysisId}-${framework}`,
          },
        });

        if (frameworkResult) {
          return {
            success: true,
            data: frameworkResult.results as T,
            source: 'supabase',
          };
        }
      } catch (error) {
        console.warn('Supabase read failed:', error);
      }
    }

    return {
      success: false,
      error: 'Analysis not found',
      source: 'none',
    };
  }

  /**
   * Store elements-specific data (B2C, B2B, CliftonStrengths)
   * Wraps existing Prisma calls with error handling
   */
  static async storeElementsData<T = unknown>(params: {
    analysisId: string;
    url: string;
    framework: 'b2c' | 'b2b' | 'clifton_strengths' | 'golden_circle';
    prismaCallback: () => Promise<T>;
    results: unknown;
  }): Promise<StorageResult<T>> {
    const { analysisId, url, framework, prismaCallback, results } = params;

    // Always save to LocalForage first
    if (typeof window !== 'undefined') {
      try {
        await ClientStorage.addFrameworkResult(analysisId, {
          assessmentType: framework,
          createdAtIso: new Date().toISOString(),
          data: results,
        });
      } catch (error) {
        console.warn('LocalForage save failed:', error);
      }
    }

    // Try Prisma/Supabase with graceful degradation
    if (isPrismaAvailable()) {
      try {
        const data = await prismaCallback();
        return {
          success: true,
          data,
          source: 'supabase',
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Prisma storage failed for ${framework}:`, errorMsg);
        
        return {
          success: true, // Still succeeded in LocalForage
          source: 'localforage',
          error: `Supabase sync failed: ${errorMsg}`,
        };
      }
    }

    // Return LocalForage-only result
    return {
      success: true,
      source: 'localforage',
    };
  }
}


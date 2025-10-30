/**
 * Unified Storage Service
 * 
 * Manages storage across LocalForage (client) and Supabase/Prisma (server)
 * with graceful degradation if Supabase is unavailable.
 */

import { ClientStorage } from '@/lib/shared/client-storage';
import { prisma } from '@/lib/prisma';

interface StorageMetadata {
  synced: boolean;
  syncError?: string;
  lastSyncAttempt?: string;
  createdAt: string;
}

interface StorableAnalysis {
  id: string;
  url: string;
  framework?: string;
  results: unknown;
  metadata?: StorageMetadata;
}

const isSupabaseAvailable = (): boolean => {
  return !!process.env.DATABASE_URL;
};

const isServer = typeof window === 'undefined';

/**
 * Unified Storage Service
 * Provides consistent API for LocalForage + Supabase/Prisma
 */
export class UnifiedStorage {
  /**
   * Save analysis to LocalForage (always) and Supabase (if available)
   */
  static async saveAnalysis(analysis: StorableAnalysis): Promise<{
    localforage: boolean;
    supabase: boolean;
    error?: string;
  }> {
    const result = {
      localforage: false,
      supabase: false,
      error: undefined as string | undefined,
    };

    // Always save to LocalForage first (client-side only)
    if (!isServer) {
      try {
        const bundle = {
          id: analysis.id,
          url: analysis.url,
          metadata: {
            existing: {
              url: analysis.url,
              timestampIso: new Date().toISOString(),
            },
          },
          content: {
            existing: { cleanText: JSON.stringify(analysis.results) },
          },
        };
        await ClientStorage.saveScrapeBundle(bundle);
        result.localforage = true;
      } catch (error) {
        result.error = `LocalForage failed: ${error instanceof Error ? error.message : 'Unknown'}`;
      }
    }

    // Try to save to Supabase/Prisma if available (server-side only)
    if (isServer && isSupabaseAvailable()) {
      try {
        // Create or update analysis in Supabase via Prisma
        await prisma.analysis.upsert({
          where: { id: analysis.id },
          create: {
            id: analysis.id,
            content: JSON.stringify(analysis.results),
            contentType: analysis.framework || 'content-comparison',
            status: 'completed',
            score: (analysis.results as { overall_score?: number })?.overall_score || null,
            insights: JSON.stringify(analysis.results),
            frameworks: analysis.framework || null,
          },
          update: {
            content: JSON.stringify(analysis.results),
            updatedAt: new Date(),
            insights: JSON.stringify(analysis.results),
          },
        });
        result.supabase = true;
      } catch (error) {
        result.error = `Supabase sync failed: ${error instanceof Error ? error.message : 'Unknown'}`;
        // Don't throw - graceful degradation
      }
    }

    return result;
  }

  /**
   * Get analysis - tries LocalForage first, then Supabase
   */
  static async getAnalysis(id: string): Promise<StorableAnalysis | null> {
    // Try LocalForage first (client-side)
    if (!isServer) {
      try {
        const bundle = await ClientStorage.getScrapeBundle(id);
        if (bundle) {
          return {
            id: bundle.id,
            url: bundle.url,
            results: JSON.parse(bundle.content.existing.cleanText),
          };
        }
      } catch {
        // Continue to Supabase fallback
      }
    }

    // Fallback to Supabase/Prisma (server-side)
    if (isServer && isSupabaseAvailable()) {
      try {
        const analysis = await prisma.analysis.findUnique({
          where: { id },
        });
        if (analysis) {
          return {
            id: analysis.id,
            url: '', // Not stored in Analysis model
            framework: analysis.frameworks || undefined,
            results: JSON.parse(analysis.content),
          };
        }
      } catch {
        // Return null if not found
      }
    }

    return null;
  }

  /**
   * List all analyses (combines LocalForage + Supabase)
   */
  static async listAnalyses(): Promise<StorableAnalysis[]> {
    const analyses: StorableAnalysis[] = [];

    // Get from LocalForage (client-side)
    if (!isServer) {
      try {
        const ids = await ClientStorage.listIds();
        for (const id of ids) {
          const bundle = await ClientStorage.getScrapeBundle(id);
          if (bundle) {
            analyses.push({
              id: bundle.id,
              url: bundle.url,
              results: JSON.parse(bundle.content.existing.cleanText),
            });
          }
        }
      } catch {
        // Continue
      }
    }

    // Get from Supabase/Prisma (server-side)
    if (isServer && isSupabaseAvailable()) {
      try {
        const dbAnalyses = await prisma.analysis.findMany({
          take: 100,
          orderBy: { createdAt: 'desc' },
        });
        for (const analysis of dbAnalyses) {
          analyses.push({
            id: analysis.id,
            url: '', // Not stored
            framework: analysis.frameworks || undefined,
            results: JSON.parse(analysis.content),
          });
        }
      } catch {
        // Graceful degradation
      }
    }

    return analyses;
  }

  /**
   * Check if Supabase is available and working
   */
  static async checkSupabaseConnection(): Promise<{
    available: boolean;
    working: boolean;
    error?: string;
  }> {
    if (!isSupabaseAvailable()) {
      return { available: false, working: false, error: 'DATABASE_URL not configured' };
    }

    if (isServer) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return { available: true, working: true };
      } catch (error) {
        return {
          available: true,
          working: false,
          error: error instanceof Error ? error.message : 'Connection failed',
        };
      }
    }

    return { available: false, working: false, error: 'Server-side only' };
  }
}


# Storage Architecture: Supabase, Prisma, and LocalForage

## Overview

This document outlines the unified storage strategy for Zero Barriers Growth Accelerator, managing three storage layers:

1. **LocalForage** (Client-side) - Immediate UX storage
2. **Prisma** (ORM Layer) - Database abstraction
3. **Supabase** (PostgreSQL) - Persistent server storage

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│         Client Components (React)               │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│      UnifiedStorageService (Hybrid Layer)      │
│  - Manages sync between LocalForage & Supabase │
│  - Handles offline-first patterns              │
│  - Provides consistent API                      │
└───────┬─────────────────────────┬───────────────┘
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│  LocalForage     │    │  Prisma → Supabase  │
│  (Client-side)   │    │  (Server-side)      │
│  - Immediate UX  │    │  - Persistent       │
│  - Offline-ready │    │  - Cross-device     │
│  - Browser-only  │    │  - Multi-user       │
└──────────────────┘    └──────────────────────┘
```

## Data Flow Strategy

### Write Pattern (Save Analysis)

```
1. User saves analysis
   ↓
2. Write to LocalForage (immediate - always succeeds)
   ↓
3. Try to write to Supabase/Prisma (background sync)
   ├─ Success: Mark as "synced" in LocalForage
   └─ Failure: Mark as "pending sync", retry later
```

### Read Pattern (Load Analysis)

```
1. User requests analysis
   ↓
2. Try LocalForage first (fast, immediate)
   ├─ Found: Return immediately
   └─ Not found: Try Supabase/Prisma
       ├─ Found: Save to LocalForage, return
       └─ Not found: Return null
```

## Use Cases by Storage Type

### LocalForage (Client-side)
**Use for:**
- ✅ Scrape bundles (Content Comparison)
- ✅ Framework results cache
- ✅ Comprehensive reports (client-side viewing)
- ✅ "Report Ready" indicators
- ✅ Offline-first UX

**Don't use for:**
- ❌ User authentication
- ❌ Permanent cross-device storage
- ❌ Multi-user data sharing
- ❌ Server-side analytics

### Prisma + Supabase (Server-side)
**Use for:**
- ✅ Permanent analysis storage (B2C, B2B, CliftonStrengths scores)
- ✅ User accounts and authentication
- ✅ Cross-device access
- ✅ Historical analysis tracking
- ✅ Framework element scores with evidence

**Don't use for:**
- ❌ Temporary scrape caches
- ❌ Client-side UI state
- ❌ Offline-first patterns

## Implementation Strategy

### 1. Unified Storage Service

Create `src/lib/storage/unified-storage.ts` that:
- Wraps both LocalForage and Prisma
- Provides consistent API (`save`, `get`, `list`)
- Handles sync logic
- Gracefully degrades if Supabase unavailable

### 2. Sync Status Tracking

Add metadata to LocalForage entries:
```typescript
{
  id: string,
  data: AnalysisData,
  metadata: {
    synced: boolean,        // Synced to Supabase?
    syncError?: string,     // Last sync error
    lastSyncAttempt?: Date
  }
}
```

### 3. Background Sync

Optional background worker that:
- Scans LocalForage for unsynced entries
- Attempts sync to Supabase
- Updates sync status

## Configuration

### Environment Variables

```bash
# Required for Supabase/Prisma
DATABASE_URL=postgresql://...  # Optional - gracefully degrades if missing

# LocalForage works without config (browser-only)
```

### Feature Flags

```typescript
const STORAGE_CONFIG = {
  useSupabase: !!process.env.DATABASE_URL,
  useLocalForage: typeof window !== 'undefined',
  syncStrategy: 'immediate' | 'background' | 'manual'
};
```

## Error Handling

### Supabase Unavailable
- ✅ Continue with LocalForage only
- ✅ Log warning (non-blocking)
- ✅ Show user-friendly message: "Reports saved locally. Cloud sync unavailable."

### LocalForage Unavailable
- ✅ Fall back to localStorage
- ✅ If that fails, memory-only cache (session)

### Both Unavailable
- ✅ Memory-only cache for session
- ✅ Warn user data won't persist

## Migration Strategy

### Phase 1: LocalForage Only (Current)
- ✅ Content Comparison works
- ✅ Reports page works
- ✅ No Supabase dependency

### Phase 2: Hybrid (Recommended Next)
- ✅ Add UnifiedStorageService
- ✅ Optional Supabase sync
- ✅ Background sync worker

### Phase 3: Full Sync
- ✅ All analyses sync to Supabase
- ✅ Cross-device access
- ✅ User accounts with persistent storage

## Best Practices

1. **Write to LocalForage first** - Always succeeds, immediate UX
2. **Sync to Supabase in background** - Don't block user
3. **Handle failures gracefully** - Never crash on storage errors
4. **Show sync status** - Let users know if cloud sync is active
5. **Cache Supabase reads** - Store in LocalForage after fetching

## Example Usage

```typescript
// Unified API
import { UnifiedStorage } from '@/lib/storage/unified-storage';

// Save analysis (writes to both if available)
await UnifiedStorage.saveAnalysis({
  id: 'analysis-123',
  url: 'https://example.com',
  framework: 'b2c',
  results: { ... }
});

// Load analysis (reads LocalForage first, falls back to Supabase)
const analysis = await UnifiedStorage.getAnalysis('analysis-123');

// List analyses (combines both sources)
const all = await UnifiedStorage.listAnalyses();
```


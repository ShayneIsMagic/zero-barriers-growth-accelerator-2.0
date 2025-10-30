# Supabase/Prisma Cleanup Guide

## Goal

Clean up Supabase/Prisma integration to:
1. ✅ Store data correctly in Supabase when `DATABASE_URL` is configured
2. ✅ Retrieve data from both LocalForage (client) and Supabase (server)
3. ✅ Gracefully degrade when Supabase unavailable (use LocalForage only)
4. ✅ Follow unified storage architecture from `STORAGE_ARCHITECTURE.md`

## Current State

- Services directly call Prisma without error handling
- No LocalForage sync for client-side access
- Prisma calls can crash if `DATABASE_URL` missing
- Data not retrievable from both sources

## Required Changes

### 1. Environment Setup

**Check `.env.local`:**
```bash
DATABASE_URL=postgresql://...  # Required for Supabase
```

**If missing:** System works with LocalForage only (graceful degradation)

**If present:** Full sync to Supabase enabled

### 2. Prisma Schema Verification

**Run migrations:**
```bash
npx prisma generate
npx prisma db push
# OR
npx prisma migrate deploy
```

**Verify schema includes:**
- `Analysis` table
- `FrameworkResult` table  
- Framework-specific tables (`elements_of_value_b2c`, `clifton_strengths_analyses`, etc.)

### 3. Service Updates Pattern

For each service (`elements-value-b2c`, `elements-value-b2b`, `clifton-strengths`, `golden-circle`):

**Add LocalForage sync:**
```typescript
// At start of store method
if (typeof window !== 'undefined') {
  try {
    const { syncToLocalForage } = await import('@/lib/storage/prisma-safe-wrapper');
    await syncToLocalForage(analysisId, 'framework-name', results);
  } catch (error) {
    console.warn('LocalForage sync failed:', error);
  }
}
```

**Wrap Prisma calls:**
```typescript
// Before
const eov = await prisma.elements_of_value_b2c.create({...});

// After
let eov;
try {
  const { isPrismaAvailable } = await import('@/lib/prisma');
  if (isPrismaAvailable()) {
    eov = await prisma.elements_of_value_b2c.create({...});
  } else {
    // Generate temporary ID if Prisma unavailable
    eov = { id: `local-${Date.now()}`, ...fallbackData };
  }
} catch (error) {
  console.warn('Supabase storage failed:', error);
  // Continue with LocalForage-only storage
  eov = { id: `local-${Date.now()}`, ...fallbackData };
}
```

### 4. Retrieval Updates

**Update get methods to read from both sources:**

```typescript
// Try LocalForage first (client-side)
if (typeof window !== 'undefined') {
  const results = await ClientStorage.getFrameworkResults(analysisId);
  if (results) {
    const entry = results.find(r => r.assessmentType === framework);
    if (entry?.data) {
      return entry.data;
    }
  }
}

// Fallback to Supabase (server-side)
if (typeof window === 'undefined' && isPrismaAvailable()) {
  const result = await prisma.frameworkResult.findUnique({
    where: { id: `${analysisId}-${framework}` }
  });
  if (result) return result.results;
}
```

## Testing Checklist

- [ ] **Without DATABASE_URL:**
  - [ ] Services don't crash
  - [ ] Data saves to LocalForage
  - [ ] Reports page shows data

- [ ] **With DATABASE_URL:**
  - [ ] Data saves to both LocalForage and Supabase
  - [ ] Data retrievable from Supabase
  - [ ] No duplicate storage

- [ ] **Data Flow:**
  - [ ] Content Comparison → LocalForage → Supabase (if available)
  - [ ] Framework analysis → LocalForage → Supabase (if available)
  - [ ] Reports page reads from LocalForage first, Supabase fallback

## Files to Update

1. `src/lib/services/elements-value-b2c.service.ts` ✅ (Started)
2. `src/lib/services/elements-value-b2b.service.ts`
3. `src/lib/services/clifton-strengths-detailed.service.ts`
4. `src/lib/services/golden-circle-detailed.service.ts`
5. `src/lib/storage/unified-storage.ts` (Use for new code)
6. `src/lib/storage/prisma-safe-wrapper.ts` (Helper utilities)

## Quick Start

**Minimal change approach:**

1. Import helpers in each service:
```typescript
import { syncToLocalForage } from '@/lib/storage/prisma-safe-wrapper';
import { isPrismaAvailable } from '@/lib/prisma';
```

2. Add LocalForage sync at start of store methods

3. Wrap Prisma calls with `isPrismaAvailable()` check and try-catch

4. Return data structure even if Prisma fails (use LocalForage data)

## Verification Commands

```bash
# Check Prisma connection
npm run test:prisma  # If script exists
# OR
node -e "const {prisma} = require('./src/lib/prisma'); prisma.$queryRaw\`SELECT 1\`.then(() => console.log('✅ Connected')).catch(e => console.log('❌', e))"

# Check environment
echo $DATABASE_URL  # Should show PostgreSQL URL if configured

# Generate Prisma client
npx prisma generate

# Push schema (development)
npx prisma db push
```

## Next Steps

1. **Phase 1:** Update one service (B2C) as template
2. **Phase 2:** Apply pattern to other services
3. **Phase 3:** Test with and without `DATABASE_URL`
4. **Phase 4:** Document any edge cases


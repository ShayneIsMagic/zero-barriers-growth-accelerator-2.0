# Supabase/Prisma Cleanup Guide

## Current Issues

1. Services directly call Prisma without checking availability
2. No graceful degradation if `DATABASE_URL` missing
3. No LocalForage sync for client-side access
4. Errors can crash the app

## Solution: Wrapper Pattern

Wrap existing Prisma calls with error handling and LocalForage sync without changing service logic.

## Implementation Steps

### Step 1: Wrap Prisma Calls

Add try-catch around Prisma operations in services:

```typescript
// Before
const eov = await prisma.elements_of_value_b2c.create({...});

// After
let eov;
try {
  if (isPrismaAvailable()) {
    eov = await prisma.elements_of_value_b2c.create({...});
  }
} catch (error) {
  console.warn('Supabase storage failed, using LocalForage only:', error);
}

// Always save to LocalForage for client-side access
await this.saveToLocalForage(analysisId, framework, results);
```

### Step 2: Update Service Methods

For each service (`elements-value-b2c`, `elements-value-b2b`, `clifton-strengths`, `golden-circle`):

1. Import `isPrismaAvailable` from `@/lib/prisma`
2. Wrap Prisma calls in try-catch
3. Add LocalForage sync after Prisma success/failure
4. Return data structure even if Prisma fails

### Step 3: Verify Storage

1. Check `DATABASE_URL` is set in `.env.local`
2. Run `npx prisma generate`
3. Run `npx prisma db push` or migrations
4. Test connection: `npm run test:prisma` (if script exists)

## Migration Checklist

- [ ] Update `elements-value-b2c.service.ts`
- [ ] Update `elements-value-b2b.service.ts`
- [ ] Update `clifton-strengths-detailed.service.ts`
- [ ] Update `golden-circle-detailed.service.ts`
- [ ] Add LocalForage sync helpers
- [ ] Test with `DATABASE_URL` missing (graceful degradation)
- [ ] Test with `DATABASE_URL` set (full sync)
- [ ] Verify reports page reads from both sources


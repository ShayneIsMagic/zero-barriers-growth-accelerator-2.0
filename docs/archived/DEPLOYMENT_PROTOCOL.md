# EFFICIENT MULTI-ENVIRONMENT DEPLOYMENT PROTOCOL

## 🎯 **CORE PRINCIPLE: Database-First Deployment**

Always update database schema BEFORE code changes to prevent conflicts.

## 📋 **STEP-BY-STEP PROTOCOL**

### **Phase 1: Database Schema Updates (Supabase)**

```bash
# 1. Create migration files
npx prisma migrate dev --name "fix-prisma-queryraw-calls"

# 2. Generate Prisma client
npx prisma generate

# 3. Push to Supabase
npx prisma db push

# 4. Verify schema in Supabase dashboard
```

### **Phase 2: Code Changes (GitHub)**

```bash
# 1. Create feature branch
git checkout -b fix/prisma-client-methods

# 2. Make code changes
# (All the Prisma fixes we just did)

# 3. Test locally
npm run dev
npm run test

# 4. Commit and push
git add .
git commit -m "fix: replace $queryRaw with Prisma client methods"
git push origin fix/prisma-client-methods

# 5. Create Pull Request
# 6. Review and merge to main
```

### **Phase 3: Auto-Deploy (Vercel)**

```bash
# Vercel automatically deploys on main branch push
# No manual intervention needed
```

### **Phase 4: Verification**

```bash
# 1. Check Vercel deployment
curl https://zero-barriers-growth-accelerator-20.vercel.app/api/health

# 2. Test database connections
curl -X POST "https://zero-barriers-growth-accelerator-20.vercel.app/api/analyze/phase2-simple" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "content": {"content": "test"}, "industry": "general"}'

# 3. Check Supabase logs
# 4. Verify Prisma client works
```

## 🔧 **CONFLICT PREVENTION STRATEGIES**

### **1. Environment Variable Management**

```bash
# .env.local (Local Development)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="local-secret"
GEMINI_API_KEY="your-key"

# Vercel Environment Variables (Production)
# Set via Vercel dashboard or CLI
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add GEMINI_API_KEY
```

### **2. Prisma Client Generation**

```bash
# Always generate client after schema changes
npx prisma generate

# Commit generated client
git add node_modules/.prisma
git commit -m "chore: update Prisma client"
```

### **3. Database Connection Pooling**

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["connectionPooling"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Use connection pooling for Vercel
  directUrl = env("DIRECT_URL")
}
```

## 🚨 **COMMON CONFLICTS & SOLUTIONS**

### **1. "Prepared Statement Already Exists" Error**

**Cause:** `prisma.$queryRaw` in serverless environments
**Solution:** Use Prisma client methods (what we just fixed)

### **2. Database Schema Mismatch**

**Cause:** Code expects different schema than database
**Solution:** Database-first deployment protocol

### **3. Environment Variable Conflicts**

**Cause:** Different values between environments
**Solution:** Centralized environment management

### **4. Prisma Client Version Mismatch**

**Cause:** Different Prisma versions between environments
**Solution:** Lock Prisma version in package.json

## 📊 **MONITORING & VERIFICATION**

### **1. Health Checks**

```typescript
// api/health/route.ts
export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Test Gemini API
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    await gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });

    return Response.json({
      status: 'healthy',
      database: 'connected',
      ai: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

### **2. Deployment Status Dashboard**

```typescript
// api/status/route.ts
export async function GET() {
  const status = {
    github: await checkGitHubStatus(),
    vercel: await checkVercelStatus(),
    supabase: await checkSupabaseStatus(),
    prisma: await checkPrismaStatus(),
  };

  return Response.json(status);
}
```

## 🔄 **AUTOMATED WORKFLOWS**

### **1. GitHub Actions (Optional)**

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx prisma generate
      - run: npm run build
      - run: npx prisma db push
```

### **2. Vercel Integration**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci && npx prisma generate",
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "GEMINI_API_KEY": "@gemini_api_key"
  }
}
```

## 🎯 **BEST PRACTICES**

### **1. Always Test Locally First**

```bash
# 1. Test database changes
npx prisma db push
npx prisma generate

# 2. Test API endpoints
npm run dev
curl localhost:3000/api/health

# 3. Test full flow
# Run complete analysis locally
```

### **2. Use Feature Branches**

```bash
# Never push directly to main
git checkout -b feature/your-feature
# Make changes
git push origin feature/your-feature
# Create PR
# Review and merge
```

### **3. Environment Parity**

```bash
# Keep all environments in sync
# Same Prisma version
# Same Node version
# Same dependencies
```

### **4. Rollback Strategy**

```bash
# If deployment fails
# 1. Revert code changes
git revert <commit-hash>

# 2. Revert database changes (if needed)
npx prisma migrate reset

# 3. Redeploy
git push origin main
```

## 🚀 **QUICK DEPLOYMENT COMMANDS**

### **Full Deployment**

```bash
# 1. Update database
npx prisma db push && npx prisma generate

# 2. Commit and push
git add . && git commit -m "feat: your changes" && git push origin main

# 3. Wait for Vercel (auto-deploy)
# 4. Verify
curl https://zero-barriers-growth-accelerator-20.vercel.app/api/health
```

### **Emergency Fix**

```bash
# Quick fix and deploy
git add . && git commit -m "hotfix: emergency fix" && git push origin main
```

## 📈 **SUCCESS METRICS**

- ✅ Zero "prepared statement" errors
- ✅ All API endpoints responding
- ✅ Database connections stable
- ✅ Vercel deployments successful
- ✅ No environment conflicts
- ✅ Fast deployment times (< 2 minutes)

# 🔧 TOKEN CONFLICT FIX - Frontend/Backend Mismatch

**Issue**: JWT token libraries don't match between frontend and backend
**Impact**: Authentication fails on Vercel
**Fix Time**: 5 minutes

---

## 🚨 **THE PROBLEM**

### **Frontend vs Backend JWT Mismatch**

**Frontend** (`src/lib/auth.ts`):
```typescript
import { SignJWT, jwtVerify } from 'jose';  // Modern JWT library
```

**Backend** (`src/app/api/auth/me/route.ts`):
```typescript
import jwt from 'jsonwebtoken';  // Legacy JWT library
```

**Result**: Tokens created by frontend can't be verified by backend!

---

## ✅ **THE FIX**

### **Option 1: Standardize on jsonwebtoken (Recommended)**

**Step 1: Update Frontend to use jsonwebtoken**

```typescript
// src/lib/auth.ts - REPLACE jose with jsonwebtoken
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production';

export class AuthService {
  static async createToken(user: User): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  static async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}
```

**Step 2: Update package.json**

```bash
npm uninstall jose
npm install jsonwebtoken @types/jsonwebtoken
```

**Step 3: Update all imports**

Replace all `jose` imports with `jsonwebtoken`:
- `src/lib/auth.ts`
- Any other files using `jose`

---

## 🔧 **VERCEL ENVIRONMENT FIX**

### **Step 1: Fix DATABASE_URL**

**Current (Broken)**:
```
postgresql://postgres.xxx:password@aws-1-us-west-1.pooler.supabase.com:5432/postgres
```

**Fixed (Add pgbouncer=true)**:
```
postgresql://postgres.xxx:password@aws-1-us-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

### **Step 2: Verify Environment Variables in Vercel**

Go to: https://vercel.com/[project]/settings/environment-variables

**Required Variables**:
- ✅ `DATABASE_URL` (with ?pgbouncer=true)
- ✅ `NEXTAUTH_SECRET` (same value as local)
- ✅ `GEMINI_API_KEY`
- ✅ `NEXTAUTH_URL` (production URL)

---

## 🧪 **TEST THE FIX**

### **Step 1: Test Locally**
```bash
npm run dev
# Try to login with test@example.com / testpassword123
```

### **Step 2: Test on Vercel**
```bash
# After pushing changes
# Go to live site and try login
```

### **Step 3: Check Logs**
```bash
# Check Vercel function logs for errors
vercel logs --follow
```

---

## 📋 **QUICK IMPLEMENTATION**

**1. Update src/lib/auth.ts:**
```typescript
// Replace jose imports with jsonwebtoken
import jwt from 'jsonwebtoken';

// Update createToken method
static async createToken(user: User): Promise<string> {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: '7d' }
  );
}

// Update verifyToken method
static async verifyToken(token: string): Promise<any> {
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET!);
  } catch {
    return null;
  }
}
```

**2. Update package.json:**
```bash
npm uninstall jose
npm install jsonwebtoken @types/jsonwebtoken
```

**3. Fix Vercel DATABASE_URL:**
- Add `?pgbouncer=true` to end of DATABASE_URL
- Redeploy

**4. Test:**
- Local login works
- Vercel login works
- No more token errors

---

## ✅ **EXPECTED RESULT**

After this fix:
- ✅ Frontend and backend use same JWT library
- ✅ Tokens created by frontend can be verified by backend
- ✅ Authentication works on Vercel
- ✅ No more "Invalid token" errors
- ✅ Users can login successfully

**Total Fix Time**: 5 minutes
**Complexity**: Low
**Risk**: None (just library standardization)

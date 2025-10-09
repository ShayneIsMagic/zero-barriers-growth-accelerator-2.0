# 🗄️ Supabase Database Setup - Quick Guide

## Step 1: Create Supabase Account (2 minutes)

Browser should have opened: https://supabase.com/dashboard

1. Click "Sign up" or "Sign in with GitHub"
2. Authorize Supabase to access GitHub
3. Complete sign up

---

## Step 2: Create New Project (2 minutes)

1. Click "+ New Project"
2. Fill in:
   - **Name**: `zero-barriers-growth`
   - **Database Password**: (create a strong one, save it!)
   - **Region**: Choose closest to you (e.g., US West)
   - **Pricing Plan**: Free

3. Click "Create new project"
4. Wait ~2 minutes for database to provision

---

## Step 3: Get Connection String (1 minute)

Once project is ready:

1. Go to **Project Settings** (gear icon)
2. Click **Database** in left sidebar
3. Scroll to **Connection String**
4. Select **URI** tab (not Session mode)
5. Click to reveal password
6. Copy the full connection string

It will look like:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Save this URL - you'll need it!**

---

## Step 4: Add to Vercel (2 minutes)

Run these commands:

```bash
# Add to production
vercel env add DATABASE_URL production
# Paste the Supabase URL when prompted

# Add to preview
vercel env add DATABASE_URL preview
# Paste the same URL

# Add to development
vercel env add DATABASE_URL development
# Paste the same URL
```

---

## Step 5: Update Local Environment (1 minute)

Add to your local `.env.local`:

```bash
# Update DATABASE_URL
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

---

## Step 6: Push Database Schema (2 minutes)

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

You should see:
```
✔ Your database is now in sync with your Prisma schema
```

---

## Step 7: Create Production Users (1 minute)

```bash
npm run setup:users
```

This creates:
- admin@zerobarriers.io / ZBadmin123! (SUPER_ADMIN)
- SK@zerobarriers.io / ZBuser123! (USER)

---

## Step 8: Verify Database (1 minute)

Open Supabase Table Editor:
```
Supabase Dashboard → Table Editor → "User" table
```

You should see 2 users with hashed passwords!

---

## Step 9: Redeploy Vercel (1 minute)

```bash
vercel --prod
```

Wait ~30 seconds for deployment to complete.

---

## Step 10: Test Authentication (2 minutes)

1. Go to: https://zero-barriers-growth-accelerator-20-apjvyhjsx.vercel.app/auth/signin

2. Try to login:
   - Email: `admin@zerobarriers.io`
   - Password: `ZBadmin123!`

3. Should redirect to dashboard ✅

4. Try wrong password:
   - Should show error ✅

---

## ✅ Success Checklist

After completing all steps:

- [ ] Supabase project created
- [ ] Database provisioned
- [ ] Connection string copied
- [ ] Added to Vercel (all environments)
- [ ] Prisma schema pushed
- [ ] Users created
- [ ] Vercel redeployed
- [ ] Can login with admin@zerobarriers.io
- [ ] Can login with SK@zerobarriers.io
- [ ] Wrong passwords are rejected

---

## 🆘 Troubleshooting

### "Database URL is invalid"
- Check you copied the entire string
- Check password is correct
- Try regenerating the connection string

### "Cannot connect to database"
- Wait 2-3 minutes for Supabase to fully provision
- Check your IP isn't blocked (Supabase is usually open)
- Try the "Session" mode connection string instead of "URI"

### "Prisma push fails"
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma
npx prisma generate
npx prisma db push
```

---

**Total Time**: ~15 minutes
**Cost**: $0 (FREE forever)
**Result**: Fully working authentication in production! ✅

---

**Ready when you are! Let me know when you have the Supabase connection string.**


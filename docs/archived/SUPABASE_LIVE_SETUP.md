# 🚀 Supabase Setup - Live Guide

## Follow These Steps:

### Step 1: In Supabase Dashboard (should be open)

1. **Click "+ New Project"** (green button)

2. **Fill in the form:**

   ```
   Name: zero-barriers-growth
   Database Password: [CREATE A STRONG PASSWORD - SAVE IT!]
   Region: US West (or closest to you)
   Pricing Plan: Free
   ```

3. **Click "Create new project"**

4. **Wait ~2 minutes** (coffee break! ☕)
   - You'll see a progress bar
   - Database is being provisioned

---

### Step 2: Get Your Connection String

Once the green "Project is ready" appears:

1. **Click the gear icon** (⚙️ Project Settings) in bottom left

2. **Click "Database"** in the left sidebar

3. **Scroll down to "Connection String"**

4. **Click the "URI" tab** (not Session mode)

5. **Click "Copy"** to copy the connection string

6. **It will look like this:**

   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

7. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the database password you created in Step 1

---

### Step 3: Come Back Here

**Once you have the connection string, paste it in chat and I'll:**

- Add it to Vercel
- Push the database schema
- Create your users
- Redeploy
- Test authentication

---

## ⏰ Estimated Time

- Project creation: 1 minute
- Database provisioning: 2 minutes
- Getting connection string: 1 minute
- **Total: ~4 minutes**

Then I'll handle the rest! (another 5 minutes)

---

**Waiting for your Supabase connection string...** 🔄

**Tip**: The connection string is safe to share with me - I'll add it to Vercel's encrypted environment variables where it will be protected.

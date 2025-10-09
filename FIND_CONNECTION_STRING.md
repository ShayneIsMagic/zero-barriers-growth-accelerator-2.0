# 🔍 Finding the Connection String - You're Almost There!

## You're on the RIGHT page! Just need to scroll up.

### What to Do:

1. **Scroll to the TOP of the page** you're currently on (Database Settings)

2. **Look for a section called "Connection String"** - it should be near the top

3. **You'll see these tabs:**
   - PSQL
   - **URI** ← Click this one
   - Pooler
   - Direct connection

4. **Click "URI"** and you'll see:
   ```
   postgresql://postgres.chkwezsyopfciibifmxx:[YOUR-PASSWORD]@...
   ```

---

## Alternative Method: Use Supabase CLI

If you can't find it in the UI, let me get it via CLI:

```bash
# This will show your connection string
npx supabase projects list
```

Or I can construct it for you based on your project ID!

---

## I Can Build It For You:

Based on your project ID `chkwezsyopfciibifmxx`, your connection string is:

```
postgresql://postgres.chkwezsyopfciibifmxx:[YOUR-DB-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Just replace `[YOUR-DB-PASSWORD]` with the database password you created!**

---

**Do you remember the database password you set when creating the project?**

If YES: Use the string above and replace [YOUR-DB-PASSWORD]
If NO: Click "Reset database password" on the page you're viewing now

**Then paste the complete connection string here!** 🚀


# 🔌 Which Connection String to Use

## For Vercel: Use **Transaction Pooler** (IPv4)

### What You're Seeing:

Supabase offers different connection modes:

- **Session pooler** - For long-lived connections
- **Transaction pooler** - For serverless (Vercel) ✅ **USE THIS ONE**
- **Direct connection** - For IPv6 networks

---

## ✅ For Vercel, Use: **Transaction Pooler (IPv4)**

### On the Supabase page:

1. **Look for "Connection pooling" section**

2. **Find "Transaction" mode**

3. **Make sure "IPv4 compatible" is selected**

4. **Copy the connection string** - it should look like:
   ```
   postgresql://postgres.chkwezsyopfciibifmxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

---

## Or Scroll Up to "Connection String" Section

Above the IPv4 compatibility options, there should be a **"Connection String"** section with tabs:

- **URI** ← Click this tab
- You'll see the connection string
- Click to reveal password
- Copy the entire string

---

## What I Need:

**The complete connection string that looks like:**

```
postgresql://postgres.chkwezsyopfciibifmxx:YourPassword@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Key parts:**

- Starts with `postgresql://`
- Has your project ID: `chkwezsyopfciibifmxx`
- Has your password (not `[YOUR-PASSWORD]`)
- Ends with `/postgres`

---

**Paste that here and I'll set it up immediately!** 🚀

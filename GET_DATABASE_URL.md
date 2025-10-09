# 📍 How to Get Database Connection String from Supabase

## You're in the right place! Now navigate to the database settings:

### Step-by-Step:

1. **Look at the LEFT sidebar** in Supabase

2. **Find and click the ⚙️ "Project Settings" icon** (at the very bottom of the left sidebar)

3. **In the settings menu, click "Database"** (in the left menu under "Project Settings")

4. **Scroll down to find "Connection String" section**

5. **You'll see tabs:**
   - Session mode
   - Transaction mode
   - **URI** ← Click this one!

6. **Click "Copy" button** next to the connection string

7. **The string will look like:**
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

8. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the actual database password you created when you made the project

9. **Paste the complete string here in chat**

---

## 🔍 Visual Guide:

```
Supabase Dashboard
├── Left Sidebar
│   ├── Home
│   ├── Table Editor
│   ├── SQL Editor
│   ├── Database
│   ├── Authentication
│   ├── Storage
│   └── ⚙️ Project Settings  ← CLICK HERE
│       ├── General
│       ├── Database  ← THEN CLICK HERE
│       │   └── Connection String section
│       │       └── URI tab  ← COPY THIS
│       ├── API
│       └── ...
```

---

## ⚠️ Don't Confuse These:

| What You See | What It Is | Do We Need It? |
|--------------|------------|----------------|
| **Project URL** | API endpoint | ❌ No |
| **API Key (anon public)** | For Supabase client | ❌ No |
| **API Key (service role)** | For admin operations | ❌ No |
| **Connection String (URI)** | **PostgreSQL database URL** | ✅ **YES - This one!** |

---

## What We Need:

**NOT** the API keys
**NOT** the project URL
**YES** the **Database Connection String (URI)**

---

**Once you paste that connection string here, I'll do the rest!** 🚀


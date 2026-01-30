# Storage and Retrieval Guide

## 📦 Where Files and Assessments Are Stored

Your app uses **two storage systems**:

### 1. **Client-Side Storage (Local Forage / IndexedDB)**
Stored in your browser's IndexedDB:

- **Location**: Browser's IndexedDB database
- **Database Name**: `ZeroBarriers`
- **Stores**:
  - `puppeteer_data` - Puppeteer collected content, metadata, SEO data
  - `reports` - Analysis reports (Markdown/JSON)
  - `imported_files` - Uploaded JSON/Markdown/text files
  - `puppeteer_content` - Cached comprehensive data (24-hour TTL)
  - `analysis_results` - Cached analysis results (24-hour TTL)

### 2. **Server-Side Storage (PostgreSQL Database)**
Stored in your Supabase/PostgreSQL database:

- **Location**: Remote database (via Prisma)
- **Tables**:
  - `ContentSnapshot` - Stored content snapshots
  - `ProposedContent` - Proposed content versions
  - `ContentComparison` - Comparison results
  - `Analysis` - Analysis results

---

## 🔍 How to Retrieve Stored Data

### **Client-Side (Local Forage)**

#### **1. View All Reports**
- **Dashboard**: Click **"View Reports"** button (top-right)
- **Content Comparison Page**: Click **"View Reports"** in results section
- Shows all reports organized by URL with filters

#### **2. Load Saved Puppeteer Data**
- **Content Comparison Page**: Click **"Load Saved Data"** button
- **Other Assessment Pages**: Click **"Load Saved Data"** (if available)
- Select URL from dropdown
- Data loads automatically

#### **3. Access via Browser DevTools**
```javascript
// In browser console:
// 1. Open DevTools (F12)
// 2. Go to Application tab (Chrome) or Storage tab (Firefox)
// 3. Navigate to: IndexedDB → ZeroBarriers
// 4. Browse stores: puppeteer_data, reports, imported_files
```

#### **4. Programmatic Access**
```typescript
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';

// Get Puppeteer data
const data = await UnifiedLocalForageStorage.getPuppeteerData(url);

// Get all reports
const reports = await UnifiedLocalForageStorage.getAllReports();

// Get reports for specific URL
const urlReports = await UnifiedLocalForageStorage.getReportsForUrl(url);

// Get imported files
const files = await UnifiedLocalForageStorage.getAllImportedFiles();
```

### **Server-Side (Database)**

#### **1. Via API Endpoints**
```bash
# Get content snapshots
GET /api/content/snapshots?url={url}

# Get proposed content
GET /api/content/proposed?url={url}

# Get comparisons
GET /api/content/compare?existingId={id}&proposedId={id}
```

#### **2. Via Prisma (Server-Side Only)**
```typescript
import { prisma } from '@/lib/prisma';

// Get latest snapshot
const snapshot = await prisma.contentSnapshot.findFirst({
  where: { url, userId },
  orderBy: { createdAt: 'desc' }
});
```

---

## ⏰ How Long Data Is Stored

### **Client-Side Storage (Local Forage)**

#### **Permanent Storage (No Expiration)**
- ✅ **Puppeteer Data** (`puppeteer_data` store)
  - **Retention**: **Permanent** - until manually cleared
  - **Cleared**: Only when you clear browser data or call `clearAll()`

- ✅ **Reports** (`reports` store)
  - **Retention**: **Permanent** - until manually cleared
  - **Cleared**: Only when you clear browser data or call `clearAll()`

- ✅ **Imported Files** (`imported_files` store)
  - **Retention**: **Permanent** - until manually cleared
  - **Cleared**: Only when you clear browser data or call `clearAll()`

#### **Temporary Cache (24-Hour TTL)**
- ⏱️ **Cached Comprehensive Data** (`puppeteer_content` store)
  - **Retention**: **24 hours** (default)
  - **Expiration**: Automatically removed after 24 hours
  - **Purpose**: Performance optimization for recent scrapes

- ⏱️ **Cached Analysis Results** (`analysis_results` store)
  - **Retention**: **24 hours** (default)
  - **Expiration**: Automatically removed after 24 hours
  - **Purpose**: Performance optimization for recent analyses

### **Server-Side Storage (Database)**

#### **Permanent Storage (No Automatic Expiration)**
- ✅ **Content Snapshots** (`ContentSnapshot` table)
  - **Retention**: **Permanent** - stored indefinitely
  - **Cleared**: Only via manual deletion or database cleanup

- ✅ **Proposed Content** (`ProposedContent` table)
  - **Retention**: **Permanent** - stored indefinitely
  - **Cleared**: Only via manual deletion

- ✅ **Content Comparisons** (`ContentComparison` table)
  - **Retention**: **Permanent** - stored indefinitely
  - **Cleared**: Only via manual deletion

- ✅ **Analysis Results** (`Analysis` table)
  - **Retention**: **Permanent** - stored indefinitely
  - **Cleared**: Only via manual deletion

---

## 📊 Storage Details by Type

### **1. Puppeteer Collected Data**

**Storage Location**: 
- Client: `ZeroBarriers/puppeteer_data` (IndexedDB)
- Server: `ContentSnapshot` table (PostgreSQL)

**What's Stored**:
- All pages scraped (with page labels from navbar)
- SEO metadata (titles, descriptions, tags)
- Keywords (meta, content, heading, alt text)
- Analytics (GA4, GTM, Facebook Pixel)
- HTML semantic tags
- Clean text content
- Page structure and hierarchy

**Retrieval**:
```typescript
// Client-side
const data = await UnifiedLocalForageStorage.getPuppeteerData(url);

// Server-side
const snapshot = await ContentStorageService.getLatestSnapshot(url, userId);
```

**Retention**: **Permanent** (both client and server)

---

### **2. Analysis Reports**

**Storage Location**: 
- Client: `ZeroBarriers/reports` (IndexedDB)
- Server: `Analysis` table (PostgreSQL)

**What's Stored**:
- Full analysis results (Markdown or JSON)
- Assessment type (content-comparison, b2c-elements, etc.)
- URL analyzed
- Timestamp
- Report ID

**Retrieval**:
```typescript
// Get all reports
const reports = await UnifiedLocalForageStorage.getAllReports();

// Get reports for URL
const urlReports = await UnifiedLocalForageStorage.getReportsForUrl(url);

// Get specific report
const report = await UnifiedLocalForageStorage.getReport(reportId);
```

**Retention**: **Permanent** (both client and server)

---

### **3. Imported Files**

**Storage Location**: 
- Client: `ZeroBarriers/imported_files` (IndexedDB)

**What's Stored**:
- Uploaded JSON/Markdown/text files
- File content (parsed or raw)
- Filename
- Upload timestamp

**Retrieval**:
```typescript
// Get all imported files
const files = await UnifiedLocalForageStorage.getAllImportedFiles();

// Get specific file
const file = await UnifiedLocalForageStorage.getImportedFile(fileId);
```

**Retention**: **Permanent** (until manually cleared)

---

## 🗑️ How to Clear Stored Data

### **Clear All Client-Side Data**
```typescript
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';

// Clear everything
await UnifiedLocalForageStorage.clearAll();
```

### **Clear via Browser**
1. **Chrome/Edge**:
   - Settings → Privacy → Clear browsing data
   - Select "Cached images and files" and "IndexedDB"
   - Click "Clear data"

2. **Firefox**:
   - Settings → Privacy → Clear Data
   - Select "IndexedDB"
   - Click "Clear"

3. **Safari**:
   - Preferences → Privacy → Manage Website Data
   - Find your site → Remove

### **Clear Server-Side Data**
```typescript
// Delete specific snapshot
await prisma.contentSnapshot.delete({ where: { id } });

// Delete all snapshots for user
await prisma.contentSnapshot.deleteMany({ where: { userId } });
```

---

## 📈 Storage Limits

### **Client-Side (IndexedDB)**
- **Chrome/Edge**: ~60% of available disk space (can be several GB)
- **Firefox**: ~50% of available disk space
- **Safari**: ~1GB by default (can be increased)

**Typical Usage**:
- Puppeteer data: ~100KB - 5MB per URL (depending on pages)
- Reports: ~50KB - 2MB per report
- Imported files: Varies by file size

### **Server-Side (PostgreSQL)**
- Limited by your database plan
- Supabase free tier: 500MB
- Supabase pro tier: 8GB+

---

## 🔄 Data Flow

```
1. User runs Content Comparison
   ↓
2. Puppeteer collects data
   ↓
3. Data saved to:
   - Local Forage (client) - PERMANENT
   - Database (server) - PERMANENT (if logged in)
   ↓
4. Analysis runs
   ↓
5. Report saved to:
   - Local Forage (client) - PERMANENT
   - Database (server) - PERMANENT (if logged in)
   ↓
6. User can retrieve:
   - Via "View Reports" button
   - Via "Load Saved Data" button
   - Via browser DevTools
   - Via API endpoints (server-side)
```

---

## 🎯 Quick Reference

### **Where to Find Reports**
- ✅ Dashboard → "View Reports" button
- ✅ Content Comparison → "View Reports" button
- ✅ Browser DevTools → Application → IndexedDB → ZeroBarriers → reports

### **How to Load Saved Data**
- ✅ Content Comparison → "Load Saved Data" button
- ✅ Other assessment pages → "Load Saved Data" button (if available)

### **Storage Duration**
- ✅ **Puppeteer Data**: Permanent (until cleared)
- ✅ **Reports**: Permanent (until cleared)
- ✅ **Imported Files**: Permanent (until cleared)
- ⏱️ **Cache**: 24 hours (auto-expires)

### **Storage Location**
- ✅ **Client**: Browser IndexedDB (Local Forage)
- ✅ **Server**: PostgreSQL database (if logged in)

---

## 💡 Best Practices

1. **Save Important Data**: Use "Save to Local Forage" for data you want to keep
2. **Export for Backup**: Download reports as JSON/Markdown for long-term storage
3. **Clear Old Data**: Periodically clear cache if storage becomes an issue
4. **Use Consistent URLs**: Same URL = same storage key = easy retrieval
5. **Check Before Scraping**: System automatically checks cache first

---

## 🔧 Troubleshooting

### **"No saved data found"**
- Verify you saved data first
- Check URL matches exactly
- Clear browser cache and try again

### **"Storage quota exceeded"**
- Clear old cached data
- Export important reports
- Clear browser IndexedDB

### **"Data expired"**
- Only affects 24-hour cache (not permanent storage)
- Re-save data to make it permanent
- Or re-scrape to refresh cache

---

## Summary

- **Storage**: Client (IndexedDB) + Server (PostgreSQL)
- **Retrieval**: UI buttons, DevTools, or programmatic access
- **Retention**: 
  - Permanent storage: Never expires (until manually cleared)
  - Cache: 24 hours (auto-expires)
- **Location**: Browser IndexedDB + Remote database

All your data is safely stored and easily retrievable!


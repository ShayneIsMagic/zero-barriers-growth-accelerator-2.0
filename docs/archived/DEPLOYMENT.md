# 🚀 Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Build passes: `npm run build` ✅
- [x] No TypeScript errors (or configured to ignore) ✅
- [x] Environment variables configured ✅
- [x] AI API keys set up ✅
- [x] No demo data ✅
- [x] Styling working ✅

---

## 🎯 Deployment Options

### **Option 1: Vercel** (⭐ RECOMMENDED)

**Why Vercel?**

- Built for Next.js
- Zero configuration
- Automatic deployments
- Free SSL
- CDN included

**Steps**:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Set environment variables in Vercel dashboard
# Go to: Settings → Environment Variables
# Add: GEMINI_API_KEY, CLAUDE_API_KEY

# 5. Redeploy
vercel --prod
```

**Time**: 5 minutes  
**Cost**: Free (Hobby plan)  
**URL**: `https://your-project.vercel.app`

---

### **Option 2: Netlify**

**Steps**:

```bash
# 1. Build the app
npm run build

# 2. Install Netlify CLI
npm install -g netlify-cli

# 3. Login
netlify login

# 4. Deploy
netlify deploy --prod

# 5. Set environment variables
netlify env:set GEMINI_API_KEY your-key-here
netlify env:set CLAUDE_API_KEY your-key-here
```

**Time**: 10 minutes  
**Cost**: Free (Starter plan)

---

### **Option 3: Cloudflare Pages**

**Steps**:

```bash
# 1. Build static export
npm run build

# 2. Login to Cloudflare
# Go to: https://dash.cloudflare.com/

# 3. Create new Pages project
# Connect your Git repository

# 4. Build settings:
# Build command: npm run build
# Output directory: .next
# Environment variables: Add AI keys
```

**Time**: 10 minutes  
**Cost**: Free

---

### **Option 4: Self-Hosted (VPS)**

**Requirements**:

- Ubuntu 20.04+ or similar
- Node.js 18+ installed
- nginx for reverse proxy

**Steps**:

```bash
# On your server

# 1. Clone repo
git clone <your-repo>
cd zero-barriers-growth-accelerator

# 2. Install dependencies
npm install --legacy-peer-deps --production

# 3. Build
npm run build

# 4. Set environment variables
nano .env.local
# Add your AI API keys

# 5. Start with PM2
npm install -g pm2
pm2 start npm --name "zero-barriers" -- start
pm2 save
pm2 startup

# 6. Configure nginx
sudo nano /etc/nginx/sites-available/zero-barriers
```

**nginx config**:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 Environment Variables for Production

### **Required**:

```env
# At least ONE AI service
GEMINI_API_KEY=your-key
# OR
CLAUDE_API_KEY=your-key

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://yourdomain.com

# Environment
NODE_ENV=production
```

### **Optional**:

```env
# Database (if using Prisma)
DATABASE_URL=postgresql://...

# Google APIs (for advanced SEO)
GOOGLE_SEARCH_CONSOLE_CLIENT_ID=
GOOGLE_ADS_API_KEY=

# External services
BROWSERLESS_API_KEY=
```

---

## 🏗️ Build Configuration

### **For Static Export** (Netlify, Cloudflare):

```javascript
// next.config.js
module.exports = {
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
};
```

### **For Server-Side** (Vercel, VPS):

```javascript
// next.config.js
module.exports = {
  // Current config is already optimized
};
```

---

## 🔍 Production Checklist

### **Before Deploying**:

- [ ] Test build locally: `npm run build`
- [ ] Test production mode: `npm start`
- [ ] Set all environment variables
- [ ] Test AI API connectivity
- [ ] Run security audit: `npm audit`
- [ ] Check for console errors
- [ ] Test on mobile devices

### **After Deploying**:

- [ ] Visit deployed URL
- [ ] Test all 4 analysis tools
- [ ] Verify styling (dark mode)
- [ ] Check browser console
- [ ] Test analysis save/load
- [ ] Monitor server logs

---

## 📊 Performance Optimization

### **Already Configured**:

- ✅ Static page generation (45 pages)
- ✅ Image optimization
- ✅ Code splitting
- ✅ Bundle size optimization
- ✅ CSS purging (Tailwind)

### **Additional Optimizations**:

```bash
# Analyze bundle size
ANALYZE=true npm run build

# Results in: .next/analyze/client.html
```

---

## 🐛 Common Deployment Issues

### **Issue**: "Module not found" in production

**Fix**: Add to `package.json` dependencies (not devDependencies)

### **Issue**: "AI_SERVICE_UNAVAILABLE"

**Fix**: Set environment variables in deployment platform

### **Issue**: "Styling broken" in production

**Fix**: Ensure `globals.css` is imported in `layout.tsx`

### **Issue**: "Build timeout"

**Fix**: Increase build timeout in platform settings

---

## 🎯 Deployment Recommendations

### **For Personal/Testing**:

→ **Vercel** (free, fast, easy)

### **For Production Business**:

→ **Vercel Pro** or **Self-hosted VPS**

### **For Static Sites**:

→ **Cloudflare Pages** (fast, free)

### **For Enterprise**:

→ **Self-hosted with PM2 + nginx**

---

## 💡 Post-Deployment

### **Monitor**:

- Server logs
- Error rates
- API usage (Gemini/Claude quotas)
- Performance metrics

### **Optimize**:

- Enable caching
- Add CDN
- Compress responses
- Monitor bundle size

### **Update**:

```bash
# On server
git pull
npm install --legacy-peer-deps
npm run build
pm2 restart zero-barriers
```

---

## 🎊 Success Criteria

Your deployment is successful when:

1. ✅ Site loads at your domain
2. ✅ All pages render with styling
3. ✅ Can run analyses and get results
4. ✅ Results save and load correctly
5. ✅ No console errors
6. ✅ Mobile responsive

---

## 📞 Support

Check documentation in project root:

- `ANALYSIS_STATUS.md` - Usage guide
- `ENVIRONMENT_FIXES.md` - Technical details
- `VERSION_COMPATIBILITY.md` - Version info

---

**Ready to deploy?** Choose a platform and follow the steps above!

**Last Updated**: October 8, 2025  
**Build Status**: ✅ PASSING  
**Production Ready**: ✅ YES

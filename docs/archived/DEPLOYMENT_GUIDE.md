# 🚀 Complete Deployment Guide

This guide covers deploying Zero Barriers Growth Accelerator to various hosting platforms.

---

## Prerequisites

### Required

- ✅ Node.js 18.x or higher
- ✅ npm 9.x or higher
- ✅ Git
- ✅ At least one AI API key (Gemini or Claude)

### Recommended

- ✅ GitHub account
- ✅ Hosting platform account (Vercel/Netlify/etc.)
- ✅ Custom domain (optional)

---

## 🎯 Quick Deploy to Vercel (5 Minutes)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
cd /path/to/zero-barriers-growth-accelerator-2.0
vercel
```

### Step 4: Add Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add:

```
GEMINI_API_KEY=your-key-here
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-project.vercel.app
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

**Your URL**: `https://your-project.vercel.app`

---

## 📦 Deployment Options

### Option 1: Vercel (Recommended)

**Pros**:

- ✅ Built for Next.js
- ✅ Zero configuration
- ✅ Automatic deployments
- ✅ Free SSL
- ✅ CDN included
- ✅ Edge functions

**Pricing**: Free tier available

**Steps**:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**URL Format**: `https://project-name.vercel.app`

---

### Option 2: Netlify

**Pros**:

- ✅ Easy deployment
- ✅ Free tier
- ✅ Forms and functions
- ✅ Split testing

**Steps**:

```bash
# Build the app
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Set environment variables
netlify env:set GEMINI_API_KEY your-key-here
netlify env:set NEXTAUTH_SECRET your-secret-here
netlify env:set NEXTAUTH_URL https://your-site.netlify.app
```

**URL Format**: `https://project-name.netlify.app`

---

### Option 3: Railway

**Pros**:

- ✅ Great for full-stack apps
- ✅ Database included
- ✅ Easy environment management

**Steps**:

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Connect GitHub repository
4. Add environment variables
5. Deploy

**URL Format**: `https://project-name.up.railway.app`

---

### Option 4: Render

**Pros**:

- ✅ Free tier
- ✅ PostgreSQL included
- ✅ Auto-deploy from Git

**Steps**:

1. Go to [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect repository
4. Configure:
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Add environment variables
6. Deploy

**URL Format**: `https://project-name.onrender.com`

---

### Option 5: Self-Hosted (VPS)

**Requirements**:

- Ubuntu 20.04+ or similar
- Node.js 18+
- PM2 or similar process manager
- Nginx (reverse proxy)

**Steps**:

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/zero-barriers-growth-accelerator-2.0.git
cd zero-barriers-growth-accelerator-2.0

# Install dependencies
npm install --legacy-peer-deps

# Create environment file
nano .env.local
# Add your environment variables

# Build
npm run build

# Start with PM2
pm2 start npm --name "zero-barriers" -- start
pm2 save
pm2 startup
```

#### 3. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/zero-barriers
```

Add:

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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/zero-barriers /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🔐 Environment Variables

### Required Variables

```env
# AI Services (at least one required)
GEMINI_API_KEY=your-gemini-key
CLAUDE_API_KEY=your-claude-key

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

### Optional Variables

```env
# OpenAI (optional)
OPENAI_API_KEY=your-openai-key

# Database (if using)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (if using)
REDIS_URL=redis://localhost:6379

# Google APIs (for advanced features)
GOOGLE_SEARCH_CONSOLE_CLIENT_ID=your-client-id
GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET=your-client-secret
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## 🧪 Pre-Deployment Checklist

### 1. Code Quality

```bash
# Run linter
npm run lint:fix

# Type check
npm run type-check

# Run tests
npm test
```

### 2. Build Test

```bash
# Test production build
npm run build

# Test production server locally
npm start
```

### 3. Environment Variables

- [ ] All required variables set
- [ ] API keys valid and working
- [ ] NEXTAUTH_URL matches deployment URL

### 4. Security

- [ ] All secrets in environment variables (not code)
- [ ] .env files in .gitignore
- [ ] No API keys committed to Git

### 5. Performance

- [ ] Images optimized
- [ ] Unused dependencies removed
- [ ] Build output < 100MB

---

## 🔄 CI/CD Setup

### GitHub Actions

Your repo includes workflows in `.github/workflows/`:

1. **ci.yml** - Runs on every push/PR
   - Linting
   - Type checking
   - Unit tests
   - Build

2. **deploy.yml** - Deploys on push to main
   - Builds application
   - Deploys to Vercel

3. **test-e2e.yml** - Runs E2E tests
   - Playwright tests
   - Upload test results

### Required Secrets

Add to GitHub: Settings → Secrets and variables → Actions

```
GEMINI_API_KEY
CLAUDE_API_KEY
NEXTAUTH_SECRET
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Recommended)

```bash
# Add to package.json
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Tracking (Optional)

**Sentry**:

```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

---

## 🌐 Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Netlify

1. Go to Site Settings → Domain Management
2. Add custom domain
3. Follow DNS instructions

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Try build again
npm run build
```

### Environment Variables Not Working

- Check spelling and case sensitivity
- Restart deployment after adding variables
- Check quotes (don't use quotes in hosting dashboards)

### 500 Server Errors

- Check API keys are valid
- Check NEXTAUTH_SECRET is set
- Check logs in hosting dashboard

### Slow Performance

- Enable caching
- Use CDN
- Optimize images
- Check database connection pooling

---

## 📈 Post-Deployment

### 1. Test Everything

- [ ] Homepage loads
- [ ] Authentication works
- [ ] Analysis tools function
- [ ] All pages accessible
- [ ] Mobile responsive

### 2. Configure Monitoring

- [ ] Set up error tracking
- [ ] Enable analytics
- [ ] Configure alerts

### 3. SEO Setup

- [ ] Submit sitemap to Google
- [ ] Configure meta tags
- [ ] Set up Google Analytics

### 4. Performance

- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Test on slow connections

---

## 🆘 Support

### Resources

- [Deployment Documentation](./DEPLOYMENT.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)
- [Architecture Guide](./ARCHITECTURE.md)

### Common Issues

- Build errors: Check Node version (18-24)
- API failures: Verify environment variables
- Slow performance: Enable caching and CDN

---

**🎉 Congratulations! Your app is deployed!**

**Next Steps**:

1. Test your deployment
2. Set up monitoring
3. Configure custom domain
4. Share with users!

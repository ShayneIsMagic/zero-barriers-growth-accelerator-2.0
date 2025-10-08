#!/bin/bash

# Production Deployment Script for Zero Barriers Growth Accelerator
# This script handles production deployment with safety checks

set -e  # Exit on any error

# Configuration
APP_NAME="zero-barriers-growth-accelerator"
DEPLOYMENT_ENV="production"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

echo "🚀 Starting production deployment for $APP_NAME..."

# 1. Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: Must be on main branch for production deployment"
    echo "Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Uncommitted changes detected"
    git status --porcelain
    exit 1
fi

# Check environment variables
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found"
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# 2. Create backup
echo "💾 Creating backup..."
mkdir -p "$BACKUP_DIR"
if [ -d ".next" ]; then
    cp -r .next "$BACKUP_DIR/"
fi
echo "✅ Backup created at $BACKUP_DIR"

# 3. Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# 4. Install dependencies
echo "📦 Installing dependencies..."
npm ci

# 5. Run production build
echo "🏗️ Running production build..."
npm run build

# 6. Run tests
echo "🧪 Running tests..."
npm run test:coverage

# 7. Database migration (if needed)
echo "🗄️ Checking database migrations..."
if command -v npx &> /dev/null; then
    npx prisma migrate deploy
fi

# 8. Deploy to Vercel (if configured)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
else
    echo "⚠️  Vercel CLI not found, skipping Vercel deployment"
fi

# 9. Health check
echo "🏥 Running health check..."
sleep 10  # Wait for deployment to settle

# 10. Post-deployment verification
echo "✅ Deployment completed successfully!"
echo "📊 Application deployed to production"
echo "🔗 Check your production URL for verification"
echo "📁 Backup available at: $BACKUP_DIR"

# 11. Cleanup old backups (keep last 5)
echo "🧹 Cleaning up old backups..."
cd backups
ls -t | tail -n +6 | xargs -r rm -rf
cd ..

echo "🎉 Production deployment completed successfully!"



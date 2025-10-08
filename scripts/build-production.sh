#!/bin/bash

# Production Build Script for Zero Barriers Growth Accelerator
# This script ensures a clean, optimized production build

set -e  # Exit on any error

echo "🚀 Starting production build process..."

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# 2. Install dependencies (production only)
echo "📦 Installing production dependencies..."
npm ci --only=production

# 3. Install dev dependencies for build
echo "🔧 Installing build dependencies..."
npm install --save-dev

# 4. Run code quality checks
echo "✅ Running code quality checks..."
npm run lint
npm run type-check
npm run format:check

# 5. Run tests
echo "🧪 Running tests..."
npm run test:coverage

# 6. Build the application
echo "🏗️ Building application..."
npm run build

# 7. Generate database client
echo "🗄️ Generating database client..."
npm run db:generate

# 8. Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level=moderate

# 9. Build Docker image (if Dockerfile exists)
if [ -f "Dockerfile" ]; then
    echo "🐳 Building Docker image..."
    docker build -t zero-barriers-growth-accelerator:latest .
fi

echo "🎉 Production build completed successfully!"
echo "📁 Build artifacts are ready in .next/ directory"
echo "🚀 Ready for deployment!"



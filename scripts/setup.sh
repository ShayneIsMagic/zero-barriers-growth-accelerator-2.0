#!/bin/bash

# Zero Barriers Growth Accelerator - Development Setup Script
set -e

echo "🚀 Setting up Zero Barriers Growth Accelerator development environment..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18.17.0 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.17.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please upgrade to $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION is compatible"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual configuration values"
else
    echo "✅ Environment file already exists"
fi

# Generate Prisma client
echo "🗄️ Setting up database..."
npm run db:generate

# Check if database is accessible
if [ -n "$DATABASE_URL" ]; then
    echo "🔗 Testing database connection..."
    if npm run db:push --silent; then
        echo "✅ Database connection successful"
        
        # Run initial migration
        echo "📊 Running database migrations..."
        npm run db:migrate
        
        # Seed database (optional)
        if [ -f "prisma/seed.ts" ]; then
            echo "🌱 Seeding database..."
            npm run db:seed
        fi
    else
        echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env.local"
    fi
else
    echo "⚠️  DATABASE_URL not set. Please configure your database connection in .env.local"
fi

# Type checking
echo "🔍 Running type checks..."
npm run type-check

# Run tests
echo "🧪 Running tests..."
npm run test -- --run

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install

echo ""
echo "🎉 Setup complete! You can now start development with:"
echo "   npm run dev"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env.local with your API keys and database URL"
echo "   2. Configure your database and run migrations"
echo "   3. Start the development server"
echo "   4. Visit http://localhost:3000"
echo ""
echo "🔧 Available commands:"
echo "   npm run dev          - Start development server"
echo "   npm run build        - Build for production"
echo "   npm run test         - Run unit tests"
echo "   npm run e2e          - Run end-to-end tests"
echo "   npm run lint         - Lint code"
echo "   npm run format       - Format code"
echo "   npm run db:studio    - Open Prisma Studio"
echo ""
echo "📚 Documentation: See README.md for detailed information"



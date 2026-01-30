#!/bin/bash
# Script to safely prepare production commit and create fix branch

set -e  # Exit on error

echo "🔍 Checking current status..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: Not on main branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No uncommitted changes. Ready to create fix branch."
    exit 0
fi

echo "📦 Staging all changes..."
git add -A

echo "🔍 Running type check..."
if ! npm run type-check > /dev/null 2>&1; then
    echo "⚠️  TypeScript errors found. Review before committing."
    npm run type-check 2>&1 | grep "error TS" | head -10
    read -p "Continue with commit anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🔨 Running build check..."
if ! npm run build > /dev/null 2>&1; then
    echo "❌ Build failed. Fix errors before committing."
    exit 1
fi

echo "✅ All checks passed!"
echo ""
echo "📝 Ready to commit. Use this command:"
echo "   git commit -F .git-commit-message.txt"
echo ""
echo "Then create fix branch with:"
echo "   git checkout -b fix/audit-issues"


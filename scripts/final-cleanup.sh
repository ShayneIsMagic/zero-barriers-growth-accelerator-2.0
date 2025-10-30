#!/bin/bash

# Final Cleanup Script
# Removes empty directories and remaining non-essential files

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DRY_RUN="${1:-false}"

echo "🧹 Final Cleanup - Removing Empty Directories and Non-Essential Files"
if [ "$DRY_RUN" = "true" ]; then
  echo "🔍 DRY RUN MODE - No files will be deleted"
fi
echo ""

# Function to remove if not dry run
remove_file() {
  local file="$1"
  if [ "$DRY_RUN" = "true" ]; then
    echo "  [DRY RUN] Would remove: $file"
  else
    if [ -f "$file" ]; then
      rm "$file"
      echo "  ✅ Removed: $file"
    fi
  fi
}

remove_dir() {
  local dir="$1"
  if [ "$DRY_RUN" = "true" ]; then
    echo "  [DRY RUN] Would remove directory: $dir"
  else
    if [ -d "$dir" ]; then
      rmdir "$dir" 2>/dev/null && echo "  ✅ Removed empty directory: $dir" || echo "  ⚠️  Directory not empty or already removed: $dir"
    fi
  fi
}

# 1. Remove empty dashboard directories
echo "📁 Removing empty dashboard directories..."
for dir in \
  src/app/dashboard/analysis \
  src/app/dashboard/analyze \
  src/app/dashboard/automated-google-tools \
  src/app/dashboard/clean \
  src/app/dashboard/clifton-strengths \
  src/app/dashboard/clifton-strengths-simple \
  src/app/dashboard/coming-soon \
  src/app/dashboard/comprehensive-analysis \
  src/app/dashboard/controlled-analysis \
  src/app/dashboard/elements-of-value \
  src/app/dashboard/elements-value-b2b \
  src/app/dashboard/elements-value-b2c \
  src/app/dashboard/elements-value-standalone \
  src/app/dashboard/enhanced-analysis \
  src/app/dashboard/evaluation-guide \
  src/app/dashboard/golden-circle-standalone \
  src/app/dashboard/google-tools \
  src/app/dashboard/multi-page-scraping \
  src/app/dashboard/page-analysis \
  src/app/dashboard/phase2 \
  src/app/dashboard/phase3 \
  src/app/dashboard/phased-analysis \
  src/app/dashboard/progressive-analysis \
  src/app/dashboard/revenue-trends \
  src/app/dashboard/seo-analysis \
  src/app/dashboard/step-by-step-analysis \
  src/app/dashboard/step-by-step-execution \
  src/app/dashboard/unified-analysis \
  src/app/dashboard/website-analysis; do
  if [ -d "$ROOT_DIR/$dir" ]; then
    remove_dir "$ROOT_DIR/$dir"
  fi
done

# 2. Remove empty services directory
echo ""
echo "📁 Removing empty services directory..."
if [ -d "$ROOT_DIR/src/lib/services" ]; then
  remove_dir "$ROOT_DIR/src/lib/services"
fi

# 3. Remove .txt files from src/app
echo ""
echo "📄 Removing .txt files from src/app..."
for file in \
  src/app/blog.txt \
  src/app/docs.txt \
  src/app/signin.txt \
  src/app/signup.txt \
  src/app/forgot-password.txt; do
  if [ -f "$ROOT_DIR/$file" ]; then
    remove_file "$ROOT_DIR/$file"
  fi
done

# 4. Check executive-reports (might have a page.tsx)
echo ""
echo "🔍 Checking executive-reports..."
if [ -f "$ROOT_DIR/src/app/dashboard/executive-reports/page.tsx" ]; then
  if [ "$DRY_RUN" = "true" ]; then
    echo "  [DRY RUN] Would archive: src/app/dashboard/executive-reports/page.tsx"
  else
    mkdir -p "$ROOT_DIR/src/archived/dashboard-pages/src/app/dashboard/executive-reports"
    mv "$ROOT_DIR/src/app/dashboard/executive-reports/page.tsx" \
       "$ROOT_DIR/src/archived/dashboard-pages/src/app/dashboard/executive-reports/" 2>/dev/null && \
       echo "  ✅ Archived: src/app/dashboard/executive-reports/page.tsx"
    rmdir "$ROOT_DIR/src/app/dashboard/executive-reports" 2>/dev/null || true
  fi
fi

echo ""
if [ "$DRY_RUN" = "true" ]; then
  echo "✅ Dry run complete! Review above and run without --dry-run to actually clean."
else
  echo "✅ Final cleanup complete!"
  echo ""
  echo "📋 Summary:"
  echo "  - Removed empty dashboard directories"
  echo "  - Removed empty services directory"
  echo "  - Removed .txt files from src/app"
  echo "  - Archived executive-reports if found"
fi

#!/bin/bash

# Archive Files Script
# Safely moves files to archive directories before deletion

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_BASE="$ROOT_DIR/src/archived"
DRY_RUN="${1:-false}"

echo "📦 Setting up archive directories..."
mkdir -p "$ARCHIVE_BASE/dashboard-pages"
mkdir -p "$ARCHIVE_BASE/analysis-components"
mkdir -p "$ARCHIVE_BASE/api-routes"
mkdir -p "$ARCHIVE_BASE/services"
mkdir -p "$ARCHIVE_BASE/app-routes"
mkdir -p "$ARCHIVE_BASE/test-files"
mkdir -p "$ARCHIVE_BASE/working"

# Function to archive a file
archive_file() {
    local file="$1"
    local category="$2"
    local archive_dir="$ARCHIVE_BASE/$category"
    
    if [ ! -f "$file" ]; then
        echo "  ⚠️  File not found: $file"
        return
    fi
    
    # Create directory structure in archive
    local relative_path="${file#$ROOT_DIR/}"
    local dir_path=$(dirname "$relative_path")
    mkdir -p "$archive_dir/$dir_path"
    
    local dest="$archive_dir/$relative_path"
    
    if [ "$DRY_RUN" = "true" ]; then
        echo "  [DRY RUN] Would move: $relative_path -> $dest"
    else
        # Use git mv to preserve history if in git, otherwise regular mv
        if git rev-parse --git-dir > /dev/null 2>&1; then
            git mv "$file" "$dest" 2>/dev/null || mv "$file" "$dest"
        else
            mv "$file" "$dest"
        fi
        echo "  ✅ Archived: $relative_path"
    fi
}

# Function to archive directory
archive_directory() {
    local dir="$1"
    local category="$2"
    
    if [ ! -d "$dir" ]; then
        echo "  ⚠️  Directory not found: $dir"
        return
    fi
    
    local relative_path="${dir#$ROOT_DIR/}"
    local dest="$ARCHIVE_BASE/$category/$relative_path"
    
    if [ "$DRY_RUN" = "true" ]; then
        echo "  [DRY RUN] Would move directory: $relative_path -> $dest"
    else
        mkdir -p "$(dirname "$dest")"
        mv "$dir" "$dest"
        echo "  ✅ Archived directory: $relative_path"
    fi
}

echo ""
echo "🗑️  Starting archive process..."
if [ "$DRY_RUN" = "true" ]; then
    echo "🔍 DRY RUN MODE - No files will be moved"
fi
echo ""

# Read from FILES_TO_ELIMINATE.md
FILES_LIST="$ROOT_DIR/docs/FILES_TO_ELIMINATE.md"

if [ ! -f "$FILES_LIST" ]; then
    echo "❌ Error: $FILES_LIST not found"
    exit 1
fi

# Extract and archive dashboard pages
echo "📁 Archiving Dashboard Pages..."
while IFS= read -r file; do
    if [[ "$file" =~ ^src/app/dashboard/.*/page\.tsx$ ]] && \
       [[ ! "$file" =~ (content-comparison|reports)/page\.tsx$ ]] && \
       [[ ! "$file" =~ ^src/app/dashboard/page\.tsx$ ]]; then
        archive_file "$ROOT_DIR/$file" "dashboard-pages"
    fi
done < <(grep -E "^src/app/dashboard" "$FILES_LIST" 2>/dev/null || true)

# Extract and archive analysis components
echo ""
echo "📁 Archiving Analysis Components..."
while IFS= read -r file; do
    if [[ "$file" =~ ^src/components/analysis/.*\.tsx$ ]] && \
       [[ ! "$file" =~ ContentComparisonPage\.tsx$ ]]; then
        archive_file "$ROOT_DIR/$file" "analysis-components"
    fi
done < <(grep -E "^src/components/analysis" "$FILES_LIST" 2>/dev/null || true)

# Extract and archive services
echo ""
echo "📁 Archiving Services..."
while IFS= read -r file; do
    if [[ "$file" =~ ^src/lib/services/.*\.ts$ ]]; then
        archive_file "$ROOT_DIR/$file" "services"
    fi
done < <(grep -E "^src/lib/services" "$FILES_LIST" 2>/dev/null || true)

# Archive API routes (entire directories)
echo ""
echo "📁 Archiving API Routes..."
# Archive entire API subdirectories except compare and enhanced
for dir in "$ROOT_DIR/src/app/api"/*; do
    if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        if [ "$dirname" != "analyze" ]; then
            archive_directory "$dir" "api-routes"
        else
            # Archive individual routes in analyze directory
            for route in "$dir"/*; do
                routename=$(basename "$route")
                if [ "$routename" != "compare" ] && [ "$routename" != "enhanced" ]; then
                    archive_directory "$route" "api-routes"
                fi
            done
        fi
    fi
done

# Archive test files
echo ""
echo "📁 Archiving Test Files..."
[ -d "$ROOT_DIR/src/test" ] && archive_directory "$ROOT_DIR/src/test" "test-files" || true
[ -d "$ROOT_DIR/tests" ] && archive_directory "$ROOT_DIR/tests" "test-files" || true

# Archive working directory
echo ""
echo "📁 Archiving Working Directory..."
[ -d "$ROOT_DIR/src/working" ] && archive_directory "$ROOT_DIR/src/working" "working" || true

echo ""
if [ "$DRY_RUN" = "true" ]; then
    echo "✅ Dry run complete! Review above and run without --dry-run to actually archive."
else
    echo "✅ Archive complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test your application to ensure everything still works"
    echo "2. If tests pass, you can safely delete archived files"
    echo "3. Review: $ARCHIVE_BASE/"
fi


#!/bin/bash

# Eject Non-Essential Documentation Script

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_DIR="$ROOT_DIR/docs/archived/cleanup-docs"
DRY_RUN="${1:-false}"

echo "📦 Archiving Non-Essential Documentation"
if [ "$DRY_RUN" = "true" ]; then
  echo "🔍 DRY RUN MODE - No files will be moved"
fi
echo ""

mkdir -p "$ARCHIVE_DIR"

# Function to archive file
archive_file() {
  local file="$1"
  local basename=$(basename "$file")
  
  if [ ! -f "$ROOT_DIR/$file" ]; then
    echo "  ⚠️  File not found: $file"
    return
  fi
  
  if [ "$DRY_RUN" = "true" ]; then
    echo "  [DRY RUN] Would archive: $file"
  else
    mv "$ROOT_DIR/$file" "$ARCHIVE_DIR/$basename"
    echo "  ✅ Archived: $file"
  fi
}

# Phase 1: One-time cleanup docs
echo "📁 Phase 1: Archiving one-time cleanup docs..."
for file in \
  docs/CLEANUP_PLAN.md \
  docs/FINAL_CLEANUP_CHECKLIST.md \
  docs/CODEBASE_AUDIT.md \
  docs/FILES_TO_ELIMINATE.md \
  docs/ESSENTIAL_FILES_LIST.md \
  docs/USEFUL_CODE_TO_KEEP.md \
  docs/DEPENDENCY_CHECK_RESULTS.md \
  docs/FRAMEWORK_COVERAGE_AUDIT.md \
  docs/FRAMEWORK_COVERAGE_SUMMARY.md \
  docs/FRAMEWORK_INTEGRITY_MEASURES.md; do
  archive_file "$file"
done

echo ""
echo "📋 Summary:"
echo "  - 10 cleanup/audit docs archived to docs/archived/cleanup-docs/"
echo ""
echo "✅ Phase 1 complete!"
echo ""
echo "⚠️  Phase 2: Manual review needed for Cursor & AI docs:"
echo "   - CURSOR_AGILE_WORKFLOW.md"
echo "   - CURSOR_DOCS_REFERENCE.md"
echo "   - CURSOR_SECURITY_ADDENDUM.md"
echo "   - INTEGRATION_GUIDE.md"
echo "   - GEMINI_PROMPT_TEMPLATES.md"
echo "   - GEMINI_PROMPT_USAGE.md"
echo "   - STANDARD_AI_PROMPT_TEMPLATE.md"
echo ""
echo "   Review these files and archive manually if not needed."


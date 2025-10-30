#!/bin/bash

# Dependency Check Script
# Checks if files marked for deletion are imported/referenced elsewhere

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULTS_FILE="$ROOT_DIR/docs/DEPENDENCY_CHECK_RESULTS.md"
FILES_TO_CHECK="$ROOT_DIR/docs/FILES_TO_ELIMINATE.md"

echo "🔍 Checking dependencies for files marked for elimination..."
echo ""

# Initialize results file
cat > "$RESULTS_FILE" << 'EOF'
# Dependency Check Results

This file shows which files marked for elimination are still referenced elsewhere.

## ⚠️ Files Still Referenced (DO NOT DELETE)

EOF

# Function to check if a file is imported/referenced
check_file_references() {
    local file="$1"
    local filename=$(basename "$file" .tsx .ts)
    local relative_path="${file#$ROOT_DIR/}"
    
    # Skip if file doesn't exist
    if [ ! -f "$file" ]; then
        echo "  ❌ File not found: $relative_path"
        return
    fi
    
    # Check for imports (TypeScript/JavaScript)
    local imports=$(grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        -E "(import|from|require).*['\"]$filename|['\"]$relative_path|['\"]\.\./.*$filename" \
        "$ROOT_DIR/src" "$ROOT_DIR/app" 2>/dev/null | grep -v "$relative_path" | wc -l | tr -d ' ')
    
    # Check for dynamic imports
    local dynamic_imports=$(grep -r --include="*.ts" --include="*.tsx" \
        -E "(import\(|require\().*['\"]$filename|['\"]$relative_path" \
        "$ROOT_DIR/src" "$ROOT_DIR/app" 2>/dev/null | grep -v "$relative_path" | wc -l | tr -d ' ')
    
    # Check for route references (Next.js)
    local route_refs=$(grep -r --include="*.ts" --include="*.tsx" \
        -E "/(dashboard|api)/[^/]+(/$filename|/$relative_path)" \
        "$ROOT_DIR/src" "$ROOT_DIR/app" 2>/dev/null | wc -l | tr -d ' ')
    
    local total_refs=$((imports + dynamic_imports + route_refs))
    
    if [ "$total_refs" -gt 0 ]; then
        echo "  ⚠️  $relative_path - $total_refs reference(s) found" >> "$RESULTS_FILE"
        echo "      - Static imports: $imports"
        echo "      - Dynamic imports: $dynamic_imports"
        echo "      - Route references: $route_refs"
        echo "" >> "$RESULTS_FILE"
        echo "⚠️  REFERENCED: $relative_path ($total_refs refs)"
        return 1
    else
        echo "✅ Safe to delete: $relative_path"
        return 0
    fi
}

# Extract files from FILES_TO_ELIMINATE.md
extract_files() {
    local section="$1"
    grep -A 1000 "^## 🗑️ $section" "$FILES_TO_CHECK" | \
        grep -B 1000 "^---" | \
        grep -E "^\`\`\`|^src/" | \
        sed 's/```//g' | \
        grep "^src/" | \
        sed 's/^[[:space:]]*//' | \
        sed 's/[[:space:]]*$//'
}

# Check dashboard pages
echo "📁 Checking Dashboard Pages..."
dashboard_count=0
dashboard_safe=0
for file in $(extract_files "Dashboard Pages to Archive/Delete"); do
    if check_file_references "$ROOT_DIR/$file"; then
        ((dashboard_safe++))
    fi
    ((dashboard_count++))
done
echo "Dashboard: $dashboard_safe/$dashboard_count safe to delete"
echo ""

# Check analysis components
echo "📁 Checking Analysis Components..."
component_count=0
component_safe=0
for file in $(extract_files "Analysis Components to Archive"); do
    if check_file_references "$ROOT_DIR/$file"; then
        ((component_safe++))
    fi
    ((component_count++))
done
echo "Components: $component_safe/$component_count safe to delete"
echo ""

# Check services (more careful - these might be used indirectly)
echo "📁 Checking Services..."
service_count=0
service_safe=0
for file in $(extract_files "Services to Archive"); do
    if check_file_references "$ROOT_DIR/$file"; then
        ((service_safe++))
    fi
    ((service_count++))
done
echo "Services: $service_safe/$service_count safe to delete"
echo ""

# Check API routes (check both route files and references)
echo "📁 Checking API Routes..."
api_count=0
api_safe=0
for file in $(extract_files "API Routes to Archive"); do
    if [ -f "$ROOT_DIR/$file" ]; then
        if check_file_references "$ROOT_DIR/$file"; then
            ((api_safe++))
        fi
        ((api_count++))
    fi
done
echo "API Routes: $api_safe/$api_count safe to delete"
echo ""

# Add summary to results file
cat >> "$RESULTS_FILE" << EOF

## ✅ Summary

- Dashboard Pages Checked: $dashboard_count
- Dashboard Pages Safe: $dashboard_safe
- Components Checked: $component_count  
- Components Safe: $component_safe
- Services Checked: $service_count
- Services Safe: $service_safe
- API Routes Checked: $api_count
- API Routes Safe: $api_safe

## 📋 Next Steps

1. Review files listed above in "Files Still Referenced" section
2. Update those files to remove dependencies OR keep the referenced files
3. Re-run this script to verify
4. Proceed with archiving/deletion once all dependencies are cleared

EOF

echo ""
echo "✅ Dependency check complete!"
echo "📄 Results saved to: $RESULTS_FILE"
echo ""
echo "⚠️  Review $RESULTS_FILE for files that are still referenced"


#!/bin/bash

# Database Backup Script for Structured Storage Implementation
# Creates backup before making changes

echo "🔄 Creating database backup before structured storage implementation..."

# Set variables
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="analysis_backup_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Please set it in .env.local"
    exit 1
fi

echo "📊 Backing up Analysis table..."

# Create backup of Analysis table
psql "$DATABASE_URL" -c "
COPY (
    SELECT 
        id,
        content,
        \"contentType\",
        status,
        score,
        \"userId\",
        \"createdAt\",
        \"updatedAt\",
        insights,
        frameworks
    FROM \"Analysis\"
) TO STDOUT WITH CSV HEADER
" > "$BACKUP_DIR/analysis_data_${TIMESTAMP}.csv"

echo "📊 Backing up User table..."

# Create backup of User table
psql "$DATABASE_URL" -c "
COPY (
    SELECT 
        id,
        email,
        name,
        role,
        \"createdAt\",
        \"updatedAt\"
    FROM \"User\"
) TO STDOUT WITH CSV HEADER
" > "$BACKUP_DIR/user_data_${TIMESTAMP}.csv"

echo "📊 Creating full database schema backup..."

# Create full schema backup
pg_dump "$DATABASE_URL" --schema-only > "$BACKUP_DIR/schema_backup_${TIMESTAMP}.sql"

echo "📊 Creating full data backup..."

# Create full data backup
pg_dump "$DATABASE_URL" --data-only > "$BACKUP_DIR/data_backup_${TIMESTAMP}.sql"

echo "✅ Backup completed successfully!"
echo "📁 Backup files created in $BACKUP_DIR/:"
echo "   - analysis_data_${TIMESTAMP}.csv"
echo "   - user_data_${TIMESTAMP}.csv"
echo "   - schema_backup_${TIMESTAMP}.sql"
echo "   - data_backup_${TIMESTAMP}.sql"

# Create rollback script
cat > "$BACKUP_DIR/rollback_${TIMESTAMP}.sh" << 'EOF'
#!/bin/bash

echo "🔄 Rolling back database changes..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Please set it in .env.local"
    exit 1
fi

# Drop new tables if they exist
echo "🗑️ Dropping new tables..."
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS framework_results CASCADE;"
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS framework_categories CASCADE;"
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS framework_elements CASCADE;"

echo "✅ Rollback completed!"
EOF

chmod +x "$BACKUP_DIR/rollback_${TIMESTAMP}.sh"

echo "🔄 Rollback script created: $BACKUP_DIR/rollback_${TIMESTAMP}.sh"
echo ""
echo "🚨 To rollback if needed, run:"
echo "   ./$BACKUP_DIR/rollback_${TIMESTAMP}.sh"

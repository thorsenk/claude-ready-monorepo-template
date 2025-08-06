#!/bin/bash

# Database restore script
# Usage: ./scripts/database/restore.sh [backup_file] [environment]

set -e

# Configuration
BACKUP_FILE=${1}
ENVIRONMENT=${2:-development}

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file is required"
    echo "Usage: ./scripts/database/restore.sh [backup_file] [environment]"
    echo ""
    echo "Available backups:"
    ls -la ./backups/database/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

# Load environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    source .env.production
    echo "⚠️  WARNING: You are about to restore to PRODUCTION database!"
    echo "   This will completely replace the current production data."
    echo "   Type 'CONFIRM_PRODUCTION_RESTORE' to proceed:"
    read -r confirmation
    if [ "$confirmation" != "CONFIRM_PRODUCTION_RESTORE" ]; then
        echo "❌ Production restore cancelled"
        exit 1
    fi
elif [ "$ENVIRONMENT" = "staging" ]; then
    source .env.staging
else
    source .env.local
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Extract database connection details
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')

if [ -z "$DB_NAME" ] || [ -z "$DB_HOST" ] || [ -z "$DB_USER" ]; then
    echo "❌ Error: Could not parse DATABASE_URL"
    echo "Expected format: postgresql://user:pass@host:port/database"
    exit 1
fi

echo "🔄 Starting database restore..."
echo "   Environment: $ENVIRONMENT"
echo "   Database: $DB_NAME"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Backup file: $BACKUP_FILE"

# Check if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "   Decompressing backup file..."
    DECOMPRESSED_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$DECOMPRESSED_FILE"
    RESTORE_FILE="$DECOMPRESSED_FILE"
    CLEANUP_FILE="$DECOMPRESSED_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
    CLEANUP_FILE=""
fi

# Create a backup of current database before restore
echo "   Creating safety backup of current database..."
SAFETY_BACKUP="./backups/database/${DB_NAME}_${ENVIRONMENT}_before_restore_$(date +"%Y%m%d_%H%M%S").sql"
mkdir -p ./backups/database

if PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --create \
    --if-exists \
    --no-owner \
    --no-privileges \
    > "$SAFETY_BACKUP" 2>/dev/null; then
    
    gzip "$SAFETY_BACKUP"
    echo "   Safety backup created: ${SAFETY_BACKUP}.gz"
else
    echo "   ⚠️  Warning: Could not create safety backup"
fi

# Restore database
echo "   Restoring database..."
if PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    < "$RESTORE_FILE"; then
    
    echo "✅ Database restore completed successfully"
    
    # Clean up decompressed file if we created it
    if [ -n "$CLEANUP_FILE" ]; then
        rm -f "$CLEANUP_FILE"
    fi
    
    # Run migrations to ensure schema is up to date
    echo "   Running database migrations..."
    pnpm db:migrate
    
    echo "🎉 Database restore and migration completed successfully!"
    
else
    echo "❌ Database restore failed"
    
    # Clean up decompressed file if we created it
    if [ -n "$CLEANUP_FILE" ]; then
        rm -f "$CLEANUP_FILE"
    fi
    
    exit 1
fi
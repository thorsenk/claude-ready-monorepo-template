#!/bin/bash

# Database backup script
# Usage: ./scripts/database/backup.sh [environment]

set -e

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/database"
ENVIRONMENT=${1:-development}

# Load environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    source .env.production
elif [ "$ENVIRONMENT" = "staging" ]; then
    source .env.staging
else
    source .env.local
fi

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

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

BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${ENVIRONMENT}_${TIMESTAMP}.sql"

echo "🗄️  Starting database backup..."
echo "   Environment: $ENVIRONMENT"
echo "   Database: $DB_NAME"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Backup file: $BACKUP_FILE"

# Create backup using pg_dump
if PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose \
    --clean \
    --create \
    --if-exists \
    --no-owner \
    --no-privileges \
    > "$BACKUP_FILE"; then
    
    echo "✅ Backup completed successfully"
    echo "   File: $BACKUP_FILE"
    echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo "   Compressed: ${BACKUP_FILE}.gz"
    echo "   Compressed size: $(du -h "${BACKUP_FILE}.gz" | cut -f1)"
    
    # Clean up old backups (keep last 7 days)
    find "$BACKUP_DIR" -name "${DB_NAME}_${ENVIRONMENT}_*.sql.gz" -type f -mtime +7 -delete
    echo "   Cleaned up backups older than 7 days"
    
else
    echo "❌ Backup failed"
    rm -f "$BACKUP_FILE"
    exit 1
fi

echo "🎉 Database backup completed successfully!"
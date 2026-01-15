#!/bin/bash
# ============================================
# MarketPulse - Production Backup Script
# ============================================
# Creates a backup of the production database and uploads

set -e  # Exit on error

BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_NAME="marketpulse-backup-$DATE"

echo "🔐 Starting production backup..."
echo "================================================"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

info() {
    echo -e "ℹ️  $1"
}

# Check if MONGODB_URI is set
if [ -z "$MONGODB_URI" ]; then
    error "MONGODB_URI environment variable not set"
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Step 1: Create MongoDB dump
info "Creating MongoDB backup..."
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME" --gzip

if [ $? -eq 0 ]; then
    success "MongoDB backup created"
else
    error "MongoDB backup failed"
fi

# Step 2: Create tarball
info "Compressing backup..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"

if [ $? -eq 0 ]; then
    success "Backup compressed"
    
    # Get backup size
    SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
    info "Backup size: $SIZE"
else
    error "Compression failed"
fi

# Step 3: Remove uncompressed backup
rm -rf "$BACKUP_DIR/$BACKUP_NAME"

# Step 4: Upload to cloud storage (optional)
# Uncomment and configure based on your cloud provider

# AWS S3
# info "Uploading to S3..."
# aws s3 cp "$BACKUP_DIR/$BACKUP_NAME.tar.gz" s3://your-bucket/backups/
# success "Uploaded to S3"

# Azure Blob Storage
# info "Uploading to Azure..."
# az storage blob upload --account-name youraccountname --container-name backups --name "$BACKUP_NAME.tar.gz" --file "$BACKUP_DIR/$BACKUP_NAME.tar.gz"
# success "Uploaded to Azure"

# Google Cloud Storage
# info "Uploading to GCS..."
# gsutil cp "$BACKUP_DIR/$BACKUP_NAME.tar.gz" gs://your-bucket/backups/
# success "Uploaded to GCS"

# Step 5: Clean up old backups (keep last 30 days)
info "Cleaning up old backups..."
find "$BACKUP_DIR" -name "marketpulse-backup-*.tar.gz" -mtime +30 -delete
success "Old backups removed"

# Summary
echo ""
echo "================================================"
success "Backup completed successfully!"
echo ""
echo "Backup Details:"
echo "  - Name: $BACKUP_NAME.tar.gz"
echo "  - Location: $BACKUP_DIR/"
echo "  - Size: $SIZE"
echo "  - Date: $DATE"
echo ""
echo "To restore this backup:"
echo "  tar -xzf $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "  mongorestore --uri=\$MONGODB_URI --drop $BACKUP_NAME/"
echo "================================================"

exit 0

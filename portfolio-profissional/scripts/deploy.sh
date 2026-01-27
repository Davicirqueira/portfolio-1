#!/bin/bash

# Portfolio Admin Dashboard Deployment Script
# This script handles production deployment

set -e

# Configuration
APP_NAME="portfolio-admin"
BACKUP_DIR="/backups/portfolio"
LOG_FILE="/var/log/portfolio-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please do not run this script as root"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed. Please install PM2 first: npm install -g pm2"
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    error "Git is not installed"
fi

log "🚀 Starting deployment of $APP_NAME..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup current version
if [ -d ".git" ]; then
    CURRENT_COMMIT=$(git rev-parse HEAD)
    log "📦 Current commit: $CURRENT_COMMIT"
    
    # Create backup
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)_$CURRENT_COMMIT"
    log "💾 Creating backup: $BACKUP_NAME"
    
    # Backup database
    if command -v pg_dump &> /dev/null; then
        pg_dump $DATABASE_URL > "$BACKUP_DIR/${BACKUP_NAME}_db.sql" 2>/dev/null || warning "Database backup failed"
    fi
    
    # Backup application files
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_files.tar.gz" --exclude=node_modules --exclude=.next --exclude=.git . || warning "File backup failed"
fi

# Pull latest changes
log "📥 Pulling latest changes..."
git fetch origin
git pull origin main || error "Failed to pull latest changes"

# Install/update dependencies
log "📦 Installing dependencies..."
npm ci --only=production || error "Failed to install dependencies"

# Generate Prisma client
log "🔧 Generating Prisma client..."
npx prisma generate || error "Failed to generate Prisma client"

# Run database migrations
log "🗄️  Running database migrations..."
npx prisma migrate deploy || error "Database migration failed"

# Build application
log "🏗️  Building application..."
npm run build || error "Build failed"

# Stop current application
log "⏹️  Stopping current application..."
pm2 stop $APP_NAME 2>/dev/null || log "Application was not running"

# Start application
log "▶️  Starting application..."
pm2 start ecosystem.config.js --env production || error "Failed to start application"

# Save PM2 configuration
pm2 save || warning "Failed to save PM2 configuration"

# Wait for application to start
log "⏳ Waiting for application to start..."
sleep 10

# Health check
log "🏥 Performing health check..."
HEALTH_URL="http://localhost:3000/api/health"
if curl -f -s "$HEALTH_URL" > /dev/null; then
    success "Health check passed"
else
    error "Health check failed - application may not be running correctly"
fi

# Clean up old backups (keep last 10)
log "🧹 Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm --
ls -t backup_*.sql 2>/dev/null | tail -n +11 | xargs -r rm --

# Show application status
log "📊 Application status:"
pm2 show $APP_NAME

# Show recent logs
log "📋 Recent logs:"
pm2 logs $APP_NAME --lines 10 --nostream

success "🎉 Deployment completed successfully!"
log "🌐 Application is running at: http://localhost:3000"
log "🔧 Admin dashboard: http://localhost:3000/admin"

# Optional: Send notification (uncomment if needed)
# curl -X POST -H 'Content-type: application/json' \
#     --data '{"text":"Portfolio Admin Dashboard deployed successfully"}' \
#     YOUR_SLACK_WEBHOOK_URL

log "📝 Deployment log saved to: $LOG_FILE"
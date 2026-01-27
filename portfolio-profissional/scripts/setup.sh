#!/bin/bash

# Portfolio Admin Dashboard Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Portfolio Admin Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if PostgreSQL is running
if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        echo "✅ PostgreSQL is running"
        
        # Ask if user wants to setup database
        read -p "🗄️  Do you want to setup the database? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🗄️  Setting up database..."
            npx prisma db push
            
            read -p "🌱 Do you want to seed the database with initial data? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                npx prisma db seed
            fi
        fi
    else
        echo "⚠️  PostgreSQL is not running. Please start PostgreSQL and run 'npm run db:push' to setup the database."
    fi
else
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL and update DATABASE_URL in .env file."
fi

# Check if Redis is available (optional)
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running (caching enabled)"
    else
        echo "⚠️  Redis is not running. Caching will be disabled."
    fi
else
    echo "ℹ️  Redis not found. Caching will be disabled (optional)."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p public/uploads
mkdir -p logs
mkdir -p backups

# Set permissions
chmod 755 public/uploads
chmod 755 logs
chmod 755 backups

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start the development server: npm run dev"
echo "3. Visit http://localhost:3000/admin to access the dashboard"
echo ""
echo "For production deployment, see docs/DEPLOYMENT.md"
echo ""
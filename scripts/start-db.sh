#!/bin/bash

# Script to start the database and verify connection

set -e

echo "🔍 Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "🚀 Starting PostgreSQL database..."
cd "$(dirname "$0")/.."
docker-compose up -d postgres

echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is accessible
if docker exec mindforge-postgres pg_isready -U mindforge > /dev/null 2>&1; then
    echo "✅ Database is running and ready!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Generate Prisma client: npm run db:generate"
    echo "   2. Run migrations: npm run db:migrate"
    echo "   3. (Optional) Seed database: npm run db:seed"
else
    echo "❌ Database is not ready yet. Please wait a moment and try again."
    exit 1
fi


#!/bin/bash

# Quick Vercel Deployment Script
# This script helps you deploy the MindForge frontend to Vercel

echo "🚀 MindForge Vercel Deployment Helper"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "   Install it with: npm i -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "client" ]; then
    echo "❌ Error: 'client' directory not found."
    echo "   Please run this script from the project root."
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Navigate to client directory
cd client

echo "📦 Deploying from client directory..."
echo ""

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel. Please login first:"
    vercel login
fi

echo ""
echo "🔧 Configuration:"
echo "   - Framework: Next.js"
echo "   - Root Directory: client/"
echo ""
echo "📝 Important: Make sure to set NEXT_PUBLIC_API_URL environment variable"
echo "   in Vercel dashboard after deployment."
echo ""
read -p "Press Enter to continue with deployment..."

# Deploy
vercel

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "   1. Set NEXT_PUBLIC_API_URL in Vercel Dashboard → Settings → Environment Variables"
echo "   2. Update your backend CORS_ORIGIN to include your Vercel domain"
echo "   3. Test your deployment"
echo ""
echo "📚 For more details, see VERCEL_DEPLOYMENT.md"


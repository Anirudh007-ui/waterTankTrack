#!/bin/bash

# Quick Deployment Script
# This script helps you deploy step by step

echo "=========================================="
echo "🚀 Water Tank API - Deployment Helper"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Step 1: Initializing Git Repository..."
    git init
    echo "✅ Git initialized"
    echo ""
else
    echo "✅ Git already initialized"
    echo ""
fi

# Check git config
echo "📝 Step 2: Checking Git Configuration..."
if [ -z "$(git config user.name)" ]; then
    echo "⚠️  Git user.name not set"
    echo "   Run: git config user.name 'Your Name'"
    echo "   Run: git config user.email 'your.email@example.com'"
    echo ""
else
    echo "✅ Git configured:"
    echo "   Name: $(git config user.name)"
    echo "   Email: $(git config user.email)"
    echo ""
fi

# Check if files are staged
echo "📋 Step 3: Checking Git Status..."
git status --short
echo ""

# Show next steps
echo "=========================================="
echo "📋 Next Steps:"
echo "=========================================="
echo ""
echo "1. Configure Git (if not done):"
echo "   git config user.name 'Your Name'"
echo "   git config user.email 'your.email@example.com'"
echo ""
echo "2. Stage all files:"
echo "   git add ."
echo ""
echo "3. Create initial commit:"
echo "   git commit -m 'Initial commit: Water Tank Level API'"
echo ""
echo "4. Create GitHub repository at: https://github.com/new"
echo "   - Name: waterTankTrack"
echo "   - Public (required for free tier)"
echo "   - DO NOT initialize with README"
echo ""
echo "5. Connect to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/waterTankTrack.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "6. Deploy to Render.com:"
echo "   - Go to: https://render.com"
echo "   - New + → Web Service"
echo "   - Connect GitHub → Select repository"
echo "   - Configure and deploy"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""


#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "🧹 Cleaning up old git data..."
rm -rf .git

echo "🔧 Initializing fresh git repo..."
git init
git config user.email "jadsongrillo95@gmail.com"
git config user.name "jg"

echo "📦 Staging all files..."
git add .

echo "💾 Creating initial commit..."
git commit -m "🚀 Initial commit — LeadForge AI platform"

echo ""
echo "✅ Git repo ready! Now run the following to push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/leadgen-platform.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Replace YOUR_USERNAME with your GitHub username."

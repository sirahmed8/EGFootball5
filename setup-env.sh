#!/bin/bash
# ==============================================================================
# EGFootball5 - Turnkey Production Environment Setup Script
# ==============================================================================

set -e

ENV_FILE=".env.local"

echo "⚽ Initializing EGFootball5 Production Environment Setup..."

if [ -f "$ENV_FILE" ]; then
    echo "⚠️  $ENV_FILE already exists. Backing up to ${ENV_FILE}.bak..."
    cp "$ENV_FILE" "${ENV_FILE}.bak"
fi

if [ -f ".env.example" ]; then
    cp ".env.example" "$ENV_FILE"
    echo "✅ Created $ENV_FILE from .env.example"
else
    echo "❌ Error: .env.example not found!"
    exit 1
fi

echo ""
echo "=============================================================================="
echo "🎯 Next Steps:"
echo "1. Edit $ENV_FILE with your live Firebase, OpenRouter, and Gemini credentials."
echo "2. Set OWNER_EMAIL to your administrator address for automatic OP Mode access."
echo "3. Run 'npm run build' to verify production bundle."
echo "4. Deploy with 'firebase deploy'."
echo "=============================================================================="

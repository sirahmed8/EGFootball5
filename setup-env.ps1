# ==============================================================================
# EGFootball5 - Turnkey Production Environment Setup Script (PowerShell)
# ==============================================================================

$EnvFile = ".env.local"

Write-Host "⚽ Initializing EGFootball5 Production Environment Setup..." -ForegroundColor Cyan

if (Test-Path $EnvFile) {
    Write-Host "⚠️  $EnvFile already exists. Backing up to $EnvFile.bak..." -ForegroundColor Yellow
    Copy-Item $EnvFile "$EnvFile.bak" -Force
}

if (Test-Path ".env.example") {
    Copy-Item ".env.example" $EnvFile -Force
    Write-Host "✅ Created $EnvFile from .env.example" -ForegroundColor Green
} else {
    Write-Host "❌ Error: .env.example not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor DarkGray
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit $EnvFile with your live Firebase, OpenRouter, and Gemini credentials." -ForegroundColor White
Write-Host "2. Set OWNER_EMAIL to your administrator address for automatic OP Mode access." -ForegroundColor White
Write-Host "3. Run 'npm run build' to verify production bundle." -ForegroundColor White
Write-Host "4. Deploy with 'firebase deploy'." -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor DarkGray

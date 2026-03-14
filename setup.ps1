Write-Host "=== SmartHire Setup ===" -ForegroundColor Cyan

# Install backend deps
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Install frontend deps  
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor White
Write-Host "Or double-click start-dev.bat" -ForegroundColor White

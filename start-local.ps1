Write-Host "Starting Disaster Management System..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "WebSocket server will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

npm run dev 
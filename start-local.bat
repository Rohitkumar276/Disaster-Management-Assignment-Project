@echo off
echo Starting Disaster Management System...
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing dependencies...
npm install

echo.
echo Starting development servers...
echo Frontend will be available at: http://localhost:3000
echo WebSocket server will be available at: http://localhost:3001
echo.

npm run dev 
@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 Deploy Firebase Functions
echo ========================================
echo.

cd /d %~dp0

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo.
echo 🔨 Building TypeScript...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo 🚀 Deploying to Firebase...
call firebase deploy --only functions

echo.
echo ✅ Deploy complete!
echo.
echo 📋 Functions:
echo    - getMessages: Get all approved messages
echo    - syncMessages: Get only new messages (use ?after=timestamp)
echo    - healthCheck: API health check
echo.

pause


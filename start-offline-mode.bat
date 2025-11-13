@echo off
echo ========================================
echo   Starting Offline Mode (Dual Mode System)
echo ========================================
echo.
echo This will start:
echo 1. Express API Server (Port 3001)
echo 2. Frontend Dev Server (Port 5173)
echo.
echo Make sure APP_MODE is set to 'offline' in src/config/appConfig.ts
echo.
pause

:: Start Express API Server in new window
echo Starting Express API Server...
start "Express API Server" cmd /k "bun run api"

:: Wait a bit for server to start
timeout /t 3 /nobreak > nul

:: Start Frontend Dev Server in new window
echo Starting Frontend Dev Server...
start "Frontend Dev Server" cmd /k "bun run dev"

echo.
echo ========================================
echo   Both servers are starting...
echo ========================================
echo.
echo Express API Server: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window (servers will keep running)
pause > nul


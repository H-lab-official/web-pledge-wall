@echo off
echo Starting API Server...
start "API Server" cmd /k "bun run api:local"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "bun run dev"

echo.
echo Done! Servers are starting...
echo.
pause


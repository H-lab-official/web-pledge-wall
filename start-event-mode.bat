@echo off
chcp 65001 >nul
cls
color 0A
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🎪 EVENT MODE - Starting Local Server System         ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📋 Configuration:
echo    • API Server:  http://192.168.11.18:3001
echo    • Frontend:    http://192.168.11.18:5173
echo    • Mode:        OFFLINE (No Internet Required)
echo.
echo ⚙️  Requirements:
echo    1. This computer's IP is 192.168.11.18
echo    2. Firewall allows port 3001 and 5173
echo    3. All devices are on the same WiFi/LAN
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause

echo.
echo [1/3] 🚀 Starting Local API Server...
start "🔥 Event API Server (Local)" cmd /k "bun run api:local"

echo [2/3] ⏳ Waiting for API to initialize...
timeout /t 4 /nobreak >nul

echo [3/3] 🌐 Starting Frontend Dev Server...
start "💻 Event Frontend" cmd /k "bun run dev"

echo.
echo ⏳ Waiting for Frontend to initialize...
timeout /t 8 /nobreak >nul

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ Servers are ready!
echo.
echo 🌐 Opening browser...
start http://192.168.11.18:5173

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📱 Share this URL with other devices:
echo    👉 http://192.168.11.18:5173
echo.
echo 🔧 Admin Page:
echo    👉 http://192.168.11.18:5173/admin
echo.
echo 💡 Tip: Keep this window open to see the status
echo.
echo ⚠️  To stop servers: Close the "Event API Server" and
echo     "Event Frontend" windows
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause


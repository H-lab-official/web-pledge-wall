@echo off
echo ========================================
echo   Data Fetcher - Web UI
echo ========================================
echo.
echo กำลังเริ่ม HTTP Server...
echo เปิด browser ที่: http://localhost:8000
echo.
echo กด Ctrl+C เพื่อหยุด server
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8000

pause


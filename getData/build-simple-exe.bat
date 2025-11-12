@echo off
echo ========================================
echo   Building Data Fetcher GUI
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Building Rust backend...
cargo build --release

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Creating launcher...

:: Create a simple launcher HTML that opens the UI and runs the backend
(
echo ^<!DOCTYPE html^>
echo ^<html^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<title^>Data Fetcher Launcher^</title^>
echo     ^<style^>
echo         body { 
echo             font-family: 'Segoe UI', sans-serif; 
echo             background: linear-gradient^(135deg, #667eea 0%%, #764ba2 100%%^);
echo             display: flex;
echo             justify-content: center;
echo             align-items: center;
echo             height: 100vh;
echo             margin: 0;
echo         }
echo         .container {
echo             background: white;
echo             padding: 40px;
echo             border-radius: 20px;
echo             box-shadow: 0 20px 60px rgba^(0,0,0,0.3^);
echo             text-align: center;
echo             max-width: 500px;
echo         }
echo         h1 { color: #667eea; margin-bottom: 20px; }
echo         .button {
echo             display: inline-block;
echo             padding: 15px 40px;
echo             margin: 10px;
echo             background: linear-gradient^(135deg, #667eea 0%%, #764ba2 100%%^);
echo             color: white;
echo             text-decoration: none;
echo             border-radius: 50px;
echo             font-size: 18px;
echo             font-weight: bold;
echo             cursor: pointer;
echo             border: none;
echo             transition: transform 0.2s;
echo         }
echo         .button:hover { transform: scale^(1.05^); }
echo         .info { margin: 20px 0; color: #666; }
echo     ^</style^>
echo ^</head^>
echo ^<body^>
echo     ^<div class="container"^>
echo         ^<h1^>🚀 Data Fetcher^</h1^>
echo         ^<p class="info"^>เลือกเวอร์ชันที่ต้องการใช้งาน^</p^>
echo         ^<button class="button" onclick="openWebUI^(^)"^>
echo             🌐 Web UI Version
echo         ^</button^>
echo         ^<br^>
echo         ^<button class="button" onclick="openConsole^(^)"^>
echo             💻 Console Version
echo         ^</button^>
echo     ^</div^>
echo     ^<script^>
echo         function openWebUI^(^) {
echo             const uiPath = 'file:///' + window.location.pathname.replace^('/launcher.html', '/ui/index.html'^);
echo             window.open^(uiPath^);
echo         }
echo         function openConsole^(^) {
echo             alert^('กรุณารันไฟล์: target\\release\\data_fetcher.exe'^);
echo         }
echo     ^</script^>
echo ^</body^>
echo ^</html^>
) > launcher.html

echo.
echo ========================================
echo ✅ Build Complete!
echo ========================================
echo.
echo Files created:
echo   1. target\release\data_fetcher.exe  (Console version)
echo   2. launcher.html                     (GUI launcher)
echo   3. ui\index.html                     (Web UI)
echo.
echo How to use:
echo   - Double-click launcher.html
echo   OR
echo   - Double-click ui\index.html (Web UI directly)
echo   OR
echo   - Run target\release\data_fetcher.exe (Console)
echo.
pause


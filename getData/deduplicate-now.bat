@echo off
chcp 65001 >nul
echo ========================================
echo 🗑️ ลบข้อมูลซ้ำใน data.txt
echo ========================================
echo.
echo ⚠️ คำเตือน: การดำเนินการนี้จะแก้ไขไฟล์ data.txt โดยตรง
echo.
pause

cd src-tauri

echo.
echo 📁 ไฟล์: %cd%\data.txt
echo.

if not exist "data.txt" (
    echo ❌ ไม่พบไฟล์ data.txt
    pause
    exit /b 1
)

echo 🔍 กำลังสร้าง backup...
copy data.txt data-backup-%date:~-4%-%date:~3,2%-%date:~0,2%-%time:~0,2%%time:~3,2%%time:~6,2%.txt >nul
echo ✅ สร้าง backup แล้ว

echo.
echo 🧹 กำลังลบข้อมูลซ้ำ...
echo.

rem ใช้ PowerShell เพื่อลบข้อมูลซ้ำ
powershell -Command "$uniqueLines = @{}; Get-Content 'data.txt' | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $json = $_ | ConvertFrom-Json; if (-not $uniqueLines.ContainsKey($json.id)) { $uniqueLines[$json.id] = $_; $_ } } | Set-Content 'data-unique.txt'; $original = (Get-Content 'data.txt' | Where-Object { $_.Trim() -ne '' }).Count; $unique = (Get-Content 'data-unique.txt').Count; Write-Host ''; Write-Host '📊 สรุปผลลัพธ์:' -ForegroundColor Cyan; Write-Host \"   ข้อมูลเดิม: $original รายการ\" -ForegroundColor Yellow; Write-Host \"   ข้อมูลไม่ซ้ำ: $unique รายการ\" -ForegroundColor Green; Write-Host \"   ลบออก: $($original - $unique) รายการ\" -ForegroundColor Red; Write-Host ''; Move-Item -Force 'data-unique.txt' 'data.txt'"

echo.
echo ✅ เสร็จสิ้น!
echo.
echo 💡 Tip: ไฟล์ backup อยู่ในโฟลเดอร์เดียวกัน
echo.
pause


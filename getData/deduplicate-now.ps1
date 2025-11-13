# PowerShell script to deduplicate data.txt

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🗑️ ลบข้อมูลซ้ำใน data.txt" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# เปลี่ยนไปยัง src-tauri directory
Set-Location -Path "src-tauri"

$dataFile = "data.txt"
$backupFile = "data-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').txt"

if (-not (Test-Path $dataFile)) {
    Write-Host "❌ ไม่พบไฟล์ $dataFile" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "📁 ไฟล์: $pwd\$dataFile" -ForegroundColor Yellow
Write-Host ""

# สร้าง backup
Write-Host "🔍 กำลังสร้าง backup..." -ForegroundColor Yellow
Copy-Item $dataFile $backupFile
Write-Host "✅ สร้าง backup แล้ว: $backupFile" -ForegroundColor Green
Write-Host ""

# อ่านและลบข้อมูลซ้ำ
Write-Host "🧹 กำลังลบข้อมูลซ้ำ..." -ForegroundColor Yellow
Write-Host ""

$uniqueData = @{}
$lines = Get-Content $dataFile | Where-Object { $_.Trim() -ne '' }
$originalCount = $lines.Count

foreach ($line in $lines) {
    try {
        $json = $line | ConvertFrom-Json
        $key = $json.id
        
        if (-not $uniqueData.ContainsKey($key)) {
            $uniqueData[$key] = $line
        }
    }
    catch {
        # ถ้า parse JSON ไม่ได้ ให้เก็บไว้
        Write-Host "⚠️ Warning: Cannot parse line: $($line.Substring(0, [Math]::Min(50, $line.Length)))..." -ForegroundColor Yellow
    }
}

# เขียนข้อมูลที่ไม่ซ้ำกลับไปที่ไฟล์
$uniqueData.Values | Set-Content $dataFile

$uniqueCount = $uniqueData.Count
$removedCount = $originalCount - $uniqueCount

# แสดงผลลัพธ์
Write-Host "📊 สรุปผลลัพธ์:" -ForegroundColor Cyan
Write-Host "   ข้อมูลเดิม: $originalCount รายการ" -ForegroundColor Yellow
Write-Host "   ข้อมูลไม่ซ้ำ: $uniqueCount รายการ" -ForegroundColor Green
Write-Host "   ลบออก: $removedCount รายการ" -ForegroundColor Red
Write-Host ""

if ($removedCount -gt 0) {
    Write-Host "✅ ลบข้อมูลซ้ำสำเร็จ!" -ForegroundColor Green
} else {
    Write-Host "✅ ไม่พบข้อมูลซ้ำ - ไฟล์สะอาดแล้ว!" -ForegroundColor Green
}

Write-Host ""
Write-Host "💡 Tip: ไฟล์ backup อยู่ที่ $backupFile" -ForegroundColor Cyan
Write-Host ""

# กลับไปยัง directory เดิม
Set-Location -Path ".."

Read-Host "กด Enter เพื่อปิด"


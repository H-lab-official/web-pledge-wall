# ⚡ Quick Start Guide

## 🚀 สำหรับผู้ใช้งาน (User)

### Windows

1. **ดาวน์โหลด**
   ```
   📥 data-fetcher-tauri.exe
   ```

2. **เปิดใช้งาน**
   - Double-click ไฟล์ `.exe`
   - ถ้า Windows SmartScreen ขึ้น คลิก "More info" → "Run anyway"

3. **เริ่มใช้งาน**
   - ใส่ API URL
   - เลือกฟิลด์ที่ต้องการ
   - กดปุ่ม "เริ่มดึงข้อมูล" 🎉

### ✅ เสร็จแล้ว! ง่ายมาก!

---

## 🛠️ สำหรับ Developer

### ติดตั้ง Rust

```bash
# Windows
https://rustup.rs/

# หรือใช้ winget
winget install Rustlang.Rustup
```

### Clone & Build

```bash
# 1. Clone
git clone <repo-url>
cd getData

# 2. Build (Development)
run-tauri-dev.bat

# 3. Build (Production)
build-tauri.bat
```

### ไฟล์จะอยู่ที่:

```
📁 getData/
   └─ 📁 src-tauri/
      └─ 📁 target/
         └─ 📁 release/
            ├─ 📄 data-fetcher-tauri.exe  ⭐ ไฟล์นี้!
            └─ 📁 bundle/
               └─ 📁 msi/
                  └─ 📄 Data Fetcher_1.0.0_x64.msi
```

---

## 📚 เอกสารเพิ่มเติม

- [README_TAURI.md](README_TAURI.md) - คู่มือหลัก
- [BUILD_TAURI.md](BUILD_TAURI.md) - วิธี Build
- [Tauri Docs](https://tauri.app/) - Official Docs

---

## ❓ FAQ

### Q: ต้องติดตั้งไหม?
**A:** ไม่ต้อง! แค่ double-click `.exe` เลย

### Q: ใช้ RAM เท่าไหร่?
**A:** ประมาณ 40-50 MB (น้อยมาก!)

### Q: ใช้งานฟรีไหม?
**A:** ใช่! ฟรีทั้งหมด (MIT License)

### Q: ทำงานบน Mac/Linux ได้ไหม?
**A:** ได้! แต่ต้อง build เอง

---

## 🎯 One-line Summary

```
ดาวน์โหลด → เปิดใช้ → ใส่ API → เริ่มดึงข้อมูล 🚀
```

**ง่ายขนาดนี้!** ⚡


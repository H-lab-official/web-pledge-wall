# 🚀 สร้าง Desktop App ด้วย Tauri

## 📋 ความต้องการ

### Windows:
```bash
# ติดตั้ง Rust (ถ้ายังไม่มี)
https://rustup.rs/

# ติดตั้ง WebView2 (Windows 10/11 มีอยู่แล้วส่วนใหญ่)
https://developer.microsoft.com/en-us/microsoft-edge/webview2/
```

### เครื่องมือที่ต้องมี:
- ✅ Rust (rustup)
- ✅ Cargo
- ✅ WebView2 Runtime (Windows)

---

## 🛠️ วิธีการ Build

### 1. เข้าไปใน folder Tauri
```bash
cd getData/src-tauri
```

### 2. Build แบบ Release (สร้าง .exe)
```bash
cargo tauri build
```

หรือใช้ไฟล์ `.bat` ที่เตรียมไว้:
```bash
cd getData
build-tauri.bat
```

### 3. ไฟล์ .exe จะอยู่ที่:
```
getData/src-tauri/target/release/data-fetcher-tauri.exe
```

### 4. Installer จะอยู่ที่:
```
getData/src-tauri/target/release/bundle/msi/Data Fetcher_1.0.0_x64_en-US.msi
```

---

## 🎯 ข้อดีของ Tauri

| Feature | Tauri | Electron |
|---------|-------|----------|
| **ขนาดไฟล์** | 3-10 MB | 100-200 MB |
| **RAM Usage** | 30-50 MB | 150-300 MB |
| **Startup** | เร็วมาก | ช้ากว่า |
| **Security** | ปลอดภัยกว่า | ธรรมดา |
| **WebView** | ใช้ของระบบ | ฝังมาเอง |

---

## 🧪 ทดสอบ (Development Mode)

```bash
cd src-tauri
cargo tauri dev
```

---

## 📦 File Structure

```
getData/
├── src-tauri/               # Tauri Backend (Rust)
│   ├── Cargo.toml          # Dependencies
│   ├── tauri.conf.json     # Configuration
│   ├── build.rs            # Build script
│   └── src/
│       └── main.rs         # Backend logic
│
├── ui-tauri/               # Frontend (HTML/CSS/JS)
│   └── index.html          # UI
│
└── BUILD_TAURI.md          # คู่มือนี้
```

---

## 🎨 Features

✅ **Modern UI** - ดีไซน์สวยด้วย Gradient
✅ **Step-by-step** - แบ่งขั้นตอนชัดเจน
✅ **Preview API** - ดูโครงสร้าง API ก่อนเลือกฟิลด์
✅ **Auto Fetch** - ดึงข้อมูลอัตโนมัติตามเวลาที่กำหนด
✅ **Duplicate Check** - ป้องกันข้อมูลซ้ำด้วย Unique Key
✅ **Statistics** - แสดงสถิติแบบ Real-time
✅ **Small Size** - ไฟล์เล็ก เร็ว ประหยัด RAM

---

## 🐛 Troubleshooting

### ❌ Error: "WebView2 not found"
**วิธีแก้:** ติดตั้ง WebView2 Runtime
```
https://go.microsoft.com/fwlink/p/?LinkId=2124703
```

### ❌ Error: "cargo not found"
**วิธีแก้:** ติดตั้ง Rust
```
https://rustup.rs/
```

### ❌ Build ช้า
**วิธีแก้:** Build ครั้งแรกจะช้า (5-10 นาที) ครั้งต่อไปจะเร็วขึ้น

---

## 📚 เอกสารเพิ่มเติม

- [Tauri Docs](https://tauri.app/)
- [Rust Lang](https://www.rust-lang.org/)

---

**Made with ❤️ using Rust + Tauri**


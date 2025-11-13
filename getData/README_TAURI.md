# 📡 API Data Fetcher - Tauri Desktop App

<div align="center">

![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?style=for-the-badge&logo=tauri)
![Rust](https://img.shields.io/badge/Rust-Latest-orange?style=for-the-badge&logo=rust)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**เครื่องมือดึงข้อมูลจาก API และบันทึกลงไฟล์แบบอัตโนมัติ**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Build](#-build)

</div>

---

## 🌟 Features

✨ **Modern Desktop App** - สร้างด้วย Rust + Tauri (เล็ก เร็ว ปลอดภัย)

🎯 **Easy to Use** - UI แบบ Step-by-step ใช้งานง่าย

🔄 **Auto Fetch** - ดึงข้อมูลอัตโนมัติตามเวลาที่กำหนด

🚫 **Duplicate Prevention** - ป้องกันข้อมูลซ้ำด้วย Unique Key

📊 **Real-time Stats** - แสดงสถิติการดึงข้อมูล

💾 **Save to File** - บันทึกเป็น JSON Lines (.txt)

🔍 **API Preview** - ดูโครงสร้างข้อมูล API ก่อนเลือกฟิลด์

⚡ **Fast & Lightweight** - ใช้ RAM น้อย เริ่มต้นเร็ว

---

## 📦 Installation

### วิธีที่ 1: ดาวน์โหลดไฟล์ .exe (แนะนำ)

1. ดาวน์โหลด `data-fetcher-tauri.exe`
2. เปิดใช้งานเลย! (ไม่ต้องติดตั้ง)

### วิธีที่ 2: ใช้ Installer (.msi)

1. ดาวน์โหลด `.msi` file
2. Double-click เพื่อติดตั้ง
3. เปิดจาก Start Menu

### วิธีที่ 3: Build เอง

```bash
# 1. Clone repository
git clone <your-repo>
cd getData

# 2. Build
build-tauri.bat

# 3. Executable อยู่ที่:
# src-tauri/target/release/data-fetcher-tauri.exe
```

---

## 🚀 Usage

### 1. เปิด App

<img src="https://via.placeholder.com/600x400/667eea/ffffff?text=App+Screenshot" alt="Screenshot" width="600">

### 2. ใส่ API URL

```
https://your-api.com/data
```

### 3. เลือก Data Path

ถ้าข้อมูลอยู่ใน nested object:
```
data
response.items
results
```

### 4. เลือกฟิลด์

- เลือก **Unique Key** (เช่น `id`)
- เลือกฟิลด์ที่ต้องการบันทึก

### 5. ตั้งค่า

- **ชื่อไฟล์**: `data.txt`
- **ดึงข้อมูลทุก**: `60` วินาที

### 6. เริ่มดึงข้อมูล! 🎉

---

## 📊 ตัวอย่างข้อมูลที่บันทึก

```json
{"id":"1","name":"John Doe","email":"john@example.com"}
{"id":"2","name":"Jane Smith","email":"jane@example.com"}
{"id":"3","name":"Bob Wilson","email":"bob@example.com"}
```

แต่ละบรรทัด = 1 record (JSON Lines format)

---

## 🛠️ Build from Source

### Requirements

- ✅ Rust (https://rustup.rs/)
- ✅ WebView2 Runtime (Windows - มีอยู่แล้วส่วนใหญ่)

### Build Commands

```bash
# Development mode (ทดสอบ)
run-tauri-dev.bat

# Production build (สร้าง .exe)
build-tauri.bat
```

### File Sizes

| Version | Size | RAM Usage |
|---------|------|-----------|
| **Tauri** | ~5 MB | ~40 MB |
| Electron | ~150 MB | ~200 MB |

**Tauri เล็กกว่า 30 เท่า! 🚀**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         UI (HTML/CSS/JS)            │
│  - Modern gradient design           │
│  - Step-by-step wizard              │
│  - Real-time statistics             │
└──────────────┬──────────────────────┘
               │ Tauri IPC
               ▼
┌─────────────────────────────────────┐
│      Backend (Rust)                 │
│  - API fetching (reqwest)           │
│  - JSON parsing (serde_json)        │
│  - Duplicate checking (HashSet)     │
│  - File I/O                         │
└─────────────────────────────────────┘
```

---

## 🎯 Use Cases

✅ ดึงข้อมูลจาก REST API  
✅ Backup ข้อมูลอัตโนมัติ  
✅ เก็บ Log/Event ต่างๆ  
✅ Sync ข้อมูลระหว่างระบบ  
✅ Data Archiving  

---

## 🐛 Troubleshooting

### ❌ "WebView2 not found"

**วิธีแก้:**
```
ดาวน์โหลดและติดตั้ง WebView2 Runtime:
https://go.microsoft.com/fwlink/p/?LinkId=2124703
```

### ❌ "API connection failed"

**วิธีแก้:**
- ตรวจสอบ Internet connection
- ตรวจสอบว่า API URL ถูกต้อง
- ตรวจสอบ Firewall/Antivirus

### ❌ "Cannot write to file"

**วิธีแก้:**
- ตรวจสอบสิทธิ์การเขียนไฟล์
- เปลี่ยนชื่อไฟล์หรือ location

---

## 📝 Technical Details

### Backend (Rust)

- **Framework**: Tauri 2.0
- **HTTP Client**: reqwest
- **JSON**: serde_json
- **Async**: Tokio

### Frontend

- **Pure HTML/CSS/JS** (ไม่ต้อง Framework)
- **Responsive Design**
- **Modern UI with Gradients**

### Security

- ✅ CSP (Content Security Policy)
- ✅ Sandboxed WebView
- ✅ ไม่มี Node.js vulnerabilities

---

## 🌐 Comparison

| Feature | Tauri App | CLI Version |
|---------|-----------|-------------|
| **UI** | ✅ Modern GUI | ❌ Terminal only |
| **Easy to use** | ✅ Very easy | ⚠️ Need command knowledge |
| **Size** | ~5 MB | ~3 MB |
| **User-friendly** | ✅✅✅ | ⚠️ |
| **Cross-platform** | ✅ Win/Mac/Linux | ✅ Win/Mac/Linux |

---

## 📚 Documentation

- [BUILD_TAURI.md](BUILD_TAURI.md) - คู่มือ Build
- [Tauri Docs](https://tauri.app/) - Official Documentation
- [Rust Book](https://doc.rust-lang.org/book/) - Learn Rust

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - ใช้งานได้ฟรี!

---

## 🎉 Credits

**Made with:**
- 🦀 Rust
- ⚡ Tauri
- ❤️ Love for performance

---

<div align="center">

**Star ⭐ this repo if you find it useful!**

[Report Bug](issues) • [Request Feature](issues)

</div>


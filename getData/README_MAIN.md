# 📡 API Data Fetcher

<div align="center">

![Rust](https://img.shields.io/badge/Rust-Latest-orange?style=for-the-badge&logo=rust)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?style=for-the-badge&logo=tauri)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**ดึงข้อมูลจาก API และบันทึกลงไฟล์อัตโนมัติ**

📥 **2 Versions**: Desktop App (Tauri) + CLI

</div>

---

## 🎯 เลือกเวอร์ชันที่เหมาะกับคุณ

### 🖥️ Option 1: Desktop App (แนะนำ!)

**Perfect for:** ผู้ใช้ทั่วไป, ต้องการ UI สวยๆ

✨ **Features:**
- Modern GUI ใช้งานง่าย
- Step-by-step wizard
- Real-time statistics
- ไม่ต้องเขียนโค้ด!

📚 **Documentation:**
- [README_TAURI.md](README_TAURI.md) - คู่มือหลัก
- [BUILD_TAURI.md](BUILD_TAURI.md) - วิธี Build
- [QUICK_START.md](QUICK_START.md) - เริ่มต้นเร็ว

🚀 **Quick Start:**
```bash
# Build Desktop App
build-tauri.bat

# Run Development Mode
run-tauri-dev.bat
```

---

### 💻 Option 2: CLI Version

**Perfect for:** Developers, Automation, Servers

⚡ **Features:**
- เบามาก (~3 MB)
- ใช้ RAM น้อย (~20 MB)
- Scriptable
- Perfect for CI/CD

📚 **Documentation:**
- [README.md](README.md) - คู่มือ CLI
- [HOW_TO_USE.md](HOW_TO_USE.md) - วิธีใช้งาน

🚀 **Quick Start:**
```bash
# Build CLI
build-simple-exe.bat

# Run
./target/release/data_fetcher.exe
```

---

## 📊 Comparison

| Feature | Desktop App | CLI |
|---------|-------------|-----|
| **UI** | ✅ Modern GUI | ❌ Terminal |
| **Size** | ~5 MB | ~3 MB |
| **RAM** | ~40 MB | ~20 MB |
| **User-friendly** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Scriptable** | ❌ | ✅ |

📖 [อ่านเพิ่มเติม: TAURI_VS_CLI.md](TAURI_VS_CLI.md)

---

## 🌟 Features (ทั้ง 2 Version)

✅ **Auto Fetch** - ดึงข้อมูลอัตโนมัติ  
✅ **Duplicate Prevention** - ป้องกันข้อมูลซ้ำ  
✅ **JSON Lines Format** - บันทึกทีละบรรทัด  
✅ **Field Selection** - เลือกฟิลด์ที่ต้องการ  
✅ **Nested Data** - รองรับ nested JSON  
✅ **Fast & Lightweight** - เร็วและเบา  

---

## 📂 Project Structure

```
getData/
│
├─ 🖥️ Desktop App (Tauri)
│  ├─ src-tauri/              # Rust backend
│  │  ├─ src/main.rs          # Tauri commands
│  │  ├─ Cargo.toml           # Dependencies
│  │  ├─ tauri.conf.json      # Configuration
│  │  └─ icons/               # App icons
│  │
│  ├─ ui-tauri/               # Frontend
│  │  └─ index.html           # Modern UI
│  │
│  ├─ build-tauri.bat         # Build script
│  ├─ run-tauri-dev.bat       # Dev mode
│  └─ README_TAURI.md         # Tauri docs
│
├─ 💻 CLI Version
│  ├─ src/main.rs             # CLI logic
│  ├─ Cargo.toml              # Dependencies
│  ├─ build-simple-exe.bat    # Build script
│  └─ README.md               # CLI docs
│
└─ 📚 Documentation
   ├─ README_MAIN.md          # This file
   ├─ QUICK_START.md          # Quick guide
   ├─ TAURI_VS_CLI.md         # Comparison
   ├─ BUILD_TAURI.md          # Build guide
   └─ HOW_TO_USE.md           # Usage guide
```

---

## 🚀 Installation

### Requirements

- **Rust** (https://rustup.rs/)
- **WebView2** (Windows - มีอยู่แล้วส่วนใหญ่)

### Build Both Versions

```bash
# Desktop App
build-tauri.bat

# CLI
build-simple-exe.bat
```

---

## 💡 Use Cases

✅ ดึงข้อมูลจาก REST API  
✅ Backup ข้อมูลอัตโนมัติ  
✅ Data synchronization  
✅ Log/Event collection  
✅ Data archiving  
✅ API monitoring  

---

## 🎯 Which Version Should You Use?

### Choose Desktop App if:
- ✅ You want a beautiful UI
- ✅ You're not comfortable with Terminal
- ✅ You want to share with non-technical users
- ✅ You want real-time visual feedback

### Choose CLI if:
- ✅ You're a developer
- ✅ You need automation/scripting
- ✅ You're running on a server
- ✅ You want maximum performance

### 🎉 Or use both!
They can coexist and share the same output files!

---

## 📖 Documentation Index

| Document | Description |
|----------|-------------|
| [README_MAIN.md](README_MAIN.md) | Overview (this file) |
| [README_TAURI.md](README_TAURI.md) | Tauri Desktop App |
| [README.md](README.md) | CLI Version |
| [QUICK_START.md](QUICK_START.md) | Quick start guide |
| [BUILD_TAURI.md](BUILD_TAURI.md) | Build instructions |
| [HOW_TO_USE.md](HOW_TO_USE.md) | Usage guide |
| [TAURI_VS_CLI.md](TAURI_VS_CLI.md) | Version comparison |

---

## 🛠️ Tech Stack

### Desktop App
- **Backend**: Rust + Tauri 2.0
- **Frontend**: HTML + CSS + JavaScript
- **HTTP**: reqwest
- **JSON**: serde_json

### CLI
- **Language**: Rust
- **HTTP**: reqwest
- **JSON**: serde_json
- **Async**: Tokio

---

## 📊 Performance

### Desktop App
- **Size**: ~5 MB
- **RAM**: ~40 MB
- **Startup**: ~1.2s
- **Build Time**: 5-10 min (first time)

### CLI
- **Size**: ~3 MB
- **RAM**: ~20 MB
- **Startup**: ~0.8s
- **Build Time**: 3-5 min (first time)

**Both are blazingly fast! 🚀**

---

## 🤝 Contributing

Contributions welcome! Feel free to:
1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push and open a Pull Request

---

## 📄 License

MIT License - Free to use!

---

## 🎉 Credits

**Built with:**
- 🦀 Rust - Performance
- ⚡ Tauri - Lightweight desktop apps
- ❤️ Love - For great UX

---

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](issues/)
- 💬 [Discussions](discussions/)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ and Rust 🦀

[Desktop App](README_TAURI.md) • [CLI](README.md) • [Quick Start](QUICK_START.md)

</div>


# App Icons

## วิธีสร้างไอคอน

1. เตรียมรูปภาพ PNG ขนาด 1024x1024 px
2. ใช้เครื่องมือสร้างไอคอน:
   - https://tauri.app/v1/guides/features/icons/
   - หรือใช้ `cargo tauri icon` command

## ไอคอนที่ต้องมี:

- `32x32.png` - Small icon
- `128x128.png` - Medium icon
- `128x128@2x.png` - Retina icon
- `icon.icns` - macOS icon
- `icon.ico` - Windows icon

## Quick Generate:

```bash
# ใส่รูป icon.png (1024x1024) ใน src-tauri/icons/
cargo tauri icon path/to/your/icon.png
```

ระบบจะสร้างไอคอนทุกขนาดให้อัตโนมัติ!


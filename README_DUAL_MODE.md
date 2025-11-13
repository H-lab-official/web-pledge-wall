# 🔄 Dual Mode System - Quick Reference

## 🎯 สรุปสั้นๆ

ระบบนี้สามารถทำงาน 2 โหมด:
- **Online Mode** ☁️ - เชื่อมต่อ Firebase โดยตรง
- **Offline Mode** 💻 - เชื่อมต่อผ่าน Express Server (localhost)

---

## ⚡ Quick Start

### 🟢 Online Mode (Firebase)
```bash
# 1. เปลี่ยน mode ใน src/config/appConfig.ts
export const APP_MODE: AppMode = 'online'

# 2. รัน dev server
bun run dev
```

### 🔵 Offline Mode (Local Server)
```bash
# วิธีที่ 1: ใช้ script (Windows)
start-offline-mode.bat

# วิธีที่ 2: ใช้ script (Mac/Linux)
chmod +x start-offline-mode.sh
./start-offline-mode.sh

# วิธีที่ 3: รันแยกทีละ Terminal
# Terminal 1
bun run api

# Terminal 2
bun run dev
```

**อย่าลืม!** เปลี่ยน `APP_MODE` เป็น `'offline'` ใน `src/config/appConfig.ts`

---

## 📁 ไฟล์สำคัญ

| ไฟล์ | คำอธิบาย |
|------|----------|
| `src/config/appConfig.ts` | ⚙️ **เปลี่ยน mode ที่นี่** |
| `src/services/messageService.ts` | 📡 Service layer (auto-switch) |
| `src/services/apiAdapter.ts` | 🔌 Adapter สำหรับทั้ง 2 mode |
| `src/api/server.ts` | 🖥️ Express server (offline mode) |
| `src/components/ModeIndicator.tsx` | 🟢 Status indicator UI |
| `DUAL_MODE_GUIDE.md` | 📖 คู่มือฉบับเต็ม |

---

## 🎨 Mode Indicator

ที่มุมบนขวาจะแสดงสถานะ:
- 🟢 **Online (Firebase)** - Online mode
- 🔵 **Offline (Local Server)** - Offline mode (เชื่อมต่อสำเร็จ)
- 🔴 **Disconnected** - Offline mode (เชื่อมต่อไม่สำเร็จ)

คลิกที่ indicator เพื่อเช็คการเชื่อมต่อใหม่ (offline mode)

---

## 🔧 การเปลี่ยน Mode

เปิดไฟล์ `src/config/appConfig.ts`:

```typescript
// เปลี่ยนค่านี้
export const APP_MODE: AppMode = 'online'  // หรือ 'offline'
```

บันทึกไฟล์และรีเฟรชหน้าเว็บ

---

## 📊 เปรียบเทียบ

| | Online | Offline |
|---|:---:|:---:|
| ต้องรัน Express Server | ❌ | ✅ |
| ต้องการอินเทอร์เน็ต | ✅ | ⚠️* |
| เหมาะสำหรับ Dev | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| เหมาะสำหรับ Production | ⭐⭐⭐⭐⭐ | ⭐ |

*Express Server ยังต้องเชื่อมต่อ Firebase

---

## 🚨 เช็ค Mode ปัจจุบัน

เปิด Browser Console (F12):
```javascript
// จะแสดง "☁️ Using Firebase (Online Mode)" 
// หรือ "🔌 Using Express API (Offline Mode)"
```

---

## 📚 เอกสารเพิ่มเติม

อ่านคู่มือฉบับเต็มได้ที่ [DUAL_MODE_GUIDE.md](./DUAL_MODE_GUIDE.md)

---

## ⚠️ ข้อควรระวัง

1. ✅ **ก่อน Deploy** - เปลี่ยนเป็น Online Mode
2. ✅ **Offline Mode** - ต้องรัน Express Server ก่อน
3. ✅ **เช็ค Mode Indicator** - ดูสถานะที่มุมบนขวา
4. ✅ **ถ้า Disconnected** - เช็คว่า Express Server รันอยู่หรือไม่

---

## 🎯 แนะนำ

- **Development**: ใช้ Offline Mode (ประหยัด Firebase quota)
- **Testing**: ใช้ Offline Mode (debug ง่ายกว่า)  
- **Production**: ใช้ Online Mode (ไม่ต้องรัน server)

---

**Happy Coding! 🚀**


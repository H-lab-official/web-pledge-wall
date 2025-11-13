# 🚀 คู่มือการ Deploy ไปยัง Firebase Hosting

## ⚠️ สิ่งสำคัญที่ต้องรู้

### 🔴 **Offline Mode จะใช้งานไม่ได้บน Firebase Hosting!**

**เพราะอะไร?**
- **Firebase Hosting** = โฮสต์เว็บไซต์บน Cloud (อินเทอร์เน็ต)
- **Offline Mode** = เชื่อมต่อกับ `localhost:3001` (เครื่องคอมพิวเตอร์ของคุณ)
- เมื่อ deploy แล้ว เว็บจะรันบนอินเทอร์เน็ต **ไม่สามารถเชื่อมต่อกับ localhost ของคุณได้**

### ✅ วิธีแก้

**ต้องเปลี่ยนเป็น Online Mode ก่อน Deploy เสมอ!**

```typescript
// src/config/appConfig.ts
export const APP_MODE = 'online' as AppMode  // ✅ ต้องเป็น 'online'
```

---

## 📋 ขั้นตอนการ Deploy

### 1️⃣ ตรวจสอบ Mode

เปิดไฟล์ `src/config/appConfig.ts`:

```typescript
// ✅ ถูกต้อง - พร้อม deploy
export const APP_MODE = 'online' as AppMode

// ❌ ผิด - จะใช้งานไม่ได้บน hosting
export const APP_MODE = 'offline' as AppMode
```

### 2️⃣ Build โปรเจค

```bash
bun run build
# หรือ
npm run build
```

ถ้า mode ไม่ถูกต้อง จะโชว์ error:

```
❌ DEPLOYMENT BLOCKED - WRONG MODE DETECTED

APP_MODE is currently set to: "offline"

⚠️  Offline mode will NOT work on Firebase Hosting!
    It only works on localhost during development.

✅ Please change APP_MODE to "online" in:
   src/config/appConfig.ts
```

### 3️⃣ Deploy

```bash
# Deploy ทั้งหมด (hosting + functions)
bun run deploy

# Deploy เฉพาะ hosting
bun run deploy:hosting

# Deploy เฉพาะ functions
bun run deploy:functions
```

---

## 🎯 เมื่อไหร่ควรใช้ Mode ไหน?

| สถานการณ์ | Mode | เหตุผล |
|-----------|------|--------|
| 🏠 พัฒนาบน localhost | `offline` | เร็ว, ไม่เปลือง Firebase quota |
| 🌐 Deploy ไป Firebase | `online` | **บังคับ** - ไม่งั้นใช้งานไม่ได้ |
| 🧪 ทดสอบบน localhost | `offline` หรือ `online` | ขึ้นอยู่กับว่าจะทดสอบอะไร |
| 📱 ทดสอบบนมือถือ (ใน network เดียวกัน) | `online` | ต้องเชื่อมต่อ Firebase |

---

## 🔧 Workflow แนะนำ

### สำหรับ Development (localhost)

```bash
# Terminal 1: รัน Express Server
bun run api

# Terminal 2: รัน Frontend
bun run dev
```

**ตั้งค่า:**
```typescript
export const APP_MODE = 'offline' as AppMode
```

### สำหรับ Production (Firebase Hosting)

**1. เปลี่ยน mode:**
```typescript
export const APP_MODE = 'online' as AppMode
```

**2. Build & Deploy:**
```bash
bun run deploy
```

---

## 🚨 สิ่งที่ต้องระวัง

### ❌ อย่าทำ:

1. ❌ Deploy ด้วย `offline` mode
2. ❌ ลืมเปลี่ยนกลับเป็น `online` ก่อน deploy
3. ❌ Commit code ที่มี `APP_MODE = 'offline'` ไป production branch

### ✅ ควรทำ:

1. ✅ เช็ค mode ก่อน deploy ทุกครั้ง
2. ✅ ใช้ `offline` mode ขณะพัฒนาเท่านั้น
3. ✅ ใช้ `bun run deploy` (มี auto-check ในตัว)
4. ✅ เปลี่ยนกลับเป็น `offline` หลัง deploy เสร็จ (ถ้าจะพัฒนาต่อ)

---

## 🔍 วิธีเช็คว่า Deploy ถูกต้องหรือไม่

### หลัง Deploy เสร็จ:

1. เปิดเว็บที่ Firebase Hosting URL
2. ดูที่มุมบนขวา:
   - ✅ **"Online (Firebase)"** สีเขียว = ใช้งานได้
   - ❌ **"Disconnected"** สีแดง = Deploy ผิด mode

### ถ้าเจอ "Disconnected":

1. เปลี่ยน mode เป็น `online`
2. Build ใหม่: `bun run build`
3. Deploy ใหม่: `bun run deploy:hosting`

---

## 💡 Tips

### เช็ค Mode ปัจจุบัน

```bash
# เช็คด้วย script
bun run check-mode

# เช็คด้วยตัวเอง
cat src/config/appConfig.ts | grep "APP_MODE ="
```

### Quick Deploy Checklist

- [ ] เปลี่ยน `APP_MODE` เป็น `'online'`
- [ ] บันทึกไฟล์ `src/config/appConfig.ts`
- [ ] รัน `bun run deploy`
- [ ] เปิดเว็บที่ Firebase Hosting URL
- [ ] เช็คว่าเห็น "Online (Firebase)" สีเขียว

---

## 📞 ถ้ามีปัญหา

### ปัญหา: เว็บแสดง "Disconnected"

**สาเหตุ:** Deploy ด้วย `offline` mode

**วิธีแก้:**
1. เปลี่ยนเป็น `online` mode
2. Build & Deploy ใหม่

### ปัญหา: สร้างข้อความไม่ได้

**สาเหตุ:** Mode ไม่ตรง

**วิธีแก้:**
1. เช็ค console (F12) ดู error
2. ตรวจสอบ mode indicator ที่มุมบนขวา
3. ตรวจสอบ Firebase config

---

## 🎯 สรุป

| | Development | Production |
|---|:---:|:---:|
| **Location** | localhost | Firebase Hosting |
| **Mode** | `offline` | `online` |
| **Express Server** | ต้องรัน | ไม่ต้องรัน |
| **Firebase** | ผ่าน Express | โดยตรง |

**จำไว้ว่า:**
- 🏠 **Development** = `offline` mode + Express server
- 🌐 **Production** = `online` mode (เท่านั้น!)
- 🔄 **เปลี่ยน mode ก่อน deploy ทุกครั้ง!**

---

**Happy Deploying! 🚀**


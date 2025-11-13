# 🔄 คู่มือการใช้งาน Dual Mode System

ระบบนี้รองรับการทำงาน 2 โหมด:
- **Online Mode** 🌐: เชื่อมต่อกับ Firebase (Cloud Database)
- **Offline Mode** 💻: เชื่อมต่อกับ Express Server บน localhost

---

## 📋 สารบัญ

1. [การเปลี่ยน Mode](#การเปลี่ยน-mode)
2. [Online Mode (Firebase)](#online-mode-firebase)
3. [Offline Mode (Local Server)](#offline-mode-local-server)
4. [วิธีใช้งาน](#วิธีใช้งาน)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 การเปลี่ยน Mode

### วิธีเปลี่ยนจาก Online เป็น Offline (และในทางกลับกัน)

1. เปิดไฟล์ `src/config/appConfig.ts`
2. แก้ไขค่า `APP_MODE`:

```typescript
// สำหรับ Online Mode (Firebase)
export const APP_MODE: AppMode = 'online'

// สำหรับ Offline Mode (Local Express Server)
export const APP_MODE: AppMode = 'offline'
```

3. บันทึกไฟล์
4. รีเฟรชหน้าเว็บ (หรือ restart dev server)

---

## 🌐 Online Mode (Firebase)

### คุณสมบัติ
- ✅ เชื่อมต่อโดยตรงกับ Firebase Firestore
- ✅ ข้อมูลเก็บบน Cloud (ไม่ต้องรัน local server)
- ✅ รองรับ real-time updates
- ✅ เข้าถึงได้จากทุกที่ที่มีอินเทอร์เน็ต

### วิธีใช้งาน
1. ตั้งค่า `APP_MODE = 'online'` ใน `src/config/appConfig.ts`
2. รัน development server:
   ```bash
   bun run dev
   # หรือ
   npm run dev
   ```
3. เปิดเบราว์เซอร์ที่ `http://localhost:5173`
4. จะเห็นสถานะ "Online (Firebase)" ที่มุมบนขวา (สีเขียว)

### ข้อจำกัด
- ⚠️ ต้องมีการเชื่อมต่ออินเทอร์เน็ต
- ⚠️ อาจมีค่าใช้จ่ายถ้าใช้งานเกิน Firebase Free Tier

---

## 💻 Offline Mode (Local Server)

### คุณสมบัติ
- ✅ ทำงานบน localhost (ไม่ต้องพึ่งอินเทอร์เน็ต)
- ✅ ข้อมูลยังคงเก็บใน Firebase แต่ผ่าน Express Server
- ✅ เหมาะสำหรับการทดสอบและพัฒนา
- ✅ ควบคุมได้ง่าย และ debug ง่ายกว่า

### วิธีใช้งาน

#### ขั้นตอนที่ 1: เริ่มต้น Express Server

เปิด Terminal ตัวแรก และรันคำสั่ง:

```bash
# ใช้ Bun (แนะนำ)
bun run api

# หรือใช้ Node.js
npm run api
```

Server จะรันที่ `http://localhost:3001`

คุณจะเห็นข้อความ:
```
🚀 Local Express API server running
📡 Base URL: http://localhost:3001/api
🔗 Health check: http://localhost:3001/api/health
📝 Mode: OFFLINE (Local Express + Firebase backend)

📚 Available endpoints:
   GET    /api/health
   GET    /api/messages/approved
   GET    /api/messages/all
   ...
```

#### ขั้นตอนที่ 2: ตั้งค่า Offline Mode

1. เปิดไฟล์ `src/config/appConfig.ts`
2. เปลี่ยนเป็น:
   ```typescript
   export const APP_MODE: AppMode = 'offline'
   ```
3. บันทึกไฟล์

#### ขั้นตอนที่ 3: เริ่มต้น Frontend

เปิด Terminal ตัวที่สอง และรันคำสั่ง:

```bash
# ใช้ Bun
bun run dev

# หรือใช้ npm
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

#### ขั้นตอนที่ 4: ตรวจสอบการเชื่อมต่อ

1. เปิดเบราว์เซอร์ที่ `http://localhost:5173`
2. ดูที่มุมบนขวา:
   - ถ้าเห็น "Offline (Local Server)" สีฟ้า ✅ = เชื่อมต่อสำเร็จ
   - ถ้าเห็น "Disconnected" สีแดง ❌ = ไม่สามารถเชื่อมต่อกับ Express Server
3. คลิกที่ indicator เพื่อเช็คการเชื่อมต่อใหม่

---

## 🚀 วิธีใช้งาน

### สำหรับ Development (แนะนำใช้ Offline Mode)

1. รัน Express Server (Terminal 1):
   ```bash
   bun run api
   ```

2. รัน Frontend Dev Server (Terminal 2):
   ```bash
   bun run dev
   ```

3. ตั้งค่าเป็น Offline Mode ใน `src/config/appConfig.ts`

### สำหรับ Production (แนะนำใช้ Online Mode)

1. Build frontend:
   ```bash
   bun run build
   ```

2. Deploy ไปยัง Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

3. ตั้งค่าเป็น Online Mode ใน `src/config/appConfig.ts` ก่อน build

---

## 🔍 API Endpoints (Offline Mode)

### สำหรับผู้ใช้ทั่วไป
- `POST /api/messages` - ส่งข้อความใหม่
- `GET /api/messages/approved` - ดึงข้อความที่ได้รับการอนุมัติ

### สำหรับ Admin
- `GET /api/messages/all` - ดึงข้อความทั้งหมด
- `GET /api/messages/:id` - ดึงข้อความตาม ID
- `PUT /api/messages/:id/approve` - อนุมัติข้อความ
- `PUT /api/messages/:id/reject` - ปฏิเสธข้อความ
- `PUT /api/messages/:id` - แก้ไขข้อความ
- `DELETE /api/messages/:id` - ลบข้อความ
- `POST /api/messages/:id/report` - รายงานข้อความ

### Health Check
- `GET /api/health` - ตรวจสอบสถานะ server

---

## ⚙️ การตั้งค่าเพิ่มเติม

### เปลี่ยน Port ของ Local Server

แก้ไขใน `src/api/server.ts`:
```typescript
const PORT = process.env.PORT || 3001  // เปลี่ยนเป็น port ที่ต้องการ
```

และอัพเดทใน `src/config/appConfig.ts`:
```typescript
export const API_CONFIG = {
  LOCAL_API_URL: 'http://localhost:3001/api',  // เปลี่ยน port ให้ตรงกัน
  REQUEST_TIMEOUT: 10000,
}
```

### เปลี่ยน Request Timeout

แก้ไขใน `src/config/appConfig.ts`:
```typescript
export const API_CONFIG = {
  LOCAL_API_URL: 'http://localhost:3001/api',
  REQUEST_TIMEOUT: 20000,  // เพิ่มเป็น 20 วินาที
}
```

---

## 🐛 Troubleshooting

### ปัญหา: แสดง "Disconnected" (สีแดง)

**สาเหตุที่เป็นไปได้:**
1. Express Server ไม่ได้รัน
2. Express Server รันอยู่ที่ port อื่น
3. มีปัญหาเกี่ยวกับ CORS

**วิธีแก้:**
1. ตรวจสอบว่า Express Server กำลังรันอยู่:
   ```bash
   bun run api
   ```
2. เช็ค console ใน Terminal ที่รัน Express Server
3. ลองเปิด `http://localhost:3001/api/health` ในเบราว์เซอร์
4. ถ้าเห็น `{"success":true,...}` แสดงว่า server ทำงานปกติ

### ปัญหา: ข้อมูลไม่อัพเดท

**วิธีแก้:**
1. กดปุ่ม Refresh ในหน้านั้นๆ
2. กดคลิกที่ Mode Indicator เพื่อเช็คการเชื่อมต่อ
3. เช็ค Network tab ใน Developer Tools (F12)
4. ดู console logs

### ปัญหา: Error เมื่อส่งข้อความ

**วิธีแก้:**
1. เช็คว่า mode ที่ตั้งค่าถูกต้องหรือไม่
2. ถ้าใช้ Offline Mode: ตรวจสอบว่า Express Server ยังรันอยู่
3. ถ้าใช้ Online Mode: ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
4. เช็ค Firebase config ใน `src/firebase/config.ts`

### ปัญหา: Express Server ไม่สามารถเชื่อมต่อ Firebase

**วิธีแก้:**
1. ตรวจสอบ Firebase config ใน `src/api/server.ts`
2. ต้องตรงกับ config ใน `src/firebase/config.ts`
3. ตรวจสอบว่ามี internet connection
4. ตรวจสอบ Firebase project settings

---

## 📊 เปรียบเทียบ Online vs Offline Mode

| คุณสมบัติ | Online Mode | Offline Mode |
|-----------|-------------|--------------|
| ความเร็ว | ปานกลาง | เร็วกว่า |
| ต้องการอินเทอร์เน็ต | ✅ ต้องการ | ⚠️ Express Server ต้องการ |
| การ Debug | ยากกว่า | ง่ายกว่า |
| เหมาะสำหรับ | Production | Development |
| จำนวน Request | จำกัดโดย Firebase | ไม่จำกัด (local) |
| ความปลอดภัย | สูง | ต่ำกว่า (localhost only) |

---

## 📝 หมายเหตุสำคัญ

1. **ก่อน Deploy**: เปลี่ยนเป็น Online Mode เสมอ
2. **การพัฒนา**: ใช้ Offline Mode เพื่อประหยัด Firebase quota
3. **Testing**: Offline Mode จะ debug ง่ายกว่า
4. **Mode Indicator**: จะแสดงที่มุมบนขวาทุกหน้า (สามารถคลิกเพื่อเช็คการเชื่อมต่อ)

---

## 🎯 Quick Start Commands

```bash
# เริ่มใช้งาน Offline Mode
Terminal 1: bun run api        # รัน Express Server
Terminal 2: bun run dev        # รัน Frontend
# จากนั้นเปลี่ยน APP_MODE เป็น 'offline' ใน src/config/appConfig.ts

# เริ่มใช้งาน Online Mode
bun run dev                    # รัน Frontend เท่านั้น
# เปลี่ยน APP_MODE เป็น 'online' ใน src/config/appConfig.ts

# Build สำหรับ Production
bun run build

# Deploy ไปยัง Firebase
firebase deploy --only hosting
```

---

## 💡 Tips

1. ใช้ Offline Mode ขณะพัฒนาเพื่อประหยัด Firebase quota
2. กด F12 เพื่อดู console logs และ network requests
3. คลิกที่ Mode Indicator เพื่อเช็คสถานะการเชื่อมต่อ
4. ตรวจสอบ Terminal ของ Express Server เพื่อดู request logs
5. ใช้ Postman หรือ Thunder Client เพื่อทดสอบ API endpoints

---

## 📧 ติดต่อ

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนา

---

**สร้างโดย:** Dual Mode System
**เวอร์ชัน:** 1.0.0
**อัพเดทล่าสุด:** 2025


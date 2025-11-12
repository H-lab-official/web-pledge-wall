# Web Pledge Wall

ระบบ Pledge Wall สำหรับแสดงข้อความและความคิดเห็น

## Features

- ✅ หน้าส่งข้อความ (Submit Page)
- ✅ ระบบกรองคำหยาบอัตโนมัติ
- ✅ หน้าแสดงข้อความที่อนุมัติแล้ว (Display Page)
- ✅ หน้าจัดการข้อความ (Admin Page)
  - อนุมัติ/ปฏิเสธข้อความ
  - แก้ไขข้อความ
  - ลบข้อความ
  - รายงานข้อความ
- ✅ API สำหรับดึงข้อความที่อนุมัติแล้ว

## Tech Stack

- React 18
- Vite
- TypeScript
- Firebase (Firestore)
- React Router
- bad-words (profanity filter)

## Installation

1. ติดตั้ง dependencies:
```bash
npm install
```

2. ตั้งค่า Firebase:
   - สร้างโปรเจกต์ Firebase ใหม่
   - คัดลอก Firebase config
   - แก้ไขไฟล์ `src/firebase/config.ts` ด้วย config ของคุณ

3. รันโปรเจกต์:
```bash
npm run dev
```

4. (Optional) รัน API Server:
```bash
npm run api
```

## Firebase Setup

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. สร้างโปรเจกต์ใหม่
3. เปิดใช้งาน Firestore Database
4. ตั้งค่า Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pledgeMessages/{messageId} {
      allow read: if request.auth != null || resource.data.status == 'approved';
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
  }
}
```

5. คัดลอก Firebase config ไปใส่ใน `src/firebase/config.ts`

## Project Structure

```
src/
├── api/              # API server
├── components/       # React components
├── firebase/         # Firebase configuration
├── pages/            # Page components
│   ├── SubmitPage    # หน้าส่งข้อความ
│   ├── DisplayPage   # หน้าแสดงข้อความ
│   └── AdminPage     # หน้าจัดการ
├── services/         # Firebase services
├── types/            # TypeScript types
└── utils/            # Utility functions (profanity filter)
```

## API Endpoints

### GET /api/messages
ดึงข้อความที่อนุมัติแล้วทั้งหมด

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "message-id",
      "message": "ข้อความ",
      "author": "ชื่อผู้ส่ง",
      "status": "approved",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### GET /api/health
ตรวจสอบสถานะ API

**Response:**
```json
{
  "success": true,
  "message": "Pledge Wall API is running"
}
```

## Pages

### 1. Submit Page (/)
- กรอกข้อความ
- ระบบกรองคำหยาบอัตโนมัติ
- ตรวจสอบความยาวข้อความ

### 2. Display Page (/display)
- แสดงข้อความที่อนุมัติแล้ว
- Auto-refresh ทุก 30 วินาที
- รองรับ responsive design

### 3. Admin Page (/admin)
- จัดการข้อความทั้งหมด
- อนุมัติ/ปฏิเสธข้อความ
- แก้ไขข้อความ
- ลบข้อความ
- รายงานข้อความ

## Profanity Filter

ระบบใช้ `bad-words` library และเพิ่มคำหยาบภาษาไทย:
- บ้า, โง่, ควาย, สัตว์, ส้นตีน
- อี, ไอ้, มึง, กู, เย็ด, ควย

สามารถเพิ่มคำหยาบเพิ่มเติมได้ใน `src/utils/profanityFilter.ts`

## Build

```bash
bun run build
```

## Firebase Hosting Deployment

### 1. ติดตั้ง Firebase CLI

```bash
# ใช้ npm
npm install -g firebase-tools

# หรือใช้ bun
bun add -g firebase-tools
```

### 2. Login Firebase

```bash
firebase login
```

### 3. ตั้งค่า Firebase Project

```bash
firebase init hosting
```

หรือแก้ไขไฟล์ `.firebaserc` โดยเปลี่ยน `your-project-id` เป็น Project ID ของคุณ

### 4. Build และ Deploy

```bash
# Build และ Deploy พร้อมกัน
bun run deploy

# หรือ Deploy แยก
bun run build
bun run deploy:hosting
```

### 5. ตรวจสอบ Deployment

หลังจาก deploy สำเร็จ คุณจะได้ URL เช่น:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

## หมายเหตุเกี่ยวกับ API Server

API Server (`src/api/server.ts`) ใช้ Express และไม่สามารถ deploy ไปที่ Firebase Hosting ได้โดยตรง 

**ทางเลือก:**
1. **ใช้ Firestore โดยตรง** (แนะนำ) - Frontend เรียก Firestore API โดยตรง (ใช้อยู่แล้ว)
2. **Cloud Functions** - แปลง Express API เป็น Cloud Functions
3. **Cloud Run** - Deploy Express server เป็น Cloud Run service

สำหรับโปรเจกต์นี้ Frontend ใช้ Firestore โดยตรงอยู่แล้ว ดังนั้น API Server เป็น optional และใช้สำหรับ development เท่านั้น

## License

MIT


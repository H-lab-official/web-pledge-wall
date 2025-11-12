# Firebase Hosting Deployment Guide

## ขั้นตอนการ Deploy

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

จะเปิด browser ให้ login ด้วย Google account ที่มี Firebase project

### 3. ตั้งค่า Firebase Project

แก้ไขไฟล์ `.firebaserc`:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

หรือใช้คำสั่ง:

```bash
firebase use --add
```

เลือก project ที่ต้องการ deploy

### 4. เปิดใช้งาน Firebase Services

#### เปิดใช้งาน Firebase Hosting

```bash
firebase init hosting
```

เลือก:
- **Public directory**: `dist` (Vite build output)
- **Single-page app**: `Yes` (สำหรับ React Router)
- **Set up automatic builds**: `No` (หรือ `Yes` ถ้าต้องการ GitHub Actions)
- **Overwrite index.html**: `No`

#### เปิดใช้งาน Firebase Functions

```bash
firebase init functions
```

เลือก:
- **Language**: TypeScript
- **Use ESLint**: Yes (หรือ No)
- **Install dependencies**: Yes

### 5. ติดตั้ง Dependencies สำหรับ Functions

```bash
cd functions
npm install
cd ..
```

### 6. Build และ Deploy

```bash
# Build และ Deploy ทั้ง Hosting และ Functions
bun run deploy:all

# หรือ Deploy แยก
bun run build
bun run deploy:hosting      # Deploy frontend only
bun run deploy:functions    # Deploy API functions only
```

### 7. ตรวจสอบ Deployment

หลังจาก deploy สำเร็จ คุณจะได้ URL:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

## ไฟล์ที่เกี่ยวข้อง

- `firebase.json` - Firebase configuration (Hosting + Functions)
- `.firebaserc` - Firebase project ID configuration
- `dist/` - Build output directory (สร้างโดย `bun run build`)
- `functions/` - Cloud Functions source code
  - `functions/src/index.ts` - Functions code
  - `functions/package.json` - Functions dependencies
  - `functions/lib/` - Compiled JavaScript (สร้างโดย build)

## Firebase Functions API Endpoints

หลังจาก deploy Functions แล้ว คุณจะได้ URL:

- `https://<region>-<project-id>.cloudfunctions.net/getMessages`
- `https://<region>-<project-id>.cloudfunctions.net/healthCheck`

หรือใช้ผ่าน Firebase Hosting rewrites (ต้อง configure เพิ่ม):

```json
{
  "source": "/api/messages",
  "function": "getMessages"
},
{
  "source": "/api/health",
  "function": "healthCheck"
}
```

## Testing Functions Locally

```bash
# Build functions
cd functions
npm run build
cd ..

# Run emulator
firebase emulators:start
```

หรือใช้:

```bash
cd functions
npm run serve
```

## Troubleshooting

### Build ล้มเหลว

ตรวจสอบว่า TypeScript compile ผ่าน:

```bash
bun run build
```

### Deploy ไม่สำเร็จ

ตรวจสอบว่า:
1. Login Firebase แล้ว: `firebase login`
2. Project ID ถูกต้องใน `.firebaserc`
3. Firebase Hosting เปิดใช้งานแล้วใน Firebase Console

### 404 Not Found เมื่อเข้า Route

ตรวจสอบว่า `firebase.json` มี rewrite rule สำหรับ SPA:

```json
{
  "source": "**",
  "destination": "/index.html"
}
```

## หมายเหตุ

### API Server Options

1. **Firebase Cloud Functions** (แนะนำ) ✅
   - ใช้ `functions/src/index.ts` ที่สร้างไว้แล้ว
   - Deploy ด้วย `bun run deploy:functions`
   - ใช้งานได้ฟรี (มี free tier)

2. **Local Express Server** (Development)
   - ใช้ `src/api/server.ts` สำหรับ local development
   - รันด้วย `bun run api`
   - ไม่สามารถ deploy ไปที่ Firebase Hosting ได้

3. **Frontend Direct Firestore** (ปัจจุบัน)
   - Frontend ใช้ Firestore โดยตรงอยู่แล้ว
   - ไม่จำเป็นต้องมี API Server
   - วิธีนี้เร็วกว่าและง่ายกว่า

### ข้อแนะนำ

- **Production**: ใช้ Firebase Cloud Functions
- **Development**: ใช้ Local Express Server หรือ Firestore โดยตรง
- **Simple Use Case**: ใช้ Firestore โดยตรง (ไม่ต้องมี API)


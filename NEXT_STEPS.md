# ขั้นตอนต่อไป - After Firebase Init

## ✅ สิ่งที่ทำเสร็จแล้ว

1. ✅ Firebase project ถูกตั้งค่าแล้ว (`web-pledge-wall`)
2. ✅ Firestore ถูกตั้งค่าแล้ว (location: asia-northeast1)
3. ✅ Functions ถูกตั้งค่าแล้ว (ใน `functions/` directory)
4. ✅ Hosting ถูกตั้งค่าแล้ว (public directory: `dist`)
5. ✅ Firestore Rules ถูกอัปเดตแล้ว
6. ✅ Storage Rules ถูกสร้างแล้ว

## 📋 ขั้นตอนต่อไป

### 1. ตั้งค่า Firebase Config ใน Frontend

แก้ไขไฟล์ `src/firebase/config.ts`:

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือก project `web-pledge-wall`
3. ไปที่ Project Settings (⚙️) → General
4. Scroll ลงไปหา "Your apps" → Web app
5. คัดลอก Firebase config (หรือใช้ config ที่มีอยู่แล้ว)
6. วางใน `src/firebase/config.ts`

ตัวอย่าง:
```typescript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "web-pledge-wall.firebaseapp.com",
  projectId: "web-pledge-wall",
  storageBucket: "web-pledge-wall.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Build Frontend

```bash
bun run build
```

### 4. Deploy ทั้งหมด

```bash
# Deploy ทั้ง Hosting, Functions, และ Firestore Rules
bun run deploy:all

# หรือ Deploy แยก
bun run deploy:hosting      # Frontend
bun run deploy:functions    # API Functions
firebase deploy --only firestore:rules  # Firestore Rules
```

### 5. ตรวจสอบ Deployment

หลังจาก deploy สำเร็จ คุณจะได้ URL:
- **Frontend**: `https://web-pledge-wall.web.app`
- **Frontend (alternate)**: `https://web-pledge-wall.firebaseapp.com`
- **Functions**: `https://asia-northeast1-web-pledge-wall.cloudfunctions.net/getMessages`

## 🔧 การตั้งค่า Firestore Indexes (ถ้าจำเป็น)

ถ้า Firestore แจ้งเตือนว่าต้องสร้าง index:

1. ไปที่ Firebase Console → Firestore Database → Indexes
2. คลิก "Create Index" หรือใช้คำสั่ง:
```bash
firebase deploy --only firestore:indexes
```

## 📝 หมายเหตุ

- **Firestore Rules**: ตั้งค่าให้อ่าน approved messages ได้ แต่ต้อง authenticated สำหรับ update/delete
- **Hosting**: ใช้ `dist` directory (Vite build output)
- **Functions**: ใช้ `functions/` directory (เรามี code อยู่แล้ว)
- **Storage**: ยังไม่ได้ตั้งค่า rules (ถ้าต้องการใช้)

## 🚀 Ready to Deploy!

เมื่อตั้งค่า Firebase config แล้ว รัน:

```bash
bun run build
bun run deploy:all
```


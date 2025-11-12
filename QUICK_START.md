# Quick Start - Firebase Setup

## วิธีแก้ Error: Failed to get Firebase project

### ขั้นตอนที่ 1: เลือก Firebase Project

รันคำสั่งนี้เพื่อเลือก project:

```bash
firebase use --add
```

เลือก project จาก list ที่แสดง แล้วกด Enter

### ขั้นตอนที่ 2: ตั้งค่า Firebase Services

หลังจากเลือก project แล้ว รัน:

```bash
firebase init
```

เลือก features ที่ต้องการ:
- **Firestore** - สำหรับ database
- **Hosting** - สำหรับ frontend
- **Functions** - สำหรับ API (optional)
- **Storage** - (optional)

### ขั้นตอนที่ 3: ตั้งค่า Firestore Rules

แก้ไขไฟล์ `firestore.rules`:

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

### ขั้นตอนที่ 4: ตั้งค่า Firebase Config

แก้ไขไฟล์ `src/firebase/config.ts` ด้วย Firebase config จาก Firebase Console:

1. ไปที่ Firebase Console → Project Settings → General
2. Scroll ลงไปหา "Your apps" → Web app
3. คัดลอก Firebase config
4. วางใน `src/firebase/config.ts`

### ขั้นตอนที่ 5: Deploy

```bash
# Build และ Deploy
bun run deploy:all
```

## หมายเหตุ

- ถ้า project ID ถูกต้องแล้ว แต่ยัง error อยู่ ลองรัน `firebase login` อีกครั้ง
- ตรวจสอบว่า project ID ใน `.firebaserc` ตรงกับ Project ID ใน Firebase Console


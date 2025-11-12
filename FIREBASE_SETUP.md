# Firebase Setup Guide

## ขั้นตอนการตั้งค่า Firebase Project

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Add project" หรือ "สร้างโปรเจกต์"
3. ใส่ชื่อโปรเจกต์และทำตามขั้นตอน
4. จด Project ID ที่ได้ (จะเป็นตัวอักษรเล็กทั้งหมด เช่น `my-project-12345`)

### 2. ตั้งค่า Project ID ในโปรเจกต์

มี 2 วิธี:

#### วิธีที่ 1: ใช้คำสั่ง (แนะนำ)

```bash
firebase use --add
```

เลือก project จาก list ที่แสดง แล้วตั้งชื่อ alias (หรือกด Enter เพื่อใช้ default)

#### วิธีที่ 2: แก้ไขไฟล์ `.firebaserc` โดยตรง

แก้ไข `.firebaserc`:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

เปลี่ยน `your-actual-project-id` เป็น Project ID จริงของคุณ

### 3. Login Firebase CLI

```bash
firebase login
```

### 4. ตรวจสอบ Project

```bash
firebase projects:list
```

### 5. ตั้งค่า Firebase Services

#### เปิดใช้งาน Firestore

```bash
firebase init firestore
```

เลือก:
- **Firestore Rules file**: `firestore.rules` (หรือใช้ default)
- **Firestore Indexes file**: `firestore.indexes.json` (หรือใช้ default)

#### ตั้งค่า Firestore Rules

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

#### เปิดใช้งาน Hosting (ถ้ายังไม่ได้ตั้งค่า)

```bash
firebase init hosting
```

เลือก:
- **Public directory**: `dist`
- **Single-page app**: `Yes`
- **Set up automatic builds**: `No` (หรือ `Yes` ถ้าต้องการ)
- **Overwrite index.html**: `No`

#### เปิดใช้งาน Functions (ถ้ายังไม่ได้ตั้งค่า)

```bash
firebase init functions
```

เลือก:
- **Language**: TypeScript
- **Use ESLint**: Yes (หรือ No)
- **Install dependencies**: Yes

### 6. Deploy

```bash
# Deploy ทั้งหมด
bun run deploy:all

# หรือ Deploy แยก
bun run deploy:hosting      # Frontend
bun run deploy:functions    # API Functions
```

## Troubleshooting

### Error: Failed to get Firebase project

**ปัญหา**: `.firebaserc` ยังใช้ค่า placeholder อยู่

**แก้ไข**: 
1. ใช้ `firebase use --add` เพื่อเลือก project
2. หรือแก้ไข `.firebaserc` โดยเปลี่ยน `your-project-id` เป็น Project ID จริง

### Error: Permission denied

**ปัญหา**: Account ไม่มีสิทธิ์เข้าถึง project

**แก้ไข**: 
1. ตรวจสอบว่า login ด้วย account ที่ถูกต้อง: `firebase login`
2. ตรวจสอบว่า project ID ถูกต้อง: `firebase projects:list`

### Error: Project not found

**ปัญหา**: Project ID ไม่ถูกต้องหรือ project ยังไม่สร้าง

**แก้ไข**: 
1. ตรวจสอบ Project ID ใน Firebase Console
2. ใช้ `firebase use --add` เพื่อเลือก project ใหม่


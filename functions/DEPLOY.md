# 🚀 Deploy Firebase Functions

## ❌ ปัญหา: 401 Unauthorized

Error นี้เกิดจาก:
- ❌ Function ยัง**ไม่ได้ deploy** ไปยัง Firebase
- ❌ หรือ Firebase project ไม่มี permissions

---

## ✅ วิธีแก้: Deploy Functions

### **1. ติดตั้ง Dependencies**

```bash
cd functions
npm install
```

---

### **2. Login Firebase**

```bash
firebase login
```

---

### **3. เลือก Project**

```bash
firebase use <your-project-id>
```

หรือ:
```bash
firebase projects:list
firebase use
```

---

### **4. Deploy Functions**

```bash
# Deploy ทั้งหมด
firebase deploy --only functions

# หรือ Deploy เฉพาะ function ที่ต้องการ
firebase deploy --only functions:syncMessages,functions:getMessages,functions:healthCheck
```

---

### **5. ตรวจสอบ URL ที่ได้**

หลัง deploy จะได้ URL แบบนี้:

```
✔  functions[syncMessages(us-central1)]: Successful create operation.
Function URL (syncMessages): https://us-central1-YOUR_PROJECT.cloudfunctions.net/syncMessages
```

---

## 🧪 ทดสอบ API

### **Test getMessages (ทั้งหมด):**

```bash
curl "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/getMessages"
```

**Response:**
```json
{
  "success": true,
  "data": [/* ทั้งหมด */],
  "count": 68
}
```

---

### **Test syncMessages (เฉพาะใหม่):**

**ครั้งแรก (ไม่ส่ง `after`):**
```bash
curl "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages"
```

**Response:**
```json
{
  "success": true,
  "data": [/* ทั้งหมด */],
  "count": 68
}
```

---

**ครั้งถัดไป (ส่ง `after`):**
```bash
curl "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages?after=2025-11-13T10:00:00.000Z"
```

**Response (เฉพาะที่ใหม่กว่า):**
```json
{
  "success": true,
  "data": [/* เฉพาะใหม่ */],
  "count": 5
}
```

---

## 📝 สรุปความแตกต่าง

| API | การทำงาน | Parameters |
|-----|----------|------------|
| **`/getMessages`** | ดึง**ทั้งหมด**ทุกครั้ง | ไม่มี |
| **`/syncMessages`** | ดึง**เฉพาะใหม่** | `?after=<timestamp>` (optional) |

### **ตัวอย่างการใช้งาน:**

```javascript
// 1. ดึงครั้งแรก (ทั้งหมด)
const response1 = await fetch('/syncMessages')
const result1 = await response1.json()
// → ได้ 68 รายการ

// เก็บ timestamp ล่าสุด
const lastTimestamp = result1.data[0].createdAt // ล่าสุดอยู่บนสุด

// 2. หลังจากนั้น 1 ชั่วโมง มีข้อความใหม่ 3 ข้อความ
const response2 = await fetch(`/syncMessages?after=${lastTimestamp}`)
const result2 = await response2.json()
// → ได้ 3 รายการ (เฉพาะใหม่!)
```

---

## ⚠️ Troubleshooting

### **1. "Error: Failed to get Firebase project"**

```bash
# ตรวจสอบ project
firebase projects:list

# เลือก project
firebase use <project-id>
```

---

### **2. "Error: HTTP Error: 403, Permission denied"**

```bash
# Login ใหม่
firebase logout
firebase login
```

---

### **3. "Functions Emulator is already running"**

```bash
# Kill emulator
npx kill-port 5001

# หรือ
firebase emulators:start --only functions
```

---

### **4. ต้องการทดสอบก่อน Deploy (Local Emulator):**

```bash
# Start emulator
cd functions
npm run serve

# หรือ
firebase emulators:start --only functions
```

**Test URL:**
```
http://localhost:5001/YOUR_PROJECT/us-central1/syncMessages
```

---

## ✅ ตรวจสอบว่า Deploy สำเร็จ

```bash
firebase functions:list
```

**Output:**
```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Name          │ Type     │ Region       │ State    │ Trigger                 │
├───────────────────────────────────────────────────────────────────────────────┤
│ getMessages   │ https    │ us-central1  │ ACTIVE   │ HTTPS                   │
│ syncMessages  │ https    │ us-central1  │ ACTIVE   │ HTTPS                   │
│ healthCheck   │ https    │ us-central1  │ ACTIVE   │ HTTPS                   │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Next Steps

หลัง deploy สำเร็จ:

1. ✅ คัดลอก URL จาก console
2. ✅ แทนที่ URL ใน Tauri app:
   ```
   https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages
   ```
3. ✅ ทดสอบการดึงข้อมูล

---

**🎉 เสร็จแล้ว! ตอนนี้ API พร้อมใช้งาน!**


# 🎪 คู่มือ Local Mode (ไม่ต้องใช้ Firebase)

## 🎯 ภาพรวม

Local Mode = เก็บข้อมูลใน **JSON file** บน server โดยไม่ต้องเชื่อมต่อ Firebase เลย

---

## ✅ ข้อดี

| คุณสมบัติ | Local Mode | Firebase Mode |
|-----------|:----------:|:-------------:|
| ไม่ต้องการอินเทอร์เน็ต | ✅ ไม่ต้อง | ❌ ต้องการ |
| ความเร็ว | ⚡⚡⚡ เร็วสุด | ⚡⚡ เร็ว |
| Firebase Errors | ✅ ไม่มี | ❌ มี (ถ้าไม่มี net) |
| Setup | ✅ ง่าย | ⚠️ ต้อง config |
| เหมาะสำหรับงาน | ✅ เหมาะมาก | ⚠️ ต้องมี internet |

---

## 🚀 วิธีใช้งาน

### วิธีที่ 1: ใช้ Script (แนะนำ)

```bash
start-event-mode.bat
```

Script จะรัน **Local API Server** อัตโนมัติ (ไม่ใช้ Firebase)

### วิธีที่ 2: รันเอง

```bash
# Terminal 1: Local API Server
bun run api:local

# Terminal 2: Frontend
bun run dev
```

---

## 📊 เมื่อรัน Local Server จะเห็น:

```
╔════════════════════════════════════════════════════════╗
║  🎪 LOCAL EVENT SERVER (No Internet Required)         ║
╚════════════════════════════════════════════════════════╝

🚀 Server running on port 3001
📡 Base URL: http://localhost:3001/api
🔗 Health check: http://localhost:3001/api/health

📝 Mode: LOCAL (JSON File Storage)
💾 Data location: ./local-data/messages.json
🌐 Internet: NOT REQUIRED
🔥 Firebase: NOT USED

📊 Current Stats:
   Total: 0
   Approved: 0
   Pending: 0
   Rejected: 0

✅ Ready to accept connections!
```

### ⚠️ ไม่มี Firebase Error logs อีกต่อไป!

---

## 💾 การเก็บข้อมูล

### ข้อมูลเก็บที่ไหน?

```
D:\PeeMee\
  └── local-data\
      └── messages.json  ← ข้อมูลทั้งหมดอยู่ที่นี่
```

### ตัวอย่างข้อมูลใน messages.json:

```json
{
  "messages": [
    {
      "id": "msg_1731526800000_abc123",
      "message": "Hello World!",
      "author": "John",
      "status": "approved",
      "createdAt": "2025-11-13T12:00:00.000Z",
      "updatedAt": "2025-11-13T12:00:00.000Z",
      "reportedCount": 0
    }
  ]
}
```

---

## 📦 Backup & Export

### Export ข้อมูล:

```bash
# ดาวน์โหลดข้อมูลทั้งหมด
curl http://localhost:3001/api/export -o backup.json
```

หรือเปิดในเบราว์เซอร์:
```
http://localhost:3001/api/export
```

### Import ข้อมูล:

```bash
# Import จากไฟล์ backup
curl -X POST http://localhost:3001/api/import \
  -H "Content-Type: application/json" \
  -d @backup.json
```

### สำรองข้อมูลด้วยตัวเอง:

```bash
# Copy ไฟล์ไปไว้ที่อื่น
copy local-data\messages.json backup-2025-11-13.json
```

---

## 🔧 การจัดการข้อมูล

### 1. ดูสถิติ:

```bash
curl http://localhost:3001/api/stats
```

ได้:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "approved": 95,
    "pending": 3,
    "rejected": 2,
    "reported": 1
  }
}
```

### 2. ล้างข้อมูลทั้งหมด:

```bash
curl -X DELETE http://localhost:3001/api/clear-all
```

⚠️ **ระวัง!** จะลบข้อมูลทั้งหมด

### 3. ดูข้อมูลทั้งหมด:

เปิด `local-data/messages.json` ใน text editor

---

## 🔄 เปรียบเทียบ 3 โหมด

### 1. **Online Mode** (`api` + Firebase)

```bash
bun run api        # ใช้ Firebase
bun run dev
```

- ✅ ข้อมูลบน Cloud
- ❌ ต้องมีอินเทอร์เน็ต
- ❌ มี Firebase error logs

### 2. **Offline Mode** (`api` + Express)

```bash
bun run api        # ยังใช้ Firebase อยู่
bun run dev
```

- ⚠️ ยังใช้ Firebase อยู่
- ❌ จะมี error ถ้าไม่มี internet
- ⚠️ ไม่เหมาะสำหรับงาน

### 3. **Local Mode** (`api:local` + JSON) ⭐ แนะนำ

```bash
bun run api:local  # ไม่ใช้ Firebase
bun run dev
```

- ✅ เก็บใน JSON file
- ✅ ไม่ต้องมีอินเทอร์เน็ต
- ✅ ไม่มี Firebase errors
- ✅ เหมาะสำหรับงาน

---

## 🎯 Use Cases

### ใช้ Local Mode เมื่อ:

✅ **งานที่มีคนเยอะ** - ไม่ต้องกังวลเรื่อง internet  
✅ **ทดสอบระบบ** - ไม่เปลือง Firebase quota  
✅ **Demo/Presentation** - ไม่ต้องพึ่ง internet  
✅ **Development** - เร็วกว่า ไม่มี lag

### ใช้ Firebase Mode เมื่อ:

✅ **Production** - ต้องการ Cloud storage  
✅ **Multi-location** - เข้าถึงจากหลายที่  
✅ **Backup automatic** - Firebase มี backup ให้  
✅ **Realtime sync** - ต้องการ sync ข้อมูล

---

## 🛠️ Advanced

### เปลี่ยน Data Location:

แก้ไข `src/api/localDB.ts`:

```typescript
const DATA_DIR = join(process.cwd(), 'my-custom-folder')
```

### เพิ่ม Auto-backup:

```typescript
// ใน localDB.ts
export function autoBackup() {
  const backup = readDB()
  const filename = `backup-${Date.now()}.json`
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(backup))
}
```

### Sync กับ Firebase ภายหลัง:

```typescript
// Export local data
const localData = await fetch('http://localhost:3001/api/export')
const messages = await localData.json()

// Import to Firebase
messages.forEach(async (msg) => {
  await addDoc(collection(db, 'pledgeMessages'), msg)
})
```

---

## 🚨 Troubleshooting

### ปัญหา: ไม่สร้างไฟล์ messages.json

**วิธีแก้:**
```bash
# สร้างโฟลเดอร์และไฟล์เอง
mkdir local-data
echo {"messages":[]} > local-data\messages.json
```

### ปัญหา: Permission denied

**วิธีแก้:**
```bash
# Run as Administrator
# หรือเปลี่ยน permission
icacls local-data /grant Everyone:F
```

### ปัญหา: ข้อมูลหาย

**วิธีแก้:**
```bash
# Restore จาก backup
copy backup-2025-11-13.json local-data\messages.json
```

---

## 📋 Checklist สำหรับงาน

### ก่อนงาน:

- [ ] ทดสอบ `bun run api:local`
- [ ] เช็คว่าสร้างไฟล์ `local-data/messages.json`
- [ ] Backup ข้อมูล (ถ้ามี): `copy local-data\messages.json backup.json`
- [ ] ทดสอบส่งข้อความ 1-2 ข้อความ
- [ ] เช็คว่าไม่มี Firebase error logs

### หลังงาน:

- [ ] Export ข้อมูล: `http://localhost:3001/api/export`
- [ ] Backup ไฟล์: `copy local-data\messages.json event-backup-$(date).json`
- [ ] (Optional) Import ไป Firebase
- [ ] เก็บไฟล์ backup ไว้ที่ปลอดภัย

---

## 💡 Tips

### 1. Auto-save Backup ทุก 30 นาที:

```bash
# Windows Task Scheduler
schtasks /create /tn "Backup Messages" /tr "copy D:\PeeMee\local-data\messages.json D:\Backups\messages-%date%.json" /sc minute /mo 30
```

### 2. Monitor จำนวนข้อความ:

```bash
# เช็คสถิติทุก 5 วินาที
while true; do curl -s http://localhost:3001/api/stats | jq '.data.total'; sleep 5; done
```

### 3. Export รูปแบบอื่น:

```bash
# Export เป็น CSV
curl http://localhost:3001/api/export | jq -r '.messages[] | [.message,.author,.status] | @csv' > export.csv
```

---

## 🎉 สรุป

**Local Mode = ไม่มี Firebase Errors + เร็วสุด + เหมาะสำหรับงาน!**

| | Before | After |
|---|:---:|:---:|
| Firebase Errors | ❌ เต็มไปหมด | ✅ ไม่มีเลย |
| Internet | ❌ ต้องมี | ✅ ไม่ต้อง |
| Speed | 🐌 ช้า (รอ Firebase) | ⚡ เร็วมาก |
| สำหรับงาน | ⚠️ ไม่เหมาะ | ✅ เหมาะมาก |

---

**คำสั่งสำคัญ:**

```bash
# รัน Local Server (ไม่ใช้ Firebase)
bun run api:local

# หรือใช้ Script
start-event-mode.bat

# Export ข้อมูล
http://localhost:3001/api/export

# ดูสถิติ
http://localhost:3001/api/stats
```

---

**ไม่มี Firebase Error Logs อีกต่อไป! 🎉**


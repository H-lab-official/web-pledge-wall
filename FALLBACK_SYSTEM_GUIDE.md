# 🛡️ คู่มือระบบ Fallback / Backup Server

## 📖 ภาพรวม

ระบบ Fallback เป็นระบบสำรองที่ทำงานอัตโนมัติเมื่อ **Firebase ล้มเหลวหรือช้าเกินไป**

### 🎯 การทำงาน (3 ขั้นตอน)

```
1. Primary (Firebase/Express) 
   ⏱️ Timeout: 12 วินาที
   ↓ หากล้มเหลว
   
2. Backup Server (IP ที่กำหนด)
   ⏱️ Timeout: 10 วินาที
   ↓ หากล้มเหลว
   
3. LocalStorage (เก็บไว้ retry ภายหลัง)
   💾 บันทึกข้อมูลไว้ในเบราว์เซอร์
```

---

## ⚙️ การตั้งค่า

### 1. เปิด/ปิด ระบบ Fallback

เปิดไฟล์ `src/config/appConfig.ts`:

```typescript
export const API_CONFIG = {
  // ⚙️ เปลี่ยน IP นี้เป็นของ backup server ของคุณ
  BACKUP_API_URL: 'http://192.168.1.100:3001/api',
  
  // Timeout settings
  PRIMARY_TIMEOUT: 12000, // 12 วินาที
  BACKUP_TIMEOUT: 10000,  // 10 วินาที
  
  // เปิด/ปิด fallback
  ENABLE_FALLBACK: true,  // เปลี่ยนเป็น false เพื่อปิด
}
```

### 2. ตั้งค่า Backup Server URL

เปลี่ยน IP ให้ตรงกับ backup server ของคุณ:

```typescript
// ตัวอย่าง
BACKUP_API_URL: 'http://192.168.1.100:3001/api'  // LAN
BACKUP_API_URL: 'http://10.0.0.50:3001/api'      // Network อื่น
BACKUP_API_URL: 'https://backup.yourdomain.com/api'  // Cloud backup
```

### 3. ปรับ Timeout

```typescript
PRIMARY_TIMEOUT: 12000, // เพิ่มถ้าต้องการรอนานกว่า
BACKUP_TIMEOUT: 10000,  // เพิ่มถ้า backup server ช้า
```

---

## 🖥️ ตั้งค่า Backup Server

### วิธีที่ 1: ใช้ Express Server บนเครื่องอื่น

```bash
# บนเครื่อง backup server
git clone [your-repo]
cd [project]
bun install

# แก้ไข port ถ้าจำเป็น (src/api/server.ts)
const PORT = 3001

# รัน server
bun run api
```

**หา IP ของเครื่อง:**

```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
# หรือ
ip addr show
```

จดค่า IP (เช่น `192.168.1.100`) แล้วเอาไปใส่ใน `BACKUP_API_URL`

### วิธีที่ 2: ใช้ Cloud Server

Deploy Express server ไปยัง:
- **Heroku** - Free tier
- **Railway** - Free tier
- **Render** - Free tier
- **DigitalOcean** - $4/month
- **AWS EC2** - Free tier 1 ปี

แล้วใช้ URL ของ cloud server:
```typescript
BACKUP_API_URL: 'https://your-backup.herokuapp.com/api'
```

---

## 📊 การทำงานของระบบ

### Scenario 1: Firebase ทำงานปกติ ✅

```
User กดส่งข้อความ
  ↓
Firebase (สำเร็จ ภายใน 12 วินาที)
  ↓
✅ แสดงผลสำเร็จ
```

**Console log:**
```
📤 [Primary] Attempting to submit...
✅ [Primary] Submitted successfully: abc123
```

### Scenario 2: Firebase ช้า/ล้มเหลว → ใช้ Backup ✅

```
User กดส่งข้อความ
  ↓
Firebase (timeout > 12 วินาที หรือ error)
  ↓
🔄 Backup Server (สำเร็จ)
  ↓
✅ แสดงผลสำเร็จ (จาก backup)
```

**Console log:**
```
📤 [Primary] Attempting to submit...
⚠️ [Primary] Failed or timeout: Error: timeout exceeded
🔄 [Fallback] Trying backup server...
📡 [Backup] Sending to backup server: http://192.168.1.100:3001/api
✅ [Backup] Submitted successfully, ID: xyz789
✅ [Fallback] Backup successful: xyz789
ℹ️ Message saved to backup server
```

### Scenario 3: ทั้ง Firebase และ Backup ล้มเหลว → localStorage 💾

```
User กดส่งข้อความ
  ↓
Firebase (timeout)
  ↓
Backup Server (timeout)
  ↓
💾 localStorage (บันทึกไว้)
  ↓
⏰ รอ retry ภายหลัง
```

**Console log:**
```
📤 [Primary] Attempting to submit...
⚠️ [Primary] Failed or timeout
🔄 [Fallback] Trying backup server...
❌ [Fallback] Backup also failed
💾 [Fallback] Saved to localStorage for retry
```

---

## 🔧 API Functions

### ส่งข้อความ (auto fallback)

```typescript
import { submitMessage } from './services/messageService'

try {
  const id = await submitMessage('Hello World', 'John')
  console.log('Success:', id)
} catch (error) {
  console.error('Failed:', error)
}
```

### ดึงข้อความที่ล้มเหลว

```typescript
import { getFailedMessages } from './services/messageService'

const failed = getFailedMessages()
console.log('Failed messages:', failed)
// [
//   {
//     message: "Hello",
//     author: "John",
//     timestamp: "2025-11-13T10:00:00.000Z",
//     attempts: 0
//   }
// ]
```

### Retry ข้อความที่ล้มเหลวทั้งหมด

```typescript
import { retryFailedMessages } from './services/messageService'

await retryFailedMessages()
// 🔄 [Backup] Retrying 3 failed messages...
// ✅ [Backup] Retry complete: 3/3 succeeded
```

### ลบข้อความที่ล้มเหลดทั้งหมด

```typescript
import { clearFailedMessages } from './services/messageService'

clearFailedMessages()
```

### ตรวจสอบ Backup Server

```typescript
import { checkBackupServer } from './services/messageService'

const isHealthy = await checkBackupServer()
console.log('Backup server healthy?', isHealthy)
```

---

## 🎨 UI สำหรับจัดการ Failed Messages (Optional)

สร้าง component สำหรับแสดงและ retry ข้อความที่ล้มเหลว:

```typescript
import { getFailedMessages, retryFailedMessages, clearFailedMessages } from '../services/messageService'

function FailedMessagesPanel() {
  const [failed, setFailed] = useState([])
  
  useEffect(() => {
    setFailed(getFailedMessages())
  }, [])
  
  const handleRetry = async () => {
    await retryFailedMessages()
    setFailed(getFailedMessages())
  }
  
  if (failed.length === 0) return null
  
  return (
    <div className="failed-messages-panel">
      <h3>⚠️ {failed.length} messages pending</h3>
      <button onClick={handleRetry}>🔄 Retry All</button>
      <button onClick={() => {
        clearFailedMessages()
        setFailed([])
      }}>🗑️ Clear All</button>
    </div>
  )
}
```

---

## 🧪 การทดสอบ

### 1. ทดสอบ Primary Success

```typescript
// ปกติ - Firebase/Express ทำงานได้
await submitMessage('Test message')
// ✅ Primary ส่งสำเร็จ
```

### 2. ทดสอบ Timeout → Backup

```typescript
// ตั้ง timeout สั้นมาก
PRIMARY_TIMEOUT: 1, // 1ms - แน่นอนว่า timeout

await submitMessage('Test message')
// ⏱️ Primary timeout → 🔄 ใช้ Backup
```

### 3. ทดสอบ Backup Server

```bash
# เปิด backup server
bun run api

# ปิด Firebase (disconnect internet)
# ส่งข้อความ → ควรใช้ backup
```

### 4. ทดสอบ LocalStorage Fallback

```typescript
// ปิดทั้ง Firebase และ Backup
// ส่งข้อความ → ควรเก็บใน localStorage

const failed = getFailedMessages()
console.log(failed) // ควรมีข้อความที่ล้มเหลว
```

---

## 🚨 Troubleshooting

### ปัญหา: Backup server ไม่ทำงาน

**วิธีเช็ค:**
```typescript
const healthy = await checkBackupServer()
console.log(healthy) // false = ไม่ทำงาน
```

**วิธีแก้:**
1. เช็คว่า backup server รันอยู่หรือไม่
2. เช็ค IP/URL ใน `BACKUP_API_URL`
3. เช็ค firewall (port 3001 เปิดหรือไม่)
4. ลอง ping IP: `ping 192.168.1.100`
5. ลองเข้า URL ในเบราว์เซอร์: `http://192.168.1.100:3001/api/health`

### ปัญหา: Fallback ไม่ทำงาน

**เช็ค config:**
```typescript
console.log(API_CONFIG.ENABLE_FALLBACK) // ต้อง true
console.log(API_CONFIG.BACKUP_API_URL)  // ต้องไม่ใช่ null/undefined
```

### ปัญหา: CORS Error

ถ้า backup server อยู่คนละ domain จะเจอ CORS error

**วิธีแก้ (src/api/server.ts):**
```typescript
import cors from 'cors'

app.use(cors({
  origin: '*', // หรือระบุ domain ที่อนุญาต
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
```

---

## 📈 Monitoring & Logs

### ดู logs ใน Console (F12)

```javascript
// Primary success
📤 [Primary] Attempting to submit...
✅ [Primary] Submitted successfully: abc123

// Fallback used
⚠️ [Primary] Failed or timeout
🔄 [Fallback] Trying backup server...
✅ [Fallback] Backup successful: xyz789

// LocalStorage fallback
❌ [Fallback] Backup also failed
💾 [Fallback] Saved to localStorage for retry
```

### ติดตาม Failed Messages

```typescript
// เช็คจำนวนที่ล้มเหลว
const failedCount = getFailedMessages().length
console.log(`${failedCount} messages pending`)

// Auto-retry ทุก 5 นาที
setInterval(async () => {
  const count = getFailedMessages().length
  if (count > 0) {
    console.log(`Auto-retrying ${count} messages...`)
    await retryFailedMessages()
  }
}, 5 * 60 * 1000)
```

---

## 💡 Best Practices

1. ✅ **เช็ค Backup Server เป็นประจำ**
   ```typescript
   setInterval(async () => {
     const healthy = await checkBackupServer()
     console.log('Backup health:', healthy)
   }, 60000) // ทุก 1 นาที
   ```

2. ✅ **Auto-retry Failed Messages**
   - เมื่อเปิดแอพ
   - ทุกๆ 5-10 นาที
   - เมื่อ network กลับมา

3. ✅ **แจ้งเตือนผู้ใช้**
   ```typescript
   if (getFailedMessages().length > 0) {
     alert('You have pending messages that will be sent later')
   }
   ```

4. ✅ **จำกัดจำนวน Failed Messages**
   ```typescript
   // เก็บไว้แค่ 100 messages
   const MAX_FAILED = 100
   const failed = getFailedMessages()
   if (failed.length > MAX_FAILED) {
     failed.splice(0, failed.length - MAX_FAILED)
     localStorage.setItem('failedMessages', JSON.stringify(failed))
   }
   ```

---

## 🎯 สรุป

| สถานการณ์ | ระยะเวลา | ผลลัพธ์ |
|-----------|---------|---------|
| Firebase ทำงานปกติ | < 12 วินาที | ✅ ส่งสำเร็จ |
| Firebase ช้า/ล้มเหลว | > 12 วินาที | 🔄 ใช้ Backup |
| Backup ทำงาน | < 10 วินาที | ✅ ส่งสำเร็จ (backup) |
| ทั้งคู่ล้มเหลว | - | 💾 เก็บไว้ retry |

**จำไว้ว่า:**
- 🏗️ **Backup Server** ต้องรันอยู่ตลอดเวลา (หรือใช้ cloud)
- ⏱️ **Timeout** ปรับได้ตามความต้องการ
- 💾 **LocalStorage** เป็น fallback สุดท้าย
- 🔄 **Auto-retry** ทำให้ไม่เสียข้อมูล

---

**Happy Coding! 🚀**


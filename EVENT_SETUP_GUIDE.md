# 🎪 คู่มือการใช้งานในงาน (Event Mode)

## 📋 ภาพรวม

โหมดนี้เหมาะสำหรับงานที่มีคนเยอะ ไม่ต้องพึ่งอินเทอร์เน็ต ใช้เครือข่าย LAN เท่านั้น

---

## ⚡ Quick Start

### 1. เตรียมเครื่อง Server

ต้องมีเครื่อง 1 เครื่องเป็น server (แนะนำ: เครื่องที่แรงที่สุด)

**หา IP ของเครื่อง:**

```bash
# Windows
ipconfig
```

จด IP Address (เช่น `192.168.11.18`)

### 2. แก้ไข Config

เปิด `src/config/appConfig.ts`:

```typescript
// เปลี่ยน IP เป็นของเครื่อง server
LOCAL_API_URL: 'http://192.168.11.18:3001/api',
```

### 3. รัน Server

**วิธีที่ 1: ใช้ Script (แนะนำ)**

```bash
start-event-mode.bat
```

**วิธีที่ 2: รันแยกทีละ Terminal**

```bash
# Terminal 1: API Server
bun run api

# Terminal 2: Frontend
bun run dev
```

### 4. เปิด Firewall

```powershell
# Windows PowerShell (Run as Administrator)
netsh advfirewall firewall add rule name="Express API" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Vite Dev" dir=in action=allow protocol=TCP localport=5173
```

---

## 📱 เข้าถึงจากอุปกรณ์อื่น

### จาก iPad/Tablet/Laptop/Desktop:

เปิดเบราว์เซอร์แล้วพิมพ์:

```
http://192.168.11.18:5173
```

**(เปลี่ยน IP เป็นของเครื่อง server คุณ)**

---

## ✅ ข้อดีของ Event Mode

| คุณสมบัติ | Event Mode | Online Mode |
|-----------|:----------:|:-----------:|
| ต้องการอินเทอร์เน็ต | ❌ ไม่ต้อง | ✅ ต้องการ |
| รองรับคนเยอะ | ✅ ได้ | ⚠️ ขึ้นกับ internet |
| ความเร็ว | ⚡ เร็วมาก | 🐌 ขึ้นกับ internet |
| เสถียรภาพ | ✅ สูง | ⚠️ ขึ้นกับ internet |
| บันทึกใน Firebase | ✅ ใช่ | ✅ ใช่ |

---

## 🔧 Network Requirements

### สิ่งที่ต้องมี:

- ✅ Router/WiFi (ไม่ต้องต่ออินเทอร์เน็ต)
- ✅ ทุกเครื่องต่อ WiFi/LAN เดียวกัน
- ✅ เครื่อง server รัน API และ Frontend

### ไม่ต้องมี:

- ❌ อินเทอร์เน็ต
- ❌ Firebase Hosting
- ❌ Cloud Server

---

## 📊 Architecture

```
┌─────────────────────────────────────────────┐
│           Router / WiFi                      │
│         (ไม่ต้องต่ออินเทอร์เน็ต)               │
└─────────────────────────────────────────────┘
           │
           ├─── Server (192.168.11.18)
           │    ├─ Express API :3001
           │    └─ Frontend :5173
           │
           ├─── iPad 1 → http://192.168.11.18:5173
           ├─── iPad 2 → http://192.168.11.18:5173
           ├─── Laptop → http://192.168.11.18:5173
           └─── Desktop → http://192.168.11.18:5173
```

---

## 🔍 Checklist ก่อนงาน

### วันก่อนงาน:

- [ ] ทดสอบ server รันได้
- [ ] ทดสอบเข้าถึงจากเครื่องอื่นได้
- [ ] เตรียม router/WiFi
- [ ] ชาร์จแบตเตอรี่เครื่อง server
- [ ] ติดตั้ง dependencies: `bun install`
- [ ] Build production (ถ้าต้องการ): `bun run build`

### วันงาน (Setup):

- [ ] เสียบปลั๊ก server
- [ ] เปิด WiFi/Router
- [ ] เปิดเครื่อง server
- [ ] รัน `start-event-mode.bat`
- [ ] เช็ค IP ของ server: `ipconfig`
- [ ] ทดสอบเข้าจาก iPad 1 เครื่อง
- [ ] เช็คว่าเห็น "Offline (Local Server)" สีฟ้า
- [ ] ทดสอบส่งข้อความ 1 ข้อความ
- [ ] พร้อมใช้งาน! 🎉

---

## 🚨 Troubleshooting

### ปัญหา: iPad เข้าไม่ได้

**เช็ค:**
1. iPad ต่อ WiFi เดียวกันกับ server หรือไม่
2. ลอง ping: `ping 192.168.11.18` (จากเครื่องอื่น)
3. เปิด URL ในเบราว์เซอร์: `http://192.168.11.18:5173`
4. เช็ค firewall บน server

**วิธีแก้:**
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Express API" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Vite Dev" dir=in action=allow protocol=TCP localport=5173
```

### ปัญหา: แสดง "Disconnected"

**สาเหตุ:** Express server ไม่รัน

**วิธีแก้:**
1. เช็ค Terminal ที่รัน `bun run api`
2. ควรเห็น: `🚀 Local Express API server running`
3. ถ้าไม่มี → รันใหม่: `bun run api`

### ปัญหา: ช้า/แฮง

**สาเหตุ:** เครื่อง server ไม่แรงพอ

**วิธีแก้:**
1. ปิดโปรแกรมอื่นๆ บน server
2. ใช้เครื่องที่แรงกว่า
3. เพิ่ม RAM

### ปัญหา: ข้อมูลไม่อัพเดท

**วิธีแก้:**
1. Refresh เบราว์เซอร์ (F5)
2. Clear cache (Ctrl+Shift+Delete)
3. ปิดเปิดเบราว์เซอร์ใหม่

---

## 📈 Performance Tips

### สำหรับงานขนาดใหญ่:

1. **ใช้เครื่อง server ที่แรง:**
   - RAM ≥ 8GB
   - CPU ≥ 4 cores
   - SSD (ไม่ใช่ HDD)

2. **ปิดโปรแกรมที่ไม่จำเป็น:**
   ```powershell
   # ปิด background apps
   taskkill /f /im chrome.exe
   taskkill /f /im discord.exe
   ```

3. **ใช้ Production Build:**
   ```bash
   bun run build
   bun run preview
   ```

4. **จำกัด concurrent connections:**
   - ประมาณ 50-100 users ต่อเครื่อง server

---

## 💾 Backup Data

แม้ใช้ Local Server ข้อมูลก็ยังบันทึกลง Firebase อยู่!

### เช็คข้อมูลใน Firebase:

1. เปิด https://console.firebase.google.com
2. เลือก project
3. ไปที่ Firestore Database
4. ดู collection `pledgeMessages`

### Export ข้อมูล:

```bash
# Export ข้อมูลออกมา
firebase firestore:export backup-$(date +%Y%m%d)
```

---

## 🎯 Production Deployment

### สำหรับงานที่ใช้จริง:

**Option 1: ใช้เครื่อง Laptop เป็น Server**

ข้อดี:
- ✅ ง่าย
- ✅ มี battery backup
- ✅ เคลื่อนย้ายได้

ข้อเสีย:
- ⚠️ Performance จำกัด
- ⚠️ รองรับคนได้ไม่เยอะ

**Option 2: ใช้ Mini PC**

ข้อดี:
- ✅ Performance ดีกว่า
- ✅ เสถียรกว่า
- ✅ ใช้ไฟน้อย

ข้อเสีย:
- ⚠️ ไม่มี battery backup
- ⚠️ ต้องซื้อ

**Option 3: ใช้ Raspberry Pi**

ข้อดี:
- ✅ ราคาถูก
- ✅ ใช้ไฟน้อย
- ✅ เล็กกะทัดรัด

ข้อเสีย:
- ⚠️ Performance จำกัด
- ⚠️ ต้อง setup Linux

---

## 📞 Support Checklist

เตรียมไว้ในงาน:

- [ ] เบอร์โทร IT support
- [ ] Backup server (เครื่องสำรอง)
- [ ] Power bank / UPS
- [ ] สาย LAN สำรอง
- [ ] USB WiFi adapter สำรอง
- [ ] คู่มือนี้พิมพ์ออกมา

---

## 🎉 สรุป

**Event Mode = Local Network + No Internet Required**

| | Before | After |
|---|:---:|:---:|
| Internet | ✅ ต้องการ | ❌ ไม่ต้อง |
| Speed | 🐌 ช้า | ⚡ เร็ว |
| Stability | ⚠️ ไม่แน่นอน | ✅ เสถียร |
| Setup | ⚠️ ยาก | ✅ ง่าย |

**ใช้ได้เลยในงาน! 🚀**

---

**Questions?** 
- เช็คคู่มือหลัก: `FALLBACK_SYSTEM_GUIDE.md`
- เช็ค troubleshooting: ด้านบน
- ติดต่อ IT support


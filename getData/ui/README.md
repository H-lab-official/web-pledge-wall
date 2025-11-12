# Data Fetcher - Web UI Version

เวอร์ชัน Web UI ที่ใช้งานง่าย ไม่ต้องพิมพ์คำสั่ง!

## 🚀 วิธีใช้งาน

### วิธีที่ 1: เปิดไฟล์ HTML โดยตรง (ง่ายที่สุด)

```bash
# ใช้ Explorer เปิดไฟล์
explorer getData\ui\index.html

# หรือ double-click ที่ไฟล์ index.html
```

### วิธีที่ 2: ใช้ Python HTTP Server

```bash
cd getData/ui
python -m http.server 8000
```

จากนั้นเปิด browser ที่: `http://localhost:8000`

### วิธีที่ 3: ใช้ Node.js HTTP Server

```bash
cd getData/ui
npx serve
```

## 📋 ขั้นตอนการใช้งาน

### 1. ใส่ API URL
- ใส่ URL ของ API ที่ต้องการดึงข้อมูล
- กดปุ่ม "ต่อไป"

### 2. Preview ข้อมูล
- ระบบจะแสดง structure ของ API response
- เลือกว่าข้อมูลอยู่ที่ root หรือ nested
- ถ้าเป็น nested ให้ระบุ path (เช่น: `data`)

### 3. เลือกฟิลด์
- ดู preview ข้อมูลตัวอย่าง
- เลือก Unique Key (ป้องกันข้อมูลซ้ำ)
- เลือกฟิลด์ที่ต้องการเก็บ
  - ✓ เลือกทั้งหมด
  - ✗ ยกเลิกทั้งหมด

### 4. ตั้งค่าและเริ่มดึงข้อมูล
- ตั้งชื่อไฟล์
- กำหนดระยะเวลาดึงข้อมูล (วินาที)
- ตรวจสอบสรุป
- กด "🚀 เริ่มดึงข้อมูล"

## ✨ คุณสมบัติ

- ✅ **UI สวยงาม** - ใช้งานง่าย ไม่ต้องพิมพ์คำสั่ง
- ✅ **Preview ข้อมูล** - เห็นตัวอย่างก่อนเลือก
- ✅ **รองรับ Nested Structure** - ดึงข้อมูลจาก `response.data` ได้
- ✅ **เลือกฟิลด์แบบ Interactive** - Checkbox ใช้งานง่าย
- ✅ **Real-time Log** - ดูสถานะการทำงาน live
- ✅ **Dashboard** - แสดงสถิติการดึงข้อมูล
- ✅ **เก็บข้อมูลใน LocalStorage** - ใช้งานบน browser

## 📊 Dashboard

แสดงสถิติ 3 ค่า:
- **รายการทั้งหมด** - จำนวนข้อมูลที่ดึงมาทั้งหมด
- **ข้อมูลใหม่รอบนี้** - ข้อมูลใหม่ในรอบปัจจุบัน
- **รอบที่** - จำนวนรอบที่ดึงข้อมูลไปแล้ว

## 💾 การดาวน์โหลดข้อมูล

ข้อมูลจะถูกเก็บใน LocalStorage ของ browser

หากต้องการ export ข้อมูล ให้เปิด Console (F12) แล้วพิมพ์:

```javascript
// ดูข้อมูลทั้งหมด
const data = JSON.parse(localStorage.getItem('data_fetcher_data.txt'));
console.log(data);

// Export เป็น JSON
const json = JSON.stringify(data, null, 2);
console.log(json);

// หรือ copy ไปใช้
copy(json);
```

## 🎨 Customization

### เปลี่ยนสีธีม

แก้ไขใน `index.html`:

```html
<!-- จาก purple/pink -->
<div class="bg-gradient-to-r from-purple-600 to-pink-600">

<!-- เป็น blue/cyan -->
<div class="bg-gradient-to-r from-blue-600 to-cyan-600">
```

### เพิ่ม Authentication

แก้ไขใน `app.js`:

```javascript
async function fetchPreview() {
    // ...
    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': 'Bearer YOUR_TOKEN',
            'Content-Type': 'application/json'
        }
    });
    // ...
}
```

## ⚠️ ข้อจำกัด

- **LocalStorage limit** - Browser มี limit ประมาณ 5-10MB
- **CORS** - บาง API อาจบล็อก CORS จาก browser
- **ไม่มี background running** - ต้องเปิด browser ไว้ตลอด

## 🔧 แก้ปัญหา CORS

ถ้า API บล็อก CORS มี 2 วิธี:

### 1. ใช้ CORS Proxy

```javascript
const apiUrl = `https://cors-anywhere.herokuapp.com/${YOUR_API_URL}`;
```

### 2. ใช้ Browser Extension

ติดตั้ง "Allow CORS: Access-Control-Allow-Origin" extension

### 3. เปิด Chrome แบบปิด CORS (สำหรับทดสอบ)

```bash
chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome"
```

## 🚀 Next Steps

ถ้าต้องการ:
- **เก็บข้อมูลจริงในไฟล์** → ใช้ Rust version แทน
- **Run background** → สร้าง backend service
- **Deploy online** → Host บน Vercel/Netlify

## 📞 สนับสนุน

ถ้ามีปัญหาหรือข้อเสนอแนะ สามารถแจ้งได้เลยครับ!


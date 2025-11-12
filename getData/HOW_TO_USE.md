# 📦 Data Fetcher - คู่มือการใช้งาน

## 🎯 ไฟล์ที่สำคัญ

```
getData/
├── target/release/data_fetcher.exe  ← โปรแกรม Console
├── launcher.html                    ← Launcher (เลือกเวอร์ชัน)
└── ui/index.html                    ← Web UI (แนะนำ)
```

---

## ✨ วิธีที่ 1: Web UI (แนะนำ) 🌐

**ใช้งานง่ายที่สุด!**

### เปิดโปรแกรม:
1. Double-click: `ui/index.html`
2. หรือเปิดผ่าน Browser: `http://localhost:8000` (ถ้ารัน `start.bat`)

### การตั้งค่า (5 ขั้นตอน):

#### **Step 1: API Configuration**
```
API URL: https://your-api.com/endpoint
เช่น: https://api.example.com/messages
```

#### **Step 2: Data Path**
- ข้อมูลอยู่ที่ Root? เลือก "Root"
- ข้อมูลอยู่ใน object? เลือก "Nested" แล้วใส่ path
  ```
  ตัวอย่าง: data
  (สำหรับ response.data)
  ```

#### **Step 3: Response Preview**
- ระบบจะแสดง Structure ของข้อมูล
- ตรวจสอบว่าถูกต้องหรือไม่

#### **Step 4: Field Selection**
- ✅ เลือกฟิลด์ที่ต้องการเก็บ
- ⭐ เลือก 1 ฟิลด์เป็น Unique Key (เช่น `id`)

#### **Step 5: Fetch Settings**
```
Interval: 60 (วินาที)
Output File: output.txt
```

### เริ่มดึงข้อมูล:
- กด **"Start Fetching"**
- ดู Log แบบ Real-time
- ดูสถิติใน Dashboard
- กด **"Stop Fetching"** เมื่อต้องการหยุด

### ข้อมูลที่บันทึก:
- บันทึกใน: `output.txt` (หรือชื่อที่กำหนด)
- Format: 1 บรรทัด = 1 JSON object

---

## 💻 วิธีที่ 2: Console Version

**สำหรับคนชอบ Command Line**

### เปิดโปรแกรม:
```bash
cd getData
.\target\release\data_fetcher.exe
```

### ตอบคำถามตามลำดับ:

```
1. API URL: https://your-api.com/endpoint
2. Data Path: data (หรือ . สำหรับ root)
3. Preview: ดูโครงสร้างข้อมูล
4. Unique Key: เลือกฟิลด์ที่ไม่ซ้ำ (เช่น id)
5. Fields: เลือกฟิลด์ที่ต้องการ (เว้นวรรคคั่น)
6. Interval: 60 (วินาที)
7. Output File: output.txt
```

### หยุดโปรแกรม:
- กด `Ctrl+C`

---

## 📊 ตัวอย่างการใช้งาน

### API Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "message": "Hello World",
      "author": "John",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

### การตั้งค่า:
- **Data Path:** `data`
- **Unique Key:** `id`
- **Fields:** `id`, `message`, `author`

### ผลลัพธ์ในไฟล์:
```json
{"id":"abc123","message":"Hello World","author":"John"}
{"id":"def456","message":"Hello Again","author":"Jane"}
```

---

## ❓ FAQ

### Q: ข้อมูลซ้ำไหม?
**A:** ไม่ซ้ำ! ระบบเช็คจาก Unique Key

### Q: ดึงข้อมูลบ่อยแค่ไหน?
**A:** ตามที่ตั้งค่า Interval (วินาที)

### Q: ไฟล์เก็บที่ไหน?
**A:** โฟลเดอร์เดียวกับที่รันโปรแกรม

### Q: Web UI vs Console?
**A:** 
- **Web UI:** ง่าย, มี UI สวย, Dashboard
- **Console:** เร็ว, เบา, ไม่ต้องเปิด Browser

---

## 🚀 Tips

1. **Test API ก่อน:** ลองเรียก API ใน Browser/Postman ก่อน
2. **Interval ไม่ต่ำเกินไป:** อาจโดน Rate Limit
3. **Backup ไฟล์:** Copy `output.txt` เป็นระยะ
4. **Check Log:** ดู Log เมื่อมี Error

---

## 📞 Support

เจอปัญหา? ลองเช็ค:
1. API URL ถูกต้องไหม?
2. Data Path ถูกต้องไหม? (ลอง Preview)
3. Unique Key มีจริงในข้อมูลไหม?
4. Internet เชื่อมต่ออยู่ไหม?

---

**สนุกกับการดึงข้อมูล! 🎉**


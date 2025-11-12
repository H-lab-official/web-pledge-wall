# Data Fetcher - โปรแกรมดึงข้อมูลจาก API

โปรแกรม Rust สำหรับดึงข้อมูลจาก API ตามระยะเวลาที่กำหนด และเก็บลงไฟล์ txt โดยไม่ซ้ำกัน  
**มี UI แบบ Interactive เลือกได้ว่าจะเก็บฟิลด์ไหนบ้าง!**

## ⚙️ การติดตั้ง

### ติดตั้ง Rust (ถ้ายังไม่มี)

```bash
# Windows
winget install Rustlang.Rust.MSVC

# หรือดาวน์โหลดจาก: https://www.rust-lang.org/tools/install
```

## 🚀 วิธีใช้งาน

### 1. รันโปรแกรม

```bash
cd getData
cargo run --release
```

### 2. ทำตามขั้นตอนที่โปรแกรมถาม

โปรแกรมจะถามคำถามต่อไปนี้:

#### ขั้นตอนที่ 1: ใส่ API URL
```
📍 กรุณาใส่ API URL:
https://jsonplaceholder.typicode.com/posts
```

#### ขั้นตอนที่ 2: ดู Preview ข้อมูล
โปรแกรมจะแสดงข้อมูลตัวอย่างที่ดึงมาได้:
```
📋 Preview ข้อมูลตัวแรก:
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere...",
  "body": "quia et suscipit..."
}

📝 ฟิลด์ที่พบในข้อมูล:
  1. userId
  2. id
  3. title
  4. body
```

#### ขั้นตอนที่ 3: เลือก Unique Key
```
🔑 กรุณาเลือกฟิลด์ที่จะใช้เป็น unique key:
   ใส่หมายเลข (1-4):
2
✅ ใช้ 'id' เป็น unique key
```

#### ขั้นตอนที่ 4: เลือกฟิลด์ที่ต้องการเก็บ
```
📝 เลือกฟิลด์ที่ต้องการเก็บ:
   ใส่หมายเลขคั่นด้วยเครื่องหมายจุลภาค (เช่น: 1,2,3)
   หรือใส่ 'all' เพื่อเลือกทั้งหมด:
2,3
✅ เลือก 2 ฟิลด์:
   - id
   - title
```

#### ขั้นตอนที่ 5: ตั้งชื่อไฟล์
```
💾 ชื่อไฟล์ที่จะเก็บข้อมูล (กด Enter เพื่อใช้ 'data.txt'):
my_data.txt
```

#### ขั้นตอนที่ 6: ตั้งระยะเวลา
```
⏱️  ดึงข้อมูลทุกกี่วินาที? (กด Enter เพื่อใช้ 60 วินาที):
120
```

### 3. โปรแกรมจะเริ่มดึงข้อมูลอัตโนมัติ

```
========================================
✨ เริ่มดึงข้อมูลอัตโนมัติ...
📍 API: https://jsonplaceholder.typicode.com/posts
💾 ไฟล์: my_data.txt
⏱️  ทุก 120 วินาที
🔑 Unique Key: id
========================================

📂 โหลดข้อมูลเดิม: พบ 0 รายการ

🔄 รอบที่ 1: กำลังดึงข้อมูล...
  ✅ เพิ่มข้อมูล [1]: id: 1, title: sunt aut facere...
  ✅ เพิ่มข้อมูล [2]: id: 2, title: qui est esse...
  📝 เพิ่มข้อมูลใหม่: 2 รายการ
  📊 ข้อมูลทั้งหมด: 2 รายการ

⏳ รอ 120 วินาที... (กด Ctrl+C เพื่อหยุด)
```

## 📋 คุณสมบัติ

- ✅ **รับ API URL แบบ interactive** - ไม่ต้อง hardcode
- ✅ **แสดง Preview ข้อมูล** - ดูข้อมูลจริงก่อนเลือก
- ✅ **เลือกฟิลด์ที่ต้องการ** - เก็บแค่ที่จำเป็น ประหยัดพื้นที่
- ✅ **เลือก Unique Key ได้** - ยืดหยุ่นกับ API ต่างๆ
- ✅ **ป้องกันข้อมูลซ้ำ** - ใช้ unique key ตรวจสอบ
- ✅ **โหลดข้อมูลเดิม** - เริ่มต่อจากที่ค้างไว้
- ✅ **แสดงสถานะ Real-time** - รู้ว่าดึงข้อมูลไปเท่าไหร่แล้ว

## 📁 โครงสร้างไฟล์

```
getData/
├── Cargo.toml          # ไฟล์ config ของ Rust project
├── src/
│   └── main.rs         # โค้ดหลักของโปรแกรม
├── data.txt            # ไฟล์ที่เก็บข้อมูล (สร้างอัตโนมัติ)
└── README.md           # ไฟล์นี้
```

## 💡 ตัวอย่างข้อมูลในไฟล์

ข้อมูลจะถูกเก็บในรูปแบบ JSONL (JSON Lines) - แต่ละบรรทัดเป็น JSON object:

```json
{"id":1,"title":"Post 1"}
{"id":2,"title":"Post 2"}
{"id":3,"title":"Post 3"}
```

## 🎯 ตัวอย่าง API ที่ใช้ได้

### JSONPlaceholder (ทดสอบ)
```
https://jsonplaceholder.typicode.com/posts
https://jsonplaceholder.typicode.com/users
https://jsonplaceholder.typicode.com/comments
```

### OpenWeatherMap
```
https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=YOUR_API_KEY
```

### GitHub API
```
https://api.github.com/users/octocat/repos
```

## 🛠️ การใช้งานขั้นสูง

### สร้าง Executable File

```bash
# Build แบบ release (เร็วกว่า)
cargo build --release

# ไฟล์จะอยู่ที่
./target/release/data_fetcher.exe
```

### เพิ่ม Authentication

แก้ไขฟังก์ชัน `fetch_data_raw()` ใน `src/main.rs`:

```rust
async fn fetch_data_raw(api_url: &str) -> Result<Vec<Value>, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let response = client
        .get(api_url)
        .header("Authorization", "Bearer YOUR_TOKEN")
        .header("User-Agent", "DataFetcher/1.0")
        .send()
        .await?;

    // ... rest of code
}
```

### เปลี่ยนรูปแบบการเก็บไฟล์

แก้ไขฟังก์ชัน `save_to_file()`:

```rust
fn save_to_file(item: &Value, filename: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(filename)?;

    // แบบ CSV
    let csv_line = format!("{},{}", 
        item["id"], 
        item["title"]
    );
    writeln!(file, "{}", csv_line)?;

    Ok(())
}
```

## ⚠️ ข้อควรระวัง

1. **API Rate Limit** - ตรวจสอบว่า API มีข้อจำกัดการเรียกใช้หรือไม่
2. **Unique Key** - ต้องเลือกฟิลด์ที่ไม่ซ้ำจริงๆ (เช่น id, uuid)
3. **ขนาดไฟล์** - ถ้าดึงข้อมูลเยอะ ไฟล์จะใหญ่ขึ้นเรื่อยๆ
4. **Authentication** - บาง API ต้องมี API key หรือ token

## 📞 การหยุดโปรแกรม

กด `Ctrl + C` เพื่อหยุดโปรแกรม

## 🐛 แก้ไขปัญหา

### ไม่พบฟิลด์ในข้อมูล
- ตรวจสอบว่า API return ข้อมูลเป็น JSON array หรือ object
- ลองใส่ API URL ใหม่

### ข้อมูลซ้ำ
- ตรวจสอบว่า unique key ที่เลือกมีค่าไม่ซ้ำจริงๆ
- ลองใช้ฟิลด์อื่น เช่น id, uuid

### API ไม่ตอบสนอง
- ตรวจสอบ internet connection
- ตรวจสอบว่า API URL ถูกต้อง
- บาง API ต้องการ authentication

# 📡 Incremental Sync API - เอกสารการใช้งาน

## 🎯 ฟีเจอร์หลัก

API endpoint นี้ออกแบบมาเพื่อ:
- ✅ **ส่งเฉพาะข้อมูลใหม่** ที่ client ยังไม่เคยได้รับ
- ✅ **ทยอยส่ง** ทีละ batch (default 20 รายการ)
- ✅ **ครบทุกข้อมูล** - รับประกันว่าจะได้ข้อมูลครบ
- ✅ **ไม่ซ้ำ** - ข้อมูลที่ส่งไปแล้วจะไม่ส่งซ้ำ

---

## 📋 API Endpoint

### **`GET /syncMessages`**

**URL:**
```
https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages
```

---

## 🔧 Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `after` | string (ISO 8601) | ❌ | null | Timestamp ของข้อความล่าสุดที่ client มีอยู่ |
| `limit` | number | ❌ | 20 | จำนวนข้อความที่ต้องการต่อ request |

---

## 📤 Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "ABC123",
      "message": "ข้อความ...",
      "author": "Anonymous",
      "status": "approved",
      "createdAt": "2025-11-13T10:00:00.000Z",
      "updatedAt": "2025-11-13T10:00:00.000Z"
    }
  ],
  "count": 20,
  "hasMore": true,
  "lastTimestamp": "2025-11-13T10:00:00.000Z",
  "message": "ส่งข้อมูล 20 รายการ (ยังมีข้อมูลเหลืออีก)"
}
```

### Response Fields:

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | สถานะการทำงาน |
| `data` | array | ข้อมูลข้อความที่ approved แล้ว |
| `count` | number | จำนวนข้อมูลที่ส่งกลับในครั้งนี้ |
| `hasMore` | boolean | `true` = ยังมีข้อมูลเหลืออีก, `false` = ครบทั้งหมดแล้ว |
| `lastTimestamp` | string \| null | Timestamp ของข้อความล่าสุด (ใช้สำหรับ request ครั้งถัดไป) |
| `message` | string | ข้อความอธิบายสถานะ |

---

## 🚀 วิธีใช้งาน

### **1️⃣ Request แรก (ไม่มี `after`)**

ดึงข้อมูลจากต้นสุด:

```bash
GET /syncMessages?limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [/* 20 รายการแรก */],
  "count": 20,
  "hasMore": true,
  "lastTimestamp": "2025-11-13T10:20:00.000Z",
  "message": "ส่งข้อมูล 20 รายการ (ยังมีข้อมูลเหลืออีก)"
}
```

---

### **2️⃣ Request ถัดไป (ใช้ `lastTimestamp`)**

ดึงข้อมูลต่อจากที่เคยได้รับ:

```bash
GET /syncMessages?after=2025-11-13T10:20:00.000Z&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [/* 20 รายการถัดไป */],
  "count": 20,
  "hasMore": true,
  "lastTimestamp": "2025-11-13T10:40:00.000Z",
  "message": "ส่งข้อมูล 20 รายการ (ยังมีข้อมูลเหลืออีก)"
}
```

---

### **3️⃣ Request สุดท้าย (ไม่มีข้อมูลเหลือ)**

```bash
GET /syncMessages?after=2025-11-13T11:00:00.000Z&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [/* 5 รายการสุดท้าย */],
  "count": 5,
  "hasMore": false,
  "lastTimestamp": "2025-11-13T11:10:00.000Z",
  "message": "ส่งข้อมูล 5 รายการ (ครบทั้งหมดแล้ว)"
}
```

---

### **4️⃣ Check for New Data (หลังจากครบแล้ว)**

```bash
GET /syncMessages?after=2025-11-13T11:10:00.000Z&limit=20
```

**Response (ไม่มีข้อมูลใหม่):**
```json
{
  "success": true,
  "data": [],
  "count": 0,
  "hasMore": false,
  "lastTimestamp": null,
  "message": "ไม่มีข้อมูลใหม่"
}
```

---

## 💻 ตัวอย่าง JavaScript/TypeScript

### **Basic Sync Loop:**

```typescript
interface SyncResponse {
  success: boolean
  data: any[]
  count: number
  hasMore: boolean
  lastTimestamp: string | null
  message: string
}

async function syncAllMessages() {
  let lastTimestamp: string | null = null
  let allMessages: any[] = []

  do {
    const url = lastTimestamp
      ? `/syncMessages?after=${encodeURIComponent(lastTimestamp)}&limit=20`
      : `/syncMessages?limit=20`

    const response = await fetch(url)
    const result: SyncResponse = await response.json()

    if (!result.success) {
      console.error('Sync failed:', result)
      break
    }

    console.log(result.message)
    allMessages = [...allMessages, ...result.data]

    lastTimestamp = result.lastTimestamp

    // ถ้า hasMore = false หมายความว่าได้ข้อมูลครบแล้ว
    if (!result.hasMore) {
      console.log('✅ Sync complete! Total:', allMessages.length)
      break
    }

  } while (lastTimestamp)

  return allMessages
}
```

---

### **Rust (Tauri) Example:**

```rust
#[derive(Deserialize)]
struct SyncResponse {
    success: bool,
    data: Vec<Value>,
    count: usize,
    #[serde(rename = "hasMore")]
    has_more: bool,
    #[serde(rename = "lastTimestamp")]
    last_timestamp: Option<String>,
    message: String,
}

async fn sync_messages(
    api_url: &str,
    last_timestamp: Option<&str>,
    limit: usize,
) -> Result<SyncResponse, Box<dyn std::error::Error>> {
    let mut url = format!("{}?limit={}", api_url, limit);
    
    if let Some(ts) = last_timestamp {
        url.push_str(&format!("&after={}", urlencoding::encode(ts)));
    }

    let response = reqwest::get(&url).await?;
    let result: SyncResponse = response.json().await?;
    
    Ok(result)
}

// Usage:
async fn fetch_all_messages() -> Result<Vec<Value>, Box<dyn std::error::Error>> {
    let api_url = "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages";
    let mut all_messages = Vec::new();
    let mut last_timestamp: Option<String> = None;

    loop {
        let result = sync_messages(
            api_url, 
            last_timestamp.as_deref(), 
            20
        ).await?;

        println!("{}", result.message);
        all_messages.extend(result.data);

        if !result.has_more {
            println!("✅ Sync complete! Total: {}", all_messages.len());
            break;
        }

        last_timestamp = result.last_timestamp;

        if last_timestamp.is_none() {
            break;
        }
    }

    Ok(all_messages)
}
```

---

## 🔄 การใช้งานในโปรเจกต์ getData (Tauri)

### **1. แก้ไข `tauri.conf.json`:**

เพิ่ม API URL:

```json
{
  "build": {
    "distDir": "../ui-tauri"
  },
  "tauri": {
    "allowlist": {
      "http": {
        "all": true,
        "request": true
      }
    }
  }
}
```

### **2. ใช้ใน UI (index.html):**

```javascript
async function fetchNewMessages() {
    const apiUrl = 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages'
    
    // ดึง lastTimestamp จาก localStorage
    let lastTimestamp = localStorage.getItem('lastMessageTimestamp')
    
    const url = lastTimestamp 
        ? `${apiUrl}?after=${encodeURIComponent(lastTimestamp)}&limit=20`
        : `${apiUrl}?limit=20`
    
    const result = await invoke('fetch_api_preview', { apiUrl: url })
    
    if (result.success && result.data.length > 0) {
        console.log(`📥 ได้รับข้อมูลใหม่ ${result.count} รายการ`)
        
        // เก็บ lastTimestamp สำหรับครั้งถัดไป
        if (result.lastTimestamp) {
            localStorage.setItem('lastMessageTimestamp', result.lastTimestamp)
        }
        
        // ถ้ายังมีข้อมูลเหลือ ให้ดึงต่อ
        if (result.hasMore) {
            console.log('🔄 ยังมีข้อมูลเหลืออีก กำลังดึงต่อ...')
            await fetchNewMessages() // Recursive call
        } else {
            console.log('✅ ดึงข้อมูลครบทั้งหมดแล้ว')
        }
    } else {
        console.log('ℹ️ ไม่มีข้อมูลใหม่')
    }
}
```

---

## 🎯 Best Practices

1. **เก็บ `lastTimestamp` ไว้:**
   - ใช้ `localStorage` (browser)
   - ใช้ file/database (Tauri/Node.js)

2. **Handle Errors:**
   - Retry ถ้า network error
   - Validate response ก่อนใช้งาน

3. **Rate Limiting:**
   - ไม่ควร request บ่อยเกินไป
   - แนะนำ: 5-10 วินาทีต่อครั้ง

4. **Batch Size:**
   - Default: 20 รายการ
   - เพิ่มได้ถึง 100 (แต่จะช้าลง)
   - ลดลงได้ถึง 5 (สำหรับ real-time)

---

## 🆚 เปรียบเทียบกับ `/getMessages`

| Feature | `/getMessages` | `/syncMessages` |
|---------|----------------|-----------------|
| การส่งข้อมูล | **ทั้งหมดในครั้งเดียว** | **ทยอยส่ง** |
| เหมาะกับ | Initial load | Incremental update |
| ขนาด Response | ใหญ่ (ทั้งหมด) | เล็ก (แค่ที่ใหม่) |
| Network Usage | สูง | ต่ำ |
| Real-time | ❌ | ✅ |

---

## ✅ สรุป

- **ครั้งแรก:** เรียก `/syncMessages` โดยไม่ส่ง `after`
- **ครั้งถัดไป:** ส่ง `lastTimestamp` จาก response ก่อนหน้า
- **Loop:** เรียกซ้ำจนกว่า `hasMore = false`
- **Real-time:** เรียกทุกๆ 5-10 วินาทีเพื่อดึงข้อมูลใหม่

**ตอนนี้มี API ที่ส่งเฉพาะข้อมูลใหม่แล้ว!** 🎉


# 📡 API Guide - ง่ายๆ ชัดเจน

## 🎯 มี 2 API

### **1. `/getMessages` - ดึงทั้งหมด**
### **2. `/syncMessages` - ดึงเฉพาะใหม่** ⭐

---

## 1️⃣ `/getMessages` - ดึงข้อมูลทั้งหมด

### **URL:**
```
GET https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/getMessages
```

### **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "message": "ข้อความ 1",
      "author": "Anonymous",
      "createdAt": "2025-11-13T10:00:00.000Z",
      "updatedAt": "2025-11-13T10:00:00.000Z",
      "status": "approved"
    },
    {
      "id": "def456",
      "message": "ข้อความ 2",
      "author": "Anonymous",
      "createdAt": "2025-11-13T09:00:00.000Z",
      "updatedAt": "2025-11-13T09:00:00.000Z",
      "status": "approved"
    }
    // ... ทั้งหมด
  ],
  "count": 68
}
```

### **การใช้งาน:**
- ✅ ดึง**ทุกครั้ง**ได้ข้อมูล**ทั้งหมด**
- ✅ ไม่ต้องเก็บ state อะไร
- ✅ เหมาะกับ: Initial load, Refresh all

---

## 2️⃣ `/syncMessages` - ดึงเฉพาะข้อมูลใหม่ ⭐

### **URL:**
```
GET https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages
GET https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages?after=<timestamp>
```

### **Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string (ISO 8601) | ❌ | ดึงเฉพาะข้อมูลที่ `createdAt > after` |

---

### **ตัวอย่างการใช้งาน:**

#### **Scenario 1: ครั้งแรก (ไม่ส่ง `after`)**

```bash
GET /syncMessages
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "latest-1",
      "message": "ข้อความล่าสุด",
      "createdAt": "2025-11-13T11:00:00.000Z",
      ...
    },
    {
      "id": "latest-2",
      "message": "ข้อความก่อนหน้า",
      "createdAt": "2025-11-13T10:00:00.000Z",
      ...
    }
    // ... ทั้งหมด 68 รายการ
  ],
  "count": 68
}
```

💡 **เก็บ `createdAt` ของข้อความล่าสุด:**
```javascript
const lastTimestamp = result.data[0].createdAt // "2025-11-13T11:00:00.000Z"
```

---

#### **Scenario 2: ครั้งถัดไป (ส่ง `after`)**

หลังจาก 1 ชั่วโมง มีข้อความใหม่ 3 ข้อความ:

```bash
GET /syncMessages?after=2025-11-13T11:00:00.000Z
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "new-1",
      "message": "ข้อความใหม่ 1",
      "createdAt": "2025-11-13T12:00:00.000Z",
      ...
    },
    {
      "id": "new-2",
      "message": "ข้อความใหม่ 2",
      "createdAt": "2025-11-13T11:30:00.000Z",
      ...
    },
    {
      "id": "new-3",
      "message": "ข้อความใหม่ 3",
      "createdAt": "2025-11-13T11:15:00.000Z",
      ...
    }
    // เฉพาะ 3 รายการใหม่!
  ],
  "count": 3
}
```

---

#### **Scenario 3: ไม่มีข้อมูลใหม่**

```bash
GET /syncMessages?after=2025-11-13T12:00:00.000Z
```

**Response:**
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

---

## 💻 Code Examples

### **JavaScript/TypeScript:**

```typescript
// เก็บ timestamp ล่าสุด
let lastTimestamp: string | null = null

async function fetchNewMessages() {
  const baseUrl = 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages'
  const url = lastTimestamp 
    ? `${baseUrl}?after=${encodeURIComponent(lastTimestamp)}`
    : baseUrl

  const response = await fetch(url)
  const result = await response.json()

  if (result.success && result.data.length > 0) {
    console.log(`📥 ได้รับข้อมูลใหม่ ${result.count} รายการ`)
    
    // บันทึกข้อมูล
    result.data.forEach(message => {
      console.log(message.message)
    })

    // อัปเดต timestamp ล่าสุด
    lastTimestamp = result.data[0].createdAt
    
    // เก็บไว้ใน localStorage
    localStorage.setItem('lastMessageTimestamp', lastTimestamp)
  } else {
    console.log('ℹ️ ไม่มีข้อมูลใหม่')
  }
}

// เรียกทุกๆ 10 วินาที
setInterval(fetchNewMessages, 10000)
```

---

### **Rust (Tauri):**

```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct SyncResponse {
    success: bool,
    data: Vec<Message>,
    count: usize,
}

#[derive(Deserialize, Serialize)]
struct Message {
    id: String,
    message: String,
    author: String,
    #[serde(rename = "createdAt")]
    created_at: String,
}

async fn fetch_new_messages(
    api_url: &str,
    last_timestamp: Option<&str>,
) -> Result<SyncResponse, Box<dyn std::error::Error>> {
    let url = if let Some(ts) = last_timestamp {
        format!("{}?after={}", api_url, urlencoding::encode(ts))
    } else {
        api_url.to_string()
    };

    let response = reqwest::get(&url).await?;
    let result: SyncResponse = response.json().await?;
    
    Ok(result)
}

// การใช้งาน
let mut last_timestamp: Option<String> = None;

loop {
    let result = fetch_new_messages(
        "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/syncMessages",
        last_timestamp.as_deref()
    ).await?;

    if result.data.is_empty() {
        println!("ℹ️ ไม่มีข้อมูลใหม่");
    } else {
        println!("📥 ได้รับข้อมูลใหม่ {} รายการ", result.count);
        
        // อัปเดต timestamp
        if let Some(first_message) = result.data.first() {
            last_timestamp = Some(first_message.created_at.clone());
        }
    }

    tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
}
```

---

## 🔄 Flow Chart

```
┌─────────────────────────────────────┐
│  1. ครั้งแรก: ไม่ส่ง 'after'        │
│     GET /syncMessages                │
│     → ได้ข้อมูลทั้งหมด 68 รายการ    │
│     → เก็บ lastTimestamp             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  2. ครั้งที่ 2: ส่ง 'after'          │
│     GET /syncMessages?after=<ts>     │
│     → ได้เฉพาะข้อมูลใหม่ 3 รายการ   │
│     → อัปเดต lastTimestamp           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  3. ครั้งที่ 3: ส่ง 'after'          │
│     GET /syncMessages?after=<ts>     │
│     → ไม่มีข้อมูลใหม่ (count: 0)    │
│     → lastTimestamp ไม่เปลี่ยน       │
└─────────────────────────────────────┘
              ↓
         Loop ทุกๆ 10 วินาที
```

---

## ⚡ Best Practices

### **1. เก็บ `lastTimestamp` ไว้:**

```javascript
// Browser
localStorage.setItem('lastMessageTimestamp', lastTimestamp)

// Node.js / Tauri
fs.writeFileSync('last-sync.txt', lastTimestamp)
```

---

### **2. Handle Errors:**

```javascript
try {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const result = await response.json()
  // ...
} catch (error) {
  console.error('Sync error:', error)
  // Retry หลัง 30 วินาที
  setTimeout(fetchNewMessages, 30000)
}
```

---

### **3. Rate Limiting:**

```javascript
// ไม่ควร request บ่อยเกินไป
const SYNC_INTERVAL = 10000 // 10 วินาที

setInterval(fetchNewMessages, SYNC_INTERVAL)
```

---

## 🆚 เปรียบเทียบ

| Feature | `/getMessages` | `/syncMessages` |
|---------|----------------|-----------------|
| **ข้อมูลที่ส่ง** | ทั้งหมดทุกครั้ง | เฉพาะใหม่ |
| **Response Size** | ใหญ่ (68 รายการ) | เล็ก (0-N รายการ) |
| **Bandwidth** | สูง | ต่ำ |
| **Speed** | ช้า | เร็ว |
| **Use Case** | Initial load | Real-time sync |
| **State Management** | ไม่ต้อง | ต้องเก็บ timestamp |

---

## ✅ สรุป

### **ใช้ `/getMessages` เมื่อ:**
- ✅ ครั้งแรก (initial load)
- ✅ Refresh ทั้งหมด
- ✅ ไม่ต้องการจัดการ state

### **ใช้ `/syncMessages` เมื่อ:**
- ✅ ต้องการ real-time update
- ✅ ประหยัด bandwidth
- ✅ มีข้อมูลเยอะ
- ✅ ต้องการดึงเฉพาะใหม่

---

**🎉 เลือกใช้ตามความเหมาะสม!**


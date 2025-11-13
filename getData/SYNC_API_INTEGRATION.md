# 🔄 การเชื่อมต่อ Sync API กับ Tauri App

## 📝 สรุป

ตอนนี้มี **2 API endpoints:**

### 1. `/getMessages` (เดิม)
- ✅ ดึงข้อมูล**ทั้งหมด**ในครั้งเดียว
- ✅ เหมาะกับ: Initial load, Simple use cases

### 2. `/syncMessages` (ใหม่!) ⭐
- ✅ ดึงเฉพาะ**ข้อมูลใหม่**
- ✅ **ทยอยส่ง** ทีละ batch
- ✅ **ไม่ซ้ำ** - ข้อมูลที่ส่งไปแล้วไม่ส่งซ้ำ
- ✅ เหมาะกับ: Real-time sync, Large datasets

---

## 🎯 วิธีใช้ใน Tauri App

### **ตัวอย่างการเรียกใช้:**

```bash
# Initial sync (ครั้งแรก)
GET https://YOUR_PROJECT.cloudfunctions.net/syncMessages?limit=20

# Response:
{
  "success": true,
  "data": [/* 20 รายการ */],
  "hasMore": true,
  "lastTimestamp": "2025-11-13T10:20:00.000Z"
}

# Sync ครั้งถัดไป
GET https://YOUR_PROJECT.cloudfunctions.net/syncMessages?after=2025-11-13T10:20:00.000Z&limit=20

# Response:
{
  "success": true,
  "data": [/* 20 รายการถัดไป */],
  "hasMore": false,  # ← ครบแล้ว!
  "lastTimestamp": "2025-11-13T10:40:00.000Z"
}
```

---

## 💻 แก้ไข Tauri App

### **Step 1: เพิ่ม Config สำหรับ Sync Mode**

ใน `ui-tauri/index.html`:

```html
<!-- Step 1: เพิ่ม option สำหรับเลือก sync mode -->
<div class="input-group">
    <label for="syncMode">📡 โหมดดึงข้อมูล:</label>
    <select id="syncMode">
        <option value="full">ดึงทั้งหมด (getMessages)</option>
        <option value="incremental" selected>ดึงเฉพาะใหม่ (syncMessages) ⭐</option>
    </select>
</div>
```

### **Step 2: แก้ไข `startFetching()` Function**

```javascript
async function startFetching() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const syncMode = document.getElementById('syncMode').value;
    const outputFile = document.getElementById('outputFile').value.trim();
    const fetchIntervalSec = parseInt(document.getElementById('fetchInterval').value);
    const uniqueKey = document.getElementById('uniqueKey').value;

    // เลือก endpoint ตาม sync mode
    const endpoint = syncMode === 'incremental' 
        ? apiUrl.replace('/getMessages', '/syncMessages')
        : apiUrl;

    config = {
        api_url: endpoint,
        output_file: outputFile,
        fetch_interval_seconds: fetchIntervalSec,
        selected_fields: selectedFields,
        unique_key: uniqueKey,
        data_path: [],  // syncMessages ไม่ต้องใช้ data_path (data อยู่ใน response.data โดยตรง)
        sync_mode: syncMode,
        last_timestamp: localStorage.getItem('lastMessageTimestamp') || null
    };

    console.log('⚙️ Config:', config);
    
    showStep('step5');
    const stopBtn = document.getElementById('stopBtn');
    if (stopBtn) {
        stopBtn.classList.remove('hidden');
    }

    // Fetch ทันที
    await doFetch();

    // ตั้ง interval
    fetchInterval = setInterval(doFetch, fetchIntervalSec * 1000);
}
```

### **Step 3: แก้ไข `doFetch()` สำหรับ Incremental Sync**

```javascript
async function doFetch() {
    if (!invoke) {
        showAlert('step5', '❌ Tauri API ไม่พร้อมใช้งาน', 'error');
        return;
    }

    try {
        showLoading('🔄 กำลังดึงข้อมูล...', 'กรุณารอสักครู่');
        
        // สร้าง URL ตาม sync mode
        let apiUrl = config.api_url;
        
        if (config.sync_mode === 'incremental' && config.last_timestamp) {
            apiUrl += `?after=${encodeURIComponent(config.last_timestamp)}&limit=20`;
        } else if (config.sync_mode === 'incremental') {
            apiUrl += '?limit=20';
        }

        console.log('🔄 Fetching from:', apiUrl);

        // เรียก Tauri command
        const result = await invoke('start_fetching', { 
            config: {
                ...config,
                api_url: apiUrl
            }
        });

        hideLoading();

        if (result.success) {
            const newItemsEl = document.getElementById('newItemsCount');
            const totalEl = document.getElementById('totalCount');
            
            if (newItemsEl) newItemsEl.textContent = result.new_items_count;
            if (totalEl) totalEl.textContent = result.total_count;
            
            // อัปเดต lastTimestamp ถ้าเป็น incremental mode
            if (config.sync_mode === 'incremental' && result.last_timestamp) {
                config.last_timestamp = result.last_timestamp;
                localStorage.setItem('lastMessageTimestamp', result.last_timestamp);
                console.log('💾 Saved lastTimestamp:', result.last_timestamp);
            }
            
            // แสดงข้อความ
            let message = `✅ ${result.message}`;
            if (config.sync_mode === 'incremental') {
                message += result.has_more 
                    ? ' (ยังมีข้อมูลเหลืออีก)' 
                    : ' (ครบทั้งหมดแล้ว)';
            }
            
            showAlert('step5', message, 'success');
        } else {
            showAlert('step5', `❌ เกิดข้อผิดพลาด`, 'error');
        }
    } catch (err) {
        hideLoading();
        showAlert('step5', `❌ ${err}`, 'error');
    }
}
```

---

## 🔧 แก้ไข Rust Backend (`main.rs`)

ตอนนี้ Rust backend รองรับ `/syncMessages` อยู่แล้ว! เพราะ:

1. ✅ `fetch_data()` ดึง JSON จาก URL ที่ส่งมา
2. ✅ ระบบตรวจสอบ unique key อยู่แล้ว
3. ✅ บันทึกเฉพาะข้อมูลที่ไม่ซ้ำ

**ไม่ต้องแก้อะไรใน Rust!** 🎉

---

## 📊 ตัวอย่างการทำงาน

### **Scenario 1: Initial Sync (ครั้งแรก)**

```
1. User เลือก "ดึงเฉพาะใหม่" และกด "เริ่มดึงข้อมูล"

2. App เรียก: GET /syncMessages?limit=20
   Response: {
     data: [20 messages],
     hasMore: true,
     lastTimestamp: "2025-11-13T10:00:00Z"
   }

3. App บันทึก 20 ข้อความ → data.txt

4. App เก็บ lastTimestamp ไว้ใน localStorage

5. หลังจาก 60 วินาที (interval), App เรียก:
   GET /syncMessages?after=2025-11-13T10:00:00Z&limit=20
```

### **Scenario 2: Continuous Sync (เรื่อยๆ)**

```
Loop every 60 seconds:

1. App: GET /syncMessages?after=<last_timestamp>&limit=20
2. Firebase: ส่งเฉพาะข้อมูลที่ใหม่กว่า last_timestamp
3. App: บันทึกข้อมูลใหม่ → data.txt (ไม่ซ้ำ)
4. App: อัปเดต last_timestamp
5. Repeat...
```

---

## 🎨 UI แสดงสถานะ Sync

เพิ่ม indicator ใน Step 5:

```html
<div class="step hidden" id="step5">
    <h2>📊 สถิติการดึงข้อมูล</h2>
    
    <!-- เพิ่ม Sync Status -->
    <div class="alert alert-info" id="syncStatus">
        <strong>📡 โหมด:</strong> <span id="syncModeDisplay">-</span><br>
        <strong>⏰ Last Sync:</strong> <span id="lastSyncTime">-</span><br>
        <strong>📝 Last Timestamp:</strong> <span id="lastTimestampDisplay">-</span>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3 id="newItemsCount">0</h3>
            <p>ข้อมูลใหม่</p>
        </div>
        <div class="stat-card">
            <h3 id="totalCount">0</h3>
            <p>ข้อมูลทั้งหมด</p>
        </div>
    </div>
</div>
```

```javascript
// อัปเดตสถานะใน doFetch()
function updateSyncStatus() {
    const modeEl = document.getElementById('syncModeDisplay');
    const timeEl = document.getElementById('lastSyncTime');
    const tsEl = document.getElementById('lastTimestampDisplay');
    
    if (modeEl) {
        modeEl.textContent = config.sync_mode === 'incremental' 
            ? '📈 Incremental Sync (เฉพาะใหม่)' 
            : '📦 Full Sync (ทั้งหมด)';
    }
    
    if (timeEl) {
        timeEl.textContent = new Date().toLocaleString('th-TH');
    }
    
    if (tsEl && config.last_timestamp) {
        const date = new Date(config.last_timestamp);
        tsEl.textContent = date.toLocaleString('th-TH');
    }
}
```

---

## ✅ สรุป

### **ตอนนี้มี 2 โหมด:**

| โหมด | API | การทำงาน | เหมาะกับ |
|------|-----|----------|----------|
| **Full Sync** | `/getMessages` | ดึงทั้งหมดในครั้งเดียว | Initial load |
| **Incremental Sync** ⭐ | `/syncMessages` | ดึงเฉพาะใหม่ ทยอยส่ง | Real-time, Large data |

### **ข้อดีของ Incremental Sync:**

1. ✅ **ประหยัด Bandwidth** - ส่งเฉพาะที่จำเป็น
2. ✅ **เร็วขึ้น** - response เล็กกว่า
3. ✅ **Real-time** - อัปเดตข้อมูลใหม่ได้ทันที
4. ✅ **ไม่ซ้ำ** - ข้อมูลที่มีแล้วไม่ดึงซ้ำ
5. ✅ **Scalable** - รองรับข้อมูลเยอะได้

---

**🎉 พร้อมใช้งานแล้ว!**

ตอนนี้ Tauri app สามารถเลือกได้ว่าจะใช้ Full Sync หรือ Incremental Sync!


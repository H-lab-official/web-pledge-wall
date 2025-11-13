# 📱 Kiosk Mode Setup Guide

## ✅ Web Kiosk Features Implemented

### 🔒 Security Features:
- ❌ Right-click disabled (context menu)
- ❌ Keyboard shortcuts disabled:
  - F5, Ctrl+R, Cmd+R (Refresh)
  - Backspace, Alt+Left (Back navigation)
  - F12, Ctrl+Shift+I (DevTools)
  - Ctrl+U, Cmd+Option+U (View Source)
- ❌ Browser back/forward navigation
- ❌ Text selection (except inputs)
- ✅ Fullscreen mode (PWA)

---

## 📲 iPad/iOS Setup (Recommended)

### Option 1: Guided Access (Built-in iOS Feature)

**ขั้นตอน:**

1. **เปิด Guided Access:**
   ```
   Settings → Accessibility → Guided Access → เปิด
   ```

2. **ตั้งรหัสผ่าน:**
   ```
   Passcode Settings → Set Guided Access Passcode
   ```

3. **เปิด Web App:**
   - เปิด Safari
   - ไปที่ URL ของแอป
   - กด Share → Add to Home Screen

4. **เปิดแอปและเริ่ม Guided Access:**
   - เปิดแอปจาก Home Screen
   - กด Home button 3 ครั้ง (หรือ Side button 3 ครั้งบน iPhone X+)
   - กด "Start" มุมขวาบน

5. **ปิด Guided Access:**
   - กด Home button 3 ครั้ง
   - ใส่รหัสผ่าน
   - กด "End"

### Option 2: Single App Mode (ต้องใช้ MDM)

**ต้องมี:**
- Apple Business Manager / Apple School Manager
- MDM Solution (Jamf, Intune, Mosyle, etc.)

**ขั้นตอน:**
1. ลงทะเบียนอุปกรณ์กับ MDM
2. สร้าง Web Clip configuration profile
3. ตั้งค่า Single App Mode ผ่าน MDM
4. Push profile ไปยัง iPad

---

## 💻 Desktop/Laptop Setup

### Chrome/Edge (Windows, Mac, Linux)

**Fullscreen Mode:**
```
F11 หรือ Cmd+Shift+F (Mac)
```

**Kiosk Mode (Command Line):**
```bash
# Windows
chrome.exe --kiosk "https://your-app-url.com"

# Mac
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --kiosk "https://your-app-url.com"

# Linux
google-chrome --kiosk "https://your-app-url.com"
```

**Exit Kiosk:**
```
Alt+F4 (Windows/Linux)
Cmd+Q (Mac)
```

### Firefox

**Kiosk Mode:**
```bash
firefox --kiosk "https://your-app-url.com"
```

---

## 🌐 Android Tablet Setup

### Option 1: Chrome Kiosk

1. **เปิด Chrome**
2. **ไปที่ URL**
3. **เพิ่มไปยัง Home Screen:**
   ```
   Menu → Add to Home Screen
   ```
4. **ตั้งค่า Kiosk:**
   ```
   Settings → Apps → Default apps → Home app → เลือกแอป
   ```

### Option 2: Android Kiosk Mode (ต้องใช้ MDM)

**ใช้ MDM เช่น:**
- Google Workspace (formerly G Suite)
- Microsoft Intune
- VMware Workspace ONE

---

## 🛠️ Advanced Configuration

### Disable Screenshot (iOS)

ต้องใช้ MDM configuration profile:
```xml
<key>allowScreenShot</key>
<false/>
```

### Auto-reload on Error

เพิ่มใน `App.tsx`:
```tsx
useEffect(() => {
  window.addEventListener('error', () => {
    setTimeout(() => window.location.reload(), 5000)
  })
}, [])
```

### Heartbeat / Keep-alive

เพิ่มใน `App.tsx`:
```tsx
useEffect(() => {
  const heartbeat = setInterval(() => {
    fetch('/api/heartbeat')
  }, 60000) // ทุก 1 นาที
  
  return () => clearInterval(heartbeat)
}, [])
```

---

## 🚫 Known Limitations

### Web App (ไม่ใช่ Native):
- ❌ ไม่สามารถป้องกัน Home button (ต้องใช้ Guided Access/MDM)
- ❌ ไม่สามารถป้องกัน Control Center (iOS)
- ❌ ไม่สามารถป้องกัน Notification Center
- ❌ ไม่สามารถล็อค orientation แบบ force (ต้องใช้ MDM)

### ทางแก้:
- ใช้ **Guided Access** (iOS) - ฟรี, ใช้ง่าย ✅
- ใช้ **MDM Solution** - ครอบคลุม, ต้องจ่ายเงิน 💰

---

## 📋 Checklist

### ก่อน Deploy:

- [ ] Build production (`npm run build`)
- [ ] Test kiosk features บน target device
- [ ] ตั้งค่า Guided Access/MDM
- [ ] ทดสอบ auto-refresh/error handling
- [ ] สร้าง app icons (192x192, 512x512)
- [ ] ทดสอบ offline mode (ถ้ามี Service Worker)

### ในการใช้งาน:

- [ ] เปิด Guided Access (iOS)
- [ ] ซ่อน bookmark bar (desktop)
- [ ] ตั้ง screen timeout = Never
- [ ] ปิด auto-lock (iOS/Android)
- [ ] เชื่อมต่อ power adapter

---

## 🆘 Troubleshooting

### แอปไม่ fullscreen:
- ตรวจสอบ `manifest.json` → `"display": "fullscreen"`
- ลองลบแอปและ Add to Home Screen ใหม่

### Keyboard shortcuts ยังใช้ได้:
- ตรวจสอบ console errors
- ทดสอบใน production build

### Back button ยังใช้ได้:
- ตรวจสอบ `popstate` event listener
- ลอง refresh หน้าเว็บ

### แอปหลุดจาก Kiosk Mode:
- ตั้ง Guided Access timeout
- ใช้ MDM เพื่อ force Single App Mode

---

## 📞 Support

สำหรับ:
- **MDM Setup** → ติดต่อ IT Admin
- **Custom Features** → แก้ไข `App.tsx`
- **iOS Issues** → ตรวจสอบ Safari settings

---

**🎉 พร้อมใช้งาน Kiosk Mode แล้ว!**


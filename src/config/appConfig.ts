// Application Configuration
// เปลี่ยนระหว่าง 'online' และ 'offline' เพื่อสลับ mode

export type AppMode = 'online' | 'offline'

// ⚙️ เปลี่ยนค่านี้เพื่อสลับระหว่าง mode
<<<<<<< HEAD
// สำหรับงานที่มีคนเยอะ: ใช้ 'offline' เพื่อใช้ Local Server เป็นหลัก
// 'offline' = เชื่อมต่อกับ Express Server บน LAN (ไม่ต้องพึ่ง internet)
// 'online' = เชื่อมต่อกับ Firebase (ต้องมี internet ดี)
export const APP_MODE = 'offline' as AppMode
=======
export const APP_MODE = 'online' as AppMode
>>>>>>> f9f03b8851a9d1e5436336495ca1b99d4608a136

// API Configuration
export const API_CONFIG = {
  // Express server local (สำหรับ offline mode)
<<<<<<< HEAD
  // ⚙️ สำหรับงาน: ใช้ IP ของเครื่อง server ในงาน
  LOCAL_API_URL: 'http://192.168.11.18:3001/api', // เปลี่ยนจาก localhost เป็น IP จริง
  
  // Backup server (สำหรับกรณี Firebase ล้มเหลวหรือช้าเกินไป)
  // ⚙️ เปลี่ยน IP/URL นี้เป็นของคุณ
  BACKUP_API_URL: 'http://192.168.11.18:3001/api', // เปลี่ยนเป็น IP ของ backup server
  
  // Timeout settings
  PRIMARY_TIMEOUT: 12000, // 12 วินาที - ถ้าเกินนี้จะใช้ backup
  BACKUP_TIMEOUT: 10000,  // 10 วินาที - timeout สำหรับ backup server
  REQUEST_TIMEOUT: 10000, // 10 วินาที - ค่าเดิม (เก็บไว้เพื่อ backward compatibility)
  
  // Fallback settings
  ENABLE_FALLBACK: false,  // ปิด fallback สำหรับงาน (offline mode ส่งตรงไปเลย)
=======
  LOCAL_API_URL: 'http://localhost:3001/api',
  
  // Timeout settings
  REQUEST_TIMEOUT: 10000, // 10 วินาที
>>>>>>> f9f03b8851a9d1e5436336495ca1b99d4608a136
} as const

// Mode descriptions
export const MODE_DESCRIPTIONS = {
  online: 'เชื่อมต่อกับ Firebase (Cloud)',
  offline: 'เชื่อมต่อกับ Express Server (Local)'
} as const

// Helper functions
export const isOnlineMode = () => APP_MODE === 'online'
export const isOfflineMode = () => APP_MODE === 'offline'
export const getCurrentModeDescription = () => MODE_DESCRIPTIONS[APP_MODE]


// Application Configuration
// เปลี่ยนระหว่าง 'online' และ 'offline' เพื่อสลับ mode

export type AppMode = 'online' | 'offline'

// ⚙️ เปลี่ยนค่านี้เพื่อสลับระหว่าง mode
export const APP_MODE = 'online' as AppMode

// API Configuration
export const API_CONFIG = {
  // Express server local (สำหรับ offline mode)
  LOCAL_API_URL: 'http://localhost:3001/api',
  
  // Timeout settings
  REQUEST_TIMEOUT: 10000, // 10 วินาที
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


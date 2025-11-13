/**
<<<<<<< HEAD
 * Message Service with Fallback Support
 * สลับระหว่าง Firebase และ Express API ตามการตั้งค่าใน appConfig
 * พร้อมระบบ fallback สำหรับกรณีล้มเหลวหรือช้าเกินไป
 */

import { PledgeMessage } from '../types'
import { APP_MODE, API_CONFIG } from '../config/appConfig'
import { FirebaseAdapter, ExpressApiAdapter, type IMessageAdapter } from './apiAdapter'
import { BackupApiAdapter, shouldUseFallback, createBackupAdapter } from './fallbackAdapter'
=======
 * Message Service
 * สลับระหว่าง Firebase และ Express API ตามการตั้งค่าใน appConfig
 */

import { PledgeMessage } from '../types'
import { APP_MODE } from '../config/appConfig'
import { FirebaseAdapter, ExpressApiAdapter, type IMessageAdapter } from './apiAdapter'
>>>>>>> f9f03b8851a9d1e5436336495ca1b99d4608a136

// สร้าง adapter instance ตาม mode
const getAdapter = (): IMessageAdapter => {
  if (APP_MODE === 'offline') {
    console.log('🔌 Using Express API (Offline Mode)')
    return new ExpressApiAdapter()
  } else {
    console.log('☁️ Using Firebase (Online Mode)')
    return new FirebaseAdapter()
  }
}

// Singleton adapter instance
const adapter = getAdapter()

<<<<<<< HEAD
// Backup adapter (สร้างเมื่อจำเป็น)
let backupAdapter: BackupApiAdapter | null = null

/**
 * ส่งข้อความพร้อมระบบ fallback
 * 1. ลองส่งไปยัง primary (Firebase/Express) ก่อน
 * 2. ถ้าล้มเหลวหรือเกิน timeout → ใช้ backup server
 * 3. ถ้า backup ล้มเหลว → เก็บไว้ใน localStorage
 */
const submitWithTimeout = async (
  message: string, 
  author?: string, 
  timeout: number = API_CONFIG.PRIMARY_TIMEOUT
): Promise<string> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const result = await adapter.submitMessage(message, author)
    clearTimeout(timeoutId)
    return result
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// ==================== Public API ====================

export const submitMessage = async (message: string, author?: string): Promise<string> => {
  // ลอง primary ก่อน
  try {
    console.log('📤 [Primary] Attempting to submit...')
    const result = await submitWithTimeout(message, author, API_CONFIG.PRIMARY_TIMEOUT)
    console.log('✅ [Primary] Submitted successfully:', result)
    return result
  } catch (primaryError) {
    console.warn('⚠️ [Primary] Failed or timeout:', primaryError)

    // ถ้าเปิด fallback และมี backup URL
    if (shouldUseFallback() && API_CONFIG.BACKUP_API_URL) {
      try {
        console.log('🔄 [Fallback] Trying backup server...')
        
        // สร้าง backup adapter ถ้ายังไม่มี
        if (!backupAdapter) {
          backupAdapter = createBackupAdapter()
        }

        const backupResult = await backupAdapter.submitMessage(message, author)
        console.log('✅ [Fallback] Backup successful:', backupResult)
        
        // แจ้งเตือนผู้ใช้ว่าใช้ backup (optional)
        if (typeof window !== 'undefined') {
          console.info('ℹ️ Message saved to backup server')
        }
        
        return backupResult
      } catch (backupError) {
        console.error('❌ [Fallback] Backup also failed:', backupError)
        
        // บันทึกลง localStorage เป็นทางเลือกสุดท้าย
        try {
          if (!backupAdapter) {
            backupAdapter = createBackupAdapter()
          }
          await backupAdapter.saveToLocalStorage(message, author)
          console.log('💾 [Fallback] Saved to localStorage for retry')
          
          // คืนค่า temporary ID
          return `temp_${Date.now()}`
        } catch {
          console.error('❌ [Fallback] All fallback methods failed')
          throw new Error('Failed to submit message. All methods exhausted.')
        }
      }
    }

    // ถ้าไม่เปิด fallback หรือไม่มี backup URL
    throw primaryError
  }
=======
// ==================== Public API ====================

export const submitMessage = async (message: string, author?: string): Promise<string> => {
  return adapter.submitMessage(message, author)
>>>>>>> f9f03b8851a9d1e5436336495ca1b99d4608a136
}

export const getApprovedMessages = async (): Promise<PledgeMessage[]> => {
  return adapter.getApprovedMessages()
}

export const getAllMessages = async (): Promise<PledgeMessage[]> => {
  return adapter.getAllMessages()
}

export const approveMessage = async (messageId: string): Promise<void> => {
  return adapter.approveMessage(messageId)
}

export const rejectMessage = async (messageId: string): Promise<void> => {
  return adapter.rejectMessage(messageId)
}

export const updateMessage = async (messageId: string, newMessage: string): Promise<void> => {
  return adapter.updateMessage(messageId, newMessage)
}

export const deleteMessage = async (messageId: string): Promise<void> => {
  return adapter.deleteMessage(messageId)
}

export const reportMessage = async (messageId: string, reason: string): Promise<void> => {
  return adapter.reportMessage(messageId, reason)
}

export const getMessageById = async (messageId: string): Promise<PledgeMessage | null> => {
  return adapter.getMessageById(messageId)
}

// ==================== Helper Functions ====================

// ตรวจสอบสถานะการเชื่อมต่อ (สำหรับ offline mode)
export const checkConnection = async (): Promise<boolean> => {
  if (APP_MODE === 'offline') {
    const expressAdapter = adapter as ExpressApiAdapter
    if ('checkHealth' in expressAdapter) {
      return await expressAdapter.checkHealth()
    }
  }
  // Online mode always return true (assume Firebase is available)
  return true
}

// ดึงข้อมูล mode ปัจจุบัน
export const getCurrentMode = () => APP_MODE

<<<<<<< HEAD
// ==================== Fallback Management ====================

/**
 * ดึงข้อความที่ล้มเหลว (เก็บไว้ใน localStorage)
 */
export const getFailedMessages = () => {
  if (!backupAdapter) {
    backupAdapter = createBackupAdapter()
  }
  return backupAdapter.getFailedMessages()
}

/**
 * ลองส่งข้อความที่ล้มเหลวทั้งหมดใหม่
 */
export const retryFailedMessages = async () => {
  if (!backupAdapter) {
    backupAdapter = createBackupAdapter()
  }
  return backupAdapter.retryFailedMessages()
}

/**
 * ลบข้อความที่ล้มเหลวทั้งหมด
 */
export const clearFailedMessages = () => {
  if (!backupAdapter) {
    backupAdapter = createBackupAdapter()
  }
  return backupAdapter.clearFailedMessages()
}

/**
 * ตรวจสอบว่า backup server ใช้งานได้หรือไม่
 */
export const checkBackupServer = async (): Promise<boolean> => {
  if (!shouldUseFallback() || !API_CONFIG.BACKUP_API_URL) {
    return false
  }
  
  if (!backupAdapter) {
    backupAdapter = createBackupAdapter()
  }
  
  return backupAdapter.checkHealth()
}

// Export adapter สำหรับการใช้งานขั้นสูง (ถ้าจำเป็น)
export { adapter, backupAdapter }
=======
// Export adapter สำหรับการใช้งานขั้นสูง (ถ้าจำเป็น)
export { adapter }
>>>>>>> f9f03b8851a9d1e5436336495ca1b99d4608a136


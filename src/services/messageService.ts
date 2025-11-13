/**
 * Message Service
 * สลับระหว่าง Firebase และ Express API ตามการตั้งค่าใน appConfig
 */

import { PledgeMessage } from '../types'
import { APP_MODE } from '../config/appConfig'
import { FirebaseAdapter, ExpressApiAdapter, type IMessageAdapter } from './apiAdapter'

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

// ==================== Public API ====================

export const submitMessage = async (message: string, author?: string): Promise<string> => {
  return adapter.submitMessage(message, author)
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

// Export adapter สำหรับการใช้งานขั้นสูง (ถ้าจำเป็น)
export { adapter }


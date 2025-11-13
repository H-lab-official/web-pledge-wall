/**
 * Fallback Adapter
 * ระบบสำรองสำหรับกรณี Firebase ล้มเหลวหรือช้าเกินไป
 */

import { API_CONFIG } from '../config/appConfig'

// Type definitions
type RequestInit = {
  method?: string
  headers?: Record<string, string>
  body?: string
  signal?: AbortSignal
}

interface BackupApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Backup API Adapter - ส่งข้อมูลไปยัง backup server
 */
export class BackupApiAdapter {
  private baseUrl: string

  constructor(customUrl?: string) {
    this.baseUrl = customUrl || API_CONFIG.BACKUP_API_URL
  }

  private async fetchWithTimeout<T>(
    url: string, 
    options?: RequestInit, 
    timeout: number = API_CONFIG.BACKUP_TIMEOUT
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Backup API Error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Backup server timeout (${timeout}ms)`)
      }
      throw error
    }
  }

  /**
   * ส่งข้อความไปยัง backup server
   */
  async submitMessage(message: string, author?: string): Promise<string> {
    console.log('📡 [Backup] Sending to backup server:', this.baseUrl)
    
    const response = await this.fetchWithTimeout<BackupApiResponse<{ id: string }>>(
      `${this.baseUrl}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ 
          message, 
          author,
          source: 'fallback', // ระบุว่ามาจาก fallback
          timestamp: new Date().toISOString()
        })
      }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to submit to backup server')
    }

    console.log('✅ [Backup] Submitted successfully, ID:', response.data.id)
    return response.data.id
  }

  /**
   * ตรวจสอบว่า backup server ทำงานหรือไม่
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout<BackupApiResponse<unknown>>(
        `${this.baseUrl}/health`,
        { method: 'GET' },
        5000 // timeout 5 วินาที
      )
      return response.success
    } catch (error) {
      console.warn('⚠️ [Backup] Health check failed:', error)
      return false
    }
  }

  /**
   * บันทึกข้อมูลที่ล้มเหลวไว้ใน localStorage (optional)
   */
  async saveToLocalStorage(message: string, author?: string): Promise<void> {
    try {
      const failedMessages = this.getFailedMessages()
      failedMessages.push({
        message,
        author,
        timestamp: new Date().toISOString(),
        attempts: 0
      })
      localStorage.setItem('failedMessages', JSON.stringify(failedMessages))
      console.log('💾 [Backup] Saved to localStorage for retry later')
    } catch (error) {
      console.error('❌ [Backup] Failed to save to localStorage:', error)
    }
  }

  /**
   * ดึงข้อความที่ล้มเหลวจาก localStorage
   */
  getFailedMessages(): Array<{
    message: string
    author?: string
    timestamp: string
    attempts: number
  }> {
    try {
      const stored = localStorage.getItem('failedMessages')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * ลบข้อความที่ล้มเหลวออกจาก localStorage
   */
  clearFailedMessages(): void {
    localStorage.removeItem('failedMessages')
  }

  /**
   * ส่งข้อความที่ล้มเหลวทั้งหมดใหม่
   */
  async retryFailedMessages(): Promise<void> {
    const failed = this.getFailedMessages()
    if (failed.length === 0) return

    console.log(`🔄 [Backup] Retrying ${failed.length} failed messages...`)

    const results = await Promise.allSettled(
      failed.map(item => this.submitMessage(item.message, item.author))
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    console.log(`✅ [Backup] Retry complete: ${succeeded}/${failed.length} succeeded`)

    if (succeeded > 0) {
      // ลบข้อความที่ส่งสำเร็จออก
      const remaining = failed.filter((_, index) => results[index].status === 'rejected')
      if (remaining.length > 0) {
        localStorage.setItem('failedMessages', JSON.stringify(remaining))
      } else {
        this.clearFailedMessages()
      }
    }
  }
}

/**
 * ตรวจสอบว่าควรใช้ backup หรือไม่
 */
export function shouldUseFallback(): boolean {
  return API_CONFIG.ENABLE_FALLBACK
}

/**
 * สร้าง backup adapter instance
 */
export function createBackupAdapter(customUrl?: string): BackupApiAdapter {
  return new BackupApiAdapter(customUrl)
}


/**
 * API Adapter Layer
 * สลับระหว่าง Firebase และ Express API ตาม mode ที่เลือก
 */

import { PledgeMessage } from '../types'
import { API_CONFIG } from '../config/appConfig'

// ==================== Type Definitions ====================
type RequestInit = {
  method?: string
  headers?: Record<string, string>
  body?: string
}

// ==================== Firebase Adapter ====================
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
  type QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'

const MESSAGES_COLLECTION = 'pledgeMessages'

// Firebase implementation
export class FirebaseAdapter {
  async submitMessage(message: string, author?: string): Promise<string> {
    const messageData = {
      message,
      author: author || 'Anonymous',
      status: 'approved',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      reportedCount: 0
    }

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData)
    return docRef.id
  }

  async getApprovedMessages(): Promise<PledgeMessage[]> {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as PledgeMessage))
  }

  async getAllMessages(): Promise<PledgeMessage[]> {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as PledgeMessage))
  }

  async approveMessage(messageId: string): Promise<void> {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
    await updateDoc(messageRef, {
      status: 'approved',
      updatedAt: Timestamp.now()
    })
  }

  async rejectMessage(messageId: string): Promise<void> {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
    await updateDoc(messageRef, {
      status: 'rejected',
      updatedAt: Timestamp.now()
    })
  }

  async updateMessage(messageId: string, newMessage: string): Promise<void> {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
    await updateDoc(messageRef, {
      message: newMessage,
      status: 'pending',
      updatedAt: Timestamp.now()
    })
  }

  async deleteMessage(messageId: string): Promise<void> {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
    await deleteDoc(messageRef)
  }

  async reportMessage(messageId: string, reason: string): Promise<void> {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
    const messageSnap = await getDoc(messageRef)
    
    if (messageSnap.exists()) {
      const currentData = messageSnap.data()
      await updateDoc(messageRef, {
        reportedCount: (currentData.reportedCount || 0) + 1,
        reportedReason: reason,
        status: 'pending',
        updatedAt: Timestamp.now()
      })
    }
  }

  async getMessageById(messageId: string): Promise<PledgeMessage | null> {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
    const messageSnap = await getDoc(messageRef)
    
    if (messageSnap.exists()) {
      const data = messageSnap.data()
      return {
        id: messageSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as PledgeMessage
    }
    
    return null
  }
}

// ==================== Express API Adapter ====================

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export class ExpressApiAdapter {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_CONFIG.LOCAL_API_URL
  }

  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API Error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${url}`, error)
      throw error
    }
  }

  async submitMessage(message: string, author?: string): Promise<string> {
    const response = await this.fetchApi<ApiResponse<{ id: string }>>('/messages', {
      method: 'POST',
      body: JSON.stringify({ message, author })
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to submit message')
    }

    return response.data.id
  }

  async getApprovedMessages(): Promise<PledgeMessage[]> {
    const response = await this.fetchApi<ApiResponse<PledgeMessage[]>>('/messages/approved')

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch messages')
    }

    // Convert string dates to Date objects
    return response.data.map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
      updatedAt: new Date(msg.updatedAt)
    }))
  }

  async getAllMessages(): Promise<PledgeMessage[]> {
    const response = await this.fetchApi<ApiResponse<PledgeMessage[]>>('/messages/all')

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch all messages')
    }

    // Convert string dates to Date objects
    return response.data.map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
      updatedAt: new Date(msg.updatedAt)
    }))
  }

  async approveMessage(messageId: string): Promise<void> {
    const response = await this.fetchApi<ApiResponse<void>>(`/messages/${messageId}/approve`, {
      method: 'PUT'
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to approve message')
    }
  }

  async rejectMessage(messageId: string): Promise<void> {
    const response = await this.fetchApi<ApiResponse<void>>(`/messages/${messageId}/reject`, {
      method: 'PUT'
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to reject message')
    }
  }

  async updateMessage(messageId: string, newMessage: string): Promise<void> {
    const response = await this.fetchApi<ApiResponse<void>>(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ message: newMessage })
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to update message')
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    const response = await this.fetchApi<ApiResponse<void>>(`/messages/${messageId}`, {
      method: 'DELETE'
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete message')
    }
  }

  async reportMessage(messageId: string, reason: string): Promise<void> {
    const response = await this.fetchApi<ApiResponse<void>>(`/messages/${messageId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to report message')
    }
  }

  async getMessageById(messageId: string): Promise<PledgeMessage | null> {
    try {
      const response = await this.fetchApi<ApiResponse<PledgeMessage>>(`/messages/${messageId}`)

      if (!response.success || !response.data) {
        return null
      }

      // Convert string dates to Date objects
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      }
    } catch {
      return null
    }
  }

  // Health check method
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchApi<ApiResponse<unknown>>('/health')
      return response.success
    } catch {
      return false
    }
  }
}

// ==================== Adapter Interface ====================

export interface IMessageAdapter {
  submitMessage(message: string, author?: string): Promise<string>
  getApprovedMessages(): Promise<PledgeMessage[]>
  getAllMessages(): Promise<PledgeMessage[]>
  approveMessage(messageId: string): Promise<void>
  rejectMessage(messageId: string): Promise<void>
  updateMessage(messageId: string, newMessage: string): Promise<void>
  deleteMessage(messageId: string): Promise<void>
  reportMessage(messageId: string, reason: string): Promise<void>
  getMessageById(messageId: string): Promise<PledgeMessage | null>
}


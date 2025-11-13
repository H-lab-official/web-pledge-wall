/**
 * Local Database (JSON File)
 * สำหรับเก็บข้อมูลใน local server โดยไม่ต้องพึ่ง Firebase
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

interface PledgeMessage {
  id: string
  message: string
  author?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  reportedCount?: number
  reportedReason?: string
}

const DATA_DIR = join(process.cwd(), 'local-data')
const DB_FILE = join(DATA_DIR, 'messages.json')

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

// สร้างไฟล์ถ้ายังไม่มี
if (!existsSync(DB_FILE)) {
  writeFileSync(DB_FILE, JSON.stringify({ messages: [] }, null, 2))
}

/**
 * อ่านข้อมูลทั้งหมด
 */
export function readDB(): { messages: PledgeMessage[] } {
  try {
    const data = readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading DB:', error)
    return { messages: [] }
  }
}

/**
 * เขียนข้อมูล
 */
export function writeDB(data: { messages: PledgeMessage[] }): void {
  try {
    writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing DB:', error)
    throw error
  }
}

/**
 * สร้าง ID ใหม่
 */
export function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * เพิ่มข้อความใหม่
 */
export function addMessage(message: string, author?: string): PledgeMessage {
  const db = readDB()
  
  const newMessage: PledgeMessage = {
    id: generateId(),
    message,
    author: author || 'Anonymous',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reportedCount: 0
  }
  
  db.messages.unshift(newMessage) // เพิ่มที่ด้านบน (ใหม่สุด)
  writeDB(db)
  
  return newMessage
}

/**
 * ดึงข้อความทั้งหมด
 */
export function getAllMessages(): PledgeMessage[] {
  const db = readDB()
  return db.messages
}

/**
 * ดึงข้อความที่ได้รับการอนุมัติ
 */
export function getApprovedMessages(): PledgeMessage[] {
  const db = readDB()
  return db.messages.filter(msg => msg.status === 'approved')
}

/**
 * ดึงข้อความตาม ID
 */
export function getMessageById(id: string): PledgeMessage | null {
  const db = readDB()
  return db.messages.find(msg => msg.id === id) || null
}

/**
 * อัพเดทข้อความ
 */
export function updateMessage(id: string, updates: Partial<PledgeMessage>): PledgeMessage | null {
  const db = readDB()
  const index = db.messages.findIndex(msg => msg.id === id)
  
  if (index === -1) return null
  
  db.messages[index] = {
    ...db.messages[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  writeDB(db)
  return db.messages[index]
}

/**
 * ลบข้อความ
 */
export function deleteMessage(id: string): boolean {
  const db = readDB()
  const index = db.messages.findIndex(msg => msg.id === id)
  
  if (index === -1) return false
  
  db.messages.splice(index, 1)
  writeDB(db)
  
  return true
}

/**
 * รายงานข้อความ
 */
export function reportMessage(id: string, reason: string): PledgeMessage | null {
  const db = readDB()
  const message = db.messages.find(msg => msg.id === id)
  
  if (!message) return null
  
  return updateMessage(id, {
    reportedCount: (message.reportedCount || 0) + 1,
    reportedReason: reason,
    status: 'pending'
  })
}

/**
 * Export ข้อมูลเป็น JSON
 */
export function exportData(): string {
  const db = readDB()
  return JSON.stringify(db, null, 2)
}

/**
 * Import ข้อมูลจาก JSON
 */
export function importData(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData)
    writeDB(data)
  } catch (error) {
    console.error('Error importing data:', error)
    throw new Error('Invalid JSON data')
  }
}

/**
 * ล้างข้อมูลทั้งหมด
 */
export function clearAllData(): void {
  writeDB({ messages: [] })
}

/**
 * สถิติ
 */
export function getStats() {
  const db = readDB()
  return {
    total: db.messages.length,
    approved: db.messages.filter(m => m.status === 'approved').length,
    pending: db.messages.filter(m => m.status === 'pending').length,
    rejected: db.messages.filter(m => m.status === 'rejected').length,
    reported: db.messages.filter(m => (m.reportedCount || 0) > 0).length
  }
}


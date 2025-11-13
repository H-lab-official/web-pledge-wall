import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { Request, Response } from 'express'

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()

interface PledgeMessage {
  id: string
  message: string
  author?: string
  status: string
  createdAt: admin.firestore.Timestamp | Date
  updatedAt: admin.firestore.Timestamp | Date
}

// API endpoint for approved messages
export const getMessages = functions.https.onRequest(async (req: Request, res: Response) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
    return
  }

  try {
    const messagesRef = db.collection('pledgeMessages')
    const snapshot = await messagesRef
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .get()

    const messages: PledgeMessage[] = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      } as PledgeMessage
    })

    res.json({
      success: true,
      data: messages,
      count: messages.length
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    })
  }
})

// Sync endpoint - เหมือน getMessages แต่ส่งเฉพาะข้อมูลใหม่
export const syncMessages = functions.https.onRequest(async (req: Request, res: Response) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
    return
  }

  try {
    // รับ timestamp จาก query string (optional)
    const afterTimestamp = req.query.after as string | undefined

    const messagesRef = db.collection('pledgeMessages')
    let query = messagesRef
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')

    // ถ้ามี afterTimestamp ให้ดึงเฉพาะข้อมูลที่ใหม่กว่า
    if (afterTimestamp) {
      const afterDate = new Date(afterTimestamp)
      query = query.where('createdAt', '>', admin.firestore.Timestamp.fromDate(afterDate))
    }

    const snapshot = await query.get()

    const messages: PledgeMessage[] = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      } as PledgeMessage
    })

    res.json({
      success: true,
      data: messages,
      count: messages.length
    })
  } catch (error) {
    console.error('Error syncing messages:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to sync messages'
    })
  }
})

// Health check endpoint
export const healthCheck = functions.https.onRequest((req: Request, res: Response) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  res.json({
    success: true,
    message: 'Pledge Wall API is running'
  })
})


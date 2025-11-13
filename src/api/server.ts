import express from 'express'
import cors from 'cors'
import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore'

const app = express()
const PORT = process.env.PORT || 3001

// Firebase config - should match your frontend config
const firebaseConfig = {
  apiKey: "AIzaSyDAittuNjAXLLwOl-ruP0SbbClBLp6WcsE",
  authDomain: "web-pledge-wall.firebaseapp.com",
  projectId: "web-pledge-wall",
  storageBucket: "web-pledge-wall.firebasestorage.app",
  messagingSenderId: "1015461911889",
  appId: "1:1015461911889:web:afb31ade37323571874770",
  measurementId: "G-J387421HR3"
}

// Initialize Firebase
const fbApp = initializeApp(firebaseConfig)
const db = getFirestore(fbApp)

app.use(cors())
app.use(express.json())

interface PledgeMessage {
  id: string
  message: string
  author?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
  reportedCount?: number
  reportedReason?: string
}

const MESSAGES_COLLECTION = 'pledgeMessages'

// ==================== GET ENDPOINTS ====================

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Pledge Wall API is running',
    mode: 'offline',
    timestamp: new Date().toISOString()
  })
})

// Get approved messages
app.get('/api/messages/approved', async (_req, res) => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const messages: PledgeMessage[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as PledgeMessage))

    res.json({
      success: true,
      data: messages,
      count: messages.length
    })
  } catch (error) {
    console.error('Error fetching approved messages:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approved messages'
    })
  }
})

// Get all messages (for admin)
app.get('/api/messages/all', async (_req, res) => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const messages: PledgeMessage[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as PledgeMessage))

    res.json({
      success: true,
      data: messages,
      count: messages.length
    })
  } catch (error) {
    console.error('Error fetching all messages:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all messages'
    })
  }
})

// Get single message by ID
app.get('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params
    const messageRef = doc(db, MESSAGES_COLLECTION, id)
    const messageSnap = await getDoc(messageRef)

    if (!messageSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

    const data = messageSnap.data()
    const message: PledgeMessage = {
      id: messageSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as PledgeMessage

    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Error fetching message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch message'
    })
  }
})

// ==================== POST ENDPOINTS ====================

// Submit new message
app.post('/api/messages', async (req, res) => {
  try {
    const { message, author } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    const messageData = {
      message: message.trim(),
      author: author?.trim() || 'Anonymous',
      status: 'approved' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      reportedCount: 0
    }

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData)

    res.json({
      success: true,
      data: {
        id: docRef.id,
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      message: 'Message submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to submit message'
    })
  }
})

// Report message
app.post('/api/messages/:id/report', async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Report reason is required'
      })
    }

    const messageRef = doc(db, MESSAGES_COLLECTION, id)
    const messageSnap = await getDoc(messageRef)

    if (!messageSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

    const currentData = messageSnap.data()
    await updateDoc(messageRef, {
      reportedCount: (currentData.reportedCount || 0) + 1,
      reportedReason: reason.trim(),
      status: 'pending',
      updatedAt: Timestamp.now()
    })

    res.json({
      success: true,
      message: 'Message reported successfully'
    })
  } catch (error) {
    console.error('Error reporting message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to report message'
    })
  }
})

// ==================== PUT ENDPOINTS ====================

// Approve message
app.put('/api/messages/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    const messageRef = doc(db, MESSAGES_COLLECTION, id)
    
    await updateDoc(messageRef, {
      status: 'approved',
      updatedAt: Timestamp.now()
    })

    res.json({
      success: true,
      message: 'Message approved successfully'
    })
  } catch (error) {
    console.error('Error approving message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to approve message'
    })
  }
})

// Reject message
app.put('/api/messages/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const messageRef = doc(db, MESSAGES_COLLECTION, id)
    
    await updateDoc(messageRef, {
      status: 'rejected',
      updatedAt: Timestamp.now()
    })

    res.json({
      success: true,
      message: 'Message rejected successfully'
    })
  } catch (error) {
    console.error('Error rejecting message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to reject message'
    })
  }
})

// Update message
app.put('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    const messageRef = doc(db, MESSAGES_COLLECTION, id)
    
    await updateDoc(messageRef, {
      message: message.trim(),
      status: 'pending',
      updatedAt: Timestamp.now()
    })

    res.json({
      success: true,
      message: 'Message updated successfully'
    })
  } catch (error) {
    console.error('Error updating message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update message'
    })
  }
})

// ==================== DELETE ENDPOINTS ====================

// Delete message
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params
    const messageRef = doc(db, MESSAGES_COLLECTION, id)
    
    await deleteDoc(messageRef)

    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    })
  }
})

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Local Express API server running`)
  console.log(`📡 Base URL: http://localhost:${PORT}/api`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
  console.log(`📝 Mode: OFFLINE (Local Express + Firebase backend)`)
  console.log(`\n📚 Available endpoints:`)
  console.log(`   GET    /api/health`)
  console.log(`   GET    /api/messages/approved`)
  console.log(`   GET    /api/messages/all`)
  console.log(`   GET    /api/messages/:id`)
  console.log(`   POST   /api/messages`)
  console.log(`   POST   /api/messages/:id/report`)
  console.log(`   PUT    /api/messages/:id/approve`)
  console.log(`   PUT    /api/messages/:id/reject`)
  console.log(`   PUT    /api/messages/:id`)
  console.log(`   DELETE /api/messages/:id`)
})


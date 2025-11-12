import express from 'express'
import cors from 'cors'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore'

const app = express()
const PORT = process.env.PORT || 3001

// Firebase config - should match your frontend config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "your-app-id"
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
  status: string
  createdAt: Date
  updatedAt: Date
}

// API endpoint for approved messages
app.get('/api/messages', async (_req, res) => {
  try {
    const q = query(
      collection(db, 'pledgeMessages'),
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
    console.error('Error fetching messages:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    })
  }
})

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Pledge Wall API is running'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/messages`)
})


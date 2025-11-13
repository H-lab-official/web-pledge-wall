/**
 * Local Express Server (ไม่ใช้ Firebase)
 * เก็บข้อมูลใน JSON file บน local server
 * ไม่ต้องเชื่อมต่ออินเทอร์เน็ต
 */

import express from 'express'
import cors from 'cors'
import * as localDB from './localDB'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// ==================== GET ENDPOINTS ====================

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const stats = localDB.getStats()
  res.json({
    success: true,
    message: 'Local Server is running (No Firebase)',
    mode: 'local',
    timestamp: new Date().toISOString(),
    stats
  })
})

// Get approved messages
app.get('/api/messages/approved', (_req, res) => {
  try {
    const messages = localDB.getApprovedMessages()
    
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
app.get('/api/messages/all', (_req, res) => {
  try {
    const messages = localDB.getAllMessages()
    
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
app.get('/api/messages/:id', (req, res) => {
  try {
    const { id } = req.params
    const message = localDB.getMessageById(id)

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

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

// Get statistics
app.get('/api/stats', (_req, res) => {
  try {
    const stats = localDB.getStats()
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    })
  }
})

// Export all data
app.get('/api/export', (_req, res) => {
  try {
    const data = localDB.exportData()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="messages-${Date.now()}.json"`)
    res.send(data)
  } catch (error) {
    console.error('Error exporting data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    })
  }
})

// ==================== POST ENDPOINTS ====================

// Submit new message
app.post('/api/messages', (req, res) => {
  try {
    const { message, author } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    const newMessage = localDB.addMessage(message.trim(), author?.trim())
    
    console.log(`✅ Message added: "${message.substring(0, 30)}..." by ${author || 'Anonymous'}`)

    res.json({
      success: true,
      data: newMessage,
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
app.post('/api/messages/:id/report', (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Report reason is required'
      })
    }

    const updated = localDB.reportMessage(id, reason.trim())
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

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

// Import data
app.post('/api/import', (req, res) => {
  try {
    const { data } = req.body
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required'
      })
    }
    
    localDB.importData(typeof data === 'string' ? data : JSON.stringify(data))
    
    res.json({
      success: true,
      message: 'Data imported successfully'
    })
  } catch (error) {
    console.error('Error importing data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to import data'
    })
  }
})

// ==================== PUT ENDPOINTS ====================

// Approve message
app.put('/api/messages/:id/approve', (req, res) => {
  try {
    const { id } = req.params
    
    const updated = localDB.updateMessage(id, { status: 'approved' })
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

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
app.put('/api/messages/:id/reject', (req, res) => {
  try {
    const { id } = req.params
    
    const updated = localDB.updateMessage(id, { status: 'rejected' })
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

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
app.put('/api/messages/:id', (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    const updated = localDB.updateMessage(id, {
      message: message.trim(),
      status: 'pending'
    })
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

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
app.delete('/api/messages/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const deleted = localDB.deleteMessage(id)
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

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

// Clear all data (for testing)
app.delete('/api/clear-all', (_req, res) => {
  try {
    localDB.clearAllData()
    res.json({
      success: true,
      message: 'All data cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to clear data'
    })
  }
})

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║  🎪 LOCAL EVENT SERVER (No Internet Required)         ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Base URL: http://localhost:${PORT}/api`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
  console.log('')
  console.log('📝 Mode: LOCAL (JSON File Storage)')
  console.log('💾 Data location: ./local-data/messages.json')
  console.log('🌐 Internet: NOT REQUIRED')
  console.log('🔥 Firebase: NOT USED')
  console.log('')
  console.log('📚 Available endpoints:')
  console.log('   GET    /api/health')
  console.log('   GET    /api/messages/approved')
  console.log('   GET    /api/messages/all')
  console.log('   GET    /api/messages/:id')
  console.log('   GET    /api/stats')
  console.log('   GET    /api/export (download JSON)')
  console.log('   POST   /api/messages')
  console.log('   POST   /api/messages/:id/report')
  console.log('   POST   /api/import')
  console.log('   PUT    /api/messages/:id/approve')
  console.log('   PUT    /api/messages/:id/reject')
  console.log('   PUT    /api/messages/:id')
  console.log('   DELETE /api/messages/:id')
  console.log('   DELETE /api/clear-all')
  console.log('')
  
  // แสดงสถิติ
  const stats = localDB.getStats()
  console.log('📊 Current Stats:')
  console.log(`   Total: ${stats.total}`)
  console.log(`   Approved: ${stats.approved}`)
  console.log(`   Pending: ${stats.pending}`)
  console.log(`   Rejected: ${stats.rejected}`)
  console.log('')
  console.log('✅ Ready to accept connections!')
  console.log('═══════════════════════════════════════════════════════')
})


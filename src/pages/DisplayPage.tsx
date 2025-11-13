import { useState, useEffect } from 'react'
import { getApprovedMessages } from '../services/messageService'
import { PledgeMessage } from '../types'
import ModeIndicator from '../components/ModeIndicator'
import './DisplayPage.css'

const DisplayPage = () => {
  const [messages, setMessages] = useState<PledgeMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMessages()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMessages, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await getApprovedMessages()
      setMessages(data)
      setError('')
    } catch (err) {
      setError('ไม่สามารถโหลดข้อความได้')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading && messages.length === 0) {
    return (
      <div className="display-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>กำลังโหลดข้อความ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="display-page">
      <ModeIndicator />
      <div className="display-header">
        <h2>📋 Pledge Wall</h2>
        <button onClick={loadMessages} className="refresh-btn">
          🔄 รีเฟรช
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="empty-state">
          <p>ยังไม่มีข้อความที่อนุมัติแล้ว</p>
          <p className="empty-subtitle">เป็นคนแรกที่ส่งข้อความ!</p>
        </div>
      ) : (
        <div className="messages-grid">
          {messages.map((message) => (
            <div key={message.id} className="message-card">
              <div className="message-header">
                <span className="message-author">
                  {message.author || 'Anonymous'}
                </span>
                <span className="message-date">
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <div className="message-content">
                {message.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DisplayPage


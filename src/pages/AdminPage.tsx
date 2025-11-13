import { useState, useEffect } from 'react'
import {
  getAllMessages,
  approveMessage,
  rejectMessage,
  updateMessage,
  deleteMessage,
  reportMessage
} from '../services/messageService'
import { PledgeMessage } from '../types'
import { checkProfanity } from '../utils/profanityFilter'
import Modal from '../components/Modal'
import './AdminPage.css'

const AdminPage = () => {
  const [messages, setMessages] = useState<PledgeMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [reportingId, setReportingId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showApproveAllConfirm, setShowApproveAllConfirm] = useState(false)

  useEffect(() => {
    // Add admin-page class to body
    document.body.classList.add('admin-page')
    
    loadMessages()
    
    // Cleanup: remove admin-page class when component unmounts
    return () => {
      document.body.classList.remove('admin-page')
    }
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await getAllMessages()
      setMessages(data)
      setError('')
    } catch (err) {
      setError('ไม่สามารถโหลดข้อความได้')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveMessage(id)
      setSuccess('อนุมัติข้อความสำเร็จ')
      loadMessages()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอนุมัติ')
      console.error(err)
    }
  }

  const handleApproveAll = async () => {
    const pendingMessages = messages.filter(m => m.status === 'pending')
    
    if (pendingMessages.length === 0) {
      setError('ไม่มีข้อความที่รอตรวจสอบ')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      setLoading(true)
      // อนุมัติทีละข้อความ
      for (const message of pendingMessages) {
        await approveMessage(message.id)
      }
      setSuccess(`อนุมัติข้อความทั้งหมดสำเร็จ (${pendingMessages.length} ข้อความ)`)
      loadMessages()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอนุมัติทั้งหมด')
      console.error(err)
      setLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectMessage(id)
      setSuccess('ปฏิเสธข้อความสำเร็จ')
      loadMessages()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการปฏิเสธ')
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(id)
      setSuccess('ลบข้อความสำเร็จ')
      loadMessages()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการลบ')
      console.error(err)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editText.trim()) {
      setError('กรุณากรอกข้อความ')
      return
    }

    if (checkProfanity(editText)) {
      setError('ข้อความยังมีคำหยาบ กรุณาแก้ไข')
      return
    }

    try {
      await updateMessage(id, editText.trim())
      setSuccess('แก้ไขข้อความสำเร็จ')
      setEditingId(null)
      setEditText('')
      loadMessages()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการแก้ไข')
      console.error(err)
    }
  }

  const handleReport = async (id: string) => {
    if (!reportReason.trim()) {
      setError('กรุณาระบุเหตุผลในการรายงาน')
      return
    }

    try {
      await reportMessage(id, reportReason.trim())
      setSuccess('รายงานข้อความสำเร็จ ข้อความจะถูกย้ายกลับไปสถานะรอตรวจสอบ')
      setReportingId(null)
      setReportReason('')
      loadMessages()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการรายงาน')
      console.error(err)
    }
  }

  const startEdit = (message: PledgeMessage) => {
    setEditingId(message.id)
    setEditText(message.message)
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const startReport = (id: string) => {
    setReportingId(id)
    setReportReason('')
    setError('')
  }

  const cancelReport = () => {
    setReportingId(null)
    setReportReason('')
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { text: 'รอตรวจสอบ', class: 'badge-pending' },
      approved: { text: 'อนุมัติแล้ว', class: 'badge-approved' },
      rejected: { text: 'ปฏิเสธ', class: 'badge-rejected' }
    }
    const badge = badges[status as keyof typeof badges] || badges.pending
    return <span className={`badge ${badge.class as string}` as string}>{badge.text}</span>
  }

  const filteredMessages = messages.filter((msg: PledgeMessage) => {
    if (filter === 'all') return true
    return msg.status === filter
  })

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>⚙️ จัดการข้อความ</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowApproveAllConfirm(true)} 
            className="approve-all-btn"
            disabled={messages.filter(m => m.status === 'pending').length === 0}
          >
            ✅ อนุมัติทั้งหมด ({messages.filter(m => m.status === 'pending').length})
          </button>
          <button onClick={loadMessages} className="refresh-btn">
            🔄 รีเฟรช
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          ทั้งหมด ({messages.length})
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          รอตรวจสอบ ({messages.filter(m => m.status === 'pending').length})
        </button>
        <button
          className={filter === 'approved' ? 'active' : ''}
          onClick={() => setFilter('approved')}
        >
          อนุมัติแล้ว ({messages.filter(m => m.status === 'approved').length})
        </button>
        <button
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          ปฏิเสธ ({messages.filter(m => m.status === 'rejected').length})
        </button>
      </div>

      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            handleDelete(deleteConfirmId)
            setDeleteConfirmId(null)
          }
        }}
        title="ยืนยันการลบ"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อความนี้? การกระทำนี้ไม่สามารถยกเลิกได้"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        confirmButtonStyle="danger"
      />

      <Modal
        isOpen={showApproveAllConfirm}
        onClose={() => setShowApproveAllConfirm(false)}
        onConfirm={() => {
          handleApproveAll()
          setShowApproveAllConfirm(false)
        }}
        title="ยืนยันการอนุมัติทั้งหมด"
        message={`คุณแน่ใจหรือไม่ว่าต้องการอนุมัติข้อความที่รอตรวจสอบทั้งหมด? (${messages.filter(m => m.status === 'pending').length} ข้อความ)`}
        confirmText="อนุมัติทั้งหมด"
        cancelText="ยกเลิก"
        confirmButtonStyle="primary"
      />

      {filteredMessages.length === 0 ? (
        <div className="empty-state">
          <p>ไม่มีข้อความ{filter !== 'all' && `ในหมวด ${filter}`}</p>
        </div>
      ) : (
        <div className="admin-messages">
          {filteredMessages.map((message) => (
            <div key={message.id} className="admin-message-card">
              <div className="message-info">
                <div className="info-row">
                  <span className="author">{message.author || 'Anonymous'}</span>
                  {getStatusBadge(message.status)}
                </div>
                <div className="info-row">
                  <span className="date">{formatDate(message.createdAt)}</span>
                  {message.reportedCount && message.reportedCount > 0 && (
                    <span className="reported">
                      ⚠️ รายงาน {message.reportedCount} ครั้ง
                    </span>
                  )}
                </div>
                {message.reportedReason && (
                  <div className="report-reason">
                    เหตุผล: {message.reportedReason}
                  </div>
                )}
              </div>

              {editingId === message.id ? (
                <div className="edit-form">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    className="edit-textarea"
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleEdit(message.id)}
                      className="btn-save"
                    >
                      บันทึก
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn-cancel"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="message-content">
                  {message.message}
                </div>
              )}

              {reportingId === message.id ? (
                <div className="report-form">
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="ระบุเหตุผลในการรายงาน..."
                    rows={3}
                    className="report-textarea"
                  />
                  <div className="report-actions">
                    <button
                      onClick={() => handleReport(message.id)}
                      className="btn-report"
                    >
                      ส่งรายงาน
                    </button>
                    <button
                      onClick={cancelReport}
                      className="btn-cancel"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="message-actions">
                  {message.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(message.id)}
                        className="btn-approve"
                      >
                        ✅ อนุมัติ
                      </button>
                      <button
                        onClick={() => handleReject(message.id)}
                        className="btn-reject"
                      >
                        ❌ ปฏิเสธ
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => startEdit(message)}
                    className="btn-edit"
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    onClick={() => startReport(message.id)}
                    className="btn-report-action"
                  >
                    🚨 รายงาน
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(message.id)}
                    className="btn-delete"
                  >
                    🗑️ ลบ
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminPage


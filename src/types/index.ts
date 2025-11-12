export interface PledgeMessage {
  id: string
  message: string
  author?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
  reportedCount?: number
  reportedReason?: string
}

export interface MessageFormData {
  message: string
  author?: string
}


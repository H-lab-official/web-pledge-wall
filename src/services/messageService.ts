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
import { PledgeMessage } from '../types'

const MESSAGES_COLLECTION = 'pledgeMessages'

export const submitMessage = async (message: string, author?: string): Promise<string> => {
  const messageData = {
    message,
    author: author || 'Anonymous',
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    reportedCount: 0
  }

  const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData)
  return docRef.id
}

export const getApprovedMessages = async (): Promise<PledgeMessage[]> => {
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

export const getAllMessages = async (): Promise<PledgeMessage[]> => {
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

export const approveMessage = async (messageId: string): Promise<void> => {
  const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
  await updateDoc(messageRef, {
    status: 'approved',
    updatedAt: Timestamp.now()
  })
}

export const rejectMessage = async (messageId: string): Promise<void> => {
  const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
  await updateDoc(messageRef, {
    status: 'rejected',
    updatedAt: Timestamp.now()
  })
}

export const updateMessage = async (messageId: string, newMessage: string): Promise<void> => {
  const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
  await updateDoc(messageRef, {
    message: newMessage,
    status: 'pending',
    updatedAt: Timestamp.now()
  })
}

export const deleteMessage = async (messageId: string): Promise<void> => {
  const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
  await deleteDoc(messageRef)
}

export const reportMessage = async (messageId: string, reason: string): Promise<void> => {
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

export const getMessageById = async (messageId: string): Promise<PledgeMessage | null> => {
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


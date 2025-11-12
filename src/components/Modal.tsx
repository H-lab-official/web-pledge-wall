import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  onConfirm?: () => void
  children?: React.ReactNode
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmButtonStyle?: 'primary' | 'danger'
  type?: 'error' | 'success' | 'info'
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  children, 
  title,
  message,
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  confirmButtonStyle = 'primary',
  type = 'info' 
}) => {
  const typeStyles = {
    error: 'border-red-300 bg-red-50 text-red-700',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    info: 'border-blue-300 bg-blue-50 text-blue-700'
  }

  const buttonStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative mx-4 max-w-md rounded-3xl border-2 px-8 py-6 shadow-2xl ${typeStyles[type]}`}
            onClick={(e) => e.stopPropagation()}
          >
            {title && <h3 className="mb-4 text-xl font-bold">{title}</h3>}
            
            {message && <p className="mb-6 text-base">{message}</p>}
            
            {children}
            
            {onConfirm && (
              <div className="mt-6 flex justify-end gap-3">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={onConfirm}
                  className={`rounded-lg px-4 py-2 transition ${buttonStyles[confirmButtonStyle]}`}
                >
                  {confirmText}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal

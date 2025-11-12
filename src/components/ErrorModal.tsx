import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuCircleX } from "react-icons/lu";
interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center "
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative mx-4 max-w-md rounded-3xl border-2 border-red-300 bg-[#F1E6F2] px-8 py-6 text-red-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 rounded-full  text-white flex flex-col items-center justify-center gap-2 w-72 h-48">
              <LuCircleX className="w-16 h-16 text-red-500" />

              <p className="text-xl font-medium text-red-500">{message}</p>
              <p className="text-sm text-black">Please use respectful language.</p>
              <button className="bg-[#6F7DFD] text-white px-4 py-2 rounded-full w-24 h-10" onClick={onClose}>OK</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ErrorModal


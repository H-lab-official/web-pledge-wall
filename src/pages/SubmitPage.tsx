import React, { useState, useEffect } from 'react'

import { checkProfanity } from '../utils/profanityFilter'
import { submitMessage } from '../services/messageService'
import Logo from '../assets/images/logo.svg'
import { GrLinkNext } from "react-icons/gr";
import { motion, AnimatePresence } from 'framer-motion'
import FormInput from '../components/FormInput'
import FormTextarea from '../components/FormTextarea'
import ErrorModal from '../components/ErrorModal'

const SubmitPage = () => {
  const [flowState, setFlowState] = useState<'start' | 'form' | 'success'>('start')
  const [message, setMessage] = useState('')
  const [author, setAuthor] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shakeAuthor, setShakeAuthor] = useState(false)
  const [shakeMessage, setShakeMessage] = useState(false)
  const [showProfanityModal, setShowProfanityModal] = useState(false)
  const [countdown, setCountdown] = useState(15)

  const logoVariants = {
    start: { y: 200, scale: 1 },
    form: { y: 80, scale: 1 },
    success: { y: 250, scale: 1 }
  }

  // Countdown timer for success state
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    
    if (flowState === 'success') {
      setCountdown(15)
      
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setFlowState('start')
            return 15
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [flowState])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    setSuccess(false)
    setShakeAuthor(false)
    setShakeMessage(false)
    // Check if both fields are empty
    if (!author.trim() && !message.trim()) {
      setError('กรุณากรอกชื่อและข้อความ')
      setShakeAuthor(true)
      setShakeMessage(true)
      setTimeout(() => {
        setShakeAuthor(false)
        setShakeMessage(false)
      }, 500)
      return
    }
    // Check if author is empty (optional: remove this if author is not required)
    if (!author.trim()) {
      setError('กรุณากรอกชื่อ')
      setShakeAuthor(true)
      setTimeout(() => setShakeAuthor(false), 500)
      return
    }

    // Check if message is empty
    if (!message.trim()) {
      setError('กรุณากรอกข้อความ')
      setShakeMessage(true)
      setTimeout(() => setShakeMessage(false), 500)
      return
    }

    // Check message length
    // if (message.trim().length < 10) {
    //   setError('ข้อความต้องมีความยาวอย่างน้อย 10 ตัวอักษร')
    //   setShakeMessage(true)
    //   setTimeout(() => setShakeMessage(false), 500)
    //   return
    // }

    // Check for profanity
    if (checkProfanity(message)) {
      setError('Profanity detected')
      setShowProfanityModal(true)
      return
    }

    setLoading(true)
    try {
      console.log('Submitting message:', message.trim(), 'Author:', author.trim() || 'Anonymous')
      const messageId = await submitMessage(message.trim(), author.trim() || undefined)
      console.log('Message submitted successfully. ID:', messageId)
      setSuccess(true)
      setFlowState('success')
      setMessage('')
      setAuthor('')
    } catch (err) {
      console.error('Error submitting message:', err)
      setError('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง')
      setShakeMessage(true)
      setTimeout(() => setShakeMessage(false), 500)
    } finally {
      setLoading(false)
    }
  }

  console.log(loading)
  console.log(success)
  console.log(error)
  console.log(author)
  console.log(message)
  console.log(shakeAuthor)
  console.log(shakeMessage)
  console.log(showProfanityModal)
  console.log(flowState)

  return (
    <div className="relative w-full min-h-screen overflow-hidden ">
      <style>{`
        @keyframes floatLayer1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -30px) scale(1.02); }
        }
        
        @keyframes floatLayer2 {
          0%, 100% { transform: translate(00px, 400px) rotate(320deg) scale(1); }
          50% { transform: translate(0px, 420px) rotate(320deg) scale(1); }
        }
        
        @keyframes floatLayer3 {
          0%, 100% { transform: translate(-500px, 550px) scale(1); }
          50% { transform: translate(-300px, 150px) scale(1.01); }
        }
        
        @keyframes floatLayer4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -15px) scale(0.99); }
        }
        
        @keyframes floatLayer5 {
          0%, 100% { transform: translate(200px, 80px) scale(1); }
          50% { transform: translate(200px, 80px) scale(1.03); }
        }
        
        .floating-layer-1 {
          animation: floatLayer1 6s ease-in-out infinite;
        }
        
        .floating-layer-2 {
          animation: floatLayer2 7.5s ease-in-out infinite;
          animation-delay: -3s;
        }
        
        .floating-layer-3 {
          animation: floatLayer3 5s ease-in-out infinite;
          animation-delay: -5s;
        }
        
        .floating-layer-4 {
          animation: floatLayer4 7s ease-in-out infinite;
          animation-delay: -7s;
        }
        
        .floating-layer-5 {
          animation: floatLayer5 5.5s ease-in-out infinite;
          animation-delay: -2s;
        }
      `}</style>

      {/* Background layers from testttttttt.svg */}
      <div className="pointer-events-none absolute inset-0 w-full h-full opacity-100">
        <svg
          width="100%"
          height="100%"
          viewBox="80 100 1880 1080"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="lg2" x1="1237.98" y1="210.74" x2="1352.64" y2="375.31" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff66c4"/>
              <stop offset="1" stopColor="#ffb800"/>
            </linearGradient>
            <linearGradient id="lg4" x1="189.92" y1="-4.23" x2="-320.74" y2="-172.93" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#00a1b5"/>
              <stop offset="1" stopColor="#a1e4cd"/>
            </linearGradient>
            <linearGradient id="lg8" x1="862.84" y1="-297.92" x2="816.39" y2="-589.63" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#6e7cff"/>
              <stop offset="1" stopColor="#8dacc3"/>
            </linearGradient>
            <clipPath id="clippath-5">
              <rect x=".3" y="0" width="1919.7" height="1080"/>
            </clipPath>
          </defs>
          
          <g className="floating-layer-5" clipPath="url(#clippath-5)">
            <path d="m454.3,129.32c-44.54-57.31-89.09-114.63-133.63-171.94-39.86-51.29-82.1-112.68-66.52-175.74,20.47-82.84,124.62-112.11,174.5-181.35,33.21-46.09,38.95-110.52,14.42-161.76-12.57-26.27-32.15-48.69-44.87-74.89-32.75-67.42-15.53-147.74,7.57-219.04,13.52-41.71,28.84-86.74,20.57-128.67H-238.09V780.42c17.11-1.07,34.15-3.45,49.98-7.64,37.09-9.82,67.54-29.62,76.62-66.1,4.16-16.7,2.71-34.95,6.48-51.44,3.41-14.91,11.08-28.37,31.01-37.95,26.07-12.52,56.82-10.93,82.38,2.61,14.87,7.87,35.61,13.91,56.4,15.82,38.99,3.59,78.11-7.36,78.87-48.01.14-7.32-1.46-14.58-3.84-21.51-4.3-12.49-8.96-24.86-13.94-37.09-14.21-34.84-31.17-68.56-50.71-100.72-10.4-17.13-11.61-38.93-1.6-56.29,14.66-25.43,39-21.29,60.41-16.8l50,10.5,114.27,23.99c7.97,1.67,16.63.22,22.76-5.15,9.16-8.02,5.95-18.56,2.73-27.76l-23.16-66.17-42.45-121.3c-9.03-25.79,17.4-49.75,42.19-38.24l192.15,89.22c.63-9.28.06-18.58-2.1-27.75-5.62-23.83-21.04-43.97-36.07-63.3Z" 
                  fill="url(#lg4)" opacity="1"/>
       
          
            <path className="cls-2" d="m300.32,131.15c-24.79-11.51-51.22,12.45-42.19,38.24l42.45,121.3,23.16,66.17c3.22,9.21,6.44,19.74-2.73,27.76-6.13,5.37-14.78,6.82-22.76,5.15l-114.27-23.99-50-10.5c-21.41-4.5-45.75-8.63-60.41,16.8-10.01,17.36-8.8,39.16,1.6,56.29,19.54,32.16,36.5,65.88,50.71,100.72,4.99,12.23,9.64,24.6,13.94,37.09,2.38,6.92,3.98,14.19,3.84,21.51-.76,40.65-39.88,51.6-78.87,48.01-20.78-1.91-41.52-7.95-56.4-15.82-25.56-13.53-56.31-15.13-82.38-2.61-19.94,9.57-27.61,23.04-31.01,37.95-3.77,16.49-2.32,34.75-6.48,51.44-9.08,36.48-39.54,56.28-76.62,66.1-15.83,4.19-32.88,6.57-49.98,7.64v295.68H307.16c-3.02-47.31,14.39-95.63,47.04-130.03,36.24-38.19,91.39-62.1,108.83-111.77,12.91-36.77.86-77.26-12.93-113.71-18.84-49.8-40.97-98.35-66.2-145.23-10.13-18.82-20.89-37.71-25.49-58.58-9.55-43.33,8.97-88.17,33.92-124.86,24.95-36.68,56.63-68.72,78.68-107.22,7.1-12.38,13.15-25.77,17.04-39.56,2.3-8.15,3.85-16.45,4.42-24.77l-192.15-89.22Z" 
                  fill="url(#lg8)" opacity="1"/>
            <path className="cls-10" d="m426.34-984.08c8.27,41.93-7.06,86.96-20.57,128.67-23.1,71.3-40.32,151.62-7.57,219.04,12.72,26.2,32.3,48.62,44.87,74.89,24.53,51.24,18.78,115.67-14.42,161.76-49.88,69.24-154.03,98.51-174.5,181.35-15.58,63.06,26.65,124.45,66.52,175.74,44.54,57.31,89.09,114.63,133.63,171.94,15.03,19.33,30.45,39.47,36.07,63.3,2.16,9.16,2.73,18.47,2.1,27.75l57.81,26.84c22.99,10.67,49.68,21.58,72.3,3.47,4.05-3.24,7.41-7.1,10.1-11.38,6.29-10.03,8.83-22.36,7.54-34.46-.61-5.75-1.79-11.18-3.41-16.37h0c-9.19-29.41-33.03-50.67-53.7-73.12-18.95-20.59-35.75-43.14-50.15-67.13-32.67-54.44,18.62-121.5,79.84-104.68,19.16,5.26,38.18,11,57.06,17.2,55.54,18.26,109.42-32.26,95.92-89.15l-13.28-55.95c-1.93-8.12-3.72-17.2.56-24.36,4.6-7.68,14.38-10.16,23.15-11.96,41.06-8.41,63.25-53.44,44.51-90.93-23.11-46.22-30.29-100.61-17.4-150.74,2.84-11.06,7.12-22.65,16.49-29.16,9.84-6.84,22.9-6.44,34.77-4.78,57.78,8.07,109.45,38.77,163.28,61.28,30.17,12.62,63.2,22.61,95.67,24.54,40.18,2.38,73.61-30.77,73.39-71.02h0c-.21-38.01,29.68-69.37,67.66-70.99l79.34-3.38c8.6-.37,18.02-1.07,24.2-7.06,7.34-7.12,7.19-18.75,6.49-28.95-5.19-75.93-12.2-151.74-21.01-227.34-3.72-31.89,10.56-61.08,34.13-78.36v-86.51H426.34Z" 
                  fill="url(#lg2)" opacity="1"/>
          </g>
        </svg>
      </div>

      {/* Main content (ของเดิมทั้งหมด เอามาห่อไว้เฉยๆ) */}
      <div className="relative z-10">
        <div className='w-full flex justify-center items-center pt-10'>
          <motion.img
            key="logo"
            src={Logo}
            alt="Logo"
            initial={{ y: 0, scale: 1, opacity: 0 }}
            animate={{ ...logoVariants[flowState], opacity: 1 }}
            transition={{ type: 'spring', stiffness: 130, damping: 16, mass: 0.9 }}
            className="h-24 w-auto"
          />
        </div>
        
        <AnimatePresence mode="wait">
          {flowState === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='w-full flex flex-col justify-center items-center h-screen py-20 gap-30'
            >
              <div className='flex flex-col items-center justify-center'>
                <p className='text-2xl font-thin font-inter text-[#FF8585]'>Share your wish for wellbeing with</p>
                <p className='text-8xl font-bold font-anuphan text-[#FF8585]'>Wishing well</p>
              </div>
              <button
                onClick={() => setFlowState('form')}
                className='flex items-center gap-2 bg-[#6F7DFD] text-white px-6 py-4 rounded-full text-5xl w-64 h-20 justify-center'
              >
                Start
                <GrLinkNext className='text-4xl' />
              </button>
            </motion.div>
          )}

          {flowState === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='w-full flex flex-col justify-center items-center h-screen py-20 gap-8'
            >
              <form onSubmit={handleSubmit} className='flex w-full max-w-4xl flex-col gap-8 relative'>
                <FormInput
                  label="Your Name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  containerClassName="flex w-full flex-col sm:flex-row sm:items-center sm:gap-4"
                  className="flex-1 min-w-0 bg-black/10"
                  shake={shakeAuthor && !author.trim()}
                />
                <FormTextarea
                  label="Your Wish"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  containerClassName="flex w-full flex-col sm:flex-row sm:items-start sm:gap-4"
                  className="flex-1 min-w-0 bg-black/10"
                  shake={shakeMessage && !message.trim()}
                />
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className='absolute right-0 -bottom-30 flex items-center justify-center text-3xl text-white bg-[#6F7DFD] p-5 rounded-full h-20 w-20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? (
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <GrLinkNext className='text-3xl' />
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {flowState === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className='w-full flex flex-col justify-center items-center h-screen py-20 gap-30'
            >
              <div className='flex flex-col items-center justify-center gap-4'>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className='text-8xl font-semibold font-anuphan text-[#FF8585]'
                >
                  Beautiful wish!
                </motion.p>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className='text-2xl font-thin font-inter text-[#FF8585]'
                >
                  Look up to see it among others in the Wishing Well. {countdown} sec
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Modal */}
        <ErrorModal 
          isOpen={showProfanityModal} 
          onClose={() => setShowProfanityModal(false)} 
          message={error}
        />
      </div>
    </div>
  )
}

export default SubmitPage

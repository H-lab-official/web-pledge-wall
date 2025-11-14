import React, { useState, useEffect, useMemo, useRef } from 'react'

import { checkProfanity } from '../utils/profanityFilter'
import { submitMessage } from '../services/messageService'
import Logo from '../assets/images/logo.svg'
import { GrLinkNext } from "react-icons/gr";
import { motion, AnimatePresence } from 'framer-motion'
import FormInput from '../components/FormInput'
// import FormTextarea from '../components/FormTextarea'
import ErrorModal from '../components/ErrorModal'

// Import keyboard sound
import keyboardSound from '../assets/sounds/keyboard-click.mp3'

const SubmitPage = () => {
  const [flowState, setFlowState] = useState<'start' | 'form' | 'success'>('start')
  const [message, setMessage] = useState('')
  const [author, setAuthor] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shakeAuthor, setShakeAuthor] = useState(false)
  const [shakeMessage, setShakeMessage] = useState(false)
  const [showProfanityModal, setShowProfanityModal] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const [isTransitioningToSuccess, setIsTransitioningToSuccess] = useState(false)
  const [showBackgroundSVG, setShowBackgroundSVG] = useState(true)

  // Audio for keyboard clicks
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const isAudioInitialized = useRef(false)

  const logoVariants = {
    start: { y: 200, scale: 1 },
    form: { y: 150, scale: 1 },
    success: { y: 250, scale: 1 }
  }

  // Resume audio เมื่อเข้าหน้า form (สำคัญสำหรับ iOS!)
  useEffect(() => {
    if (flowState === 'form' && audioContextRef.current) {
      const resumeAudio = async () => {
        try {
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            console.log('🔊 Resuming audio for form state...')
            await audioContextRef.current.resume()
            console.log('✅ Audio resumed, state:', audioContextRef.current.state)
          }
        } catch (error) {
          console.error('Failed to resume audio:', error)
        }
      }
      resumeAudio()
    }
  }, [flowState])

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = async () => {
      if (isAudioInitialized.current) return

      try {
        // สร้าง AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContextClass()

        // Load ไฟล์เสียง
        const response = await fetch(keyboardSound)
        const arrayBuffer = await response.arrayBuffer()
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer)

        isAudioInitialized.current = true
        console.log('🔊 Audio initialized with custom sound')
      } catch (error) {
        console.error('Failed to initialize audio:', error)
      }
    }

    // Initialize หลังจาก user interaction
    const handleFirstInteraction = () => {
      initAudio()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('touchstart', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
      if (audioContextRef.current?.state === 'running') {
        audioContextRef.current.close()
      }
    }
  }, [])

  // เก็บค่าก่อนหน้าเพื่อเช็คว่ามีการเปลี่ยนแปลง
  const prevAuthorRef = useRef('')
  const prevMessageRef = useRef('')
  
  // Refs for input fields
  const authorInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  // ฟังก์ชันเล่นเสียงแป้นพิมพ์ (iOS-friendly)
  const playKeySound = async () => {
    if (!audioContextRef.current) {
      console.warn('AudioContext not initialized')
      return
    }

    try {
      // Resume AudioContext ถ้า suspended (สำคัญสำหรับ iOS!)
      if (audioContextRef.current.state === 'suspended') {
        console.log('Resuming AudioContext...')
        await audioContextRef.current.resume()
      }

      // เช็คอีกครั้งหลัง resume
      if (audioContextRef.current.state !== 'running') {
        console.warn('AudioContext state:', audioContextRef.current.state)
        return
      }

      // ถ้ามีไฟล์เสียง - ใช้ buffer
      if (audioBufferRef.current) {
        const source = audioContextRef.current.createBufferSource()
        const gainNode = audioContextRef.current.createGain()
        
        source.buffer = audioBufferRef.current
        source.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)
        
        gainNode.gain.value = 0.5 // เพิ่มความดังสำหรับ iOS
        source.start(0)
      } else {
        // ถ้าไม่มีไฟล์ - สร้างเสียงสั้นๆ (fallback)
        console.log('Using generated sound (fallback)')
        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)
        
        oscillator.frequency.value = 800 // เสียงสูง (Hz)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.04)
        
        oscillator.start(audioContextRef.current.currentTime)
        oscillator.stop(audioContextRef.current.currentTime + 0.04) // เล่น 40ms
      }
    } catch (error) {
      console.error('Error playing key sound:', error)
    }
  }

  // Handle input change with sound for Author
  const handleAuthorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // เล่นเสียงเฉพาะเมื่อมีการพิมพ์เพิ่ม (ไม่ใช่การลบ)
    if (newValue.length > prevAuthorRef.current.length) {
      await playKeySound()
    }
    prevAuthorRef.current = newValue
    setAuthor(newValue)
  }

  // Handle input change with sound for Message
  const handleMessageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // เล่นเสียงเฉพาะเมื่อมีการพิมพ์เพิ่ม (ไม่ใช่การลบ)
    if (newValue.length > prevMessageRef.current.length) {
      await playKeySound()
    }
    prevMessageRef.current = newValue
    setMessage(newValue)
  }

  // Countdown timer for success state
  useEffect(() => {
    if (flowState !== 'success') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Fade out background ก่อน
          setShowBackgroundSVG(false)
          // เปลี่ยน state หลัง 400ms
          setTimeout(() => {
            setFlowState('start')
          }, 400)
          // Fade in background หลัง 600ms
          setTimeout(() => {
            setShowBackgroundSVG(true)
          }, 600)
          return 15
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [flowState])

  // Handle Enter key press on start screen
  useEffect(() => {
    if (flowState !== 'start') return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setFlowState('form')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [flowState])

  // Auto focus on first input when entering form
  useEffect(() => {
    if (flowState !== 'form' || isTransitioningToSuccess) return

    const focusInput = () => {
      const input = authorInputRef.current
      if (input) {
        input.focus()
        const length = input.value.length
        input.setSelectionRange(length, length)
      }
    }

    // Run immediately in case input already mounted
    focusInput()

    // Multiple attempts to ensure focus works on all devices
    const timer1 = setTimeout(focusInput, 100)
    const timer2 = setTimeout(focusInput, 300)
    const timer3 = setTimeout(() => {
      requestAnimationFrame(focusInput)
    }, 500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [flowState, isTransitioningToSuccess])

  // Handle Enter key on author input (move to next field)
  const handleAuthorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      messageInputRef.current?.focus()
    }
  }

  // Handle Enter key on message input (submit form)
  const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    setShakeAuthor(false)
    setShakeMessage(false)

    // Check for profanity FIRST (even if only one field is filled)
    const hasProfanityInAuthor = author.trim() && checkProfanity(author)
    const hasProfanityInMessage = message.trim() && checkProfanity(message)

    if (hasProfanityInAuthor || hasProfanityInMessage) {
      setError('Profanity detected')
      setShowProfanityModal(true)

      // Clear the field(s) that contain profanity
      if (hasProfanityInAuthor) {
        setAuthor('')
      }
      if (hasProfanityInMessage) {
        setMessage('')
      }

      return
    }

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

    setLoading(true)
    try {
      console.log('Submitting message:', message.trim(), 'Author:', author.trim() || 'Anonymous')
      const messageId = await submitMessage(message.trim(), author.trim() || undefined)
      console.log('Message submitted successfully. ID:', messageId)
      setLoading(false)

      // Start wave transition immediately
      setIsTransitioningToSuccess(true)
      setShowBackgroundSVG(false) // Hide background SVG

      // Start fading in background SVG (ขณะที่ wave กำลังเลื่อนขึ้น)
      setTimeout(() => {
        setShowBackgroundSVG(true)
      }, 1200) // 1.2 seconds - wave กำลังเลื่อนขึ้นไป

      // Change to success state when wave is in the middle (1 second)
      setTimeout(() => {
        setCountdown(15) // Reset countdown before entering success state
        setFlowState('success')
      }, 1000) // 1 second - wave อยู่กลางหน้าจอ

      // Hide wave transition after animation completes
      setTimeout(() => {
        setIsTransitioningToSuccess(false)
      }, 2300) // 2.3 seconds total

      setMessage('')
      setAuthor('')
    } catch (err) {
      console.error('Error submitting message:', err)
      setError('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง')
      setShakeMessage(true)
      setTimeout(() => setShakeMessage(false), 500)
      setLoading(false)
    }
  }

  // Memoize background SVG to prevent re-render when flowState changes
  const backgroundSVG = useMemo(() => (
    <div className="pointer-events-none absolute inset-0 w-full h-full" style={{ 
      opacity: showBackgroundSVG ? 1 : 0,
      transition: 'opacity 1s ease-in-out'
    }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 700"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="gradient-wave-0" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="5%" stopColor="#F78DA7" />
            <stop offset="95%" stopColor="#8ED1FC" />
          </linearGradient>
          <linearGradient id="gradient-wave-1" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="5%" stopColor="#F78DA7" />
            <stop offset="95%" stopColor="#8ED1FC" />
          </linearGradient>
          <linearGradient id="gradient-wave-2" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="5%" stopColor="#F78DA7" />
            <stop offset="95%" stopColor="#8ED1FC" />
          </linearGradient>
          <linearGradient id="gradient-wave-3" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="5%" stopColor="#F78DA7" />
            <stop offset="95%" stopColor="#8ED1FC" />
          </linearGradient>
        </defs>

        <g className="floating-layer-5">
          <path
            className="path-0"
            fill="url(#gradient-wave-0)"
            fillOpacity="0.265"
          >
            <animate
              attributeName="d"
              dur="4s"
              repeatCount="indefinite"
              values="
                M 0,700 L 0,105 C 79.59,99.91 159.18,94.82 230,108 C 300.82,121.18 362.86,152.62 421,152 C 479.14,151.38 533.39,118.69 590,95 C 646.61,71.31 705.59,56.63 784,71 C 862.41,85.37 960.27,128.79 1033,147 C 1105.73,165.21 1153.35,158.20 1217,147 C 1280.65,135.80 1360.32,120.40 1440,105 L 1440,700 L 0,700 Z;
                M 0,700 L 0,105 C 48.44,112.68 96.89,120.37 176,105 C 255.11,89.63 364.90,51.21 439,58 C 513.10,64.79 551.52,116.78 619,142 C 686.48,167.22 783.01,165.66 847,141 C 910.99,116.34 942.42,68.59 998,67 C 1053.58,65.41 1133.31,109.97 1211,124 C 1288.69,138.03 1364.35,121.51 1440,105 L 1440,700 L 0,700 Z;
                M 0,700 L 0,105 C 57.80,103.86 115.61,102.72 191,98 C 266.39,93.28 359.38,84.96 429,91 C 498.62,97.04 544.89,117.42 615,123 C 685.11,128.58 779.06,119.36 848,118 C 916.94,116.64 960.87,123.13 1030,120 C 1099.13,116.87 1193.47,104.10 1266,100 C 1338.53,95.90 1389.27,100.45 1440,105 L 1440,700 L 0,700 Z;
                M 0,700 L 0,105 C 62.27,90.40 124.53,75.81 188,77 C 251.47,78.19 316.13,95.17 398,100 C 479.87,104.83 578.95,97.49 654,99 C 729.05,100.51 780.08,110.85 844,124 C 907.92,137.15 984.75,153.12 1050,152 C 1115.25,150.88 1168.93,132.68 1232,122 C 1295.07,111.32 1367.54,108.16 1440,105 L 1440,700 L 0,700 Z;
                M 0,700 L 0,105 C 79.59,99.91 159.18,94.82 230,108 C 300.82,121.18 362.86,152.62 421,152 C 479.14,151.38 533.39,118.69 590,95 C 646.61,71.31 705.59,56.63 784,71 C 862.41,85.37 960.27,128.79 1033,147 C 1105.73,165.21 1153.35,158.20 1217,147 C 1280.65,135.80 1360.32,120.40 1440,105 L 1440,700 L 0,700 Z
              "
            />
          </path>
          <path
            className="path-1"
            fill="url(#gradient-wave-1)"
            fillOpacity="0.4"
          >
            <animate
              attributeName="d"
              dur="4s"
              repeatCount="indefinite"
              values="
                M 0,700 L 0,245 C 57.31,241.43 114.62,237.86 192,233 C 269.38,228.14 366.82,221.98 442,230 C 517.18,238.02 570.08,260.22 633,261 C 695.92,261.78 768.84,241.15 832,224 C 895.16,206.85 948.54,193.19 1012,202 C 1075.46,210.81 1148.99,242.09 1222,253 C 1295.01,263.91 1367.51,254.46 1440,245 L 1440,700 L 0,700 Z;
                M 0,700 L 0,245 C 49.44,255.53 98.89,266.06 177,250 C 255.11,233.94 361.89,191.30 444,200 C 526.11,208.70 583.55,268.74 648,292 C 712.45,315.26 783.91,301.75 855,275 C 926.09,248.25 996.79,208.26 1064,193 C 1131.21,177.74 1194.92,187.21 1257,200 C 1319.08,212.79 1379.54,228.89 1440,245 L 1440,700 L 0,700 Z;
                M 0,700 L 0,245 C 77.70,242.03 155.39,239.06 230,237 C 304.61,234.94 376.13,233.81 435,243 C 493.87,252.19 540.10,271.72 615,273 C 689.90,274.28 793.46,257.30 859,260 C 924.54,262.70 952.07,285.07 1009,279 C 1065.93,272.93 1152.27,238.41 1229,228 C 1305.73,217.59 1372.87,231.30 1440,245 L 1440,700 L 0,700 Z;
                M 0,700 L 0,245 C 78.44,255.39 156.88,265.78 228,269 C 299.12,272.22 362.92,268.28 431,268 C 499.08,267.72 571.43,271.11 632,266 C 692.57,260.89 741.35,247.28 807,235 C 872.65,222.72 955.18,211.77 1027,215 C 1098.82,218.23 1159.95,235.64 1227,243 C 1294.05,250.36 1367.03,247.68 1440,245 L 1440,700 L 0,700 Z;
                M 0,700 L 0,245 C 57.31,241.43 114.62,237.86 192,233 C 269.38,228.14 366.82,221.98 442,230 C 517.18,238.02 570.08,260.22 633,261 C 695.92,261.78 768.84,241.15 832,224 C 895.16,206.85 948.54,193.19 1012,202 C 1075.46,210.81 1148.99,242.09 1222,253 C 1295.01,263.91 1367.51,254.46 1440,245 L 1440,700 L 0,700 Z
              "
            />
          </path>
          <path
            className="path-2"
            fill="url(#gradient-wave-2)"
            fillOpacity="0.53"
          >
            <animate
              attributeName="d"
              dur="4s"
              repeatCount="indefinite"
              values="
                M 0,700 L 0,385 C 52.41,375.12 104.82,365.23 175,359 C 245.18,352.77 333.13,350.19 404,368 C 474.87,385.81 528.66,424.00 593,417 C 657.34,410.00 732.21,357.80 810,341 C 887.79,324.20 968.48,342.78 1038,344 C 1107.52,345.22 1165.86,329.06 1231,333 C 1296.14,336.94 1368.07,360.97 1440,385 L 1440,700 L 0,700 Z;
                M 0,700 L 0,385 C 80.73,395.12 161.46,405.24 222,406 C 282.54,406.76 322.87,398.17 391,386 C 459.13,373.83 555.04,358.07 623,354 C 690.96,349.93 730.96,357.54 791,357 C 851.04,356.46 931.13,347.78 1014,365 C 1096.87,382.22 1182.54,425.35 1254,433 C 1325.46,440.65 1382.73,412.83 1440,385 L 1440,700 L 0,700 Z;
                M 0,700 L 0,385 C 53.78,398.00 107.56,411.00 176,412 C 244.44,413.00 327.54,401.99 415,389 C 502.46,376.01 594.27,361.04 650,354 C 705.73,346.96 725.39,347.83 794,357 C 862.61,366.17 980.16,383.62 1060,390 C 1139.84,396.38 1181.95,391.68 1239,389 C 1296.05,386.32 1368.02,385.66 1440,385 L 1440,700 L 0,700 Z;
                M 0,700 L 0,385 C 73.82,392.96 147.63,400.93 217,385 C 286.37,369.07 351.28,329.25 420,338 C 488.72,346.75 561.23,404.07 621,416 C 680.77,427.93 727.79,394.47 788,378 C 848.21,361.53 921.59,362.07 996,358 C 1070.41,353.93 1145.83,345.27 1220,349 C 1294.17,352.73 1367.08,368.87 1440,385 L 1440,700 L 0,700 Z;
                M 0,700 L 0,385 C 52.41,375.12 104.82,365.23 175,359 C 245.18,352.77 333.13,350.19 404,368 C 474.87,385.81 528.66,424.00 593,417 C 657.34,410.00 732.21,357.80 810,341 C 887.79,324.20 968.48,342.78 1038,344 C 1107.52,345.22 1165.86,329.06 1231,333 C 1296.14,336.94 1368.07,360.97 1440,385 L 1440,700 L 0,700 Z
              "
            />
          </path>
          <path
            className="path-3"
            fill="url(#gradient-wave-3)"
            fillOpacity="1"
          >
            <animate
              attributeName="d"
              dur="4s"
              repeatCount="indefinite"
              values="
                M 0,700 L 0,525 C 56.15,502.82 112.30,480.64 176,495 C 239.70,509.36 310.96,560.25 386,571 C 461.04,581.75 539.86,552.36 617,526 C 694.14,499.64 769.60,476.33 828,485 C 886.40,493.67 927.72,534.33 1004,539 C 1080.28,543.67 1191.51,512.33 1270,504 C 1348.49,495.67 1394.25,510.33 1440,525 L 1440,700 L 0,700 Z;
                M 0,700 L 0,525 C 62.08,520.54 124.15,516.08 193,523 C 261.85,529.92 337.47,548.20 402,554 C 466.53,559.80 520.98,553.10 583,558 C 646.02,562.90 718.60,579.38 792,568 C 865.40,556.62 939.61,517.36 1009,514 C 1078.39,510.64 1142.97,543.18 1214,551 C 1285.03,558.82 1362.52,541.91 1440,525 L 1440,700 L 0,700 Z;
                M 0,700 L 0,525 C 53.12,513.08 106.23,501.15 171,492 C 235.77,482.85 312.18,476.46 395,474 C 477.82,471.54 567.05,473.00 636,485 C 704.95,497.00 753.64,519.54 819,524 C 884.36,528.46 966.41,514.86 1034,500 C 1101.59,485.14 1154.74,469.04 1220,473 C 1285.26,476.96 1362.63,500.98 1440,525 L 1440,700 L 0,700 Z;
                M 0,700 L 0,525 C 79.52,515.98 159.04,506.96 224,501 C 288.96,495.04 339.36,492.12 393,497 C 446.64,501.88 503.53,514.54 581,517 C 658.47,519.46 756.52,511.70 837,509 C 917.48,506.30 980.40,508.66 1050,501 C 1119.60,493.34 1195.89,475.67 1262,478 C 1328.11,480.33 1384.06,502.67 1440,525 L 1440,700 L 0,700 Z;
                M 0,700 L 0,525 C 56.15,502.82 112.30,480.64 176,495 C 239.70,509.36 310.96,560.25 386,571 C 461.04,581.75 539.86,552.36 617,526 C 694.14,499.64 769.60,476.33 828,485 C 886.40,493.67 927.72,534.33 1004,539 C 1080.28,543.67 1191.51,512.33 1270,504 C 1348.49,495.67 1394.25,510.33 1440,525 L 1440,700 L 0,700 Z
              "
            />
          </path>
        </g>
      </svg>

      {/* Animated Waves */}
      <div className="wave-background absolute bottom-0 left-0 right-0" style={{ 
        transform: 'translate(0, 720px)',
        opacity: showBackgroundSVG ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 600"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ transform: 'scale(1.333333, 1.4)' }}
        >
          <path className="wave-path wave-path-0" d="M 0,600 L 0,150 C 60.5263157894737,154.91866028708134 121.0526315789474,159.83732057416267 235,168 C 348.9473684210526,176.16267942583733 516.3157894736842,187.5693779904306 614,162 C 711.6842105263158,136.4306220095694 739.6842105263158,73.88516746411484 820,89 C 900.3157894736842,104.11483253588516 1032.9473684210525,196.88995215311004 1145,220 C 1257.0526315789475,243.11004784688996 1348.5263157894738,196.555023923445 1440,150 L 1440,600 L 0,600 Z" />
          <path className="wave-path wave-path-1" d="M 0,600 L 0,350 C 68.64114832535887,306.7464114832536 137.28229665071774,263.49282296650716 244,279 C 350.71770334928226,294.50717703349284 495.51196172248797,368.7751196172249 597,397 C 698.488038277512,425.2248803827751 756.66985645933,407.4066985645933 838,406 C 919.33014354067,404.5933014354067 1023.8086124401914,419.59808612440196 1128,413 C 1232.1913875598086,406.40191387559804 1336.0956937799042,378.200956937799 1440,350 L 1440,600 L 0,600 Z" />
          <path className="wave-path wave-path-2" d="M 0,600 L 0,500 C 92.42011834319526,488.6698564593301 184.84023668639052,477.33971291866025 279,469 C 373.1597633136095,460.66028708133975 469.0591715976331,455.310005784689 566,458 C 662.9408284023669,460.689994215311 760.9230769230769,471.42126394258375 867,474 C 973.0769230769231,476.57873605741625 1087.2485207100591,470.0054380664653 1184,459 C 1280.7514792899409,447.9945619335347 1360.0828402366864,432.557983790555 1440,417 L 1440,600 L 0,600 Z" />
        </svg>
      </div>
    </div>
  ), [showBackgroundSVG])

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
        

        @keyframes waveAnim0 {
          0% { d: path("M 0,600 L 0,150 C 60.5263157894737,154.91866028708134 121.0526315789474,159.83732057416267 235,168 C 348.9473684210526,176.16267942583733 516.3157894736842,187.5693779904306 614,162 C 711.6842105263158,136.4306220095694 739.6842105263158,73.88516746411484 820,89 C 900.3157894736842,104.11483253588516 1032.9473684210525,196.88995215311004 1145,220 C 1257.0526315789475,243.11004784688996 1348.5263157894738,196.555023923445 1440,150 L 1440,600 L 0,600 Z"); }
          25% { d: path("M 0,600 L 0,150 C 103.09090909090907,180.14354066985646 206.18181818181813,210.2870813397129 289,193 C 371.81818181818187,175.7129186602871 434.3636363636364,110.99521531100477 525,95 C 615.6363636363636,79.00478468899523 734.3636363636363,111.73205741626796 838,147 C 941.6363636363637,182.26794258373204 1030.1818181818182,220.07655502392345 1128,221 C 1225.8181818181818,221.92344497607655 1332.909090909091,185.96172248803828 1440,150 L 1440,600 L 0,600 Z"); }
          50% { d: path("M 0,600 L 0,350 C 87.63636363636365,139.35885167464116 175.2727272727273,128.71770334928232 261,127 C 346.7272727272727,125.2822966507177 430.5454545454545,132.48803827751195 524,159 C 617.4545454545455,185.51196172248805 720.5454545454545,231.33014354066984 835,209 C 949.4545454545455,186.66985645933016 1075.2727272727275,96.19138755980862 1178,75 C 1280.7272727272725,53.80861244019138 1360.3636363636363,101.90430622009569 1440,150 L 1440,600 L 0,600 Z"); }
          75% { d: path("M 0,600 L 0,350 C 92.89952153110048,184.5263157894737 185.79904306220095,219.05263157894737 291,211 C 396.20095693779905,202.94736842105263 513.7033492822967,152.31578947368422 614,127 C 714.2966507177033,101.68421052631578 797.3875598086123,101.6842105263158 870,96 C 942.6124401913877,90.3157894736842 1004.7464114832535,78.94736842105263 1098,87 C 1191.2535885167465,95.05263157894737 1315.6267942583731,122.52631578947368 1440,150 L 1440,600 L 0,600 Z"); }
          100% { d: path("M 0,600 L 0,150 C 60.5263157894737,154.91866028708134 121.0526315789474,159.83732057416267 235,168 C 348.9473684210526,176.16267942583733 516.3157894736842,187.5693779904306 614,162 C 711.6842105263158,136.4306220095694 739.6842105263158,73.88516746411484 820,89 C 900.3157894736842,104.11483253588516 1032.9473684210525,196.88995215311004 1145,220 C 1257.0526315789475,243.11004784688996 1348.5263157894738,196.555023923445 1440,150 L 1440,600 L 0,600 Z"); }
        }

        @keyframes waveAnim1 {
          0% { d: path("M 0,600 L 0,350 C 68.64114832535887,306.7464114832536 137.28229665071774,263.49282296650716 244,279 C 350.71770334928226,294.50717703349284 495.51196172248797,368.7751196172249 597,397 C 698.488038277512,425.2248803827751 756.66985645933,407.4066985645933 838,406 C 919.33014354067,404.5933014354067 1023.8086124401914,419.59808612440196 1128,413 C 1232.1913875598086,406.40191387559804 1336.0956937799042,378.200956937799 1440,350 L 1440,600 L 0,600 Z"); }
          25% { d: path("M 0,600 L 0,350 C 114.64114832535884,338.41148325358853 229.28229665071768,326.82296650717706 319,324 C 408.7177033492823,321.17703349282294 473.5119617224881,327.1196172248804 563,347 C 652.4880382775119,366.8803827751196 766.66985645933,400.69856459330146 861,418 C 955.33014354067,435.30143540669854 1029.8086124401914,436.0861244019139 1123,422 C 1216.1913875598086,407.9138755980861 1328.0956937799042,378.9569377990431 1440,350 L 1440,600 L 0,600 Z"); }
          50% { d: path("M 0,600 L 0,350 C 68.79425837320574,359.311004784689 137.58851674641147,368.62200956937795 241,362 C 344.41148325358853,355.37799043062205 482.4401913875598,332.82296650717706 600,345 C 717.5598086124402,357.17703349282294 814.6507177033494,404.0861244019138 894,394 C 973.3492822966506,383.9138755980862 1034.956937799043,316.83253588516743 1123,300 C 1211.043062200957,283.16746411483257 1325.5215311004786,316.5837320574163 1440,350 L 1440,600 L 0,600 Z"); }
          75% { d: path("M 0,600 L 0,350 C 109.27272727272728,353.74162679425837 218.54545454545456,357.48325358851673 323,342 C 427.45454545454544,326.51674641148327 527.0909090909091,291.80861244019144 621,285 C 714.9090909090909,278.19138755980856 803.090909090909,299.2822966507177 881,325 C 958.909090909091,350.7177033492823 1026.5454545454545,381.06220095693783 1118,386 C 1209.4545454545455,390.93779904306217 1324.7272727272727,370.46889952153106 1440,350 L 1440,600 L 0,600 Z"); }
          100% { d: path("M 0,600 L 0,350 C 68.64114832535887,306.7464114832536 137.28229665071774,263.49282296650716 244,279 C 350.71770334928226,294.50717703349284 495.51196172248797,368.7751196172249 597,397 C 698.488038277512,425.2248803827751 756.66985645933,407.4066985645933 838,406 C 919.33014354067,404.5933014354067 1023.8086124401914,419.59808612440196 1128,413 C 1232.1913875598086,406.40191387559804 1336.0956937799042,378.200956937799 1440,350 L 1440,600 L 0,600 Z"); }
        }

        @keyframes waveAnim2 {
          0% { d: path("M 0,600 L 0,500 C 92.42011834319526,488.6698564593301 184.84023668639052,477.33971291866025 279,469 C 373.1597633136095,460.66028708133975 469.0591715976331,455.310005784689 566,458 C 662.9408284023669,460.689994215311 760.9230769230769,471.42126394258375 867,474 C 973.0769230769231,476.57873605741625 1087.2485207100591,470.0054380664653 1184,459 C 1280.7514792899409,447.9945619335347 1360.0828402366864,432.557983790555 1440,417 L 1440,600 L 0,600 Z"); }
          33% { d: path("M 0,600 L 0,500 C 103.4354066985646,492.0828402366864 206.8708133971292,484.16568047337277 305,485 C 403.1291866028708,485.83431952662723 495.9521531100478,495.4201183431953 595,500 C 694.0478468899522,504.57988165680467 799.3205741626794,504.15384615384613 894,495 C 988.6794258373206,485.84615384615387 1072.7655502392345,467.9644970414201 1165,460 C 1257.2344497607655,452.0355029585799 1357.6172248803827,454.01775147929 1440,456 L 1440,600 L 0,600 Z"); }
          66% { d: path("M 0,600 L 0,500 C 96.89952153110048,505.53110047846887 193.79904306220095,511.0622009569378 293,507 C 392.20095693779905,502.93779904306217 493.7033492822966,489.28229665071776 592,486 C 690.2966507177034,482.71770334928224 785.3875598086125,489.8086124401914 881,497 C 976.6124401913875,504.1913875598086 1072.7464114832535,511.4832535885167 1166,506 C 1259.2535885167465,500.5167464114833 1349.6267942583733,482.25837320574167 1440,464 L 1440,600 L 0,600 Z"); }
          100% { d: path("M 0,600 L 0,500 C 92.42011834319526,488.6698564593301 184.84023668639052,477.33971291866025 279,469 C 373.1597633136095,460.66028708133975 469.0591715976331,455.310005784689 566,458 C 662.9408284023669,460.689994215311 760.9230769230769,471.42126394258375 867,474 C 973.0769230769231,476.57873605741625 1087.2485207100591,470.0054380664653 1184,459 C 1280.7514792899409,447.9945619335347 1360.0828402366864,432.557983790555 1440,417 L 1440,600 L 0,600 Z"); }
        }

        .wave-path {
          fill: #ff0080;
          opacity: .4;
        }

        .wave-path-0 {
          animation: waveAnim0 12s linear infinite;
          opacity: .28;
        }

        .wave-path-1 {
          animation: waveAnim1 9s linear infinite;
          opacity: .38;
        }

        .wave-path-2 {
          animation: waveAnim2 7s linear infinite;
          opacity: .5;
        }

        .wave-background {
          mix-blend-mode: screen;
        }

      `}</style>

      {/* Wave Transition from form to success */}
      <AnimatePresence>
        {isTransitioningToSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* Wave 1 - Layer 1 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: ['100%', '-100%'] }}
              transition={{
                duration: 2,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 1080"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="wave-transition-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff66c4" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#ffb800" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,400 Q360,300 720,400 T1440,400 L1440,680 Q1080,780 720,680 T0,680 Z"
                  fill="url(#wave-transition-1)"
                />
              </svg>
            </motion.div>

            {/* Wave 1 - Layer 2 (ประกบกับ Layer 1 - กลับหัว) */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: ['100%', '-100%'] }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 0.05
              }}
              className="absolute inset-0"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 1080"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="wave-transition-1b" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff66c4" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#ffb800" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ffb800" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g style={{ transform: 'translate(0px, 1080px) scaleY(-1)', transformOrigin: 'center' }}>
                  <path
                    d="M0,420 Q360,320 720,420 T1440,420 L1440,700 Q1080,800 720,700 T0,700 Z"
                    fill="url(#wave-transition-1b)"
                  />
                </g>
              </svg>
            </motion.div>

            {/* Wave 2 - Layer 1 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: ['100%', '-100%'] }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 0.1
              }}
              className="absolute inset-0"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 1080"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="wave-transition-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00a1b5" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#a1e4cd" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,450 Q360,350 720,450 T1440,450 L1440,730 Q1080,830 720,730 T0,730 Z"
                  fill="url(#wave-transition-2)"
                />
              </svg>
            </motion.div>

            {/* Wave 2 - Layer 2 (ประกบกับ Layer 1 - กลับหัว) */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: ['100%', '-100%'] }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 0.15
              }}
              className="absolute inset-0"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 1080"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="wave-transition-2b" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00a1b5" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#a1e4cd" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#a1e4cd" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g style={{ transform: 'translate(0px, 1080px) scaleY(-1)', transformOrigin: 'center' }}>
                  <path
                    d="M0,470 Q360,370 720,470 T1440,470 L1440,750 Q1080,850 720,750 T0,750 Z"
                    fill="url(#wave-transition-2b)"
                  />
                </g>
              </svg>
            </motion.div>

            {/* Wave 3 - Layer 1 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: ['100%', '-100%'] }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 0.2
              }}
              className="absolute inset-0"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 1080"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="wave-transition-3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6e7cff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8dacc3" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,500 Q360,400 720,500 T1440,500 L1440,780 Q1080,880 720,780 T0,780 Z"
                  fill="url(#wave-transition-3)"
                />
              </svg>
            </motion.div>

            {/* Wave 3 - Layer 2 (ประกบกับ Layer 1 - กลับหัว) */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: ['100%', '-100%'] }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 0.25
              }}
              className="absolute inset-0"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 1080"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="wave-transition-3b" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6e7cff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#8dacc3" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#8dacc3" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g style={{ transform: 'translate(0px, 1080px) scaleY(-1)', transformOrigin: 'center' }}>
                  <path
                    d="M0,520 Q360,420 720,520 T1440,520 L1440,800 Q1080,900 720,800 T0,800 Z"
                    fill="url(#wave-transition-3b)"
                  />
                </g>
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background layers from testttttttt.svg */}
      {backgroundSVG}

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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
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

          {flowState === 'form' && !isTransitioningToSuccess && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className='w-full flex flex-col justify-center items-center h-screen py-20 gap-8'
            >
              <form onSubmit={handleSubmit} className='flex w-full max-w-4xl flex-col gap-8 relative'>
                <FormInput
                  ref={authorInputRef}
                  label="Your Name"
                  value={author}
                  onChange={handleAuthorChange}
                  onKeyDown={handleAuthorKeyDown}
                  autoFocus
                  containerClassName="flex w-full flex-col items-center gap-4 h-30 w-full"
                  className="flex-1 min-w-0 bg-black/10 text-center text-3xl font-anuphan w-[90%] "
                  shake={shakeAuthor && !author.trim()}
                />
                <FormInput
                  ref={messageInputRef}
                  label="Your Wish"
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={handleMessageKeyDown}
                  containerClassName="flex w-full flex-col items-center gap-4 h-30 w-full"
                  className="flex-1 min-w-0 bg-black/10 text-center text-3xl font-anuphan w-[90%] "
                  shake={shakeMessage && !message.trim()}
                  maxLength={60}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className='w-full flex flex-col justify-center items-center h-screen py-20 gap-30 relative z-60'
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

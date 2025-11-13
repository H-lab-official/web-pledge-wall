import React, { useState, useEffect } from 'react'
import { APP_MODE, getCurrentModeDescription } from '../config/appConfig'
import { checkConnection } from '../services/messageService'

const ModeIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // เช็คการเชื่อมต่อเมื่อเริ่มต้น
    checkConnectionStatus()

    // เช็คทุก 30 วินาที (สำหรับ offline mode)
    if (APP_MODE === 'offline') {
      const interval = setInterval(checkConnectionStatus, 30000)
      return () => clearInterval(interval)
    }
  }, [])

  const checkConnectionStatus = async () => {
    setIsChecking(true)
    try {
      const connected = await checkConnection()
      setIsConnected(connected)
    } catch {
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  const handleClick = () => {
    if (APP_MODE === 'offline') {
      checkConnectionStatus()
    }
  }

  // สีตาม mode และสถานะการเชื่อมต่อ
  const getStatusColor = () => {
    if (APP_MODE === 'online') {
      return 'bg-green-500'
    }
    return isConnected ? 'bg-blue-500' : 'bg-red-500'
  }

  const getStatusText = () => {
    if (APP_MODE === 'online') {
      return 'Online (Firebase)'
    }
    return isConnected ? 'Offline (Local Server)' : 'Disconnected'
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer hover:bg-black/70 transition-all"
      onClick={handleClick}
      title={`Mode: ${getCurrentModeDescription()}\n${APP_MODE === 'offline' ? 'Click to check connection' : ''}`}
    >
      {/* Status dot with pulse animation */}
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${getStatusColor()} ${isChecking ? 'animate-pulse' : ''}`}
        />
        {isConnected && !isChecking && (
          <div
            className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor()} animate-ping opacity-75`}
          />
        )}
      </div>

      {/* Status text */}
      <span className="text-white text-sm font-medium">
        {getStatusText()}
      </span>

      {/* Refresh icon (for offline mode) */}
      {APP_MODE === 'offline' && (
        <svg
          className={`w-4 h-4 text-white ${isChecking ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      )}
    </div>
  )
}

export default ModeIndicator


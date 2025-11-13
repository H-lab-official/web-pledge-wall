import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true, // หรือใช้ '0.0.0.0' - อนุญาตให้เข้าถึงจาก network อื่น
    open: true,
    // สำหรับ CORS ในโหมด development
    cors: true,
    // แสดง network URLs เมื่อรัน dev server
    strictPort: false
  }
})


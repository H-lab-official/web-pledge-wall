import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import SubmitPage from './pages/SubmitPage'
import DisplayPage from './pages/DisplayPage'
import AdminPage from './pages/AdminPage'
import Page2 from './pages/SubmitPage2'

function App() {
  useEffect(() => {
    // Kiosk Mode: Prevent context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Kiosk Mode: Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent refresh (F5, Ctrl+R, Cmd+R)
      if (
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'r') ||
        (e.metaKey && e.key === 'r')
      ) {
        e.preventDefault()
        return false
      }

      // Prevent browser back (Backspace, Alt+Left) - BUT allow in input/textarea
      const target = e.target as HTMLElement
      const isEditable = 
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      
      if (
        (e.key === 'Backspace' && !isEditable) ||
        (e.altKey && e.key === 'ArrowLeft')
      ) {
        e.preventDefault()
        return false
      }

      // Prevent DevTools (F12, Ctrl+Shift+I, Cmd+Option+I)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.metaKey && e.altKey && e.key === 'i')
      ) {
        e.preventDefault()
        return false
      }

      // Prevent View Source (Ctrl+U, Cmd+Option+U)
      if (
        (e.ctrlKey && e.key === 'u') ||
        (e.metaKey && e.altKey && e.key === 'u')
      ) {
        e.preventDefault()
        return false
      }
    }

    // Kiosk Mode: Prevent back/forward navigation
    const preventNavigation = () => {
      window.history.pushState(null, '', window.location.href)
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('popstate', preventNavigation)
    
    // Push initial state
    preventNavigation()

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('popstate', preventNavigation)
    }
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Page2 />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/page2" element={<SubmitPage />} />
      </Routes>
    </Layout>
  )
}

export default App


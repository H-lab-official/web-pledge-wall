import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import SubmitPage from './pages/SubmitPage'
import DisplayPage from './pages/DisplayPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SubmitPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  )
}

export default App


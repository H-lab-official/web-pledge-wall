import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import SubmitPage from './pages/SubmitPage'
import DisplayPage from './pages/DisplayPage'
import AdminPage from './pages/AdminPage'
import Page2 from './pages/SubmitPage2'

function App() {
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


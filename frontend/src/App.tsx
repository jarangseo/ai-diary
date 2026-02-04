import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import DiaryWritePage from '@/pages/DiaryWritePage'
import DiaryDetailPage from '@/pages/DiaryDetailPage'
import SettingsPage from '@/pages/SettingsPage'
import Layout from '@/components/Layout'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/write" element={<DiaryWritePage />} />
        <Route path="/write/:date" element={<DiaryWritePage />} />
        <Route path="/diary/:date" element={<DiaryDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App

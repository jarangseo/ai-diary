import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import DiaryWritePage from '@/pages/DiaryWritePage'
import DiaryDetailPage from '@/pages/DiaryDetailPage'
import SettingsPage from '@/pages/SettingsPage'
import LoginPage from '@/pages/LoginPage'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'

function App() {
  const checkSession = useAuthStore((state) => state.checkSession)
  const navigate = useNavigate()

  useEffect(() => {
    // Handle OAuth callback: read user data from URL parameter
    const params = new URLSearchParams(window.location.search)
    const authData = params.get('auth')

    if (authData) {
      try {
        const user = JSON.parse(atob(authData))
        useAuthStore.setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch (e) {
        console.error('Failed to parse auth data:', e)
      }
      // Clean up URL
      window.history.replaceState({}, '', '/')
      navigate('/', { replace: true })
      return
    }

    checkSession()
  }, [checkSession, navigate])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
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

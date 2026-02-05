import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/stores/authStore'

const HomePage = lazy(() => import('@/pages/HomePage'))
const DiaryWritePage = lazy(() => import('@/pages/DiaryWritePage'))
const DiaryDetailPage = lazy(() => import('@/pages/DiaryDetailPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))

function App() {
  const checkSession = useAuthStore((state) => state.checkSession)
  const navigate = useNavigate()

  useEffect(() => {
    // Handle OAuth callback: read user data from URL parameter
    const params = new URLSearchParams(window.location.search)
    const authData = params.get('auth')

    if (authData) {
      try {
        const decoded = JSON.parse(atob(authData))

        // Validate shape before trusting URL data
        if (
          typeof decoded === 'object' &&
          decoded !== null &&
          typeof decoded.id === 'string' &&
          typeof decoded.provider === 'string'
        ) {
          const user: User = {
            id: decoded.id,
            name: typeof decoded.name === 'string' ? decoded.name : null,
            email: typeof decoded.email === 'string' ? decoded.email : null,
            image: typeof decoded.image === 'string' ? decoded.image : null,
            provider: decoded.provider,
          }
          useAuthStore.setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        }
      } catch {
        console.error('Failed to parse auth data')
      }
      // Clean up URL
      window.history.replaceState({}, '', '/')
      navigate('/', { replace: true })
      return
    }

    checkSession()
  }, [checkSession, navigate])

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      }
    >
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
    </Suspense>
  )
}

export default App

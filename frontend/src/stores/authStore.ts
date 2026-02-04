import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Remove trailing slash to prevent double slashes in URLs
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  provider: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (provider: 'google' | 'github') => void
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      login: (provider) => {
        // Redirect to NextAuth sign in (backend handles redirect to frontend)
        window.location.href = `${API_URL}/api/auth/signin/${provider}`
      },

      logout: async () => {
        try {
          // Clear local state first
          set({ user: null, isAuthenticated: false })

          // Call NextAuth signout via redirect
          window.location.href = `${API_URL}/api/auth/signout`
        } catch (error) {
          console.error('Logout error:', error)
        }
      },

      checkSession: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch(`${API_URL}/api/auth/session`, {
            credentials: 'include',
          })

          if (!response.ok) {
            throw new Error('Session check failed')
          }

          const session = await response.json()

          if (session?.user?.email) {
            set({
              user: {
                id: session.user.id || session.user.email,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                provider: session.provider || 'unknown',
              },
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // No session, check if we have stored user (for development)
            const currentUser = get().user
            if (currentUser) {
              set({ isAuthenticated: true, isLoading: false })
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false })
            }
          }
        } catch (error) {
          console.error('Session check error:', error)
          // If session check fails, use stored user if available
          const currentUser = get().user
          if (currentUser) {
            set({ isAuthenticated: true, isLoading: false })
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

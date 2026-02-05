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
        // Pass callbackUrl=/ (relative) to bypass NextAuth cross-origin validation
        // The backend redirect callback will send user to FRONTEND_URL
        window.location.href = `${API_URL}/api/auth/signin/${provider}?callbackUrl=%2F`
      },

      logout: async () => {
        try {
          // Clear local state first
          set({ user: null, isAuthenticated: false })

          // Pass callbackUrl=/ for same reason as login
          window.location.href = `${API_URL}/api/auth/signout?callbackUrl=%2F`
        } catch (error) {
          console.error('Logout error:', error)
        }
      },

      checkSession: async () => {
        // Use localStorage (Zustand persist) for session state.
        // Cross-origin cookies don't work between frontend/backend domains,
        // so we rely on the auth data passed via URL after OAuth callback.
        const currentUser = get().user
        if (currentUser) {
          set({ isAuthenticated: true, isLoading: false })
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

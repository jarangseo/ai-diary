import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Track mock state
let mockState = {
  isLoading: true,
  isAuthenticated: false,
}

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => mockState,
}))

// Mock react-router-dom to avoid heavy import
vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  useLocation: () => ({ pathname: '/' }),
}))

// Import after mocks
import ProtectedRoute from '../ProtectedRoute'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockState = { isLoading: true, isAuthenticated: false }
  })

  it('shows loading spinner when auth is loading', () => {
    mockState = { isLoading: true, isAuthenticated: false }

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockState = { isLoading: false, isAuthenticated: true }

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    mockState = { isLoading: false, isAuthenticated: false }

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toHaveAttribute('data-to', '/login')
  })
})

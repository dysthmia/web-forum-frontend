import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthContextValue } from '../../features/auth/model/AuthContext.ts'
import { AppRouter } from './AppRouter.tsx'

const user = { id: 1, username: 'alice', email: 'alice@example.test', role: 'user', createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 }

function renderProtected(path: string, role: string) {
  const value: AuthContextValue = { status: 'authenticated', user: { ...user, role }, login: async () => undefined, register: async () => undefined, logout: async () => undefined }
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}><AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}><AppRouter /></MemoryRouter>
    </AuthContext.Provider></QueryClientProvider>,
  )
}

describe('ProtectedRoute role access', () => {
  it('allows only admins into admin routes', () => {
    renderProtected('/admin', 'moderator')
    expect(screen.getByText('Недостаточно прав')).toBeInTheDocument()
  })

  it('allows moderators and admins into moderation routes', () => {
    renderProtected('/moderation/reports', 'moderator')
    expect(screen.getByRole('heading', { name: 'Жалобы' })).toBeInTheDocument()
  })

  it('allows admins into admin routes and gives them both service navigation groups', () => {
    renderProtected('/admin', 'admin')
    expect(screen.getByRole('heading', { name: 'Администрирование' })).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Навигация администратора' })).getByRole('link', { name: 'Жалобы' })).toHaveAttribute('href', '/moderation/reports')
  })
})

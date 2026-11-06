import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserProfilePage } from './UserProfilePage.tsx'

const authState = vi.hoisted(() => ({
  status: 'authenticated' as const,
  user: { id: 1, username: 'alice', email: 'alice@example.test', role: 'admin', createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 },
}))
const profileState = vi.hoisted(() => ({
  data: { id: 1, username: 'alice', role: 'admin', createdAt: '2026-01-01T00:00:00Z', topicCount: 3, postCount: 4 },
}))

vi.mock('../features/auth/model/useAuth.ts', () => ({ useAuth: () => authState }))
vi.mock('../features/forum/api/queries.ts', () => ({
  usePublicUserProfileByUsernameQuery: () => ({ isPending: false, isError: false, data: profileState.data, refetch: vi.fn() }),
}))

function renderProfile(pathname: string) {
  return render(<MemoryRouter initialEntries={[pathname]}><UserProfilePage /></MemoryRouter>)
}

describe('UserProfilePage service mode link', () => {
  beforeEach(() => {
    authState.user = { id: 1, username: 'alice', email: 'alice@example.test', role: 'admin', createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 }
    profileState.data = { id: 1, username: 'alice', role: 'admin', createdAt: '2026-01-01T00:00:00Z', topicCount: 3, postCount: 4 }
  })

  it('shows the admin mode link only on the current admin profile', () => {
    renderProfile('/users/alice')

    expect(screen.getByRole('link', { name: 'Режим администратора' })).toHaveAttribute('href', '/admin')
  })

  it('shows the moderator mode link only on the current moderator profile', () => {
    authState.user = { ...authState.user, role: 'moderator' }
    profileState.data = { ...profileState.data, role: 'moderator' }

    renderProfile('/users/alice')

    expect(screen.getByRole('link', { name: 'Режим модератора' })).toHaveAttribute('href', '/moderation/reports')
    expect(screen.queryByRole('link', { name: 'Режим администратора' })).not.toBeInTheDocument()
  })

  it('hides the mode link for a regular user and on another profile', () => {
    authState.user = { ...authState.user, role: 'user' }
    profileState.data = { ...profileState.data, role: 'user' }
    const { rerender } = renderProfile('/users/alice')

    expect(screen.queryByRole('link', { name: /Режим/ })).not.toBeInTheDocument()

    authState.user = { ...authState.user, role: 'admin' }
    profileState.data = { ...profileState.data, id: 2, username: 'bob', role: 'admin' }
    rerender(<MemoryRouter initialEntries={['/users/bob']}><UserProfilePage /></MemoryRouter>)

    expect(screen.queryByRole('link', { name: /Режим/ })).not.toBeInTheDocument()
  })
})

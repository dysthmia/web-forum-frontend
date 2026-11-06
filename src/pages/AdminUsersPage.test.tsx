import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminUsersPage } from './AdminUsersPage.tsx'

const moderationApi = vi.hoisted(() => ({ users: vi.fn(), changeRole: vi.fn() }))
const authState = vi.hoisted(() => ({ user: { id: 1, username: 'admin', email: 'admin@example.test', role: 'admin', createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 } }))

vi.mock('../features/moderation/api/moderationApi.ts', () => ({ moderationApi }))
vi.mock('../features/auth/model/useAuth.ts', () => ({ useAuth: () => authState }))

const users = [
  { id: 1, username: 'admin', role: 'admin', createdAt: '2026-01-01T00:00:00Z', isBanned: false },
  { id: 2, username: 'alice', role: 'user', createdAt: '2026-01-02T00:00:00Z', isBanned: false },
  { id: 3, username: 'maria', role: 'moderator', createdAt: '2026-01-03T00:00:00Z', isBanned: true },
]

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function close() { this.removeAttribute('open') }
})

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><MemoryRouter><AdminUsersPage /></MemoryRouter></QueryClientProvider>)
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    moderationApi.users.mockResolvedValue({ items: users, page: 1, pageSize: 20, totalCount: users.length })
    moderationApi.changeRole.mockResolvedValue({ ...users[1], role: 'moderator' })
  })

  it('debounces username search before requesting users', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('alice')

    await user.type(screen.getByLabelText('Поиск по username'), 'ali')

    await waitFor(() => expect(moderationApi.users).toHaveBeenLastCalledWith({ query: 'ali', role: undefined, page: 1, pageSize: 20 }))
  })

  it('requests users with the selected role filter', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('alice')

    await user.selectOptions(screen.getByLabelText('Роль'), 'moderator')

    await waitFor(() => expect(moderationApi.users).toHaveBeenLastCalledWith({ query: undefined, role: 'moderator', page: 1, pageSize: 20 }))
  })

  it('changes a user role only after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('alice')

    await user.click(screen.getByRole('button', { name: 'Сделать модератором для alice' }))
    expect(moderationApi.changeRole).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Изменить роль' }))

    await waitFor(() => expect(moderationApi.changeRole).toHaveBeenCalledWith(2, 'moderator'))
  })

  it('does not offer actions for admin rows or the current administrator', async () => {
    renderPage()
    await screen.findByText('admin')

    expect(screen.queryByRole('button', { name: /для admin/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Сделать.*для admin/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Сделать модератором для alice' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Сделать пользователем для maria' })).toBeInTheDocument()
  })
})

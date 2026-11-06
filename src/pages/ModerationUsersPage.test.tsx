import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../features/auth/model/AuthContext.ts'
import { ApiError } from '../shared/api/errors.ts'
import { ModerationUsersPage } from './ModerationUsersPage.tsx'

const moderationApi = vi.hoisted(() => ({ bans: vi.fn(), banHistory: vi.fn(), createBan: vi.fn(), revokeBan: vi.fn() }))
const forumApi = vi.hoisted(() => ({ getPublicUserProfileByUsername: vi.fn() }))
vi.mock('../features/moderation/api/moderationApi.ts', () => ({ moderationApi }))
vi.mock('../features/forum/api/forumApi.ts', () => ({ forumApi }))

const profile = { id: 7, username: 'alice', role: 'user', createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 }
const activeBan = { banId: 11, userId: 7, username: 'alice', moderatorId: 2, moderatorUsername: 'mod', reason: 'Нарушение правил', createdAt: '2026-01-02T00:00:00Z', expiresAt: '2027-01-02T00:00:00Z', revokedAt: null }

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function close() { this.removeAttribute('open') }
})

function renderPage(role: 'admin' | 'moderator') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><AuthContext.Provider value={{ status: 'authenticated', user: { id: 2, username: 'staff', email: 'staff@example.test', role, createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 }, login: vi.fn(), register: vi.fn(), logout: vi.fn() }}><MemoryRouter><ModerationUsersPage /></MemoryRouter></AuthContext.Provider></QueryClientProvider>)
}

async function selectUser(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Username пользователя'), 'alice')
  await user.click(screen.getByRole('button', { name: 'Найти пользователя' }))
  await screen.findByText((_, node) => node?.textContent === 'Выбран пользователь: alice')
}

describe('ModerationUsersPage', () => {
  beforeEach(() => {
    moderationApi.bans.mockResolvedValue({ items: [activeBan], page: 1, pageSize: 20, totalCount: 1 })
    moderationApi.banHistory.mockResolvedValue([activeBan])
    moderationApi.createBan.mockResolvedValue(undefined)
    moderationApi.revokeBan.mockResolvedValue(undefined)
    forumApi.getPublicUserProfileByUsername.mockResolvedValue(profile)
  })

  it('requires a moderator to choose a future end date', async () => {
    const user = userEvent.setup()
    renderPage('moderator')
    await selectUser(user)
    await user.type(screen.getByLabelText(/^Причина/), 'Нарушение правил')
    await user.click(screen.getByRole('button', { name: 'Заблокировать пользователя' }))

    expect(await screen.findByText('Для модератора обязательна дата окончания блокировки.')).toBeInTheDocument()
    expect(moderationApi.createBan).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Бессрочная блокировка')).not.toBeInTheDocument()
  })

  it('sends a temporary moderator ban in UTC', async () => {
    const user = userEvent.setup()
    renderPage('moderator')
    await selectUser(user)
    await user.type(screen.getByLabelText(/^Причина/), 'Нарушение правил')
    await user.type(screen.getByLabelText(/^Дата окончания/), '2027-01-02T12:30')
    await user.click(screen.getByRole('button', { name: 'Заблокировать пользователя' }))

    await waitFor(() => expect(moderationApi.createBan).toHaveBeenCalledWith(7, 'Нарушение правил', new Date('2027-01-02T12:30').toISOString()))
  })

  it('lets an admin create a permanent ban only when explicitly selected', async () => {
    const user = userEvent.setup()
    renderPage('admin')
    await selectUser(user)
    await user.type(screen.getByLabelText(/^Причина/), 'Нарушение правил')
    await user.click(screen.getByLabelText('Бессрочная блокировка'))
    await user.click(screen.getByRole('button', { name: 'Заблокировать пользователя' }))

    await waitFor(() => expect(moderationApi.createBan).toHaveBeenCalledWith(7, 'Нарушение правил', null))
  })

  it('revokes an active ban only after confirmation', async () => {
    const user = userEvent.setup()
    renderPage('admin')
    await screen.findByText('Нарушение правил')
    await user.click(screen.getByRole('button', { name: 'Снять блокировку для alice' }))
    expect(moderationApi.revokeBan).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Снять блокировку' }))

    await waitFor(() => expect(moderationApi.revokeBan).toHaveBeenCalledWith(11))
  })

  it('explains a conflict when a ban was already revoked', async () => {
    const user = userEvent.setup()
    moderationApi.revokeBan.mockRejectedValue(new ApiError('CONFLICT', 'Ban is no longer active.', 409, 'Ban is no longer active.'))
    renderPage('admin')
    await screen.findByText('Нарушение правил')
    await user.click(screen.getByRole('button', { name: 'Снять блокировку для alice' }))
    await user.click(screen.getByRole('button', { name: 'Снять блокировку' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Блокировка уже снята или срок её действия истёк.')
  })
})

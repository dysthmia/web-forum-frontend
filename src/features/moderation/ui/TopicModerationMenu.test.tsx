import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../auth/model/AuthContext.ts'
import { ApiError } from '../../../shared/api/errors.ts'
import { PostModerationActions } from './PostModerationActions.tsx'
import { TopicModerationMenu } from './TopicModerationMenu.tsx'

const forumApi = vi.hoisted(() => ({ setTopicClosed: vi.fn(), setTopicPinned: vi.fn(), deleteTopic: vi.fn(), deletePost: vi.fn() }))
vi.mock('../../forum/api/forumApi.ts', () => ({ forumApi }))

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function close() { this.removeAttribute('open') }
})

function renderWithRole(role: 'user' | 'moderator' | 'admin', content: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><AuthContext.Provider value={{ status: 'authenticated', user: { id: 2, username: 'staff', email: 'staff@example.test', role, createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 }, login: vi.fn(), register: vi.fn(), logout: vi.fn() }}><MemoryRouter>{content}</MemoryRouter></AuthContext.Provider></QueryClientProvider>)
}

describe('Topic moderation actions', () => {
  beforeEach(() => {
    forumApi.setTopicClosed.mockResolvedValue(undefined)
    forumApi.setTopicPinned.mockResolvedValue(undefined)
    forumApi.deleteTopic.mockResolvedValue(undefined)
    forumApi.deletePost.mockResolvedValue(undefined)
  })

  it('allows a moderator to close and pin a topic', async () => {
    const user = userEvent.setup()
    renderWithRole('moderator', <TopicModerationMenu topicId={4} topicAuthorId={8} isClosed={false} isPinned={false} />)

    await user.click(screen.getByRole('button', { name: 'Закрыть тему' }))
    await user.click(screen.getByRole('button', { name: 'Закрепить тему' }))

    await waitFor(() => expect(forumApi.setTopicClosed).toHaveBeenCalledWith(4, true))
    await waitFor(() => expect(forumApi.setTopicPinned).toHaveBeenCalledWith(4, true))
  })

  it('shows a useful error when topic moderation is rejected', async () => {
    const user = userEvent.setup()
    forumApi.setTopicClosed.mockRejectedValue(new ApiError('FORBIDDEN', 'Forbidden', 403))
    renderWithRole('admin', <TopicModerationMenu topicId={4} topicAuthorId={8} isClosed={false} isPinned={false} />)

    await user.click(screen.getByRole('button', { name: 'Закрыть тему' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('У вас нет прав для этого действия.')
  })

  it('confirms topic deletion for a permitted actor', async () => {
    const user = userEvent.setup()
    renderWithRole('moderator', <TopicModerationMenu topicId={4} topicAuthorId={8} isClosed={false} isPinned={false} />)

    await user.click(screen.getByRole('button', { name: 'Удалить тему' }))
    expect(forumApi.deleteTopic).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Удалить тему навсегда' }))

    await waitFor(() => expect(forumApi.deleteTopic).toHaveBeenCalledWith(4))
  })

  it('does not offer deletion for the first post and confirms an ordinary reply deletion', async () => {
    const user = userEvent.setup()
    const { rerender } = renderWithRole('moderator', <PostModerationActions topicId={4} postId={10} position={1} />)
    expect(screen.queryByRole('button', { name: /Удалить сообщение/ })).not.toBeInTheDocument()

    rerender(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><AuthContext.Provider value={{ status: 'authenticated', user: { id: 2, username: 'staff', email: 'staff@example.test', role: 'moderator', createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 }, login: vi.fn(), register: vi.fn(), logout: vi.fn() }}><MemoryRouter><PostModerationActions topicId={4} postId={11} position={2} /></MemoryRouter></AuthContext.Provider></QueryClientProvider>)
    await user.click(screen.getByRole('button', { name: 'Удалить сообщение #2' }))
    await user.click(screen.getByRole('button', { name: 'Удалить сообщение' }))

    await waitFor(() => expect(forumApi.deletePost).toHaveBeenCalledWith(4, 11))
  })
})

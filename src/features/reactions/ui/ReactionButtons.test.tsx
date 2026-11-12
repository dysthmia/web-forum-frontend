import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../auth/model/AuthContext.ts'
import { ReactionButtons } from './ReactionButtons.tsx'

const forumApi = vi.hoisted(() => ({
  removeReaction: vi.fn(),
  setReaction: vi.fn(),
}))

vi.mock('../../forum/api/forumApi.ts', () => ({ forumApi }))

function CurrentPath() {
  return <output data-testid="current-path">{useLocation().pathname}</output>
}

function renderReactionButtons(currentUserReaction: -1 | 1 | null = null, status: 'authenticated' | 'guest' = 'authenticated') {
  forumApi.setReaction.mockResolvedValue(undefined)
  forumApi.removeReaction.mockResolvedValue(undefined)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ status, user: status === 'authenticated' ? { id: 1, username: 'member', email: 'member@example.test', role: 'user', createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 } : null, login: vi.fn(), register: vi.fn(), logout: vi.fn(), updateProfile: vi.fn() }}>
        <MemoryRouter><ReactionButtons postId={7} reaction={{ postId: 7, likeCount: 3, dislikeCount: 1, currentUserReaction }} /><CurrentPath /></MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('ReactionButtons', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends a like when a member selects it', async () => {
    const user = userEvent.setup()
    renderReactionButtons()

    await user.click(await screen.findByRole('button', { name: 'Нравится: 3' }))

    await waitFor(() => expect(forumApi.setReaction).toHaveBeenCalledWith(7, 1))
  })

  it('removes the selected dislike when it is clicked again', async () => {
    const user = userEvent.setup()
    renderReactionButtons(-1)

    await user.click(await screen.findByRole('button', { name: 'Не нравится: 1' }))

    await waitFor(() => expect(forumApi.removeReaction).toHaveBeenCalledWith(7))
  })

  it('sends a guest to login without creating a reaction', async () => {
    const user = userEvent.setup()
    renderReactionButtons(null, 'guest')

    const likeButton = await screen.findByRole('button', { name: 'Нравится: 3' })
    expect(likeButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(likeButton)

    expect(screen.getByTestId('current-path')).toHaveTextContent('/login')
    expect(forumApi.setReaction).not.toHaveBeenCalled()
    expect(forumApi.removeReaction).not.toHaveBeenCalled()
  })
})

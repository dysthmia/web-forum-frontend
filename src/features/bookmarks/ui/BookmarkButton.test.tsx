import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../auth/model/AuthContext.ts'
import { BookmarkButton } from './BookmarkButton.tsx'

const forumApi = vi.hoisted(() => ({ addBookmark: vi.fn(), getBookmarkStatus: vi.fn(), removeBookmark: vi.fn() }))
vi.mock('../../forum/api/forumApi.ts', () => ({ forumApi }))

function renderButton(isBookmarked: boolean) {
  forumApi.getBookmarkStatus.mockResolvedValue({ isBookmarked })
  forumApi.addBookmark.mockResolvedValue(undefined)
  forumApi.removeBookmark.mockResolvedValue(undefined)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(<QueryClientProvider client={queryClient}><AuthContext.Provider value={{ status: 'authenticated', user: { id: 1, username: 'member', email: 'member@example.test', role: 'user', createdAt: '2026-01-01T00:00:00Z', topicCount: 0, postCount: 0 }, login: vi.fn(), register: vi.fn(), logout: vi.fn(), updateProfile: vi.fn() }}><MemoryRouter><BookmarkButton topicId={7} /></MemoryRouter></AuthContext.Provider></QueryClientProvider>)
}

describe('BookmarkButton', () => {
  it('adds a topic to bookmarks', async () => {
    const user = userEvent.setup()
    renderButton(false)

    await user.click(await screen.findByRole('button', { name: 'Добавить тему в избранное' }))

    await waitFor(() => expect(forumApi.addBookmark).toHaveBeenCalledWith(7))
  })

  it('removes an already saved topic from bookmarks', async () => {
    const user = userEvent.setup()
    renderButton(true)

    await user.click(await screen.findByRole('button', { name: 'Убрать тему из избранного' }))

    await waitFor(() => expect(forumApi.removeBookmark).toHaveBeenCalledWith(7))
  })
})

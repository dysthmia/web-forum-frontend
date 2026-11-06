import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BookmarksPage } from './BookmarksPage.tsx'

const forumApi = vi.hoisted(() => ({ getBookmarks: vi.fn() }))
vi.mock('../features/forum/api/forumApi.ts', () => ({ forumApi }))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><MemoryRouter><BookmarksPage /></MemoryRouter></QueryClientProvider>)
}

describe('BookmarksPage', () => {
  beforeEach(() => forumApi.getBookmarks.mockResolvedValue({ items: [{ topicId: 7, title: 'Сохранённая тема', isClosed: false, isPinned: true, topicCreatedAt: '2026-01-01T00:00:00Z', bookmarkedAt: '2026-01-02T00:00:00Z' }], page: 1, pageSize: 20, totalCount: 1 }))

  it('renders actual bookmarked topics instead of a placeholder', async () => {
    renderPage()
    expect(await screen.findByRole('link', { name: 'Сохранённая тема' })).toHaveAttribute('href', '/topics/7')
  })
})

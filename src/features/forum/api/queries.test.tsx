import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useReactionCountsQuery } from './queries.ts'

const forumApi = vi.hoisted(() => ({ getReactionCounts: vi.fn() }))
vi.mock('./forumApi.ts', () => ({ forumApi }))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function QueryWrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useReactionCountsQuery', () => {
  beforeEach(() => vi.clearAllMocks())

  it('refetches reaction state when the authenticated viewer changes', async () => {
    forumApi.getReactionCounts.mockResolvedValue([{ postId: 7, likeCount: 3, dislikeCount: 1, currentUserReaction: 1 }])
    const { rerender } = renderHook(({ viewerId }) => useReactionCountsQuery([7], viewerId), { initialProps: { viewerId: 1 as number | null }, wrapper: createWrapper() })

    await waitFor(() => expect(forumApi.getReactionCounts).toHaveBeenCalledTimes(1))
    rerender({ viewerId: 2 })

    await waitFor(() => expect(forumApi.getReactionCounts).toHaveBeenCalledTimes(2))
  })
})

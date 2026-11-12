import { describe, expect, it, vi } from 'vitest'
import { forumApi } from './forumApi.ts'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('../../../shared/api/httpClient.ts', () => ({ httpClient: { get } }))

describe('forumApi.getReactionCounts', () => {
  it('serializes post IDs without square brackets for ASP.NET Core query binding', async () => {
    get.mockResolvedValue({ data: [] })

    await forumApi.getReactionCounts([42])

    expect(get).toHaveBeenCalledWith('/api/reactions/counts', {
      params: { postIds: [42] },
      paramsSerializer: { indexes: null },
    })
  })
})

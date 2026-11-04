import type { Category } from '../../../entities/category/model/types.ts'
import type { TopicPost } from '../../../entities/post/model/types.ts'
import type { PagedResponse, TopicListItem } from '../../../entities/topic/model/types.ts'
import type { PublicUserProfile } from '../../../entities/user/model/types.ts'
import { httpClient } from '../../../shared/api/httpClient.ts'

export interface TopicDetails {
  id: number
  categoryId: number
  authorId: number
  title: string | null
  viewCount: number
  isClosed: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  firstPost: TopicPost
  replies: PagedResponse<TopicPost>
}

export interface SearchTopic {
  topicId: number
  categoryId: number
  title: string | null
  fragment: string | null
  relevance: number
  createdAt: string
}

export type SearchResponse = PagedResponse<SearchTopic>
export interface ListOptions { page?: number; pageSize?: number }
export interface CategoryTopicOptions extends ListOptions { sort?: string }

export const forumApi = {
  async getCategories(): Promise<Category[]> {
    const { data } = await httpClient.get<Category[]>('/api/categories')
    return data
  },
  async getCategory(slug: string): Promise<Category> {
    const { data } = await httpClient.get<Category>(`/api/categories/${encodeURIComponent(slug)}`)
    return data
  },
  async getCategoryTopics(categoryId: number, options: CategoryTopicOptions): Promise<PagedResponse<TopicListItem>> {
    const { data } = await httpClient.get<PagedResponse<TopicListItem>>(`/api/categories/${categoryId}/topics`, { params: { Sort: options.sort, Page: options.page, PageSize: options.pageSize } })
    return data
  },
  async getTopic(topicId: number, options: ListOptions): Promise<TopicDetails> {
    const { data } = await httpClient.get<TopicDetails>(`/api/topics/${topicId}`, { params: { Page: options.page, PageSize: options.pageSize } })
    return data
  },
  async search(query: string, options: ListOptions): Promise<SearchResponse> {
    const { data } = await httpClient.get<SearchResponse>('/api/search', { params: { Query: query, Page: options.page, PageSize: options.pageSize } })
    return data
  },
  async getPublicUserProfile(userId: number): Promise<PublicUserProfile> {
    const { data } = await httpClient.get<PublicUserProfile>(`/api/users/${userId}`)
    return data
  },
}

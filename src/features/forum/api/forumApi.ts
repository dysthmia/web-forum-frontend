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
export interface CreateTopicInput { categoryId: number; title: string; content: string }
export interface CreateTopicResponse { topicId: number }
export interface BookmarkTopic { topicId: number; title: string; isClosed: boolean; isPinned: boolean; topicCreatedAt: string; bookmarkedAt: string }
export type ReactionType = -1 | 1
export interface ReactionCounts { postId: number; likeCount: number; dislikeCount: number; currentUserReaction: ReactionType | null }

export const forumApi = {
  async getTopics(options: CategoryTopicOptions): Promise<PagedResponse<TopicListItem>> {
    const { data } = await httpClient.get<PagedResponse<TopicListItem>>('/api/topics', { params: { Sort: options.sort, Page: options.page, PageSize: options.pageSize } })
    return data
  },
  async createTopic(input: CreateTopicInput): Promise<CreateTopicResponse> {
    const { data } = await httpClient.post<CreateTopicResponse>('/api/topics', input)
    return data
  },
  async createPost(topicId: number, content: string): Promise<void> { await httpClient.post(`/api/topics/${topicId}/posts`, { content }) },
  async updatePost(topicId: number, postId: number, content: string): Promise<void> { await httpClient.put(`/api/topics/${topicId}/posts/${postId}`, { content }) },
  async deletePost(topicId: number, postId: number): Promise<void> { await httpClient.delete(`/api/topics/${topicId}/posts/${postId}`) },
  async deleteTopic(topicId: number): Promise<void> { await httpClient.delete(`/api/topics/${topicId}`) },
  async setReaction(postId: number, type: ReactionType): Promise<void> { await httpClient.put(`/api/posts/${postId}/reactions`, { type }) },
  async removeReaction(postId: number): Promise<void> { await httpClient.delete(`/api/posts/${postId}/reactions`) },
  async getReactionCounts(postIds: number[]): Promise<ReactionCounts[]> { return (await httpClient.get<ReactionCounts[]>('/api/reactions/counts', { params: { postIds }, paramsSerializer: { indexes: null } })).data },
  async getBookmarkStatus(topicId: number): Promise<{ isBookmarked: boolean }> { return (await httpClient.get<{ isBookmarked: boolean }>(`/api/bookmarks/${topicId}`)).data },
  async getBookmarks(options: ListOptions): Promise<PagedResponse<BookmarkTopic>> { return (await httpClient.get<PagedResponse<BookmarkTopic>>('/api/bookmarks', { params: { Page: options.page, PageSize: options.pageSize } })).data },
  async addBookmark(topicId: number): Promise<void> { await httpClient.put(`/api/bookmarks/${topicId}`) },
  async removeBookmark(topicId: number): Promise<void> { await httpClient.delete(`/api/bookmarks/${topicId}`) },
  async createReport(postId: number, reason: string): Promise<void> { await httpClient.post('/api/reports', { postId, reason }) },
  async setTopicClosed(topicId: number, isClosed: boolean): Promise<void> { await httpClient.put(`/api/topics/${topicId}/closed`, { isClosed }) },
  async setTopicPinned(topicId: number, isPinned: boolean): Promise<void> { await httpClient.put(`/api/topics/${topicId}/pinned`, { isPinned }) },
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
  async getPublicUserProfileByUsername(username: string): Promise<PublicUserProfile> {
    const { data } = await httpClient.get<PublicUserProfile>(`/api/users/by-username/${encodeURIComponent(username)}`)
    return data
  },
}

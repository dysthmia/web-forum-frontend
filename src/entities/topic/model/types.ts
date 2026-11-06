export interface TopicListItem {
  id: number
  categoryId: number
  categoryName: string
  authorId: number
  authorUsername: string
  title: string | null
  viewCount: number
  isClosed: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  replyCount: number
}

export interface PagedResponse<T> {
  items: T[] | null
  page: number
  pageSize: number
  totalCount: number
}

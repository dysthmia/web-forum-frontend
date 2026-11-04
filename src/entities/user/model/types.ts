export interface PublicUserProfile {
  id: number
  username: string | null
  role: string | null
  createdAt: string
  topicCount: number
  postCount: number
}

export interface OwnUserProfile { id: number; username: string | null; email: string | null; role: string | null; createdAt: string; topicCount: number; postCount: number }
export type AuthStatus = 'loading' | 'guest' | 'authenticated'

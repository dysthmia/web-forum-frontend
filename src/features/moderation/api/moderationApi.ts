import { httpClient } from '../../../shared/api/httpClient.ts'
import type { PagedResponse } from '../../../entities/topic/model/types.ts'

export type AdminUserRole = 'user' | 'moderator' | 'admin'
export interface AdminUser { id: number; username: string; role: AdminUserRole; createdAt: string; isBanned: boolean }
export interface Ban { banId: number; userId: number; username: string | null; moderatorId: number; moderatorUsername: string | null; reason: string | null; createdAt: string; expiresAt: string | null; revokedAt: string | null }
export interface PendingReport { reportId: number; postId: number; reporterId: number; reporterUsername: string | null; reason: string | null; createdAt: string }

export const moderationApi = {
  users: async (params: { query?: string; role?: AdminUserRole; page?: number; pageSize?: number }) => (await httpClient.get<PagedResponse<AdminUser>>('/api/admin/users', { params: { Query: params.query, Role: params.role, Page: params.page, PageSize: params.pageSize } })).data,
  changeRole: async (userId: number, role: Exclude<AdminUserRole, 'admin'>) => (await httpClient.put<AdminUser>(`/api/admin/users/${userId}/role`, { role })).data,
  bans: async (params: { query?: string; status?: string; page?: number; pageSize?: number }) => (await httpClient.get<PagedResponse<Ban>>('/api/moderation/bans', { params: { Query: params.query, Status: params.status, Page: params.page, PageSize: params.pageSize } })).data,
  reports: async () => (await httpClient.get<PendingReport[]>('/api/moderation/reports')).data,
  reviewReport: async (reportId: number, status: string, hidePost: boolean) => { await httpClient.put(`/api/moderation/reports/${reportId}`, { status, hidePost }) },
  createBan: async (userId: number, reason: string, expiresAt: string | null) => { await httpClient.post('/api/moderation/bans', { userId, reason, expiresAt }) },
  revokeBan: async (banId: number) => { await httpClient.delete(`/api/moderation/bans/${banId}`) },
}

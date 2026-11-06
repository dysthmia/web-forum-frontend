import { httpClient } from '../../../shared/api/httpClient.ts'
import type { PagedResponse } from '../../../entities/topic/model/types.ts'

export type AdminUserRole = 'user' | 'moderator' | 'admin'
export interface AdminUser { id: number; username: string; role: AdminUserRole; createdAt: string; isBanned: boolean }
export type BanStatus = 'active' | 'expired' | 'revoked'
export interface Ban { banId: number; userId: number; username: string; moderatorId: number; moderatorUsername: string; reason: string; createdAt: string; expiresAt: string | null; revokedAt: string | null }
export interface CreatedBan { banId: number; userId: number; expiresAt: string | null }
export type ReviewReportStatus = 'accepted' | 'rejected'
export interface PendingReport { reportId: number; postId: number; reporterId: number; reporterUsername: string; reason: string; createdAt: string }

export const moderationApi = {
  users: async (params: { query?: string; role?: AdminUserRole; page?: number; pageSize?: number }) => (await httpClient.get<PagedResponse<AdminUser>>('/api/admin/users', { params: { Query: params.query, Role: params.role, Page: params.page, PageSize: params.pageSize } })).data,
  changeRole: async (userId: number, role: Exclude<AdminUserRole, 'admin'>) => (await httpClient.put<AdminUser>(`/api/admin/users/${userId}/role`, { role })).data,
  bans: async (params: { query?: string; status?: BanStatus; page?: number; pageSize?: number }) => (await httpClient.get<PagedResponse<Ban>>('/api/moderation/bans', { params: { Query: params.query, Status: params.status, Page: params.page, PageSize: params.pageSize } })).data,
  banHistory: async (userId: number) => (await httpClient.get<Ban[]>(`/api/moderation/users/${userId}/bans`)).data,
  reports: async () => (await httpClient.get<PendingReport[]>('/api/moderation/reports')).data,
  reviewReport: async (reportId: number, status: ReviewReportStatus, hidePost: boolean) => { await httpClient.put(`/api/moderation/reports/${reportId}`, { status, hidePost }) },
  createBan: async (userId: number, reason: string, expiresAt: string | null) => (await httpClient.post<CreatedBan>('/api/moderation/bans', { userId, reason, expiresAt })).data,
  revokeBan: async (banId: number) => { await httpClient.delete(`/api/moderation/bans/${banId}`) },
}

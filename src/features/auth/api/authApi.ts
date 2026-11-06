import type { OwnUserProfile } from '../model/types.ts'
import { httpClient } from '../../../shared/api/httpClient.ts'

export interface AuthResponse { userId: number; username: string | null; email: string | null; role: string | null; accessToken: string | null }
export interface LoginRequest { usernameOrEmail: string; password: string }
export interface RegisterRequest { username: string; email: string; password: string }
export interface UpdateProfileRequest { username?: string; email?: string; currentPassword?: string; newPassword?: string }

export const authApi = {
  login: async (body: LoginRequest) => (await httpClient.post<AuthResponse>('/api/auth/login', body)).data,
  register: async (body: RegisterRequest) => (await httpClient.post<AuthResponse>('/api/auth/register', body)).data,
  refresh: async () => (await httpClient.post<AuthResponse>('/api/auth/refresh', {})).data,
  logout: async () => { await httpClient.post('/api/auth/logout', {}) },
  me: async () => (await httpClient.get<OwnUserProfile>('/api/users/me')).data,
  updateProfile: async (body: UpdateProfileRequest) => (await httpClient.put<OwnUserProfile>('/api/users/me', body)).data,
}

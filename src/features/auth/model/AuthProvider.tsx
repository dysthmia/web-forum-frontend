import { useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { setAccessToken } from '../../../shared/api/httpClient.ts'
import { authApi, type AuthResponse, type LoginRequest, type RegisterRequest } from '../api/authApi.ts'
import type { AuthStatus, OwnUserProfile } from './types.ts'
import { AuthContext } from './AuthContext.ts'

export function AuthProvider({ children }: PropsWithChildren) { const [status, setStatus] = useState<AuthStatus>('guest'); const [user, setUser] = useState<OwnUserProfile | null>(null); const applyAuth = async (response: AuthResponse) => { if (!response.accessToken) throw new Error('Сервер не вернул access token.'); setAccessToken(response.accessToken); const profile = await authApi.me(); setUser(profile); setStatus('authenticated') }; const value = useMemo(() => ({ status, user, login: async (input: LoginRequest) => applyAuth(await authApi.login(input)), register: async (input: RegisterRequest) => applyAuth(await authApi.register(input)), logout: async () => { await authApi.logout(); setAccessToken(null); setUser(null); setStatus('guest') } }), [status, user]); return <AuthContext.Provider value={value}>{children}</AuthContext.Provider> }

import { useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { setAccessToken } from '../../../shared/api/httpClient.ts'
import { authApi, type AuthResponse, type LoginRequest, type RegisterRequest } from '../api/authApi.ts'
import type { AuthStatus, OwnUserProfile } from './types.ts'
import { AuthContext } from './AuthContext.ts'

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<OwnUserProfile | null>(null)

  const applyAuth = async (response: AuthResponse) => {
    if (!response.accessToken) throw new Error('Сервер не вернул access token.')
    setAccessToken(response.accessToken)
    const profile = await authApi.me()
    setUser(profile)
    setStatus('authenticated')
  }

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      try {
        const response = await authApi.refresh()
        if (!active) return
        await applyAuth(response)
      } catch {
        setAccessToken(null)
        if (active) {
          setUser(null)
          setStatus('guest')
        }
      }
    }

    void restoreSession()
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({
    status,
    user,
    login: async (input: LoginRequest) => applyAuth(await authApi.login(input)),
    register: async (input: RegisterRequest) => applyAuth(await authApi.register(input)),
    logout: async () => {
      try {
        await authApi.logout()
      } finally {
        setAccessToken(null)
        setUser(null)
        setStatus('guest')
      }
    },
  }), [status, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

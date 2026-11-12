import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { setAccessToken } from '../../../shared/api/httpClient.ts'
import { authApi, type AuthResponse, type LoginRequest, type RegisterRequest, type UpdateProfileRequest } from '../api/authApi.ts'
import type { AuthStatus, OwnUserProfile } from './types.ts'
import { AuthContext } from './AuthContext.ts'

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<OwnUserProfile | null>(null)

  const applyAuth = useCallback(async (response: AuthResponse) => {
    if (!response.accessToken) throw new Error('Сервер не вернул access token.')
    queryClient.removeQueries({ queryKey: ['reactions'] })
    setAccessToken(response.accessToken)
    const profile = await authApi.me()
    setUser(profile)
    setStatus('authenticated')
  }, [queryClient])

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      try {
        const response = await authApi.refresh()
        if (!active) return
        await applyAuth(response)
      } catch {
        setAccessToken(null)
        queryClient.removeQueries({ queryKey: ['reactions'] })
        if (active) {
          setUser(null)
          setStatus('guest')
        }
      }
    }

    void restoreSession()
    return () => { active = false }
  }, [applyAuth, queryClient])

  const value = useMemo(() => ({
    status,
    user,
    login: async (input: LoginRequest) => applyAuth(await authApi.login(input)),
    register: async (input: RegisterRequest) => applyAuth(await authApi.register(input)),
    updateProfile: async (input: UpdateProfileRequest) => {
      const profile = await authApi.updateProfile(input)
      setUser(profile)
      return profile
    },
    logout: async () => {
      try {
        await authApi.logout()
      } finally {
        setAccessToken(null)
        queryClient.removeQueries({ queryKey: ['reactions'] })
        setUser(null)
        setStatus('guest')
      }
    },
  }), [applyAuth, queryClient, status, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

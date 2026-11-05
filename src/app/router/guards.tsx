import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../features/auth/model/useAuth.ts'
import { LoadingState } from '../../shared/ui/LoadingState.tsx'

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) { const { status, user } = useAuth(); const location = useLocation(); if (status === 'loading') return <LoadingState label="Проверка сессии…" />; if (status === 'guest') return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />; if (roles && (!user?.role || !roles.includes(user.role))) return <Navigate to="/403" replace />; return children }
export function GuestRoute({ children }: { children: ReactNode }) { const { status } = useAuth(); if (status === 'loading') return <LoadingState label="Проверка сессии…" />; return status === 'authenticated' ? <Navigate to="/" replace /> : children }

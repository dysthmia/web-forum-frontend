import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { AdminUser, AdminUserRole } from '../features/moderation/api/moderationApi.ts'
import { moderationApi } from '../features/moderation/api/moderationApi.ts'
import { useAuth } from '../features/auth/model/useAuth.ts'
import { ApiError } from '../shared/api/errors.ts'
import { formatDate } from '../shared/lib/formatDate.ts'
import { Button } from '../shared/ui/Button.tsx'
import { ConfirmDialog } from '../shared/ui/ConfirmDialog.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { EmptyState } from '../shared/ui/EmptyState.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { Input } from '../shared/ui/Input.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'
import { Pagination } from '../shared/ui/Pagination.tsx'
import { Select } from '../shared/ui/Select.tsx'

const pageSize = 20
const roleLabels: Record<AdminUserRole, string> = { user: 'Пользователь', moderator: 'Модератор', admin: 'Администратор' }

function getRole(value: string | null): AdminUserRole | undefined {
  return value === 'user' || value === 'moderator' || value === 'admin' ? value : undefined
}

function actionError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Не удалось изменить роль. Попробуйте ещё раз.'
  const detail = error.problemTitle ? ` ${error.problemTitle}` : ''
  if (error.status === 400) return `Сервер не принял выбранную роль.${detail}`
  if (error.status === 403) return 'Изменение роли недоступно для вашей учётной записи.'
  if (error.status === 404) return `Пользователь больше не найден.${detail}`
  return error.problemTitle ?? error.message
}

interface PendingRoleChange {
  user: AdminUser
  role: Exclude<AdminUserRole, 'admin'>
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('query') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim())
  const [pendingChange, setPendingChange] = useState<PendingRoleChange | null>(null)
  const firstSearchEffect = useRef(true)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const role = getRole(searchParams.get('role'))

  useEffect(() => {
    if (firstSearchEffect.current) {
      firstSearchEffect.current = false
      return
    }
    const timer = window.setTimeout(() => {
      const query = search.trim()
      setDebouncedSearch(query)
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        if (query) next.set('query', query)
        else next.delete('query')
        next.set('page', '1')
        return next
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search, setSearchParams])

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', { query: debouncedSearch, role, page, pageSize }],
    queryFn: () => moderationApi.users({ query: debouncedSearch || undefined, role, page, pageSize }),
  })
  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role: nextRole }: { userId: number; role: Exclude<AdminUserRole, 'admin'> }) => moderationApi.changeRole(userId, nextRole),
    onSuccess: async () => {
      setPendingChange(null)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
  const list = usersQuery.data
  const mutationError = changeRoleMutation.isError ? actionError(changeRoleMutation.error) : null

  const changeFilter = (nextRole: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (nextRole) next.set('role', nextRole)
      else next.delete('role')
      next.set('page', '1')
      return next
    })
  }

  return <section className="py-8"><Container><PageTitle title="Управление пользователями" description="Поиск, роли и активные блокировки." /><div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]"><Input label="Поиск по username" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Введите username" /><Select label="Роль" value={role ?? ''} onChange={(event) => changeFilter(event.target.value)}><option value="">Все роли</option><option value="user">Пользователи</option><option value="moderator">Модераторы</option><option value="admin">Администраторы</option></Select></div>{mutationError ? <p className="mt-4 text-sm text-forum-text" role="alert">{mutationError}</p> : null}<div className="mt-5">{usersQuery.isPending ? <LoadingState label="Загрузка пользователей…" /> : usersQuery.isError ? <ErrorState message={actionError(usersQuery.error)} onRetry={() => void usersQuery.refetch()} /> : list?.items.length ? <><div className="overflow-x-auto"><table className="min-w-[44rem] w-full border-collapse text-left text-sm"><thead className="border-y border-forum-border text-forum-muted"><tr><th className="px-3 py-3 font-medium">Username</th><th className="px-3 py-3 font-medium">Роль</th><th className="px-3 py-3 font-medium">Регистрация</th><th className="px-3 py-3 font-medium">Блокировка</th><th className="px-3 py-3 font-medium"><span className="sr-only">Действия</span></th></tr></thead><tbody>{list.items.map((item) => { const nextRole = item.role === 'user' ? 'moderator' : item.role === 'moderator' ? 'user' : null; const canChangeRole = nextRole !== null && item.id !== currentUser?.id; return <tr key={item.id} className="border-b border-forum-border"><td className="px-3 py-3 font-medium text-forum-text">{item.username}</td><td className="px-3 py-3 text-forum-muted">{roleLabels[item.role]}</td><td className="px-3 py-3 text-forum-muted">{formatDate(item.createdAt)}</td><td className="px-3 py-3 text-forum-muted">{item.isBanned ? 'Активная' : 'Нет'}</td><td className="px-3 py-3 text-right">{canChangeRole ? <Button variant="secondary" disabled={changeRoleMutation.isPending} aria-label={`${nextRole === 'moderator' ? 'Сделать модератором' : 'Сделать пользователем'} для ${item.username}`} onClick={() => { changeRoleMutation.reset(); setPendingChange({ user: item, role: nextRole }) }}>{nextRole === 'moderator' ? 'Сделать модератором' : 'Сделать пользователем'}</Button> : <span className="text-sm text-forum-subtle">—</span>}</td></tr> })}</tbody></table></div><Pagination page={list.page} totalPages={Math.ceil(list.totalCount / list.pageSize)} /></> : <EmptyState title="Пользователи не найдены" description="Попробуйте изменить поиск или фильтр." />}</div><ConfirmDialog open={pendingChange !== null} title="Изменить роль пользователя?" description={pendingChange ? `Пользователь ${pendingChange.user.username} получит роль «${roleLabels[pendingChange.role]}».` : ''} confirmLabel="Изменить роль" loading={changeRoleMutation.isPending} onClose={() => { if (!changeRoleMutation.isPending) setPendingChange(null) }} onConfirm={() => { if (pendingChange) changeRoleMutation.mutate({ userId: pendingChange.user.id, role: pendingChange.role }) }} /></Container></section>
}

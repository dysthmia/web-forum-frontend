import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { Ban, BanStatus } from '../features/moderation/api/moderationApi.ts'
import { moderationApi } from '../features/moderation/api/moderationApi.ts'
import { useAuth } from '../features/auth/model/useAuth.ts'
import { forumApi } from '../features/forum/api/forumApi.ts'
import type { PublicUserProfile } from '../entities/user/model/types.ts'
import { ApiError } from '../shared/api/errors.ts'
import { formatDate } from '../shared/lib/formatDate.ts'
import { Button } from '../shared/ui/Button.tsx'
import { Checkbox } from '../shared/ui/Checkbox.tsx'
import { ConfirmDialog } from '../shared/ui/ConfirmDialog.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { EmptyState } from '../shared/ui/EmptyState.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { Input } from '../shared/ui/Input.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'
import { Pagination } from '../shared/ui/Pagination.tsx'
import { Select } from '../shared/ui/Select.tsx'
import { Textarea } from '../shared/ui/Textarea.tsx'

const pageSize = 20
const statusLabels: Record<BanStatus, string> = { active: 'Активные', expired: 'Истёкшие', revoked: 'Снятые' }

function getStatus(value: string | null): BanStatus | undefined { return value === 'active' || value === 'expired' || value === 'revoked' ? value : undefined }
function isActive(ban: Ban): boolean { return ban.revokedAt === null && (ban.expiresAt === null || new Date(ban.expiresAt).getTime() > Date.now()) }
function formatExpiry(value: string | null): string { return value ? formatDate(value) : 'Бессрочно' }
function actionError(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback
  if (error.status === 403) return 'У вас недостаточно прав для этого действия.'
  if (error.status === 404) return 'Пользователь или блокировка больше не найдены.'
  if (error.status === 409) return 'Блокировка уже снята или срок её действия истёк.'
  return error.problemTitle ?? error.message
}
function createBanError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Не удалось создать блокировку. Попробуйте ещё раз.'
  if (error.status === 403) return 'У вас недостаточно прав для блокировки этого пользователя.'
  if (error.status === 404) return 'Пользователь больше не найден.'
  if (error.status === 409) return 'У пользователя уже есть активная блокировка.'
  if (error.status === 400) return 'Проверьте причину и дату окончания блокировки.'
  return error.problemTitle ?? error.message
}

export function ModerationUsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('query') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim())
  const [username, setUsername] = useState('')
  const [selectedUser, setSelectedUser] = useState<PublicUserProfile | null>(null)
  const [reason, setReason] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [permanent, setPermanent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingRevoke, setPendingRevoke] = useState<Ban | null>(null)
  const firstSearchEffect = useRef(true)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const status = getStatus(searchParams.get('status'))
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (firstSearchEffect.current) { firstSearchEffect.current = false; return }
    const timer = window.setTimeout(() => {
      const query = search.trim()
      setDebouncedSearch(query)
      setSearchParams((current) => { const next = new URLSearchParams(current); if (query) next.set('query', query); else next.delete('query'); next.set('page', '1'); return next })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search, setSearchParams])

  const bansQuery = useQuery({ queryKey: ['moderation', 'bans', { query: debouncedSearch, status, page, pageSize }], queryFn: () => moderationApi.bans({ query: debouncedSearch || undefined, status, page, pageSize }) })
  const historyQuery = useQuery({ queryKey: ['moderation', 'ban-history', selectedUser?.id], queryFn: () => moderationApi.banHistory(selectedUser!.id), enabled: selectedUser !== null })
  const lookupMutation = useMutation({ mutationFn: (value: string) => forumApi.getPublicUserProfileByUsername(value), onSuccess: (profile) => { setSelectedUser(profile); setFormError(null) } })
  const createMutation = useMutation({
    mutationFn: ({ userId, nextReason, nextExpiresAt }: { userId: number; nextReason: string; nextExpiresAt: string | null }) => moderationApi.createBan(userId, nextReason, nextExpiresAt),
    onSuccess: async () => { setReason(''); setExpiresAt(''); setPermanent(false); setFormError(null); await queryClient.invalidateQueries({ queryKey: ['moderation', 'bans'] }); await queryClient.invalidateQueries({ queryKey: ['moderation', 'ban-history', selectedUser?.id] }) },
  })
  const revokeMutation = useMutation({
    mutationFn: (banId: number) => moderationApi.revokeBan(banId),
    onSuccess: async () => { setPendingRevoke(null); await queryClient.invalidateQueries({ queryKey: ['moderation', 'bans'] }); await queryClient.invalidateQueries({ queryKey: ['moderation', 'ban-history', selectedUser?.id] }) },
  })

  const submitLookup = () => { const value = username.trim(); if (!value) { setFormError('Введите точный username пользователя.'); return }; setFormError(null); lookupMutation.mutate(value) }
  const submitBan = () => {
    createMutation.reset()
    const nextReason = reason.trim()
    if (!selectedUser) { setFormError('Сначала найдите и выберите пользователя.'); return }
    if (!nextReason) { setFormError('Укажите причину блокировки.'); return }
    if (!isAdmin && !expiresAt) { setFormError('Для модератора обязательна дата окончания блокировки.'); return }
    if (!permanent && !expiresAt) { setFormError('Укажите дату окончания или выберите бессрочную блокировку.'); return }
    const nextExpiresAt = permanent ? null : new Date(expiresAt).toISOString()
    if (nextExpiresAt !== null && (Number.isNaN(new Date(nextExpiresAt).getTime()) || new Date(nextExpiresAt).getTime() <= Date.now())) { setFormError('Дата окончания должна быть в будущем.'); return }
    setFormError(null)
    createMutation.mutate({ userId: selectedUser.id, nextReason, nextExpiresAt })
  }
  const changeStatus = (value: string) => setSearchParams((current) => { const next = new URLSearchParams(current); if (value) next.set('status', value); else next.delete('status'); next.set('page', '1'); return next })
  const list = bansQuery.data
  const lookupError = lookupMutation.isError && lookupMutation.error instanceof ApiError && lookupMutation.error.status === 404 ? 'Пользователь не найден.' : lookupMutation.isError ? actionError(lookupMutation.error, 'Не удалось найти пользователя. Попробуйте ещё раз.') : null
  const mutationError = createMutation.isError ? createBanError(createMutation.error) : revokeMutation.isError ? actionError(revokeMutation.error, 'Не удалось снять блокировку. Попробуйте ещё раз.') : null

  return <section className="py-8"><Container><PageTitle title="Блокировки пользователей" description="Создание, история и снятие блокировок пользователей." />
    <div className="mt-5 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start"><div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]"><Input label="Поиск блокировок" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Username" /><Select label="Статус" value={status ?? ''} onChange={(event) => changeStatus(event.target.value)}><option value="">Все блокировки</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></div>
      {mutationError ? <p className="mt-4 text-sm text-forum-text" role="alert">{mutationError}</p> : null}
      <div className="mt-5">{bansQuery.isPending ? <LoadingState label="Загрузка блокировок…" /> : bansQuery.isError ? <ErrorState message={actionError(bansQuery.error, 'Не удалось загрузить блокировки.')} onRetry={() => void bansQuery.refetch()} /> : list?.items.length ? <><div className="overflow-x-auto"><table className="min-w-[48rem] w-full border-collapse text-left text-sm"><thead className="border-y border-forum-border text-forum-muted"><tr><th className="px-3 py-3 font-medium">Пользователь</th><th className="px-3 py-3 font-medium">Причина</th><th className="px-3 py-3 font-medium">Окончание</th><th className="px-3 py-3 font-medium">Статус</th><th className="px-3 py-3 font-medium"><span className="sr-only">Действия</span></th></tr></thead><tbody>{list.items.map((ban) => <tr key={ban.banId} className="border-b border-forum-border"><td className="px-3 py-3 font-medium text-forum-text">{ban.username}</td><td className="px-3 py-3 text-forum-muted">{ban.reason}</td><td className="px-3 py-3 text-forum-muted">{formatExpiry(ban.expiresAt)}</td><td className="px-3 py-3 text-forum-muted">{isActive(ban) ? 'Активна' : ban.revokedAt ? 'Снята' : 'Истекла'}</td><td className="px-3 py-3 text-right">{isActive(ban) ? <Button variant="secondary" disabled={revokeMutation.isPending} aria-label={`Снять блокировку для ${ban.username}`} onClick={() => { revokeMutation.reset(); setPendingRevoke(ban) }}>Снять</Button> : <span className="text-forum-subtle">—</span>}</td></tr>)}</tbody></table></div><Pagination page={list.page} totalPages={Math.ceil(list.totalCount / list.pageSize)} /></> : <EmptyState title="Блокировки не найдены" description="Попробуйте изменить поиск или фильтр." />}</div>
    </div><aside className="border-t border-forum-border pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0"><h2 className="text-base font-medium text-forum-text">Новая блокировка</h2><div className="mt-4 grid gap-4"><Input label="Username пользователя" value={username} onChange={(event) => setUsername(event.target.value)} disabled={lookupMutation.isPending || createMutation.isPending} /><Button variant="secondary" loading={lookupMutation.isPending} disabled={createMutation.isPending} onClick={submitLookup}>Найти пользователя</Button>{lookupError ? <p className="text-sm text-forum-text" role="alert">{lookupError}</p> : null}{selectedUser ? <p className="text-sm text-forum-muted">Выбран пользователь: <span className="font-medium text-forum-text">{selectedUser.username}</span></p> : null}<Textarea label="Причина" value={reason} onChange={(event) => setReason(event.target.value)} disabled={!selectedUser || createMutation.isPending} required />{isAdmin ? <Checkbox label="Бессрочная блокировка" checked={permanent} onChange={(event) => setPermanent(event.target.checked)} disabled={!selectedUser || createMutation.isPending} /> : null}<Input label="Дата окончания" type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} disabled={!selectedUser || permanent || createMutation.isPending} required={!isAdmin || !permanent} hint={isAdmin ? 'Оставьте пустым только для бессрочной блокировки.' : 'Модератор может создать только временную блокировку.'} />{formError ? <p className="text-sm text-forum-text" role="alert">{formError}</p> : null}<Button loading={createMutation.isPending} disabled={!selectedUser || lookupMutation.isPending} onClick={submitBan}>Заблокировать пользователя</Button></div>{selectedUser ? <div className="mt-8 border-t border-forum-border pt-5"><h2 className="text-base font-medium text-forum-text">История блокировок</h2>{historyQuery.isPending ? <div className="mt-3"><LoadingState label="Загрузка истории…" /></div> : historyQuery.isError ? <div className="mt-3"><ErrorState message={actionError(historyQuery.error, 'Не удалось загрузить историю блокировок.')} onRetry={() => void historyQuery.refetch()} /></div> : historyQuery.data?.length ? <ul className="mt-3 grid gap-3">{historyQuery.data.map((ban) => <li key={ban.banId} className="border-b border-forum-border pb-3 text-sm"><p className="text-forum-text">{ban.reason}</p><p className="mt-1 text-forum-muted">{formatDate(ban.createdAt)} · до {formatExpiry(ban.expiresAt)}</p></li>)}</ul> : <p className="mt-3 text-sm text-forum-muted">У пользователя ещё нет блокировок.</p>}</div> : null}</aside></div>
    <ConfirmDialog open={pendingRevoke !== null} title="Снять блокировку?" description={pendingRevoke ? `Блокировка пользователя ${pendingRevoke.username} будет снята.` : ''} confirmLabel="Снять блокировку" loading={revokeMutation.isPending} onClose={() => { if (!revokeMutation.isPending) setPendingRevoke(null) }} onConfirm={() => { if (pendingRevoke) revokeMutation.mutate(pendingRevoke.banId) }} />
  </Container></section>
}

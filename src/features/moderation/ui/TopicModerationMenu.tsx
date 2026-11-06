import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/model/useAuth.ts'
import { forumApi } from '../../forum/api/forumApi.ts'
import { invalidateTopicRelatedQueries } from '../../forum/api/queries.ts'
import { ApiError } from '../../../shared/api/errors.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog.tsx'

function actionError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Не удалось изменить тему. Попробуйте ещё раз.'
  if (error.status === 403) return 'У вас нет прав для этого действия.'
  if (error.status === 404) return 'Тема больше не найдена.'
  return error.problemTitle ?? error.message
}

export function TopicModerationMenu({ topicId, topicAuthorId, isClosed, isPinned }: { topicId: number; topicAuthorId: number; isClosed: boolean; isPinned: boolean }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canModerate = user?.role === 'moderator' || user?.role === 'admin'
  const canDelete = canModerate || user?.id === topicAuthorId
  const updateMutation = useMutation({ mutationFn: async ({ action, value }: { action: 'closed' | 'pinned'; value: boolean }) => action === 'closed' ? forumApi.setTopicClosed(topicId, value) : forumApi.setTopicPinned(topicId, value), onSuccess: async () => { await invalidateTopicRelatedQueries(queryClient) } })
  const deleteMutation = useMutation({ mutationFn: () => forumApi.deleteTopic(topicId), onSuccess: async () => { await invalidateTopicRelatedQueries(queryClient); navigate('/') } })
  if (!canModerate && !canDelete) return null
  const pending = updateMutation.isPending || deleteMutation.isPending
  const error = updateMutation.isError ? actionError(updateMutation.error) : deleteMutation.isError ? actionError(deleteMutation.error) : null
  return <><div className="mt-4 flex flex-wrap gap-2">{canModerate ? <><Button variant="secondary" loading={updateMutation.isPending} disabled={pending} onClick={() => updateMutation.mutate({ action: 'closed', value: !isClosed })}>{isClosed ? 'Открыть тему' : 'Закрыть тему'}</Button><Button variant="secondary" loading={updateMutation.isPending} disabled={pending} onClick={() => updateMutation.mutate({ action: 'pinned', value: !isPinned })}>{isPinned ? 'Открепить тему' : 'Закрепить тему'}</Button></> : null}{canDelete ? <Button variant="ghost" disabled={pending} onClick={() => { deleteMutation.reset(); setConfirmDelete(true) }}>Удалить тему</Button> : null}</div>{error ? <p className="mt-3 text-sm text-forum-text" role="alert">{error}</p> : null}<ConfirmDialog open={confirmDelete} title="Удалить тему?" description="Тема и её ответы будут скрыты из форума." confirmLabel="Удалить тему навсегда" loading={deleteMutation.isPending} onClose={() => { if (!deleteMutation.isPending) setConfirmDelete(false) }} onConfirm={() => deleteMutation.mutate()} /></>
}

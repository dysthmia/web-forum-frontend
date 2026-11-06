import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../../auth/model/useAuth.ts'
import { forumApi } from '../../forum/api/forumApi.ts'
import { invalidateTopicRelatedQueries } from '../../forum/api/queries.ts'
import { ApiError } from '../../../shared/api/errors.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog.tsx'

function deleteError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Не удалось удалить сообщение. Попробуйте ещё раз.'
  if (error.status === 403) return 'У вас нет прав для удаления этого сообщения.'
  if (error.status === 404) return 'Сообщение больше не найдено.'
  if (error.status === 409) return 'Сообщение уже удалено.'
  return error.problemTitle ?? error.message
}

export function PostModerationActions({ topicId, postId, position }: { topicId: number; postId: number; position: number }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const canModerate = user?.role === 'moderator' || user?.role === 'admin'
  const mutation = useMutation({ mutationFn: () => forumApi.deletePost(topicId, postId), onSuccess: async () => { setConfirmOpen(false); await invalidateTopicRelatedQueries(queryClient) } })
  if (!canModerate || position === 1) return null
  return <><div className="mt-3"><Button variant="ghost" disabled={mutation.isPending} aria-label={`Удалить сообщение #${position}`} onClick={() => { mutation.reset(); setConfirmOpen(true) }}>Удалить</Button></div>{mutation.isError ? <p className="mt-2 text-sm text-forum-text" role="alert">{deleteError(mutation.error)}</p> : null}<ConfirmDialog open={confirmOpen} title="Удалить сообщение?" description="Ответ будет удалён без возможности восстановления." confirmLabel="Удалить сообщение" loading={mutation.isPending} onClose={() => { if (!mutation.isPending) setConfirmOpen(false) }} onConfirm={() => mutation.mutate()} /></>
}

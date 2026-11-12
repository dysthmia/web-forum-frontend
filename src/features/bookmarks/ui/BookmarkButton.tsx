import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../auth/model/useAuth.ts'
import { forumApi } from '../../forum/api/forumApi.ts'
import { Button } from '../../../shared/ui/Button.tsx'

export function BookmarkButton({ topicId }: { topicId: number }) {
  const { status } = useAuth()
  const queryClient = useQueryClient()
  const bookmarkStatus = useQuery({ queryKey: ['bookmarks', 'status', topicId], queryFn: () => forumApi.getBookmarkStatus(topicId), enabled: status === 'authenticated' })
  const mutation = useMutation({
    mutationFn: () => bookmarkStatus.data?.isBookmarked ? forumApi.removeBookmark(topicId) : forumApi.addBookmark(topicId),
    onSuccess: async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ['bookmarks', 'status', topicId] }), queryClient.invalidateQueries({ queryKey: ['bookmarks'] })]) },
  })

  if (status === 'guest') return <Link to="/login" title="Войдите, чтобы добавить тему в избранное" aria-label="Войдите, чтобы добавить тему в избранное" className="inline-flex min-h-10 items-center justify-center rounded-md px-2 text-forum-muted transition-colors hover:bg-forum-surface hover:text-forum-text"><Bookmark className="size-5" aria-hidden="true" /></Link>

  const isBookmarked = bookmarkStatus.data?.isBookmarked ?? false
  const label = isBookmarked ? 'Убрать тему из избранного' : 'Добавить тему в избранное'
  return <Button variant="ghost" className="px-2 text-forum-muted hover:text-forum-text" aria-label={label} title={label} loading={bookmarkStatus.isPending || mutation.isPending} disabled={mutation.isPending} icon={isBookmarked ? <BookmarkCheck className="size-5" aria-hidden="true" /> : <Bookmark className="size-5" aria-hidden="true" />} onClick={() => mutation.mutate()} />
}

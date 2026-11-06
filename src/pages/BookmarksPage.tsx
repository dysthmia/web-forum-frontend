import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import { forumApi } from '../features/forum/api/forumApi.ts'
import { formatDate } from '../shared/lib/formatDate.ts'
import { Container } from '../shared/ui/Container.tsx'
import { EmptyState } from '../shared/ui/EmptyState.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'
import { Pagination } from '../shared/ui/Pagination.tsx'

const pageSize = 20

export function BookmarksPage() {
  const [params] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const bookmarks = useQuery({ queryKey: ['bookmarks', { page, pageSize }], queryFn: () => forumApi.getBookmarks({ page, pageSize }) })
  return <main className="py-8"><Container><PageTitle title="Избранное" description="Сохранённые темы." /><div className="mt-5">{bookmarks.isPending ? <LoadingState label="Загрузка избранного…" /> : bookmarks.isError ? <ErrorState message={bookmarks.error.message} onRetry={() => void bookmarks.refetch()} /> : bookmarks.data.items.length ? <><div className="border-t border-forum-border">{bookmarks.data.items.map((topic) => <article key={topic.topicId} className="border-b border-forum-border py-4"><Link to={`/topics/${topic.topicId}`} className="font-medium text-forum-text hover:underline">{topic.title}</Link><p className="mt-2 text-sm text-forum-muted">{topic.isPinned ? 'Закреплена · ' : ''}{topic.isClosed ? 'Закрыта · ' : ''}Добавлена в избранное {formatDate(topic.bookmarkedAt)}</p></article>)}</div><Pagination page={bookmarks.data.page} totalPages={Math.ceil(bookmarks.data.totalCount / bookmarks.data.pageSize)} /></> : <EmptyState title="В избранном пока нет тем" description="Сохранённые темы появятся здесь." />}</div></Container></main>
}

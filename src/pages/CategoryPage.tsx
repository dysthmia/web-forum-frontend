import { useParams, useSearchParams } from 'react-router'
import { TopicRow } from '../entities/topic/ui/TopicRow.tsx'
import { useCategoryQuery } from '../features/categories/api/queries.ts'
import { useCategoryTopicsQuery } from '../features/forum/api/queries.ts'
import { formatDate } from '../shared/lib/formatDate.ts'
import { Container } from '../shared/ui/Container.tsx'
import { EmptyState } from '../shared/ui/EmptyState.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'
import { Pagination } from '../shared/ui/Pagination.tsx'
import { SortSelect } from '../shared/ui/SortSelect.tsx'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const [params] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const sort = params.get('sort') ?? 'recent'
  const categoryQuery = useCategoryQuery(slug)
  const topicsQuery = useCategoryTopicsQuery(categoryQuery.data?.id, { page, pageSize: 20, sort })
  if (categoryQuery.isPending) return <main className="py-8"><Container><LoadingState label="Загрузка категории…" /></Container></main>
  if (categoryQuery.isError) return <main className="py-8"><Container><ErrorState message={categoryQuery.error.message} onRetry={() => void categoryQuery.refetch()} /></Container></main>
  const category = categoryQuery.data
  return <main className="py-8"><Container><PageTitle title={category.name ?? `Категория #${category.id}`} description={category.description ?? undefined} /><div className="mt-5 flex justify-end"><SortSelect options={[{ value: 'recent', label: 'Сначала новые' }, { value: 'active', label: 'По активности' }]} /></div><div className="mt-4">{topicsQuery.isPending ? <LoadingState label="Загрузка тем…" /> : topicsQuery.isError ? <ErrorState message={topicsQuery.error.message} onRetry={() => void topicsQuery.refetch()} /> : topicsQuery.data.items?.length ? <><div>{topicsQuery.data.items.map((topic) => <TopicRow key={topic.id} id={String(topic.id)} title={topic.title ?? `Тема #${topic.id}`} author={`Пользователь #${topic.authorId}`} category={category.name ?? `Категория #${category.id}`} replies={topic.replyCount} views={topic.viewCount} lastActivity={formatDate(topic.updatedAt)} isClosed={topic.isClosed} isPinned={topic.isPinned} />)}</div><Pagination page={topicsQuery.data.page} totalPages={Math.ceil(topicsQuery.data.totalCount / topicsQuery.data.pageSize)} /></> : <EmptyState title="В этой категории пока нет тем" />}</div></Container></main>
}

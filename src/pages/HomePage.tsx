import { useSearchParams } from 'react-router'
import { TopicRow } from '../entities/topic/ui/TopicRow.tsx'
import { useTopicsQuery } from '../features/forum/api/queries.ts'
import { formatDate } from '../shared/lib/formatDate.ts'
import { Container } from '../shared/ui/Container.tsx'
import { EmptyState } from '../shared/ui/EmptyState.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'
import { Pagination } from '../shared/ui/Pagination.tsx'
import { Tabs } from '../shared/ui/Tabs.tsx'

export function HomePage() { const [params] = useSearchParams(); const page = Number(params.get('page')) || 1; const sort = params.get('tab') === 'popular' ? 'popular' : 'recent'; const query = useTopicsQuery({ sort, page, pageSize: 20 }); return <main className="py-8"><Container><PageTitle title="Обсуждения" description="Последние и популярные темы форума." /><div className="mt-5"><Tabs /></div><div className="mt-4">{query.isPending ? <LoadingState label="Загрузка тем…" /> : query.isError ? <ErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : query.data.items?.length ? <><div>{query.data.items.map((topic) => <TopicRow key={topic.id} id={String(topic.id)} title={topic.title ?? `Тема #${topic.id}`} author={`Пользователь #${topic.authorId}`} category="Категория не указана" replies={topic.replyCount} views={topic.viewCount} lastActivity={formatDate(topic.updatedAt)} isClosed={topic.isClosed} isPinned={topic.isPinned} />)}</div><Pagination page={query.data.page} totalPages={Math.ceil(query.data.totalCount / query.data.pageSize)} /></> : <EmptyState title="Тем пока нет" />}</div></Container></main> }

import { Link } from 'react-router'
import { useCategoriesQuery } from '../features/categories/api/queries.ts'
import { Container } from '../shared/ui/Container.tsx'
import { EmptyState } from '../shared/ui/EmptyState.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

export function CategoriesPage() {
  const query = useCategoriesQuery()
  return <main className="py-8"><Container><PageTitle title="Категории" description="Разделы форума." /><div className="mt-5">{query.isPending ? <LoadingState label="Загрузка категорий…" /> : query.isError ? <ErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : query.data.length === 0 ? <EmptyState title="Категорий пока нет" /> : <div>{query.data.map((category) => category.slug ? <Link key={category.id} to={`/categories/${category.slug}`} className="block border-b border-forum-border py-4 hover:bg-forum-surface"><h2 className="text-base font-medium text-forum-text">{category.name ?? `Категория #${category.id}`}</h2>{category.description ? <p className="mt-1 text-sm text-forum-muted">{category.description}</p> : null}</Link> : <article key={category.id} className="border-b border-forum-border py-4"><h2 className="text-base font-medium text-forum-text">{category.name ?? `Категория #${category.id}`}</h2></article>)}</div>}</div></Container></main>
}

import { Link, useParams } from 'react-router'
import { useAuth } from '../features/auth/model/useAuth.ts'
import { usePublicUserProfileByUsernameQuery } from '../features/forum/api/queries.ts'
import { formatDate } from '../shared/lib/formatDate.ts'
import { Container } from '../shared/ui/Container.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

export function UserProfilePage() {
  const { username = '' } = useParams()
  const { user: currentUser } = useAuth()
  const query = usePublicUserProfileByUsernameQuery(username)

  if (query.isPending) return <main className="py-8"><Container><LoadingState label="Загрузка профиля…" /></Container></main>
  if (query.isError) return <main className="py-8"><Container><ErrorState message={query.error.message} onRetry={() => void query.refetch()} /></Container></main>

  const user = query.data
  const modePath = currentUser?.id === user.id && currentUser.role === 'admin'
    ? { href: '/admin', label: 'Режим администратора' }
    : currentUser?.id === user.id && currentUser.role === 'moderator'
      ? { href: '/moderation/reports', label: 'Режим модератора' }
      : null

  return <main className="py-8"><Container><PageTitle title={user.username ?? username} description={<span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1"><span>{user.role}</span>{modePath ? <Link to={modePath.href} className="font-medium text-forum-text underline decoration-forum-border underline-offset-4 hover:decoration-forum-text">{modePath.label}</Link> : null}</span>} /><dl className="mt-5 grid gap-3 text-sm text-forum-muted"><div><dt className="text-forum-subtle">Дата регистрации</dt><dd className="mt-1 text-forum-text">{formatDate(user.createdAt)}</dd></div><div><dt className="text-forum-subtle">Темы</dt><dd className="mt-1 text-forum-text">{user.topicCount}</dd></div><div><dt className="text-forum-subtle">Сообщения</dt><dd className="mt-1 text-forum-text">{user.postCount}</dd></div></dl></Container></main>
}

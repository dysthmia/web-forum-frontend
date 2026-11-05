import { useAuth } from '../features/auth/model/useAuth.ts'
import { Container } from '../shared/ui/Container.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

export function SettingsPage() { const { user } = useAuth(); return <main className="py-8"><Container><PageTitle title="Настройки" description="Данные учётной записи." /><dl className="mt-5 grid gap-3 text-sm"><div><dt className="text-forum-muted">Username</dt><dd>{user?.username}</dd></div><div><dt className="text-forum-muted">Email</dt><dd>{user?.email}</dd></div><div><dt className="text-forum-muted">Роль</dt><dd>{user?.role}</dd></div></dl><p className="mt-6 text-sm text-forum-muted">Изменение профиля будет доступно после согласования UX для подтверждённого PUT /api/users/me.</p></Container></main> }

import { Link } from 'react-router'
import { Container } from '../shared/ui/Container.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

const sections = [
  { to: '/admin/categories', label: 'Категории' },
  { to: '/admin/users', label: 'Пользователи' },
  { to: '/moderation/reports', label: 'Жалобы' },
  { to: '/moderation/users', label: 'Блокировки' },
]

export function AdminPage() {
  return <section className="py-8"><Container><PageTitle title="Администрирование" description="Управление доступными служебными разделами форума." /><nav className="mt-5 grid border-t border-forum-border" aria-label="Разделы администрирования">{sections.map((section) => <Link key={section.to} to={section.to} className="flex min-h-12 items-center border-b border-forum-border text-sm text-forum-text hover:bg-forum-surface">{section.label}</Link>)}</nav></Container></section>
}

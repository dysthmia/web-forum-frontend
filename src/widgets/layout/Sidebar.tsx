import { Bookmark, Folder, Home, TrendingUp } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router'
import { EmptyState } from '../../shared/ui/EmptyState.tsx'

interface SidebarProps {
  onNavigate?: () => void
}

const itemClasses = (active: boolean) => `flex min-h-10 items-center gap-3 rounded-md px-3 text-sm ${active ? 'bg-forum-surface text-forum-text' : 'text-forum-muted hover:bg-forum-surface hover:text-forum-text'}`

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation()
  const activeFeed = new URLSearchParams(location.search).get('tab') === 'popular' ? 'popular' : 'new'

  return (
    <aside className="h-full border-r border-forum-border bg-forum-sidebar p-3" aria-label="Навигация форума">
      <nav className="grid gap-1">
        <Link to="/" onClick={onNavigate} aria-current={location.pathname === '/' && activeFeed === 'new' ? 'page' : undefined} className={itemClasses(location.pathname === '/' && activeFeed === 'new')}>
          <Home className="size-4" aria-hidden="true" />Главная
        </Link>
        <Link to="/?tab=popular" onClick={onNavigate} aria-current={location.pathname === '/' && activeFeed === 'popular' ? 'page' : undefined} className={itemClasses(location.pathname === '/' && activeFeed === 'popular')}>
          <TrendingUp className="size-4" aria-hidden="true" />Популярные
        </Link>
        <NavLink to="/categories" onClick={onNavigate} className={({ isActive }) => itemClasses(isActive)}>
          <Folder className="size-4" aria-hidden="true" />Категории
        </NavLink>
        <NavLink to="/bookmarks" onClick={onNavigate} className={({ isActive }) => itemClasses(isActive)}>
          <Bookmark className="size-4" aria-hidden="true" />Избранное
        </NavLink>
      </nav>
      <section className="mt-6" aria-labelledby="categories-title">
        <h2 id="categories-title" className="px-3 text-xs font-medium uppercase tracking-wide text-forum-muted">Категории</h2>
        <div className="mt-2 px-3"><EmptyState title="Категории появятся здесь" description="Нужен подтверждённый API-контракт." /></div>
      </section>
    </aside>
  )
}

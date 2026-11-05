import { Menu, Plus, Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../features/auth/model/useAuth.ts'
import { Button } from '../../shared/ui/Button.tsx'

interface HeaderProps { onOpenNavigation: () => void }

export function Header({ onOpenNavigation }: HeaderProps) {
  const navigate = useNavigate()
  const { status, user } = useAuth()
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get('query') ?? '').trim()
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }

  const userProfilePath = user?.username ? `/users/${encodeURIComponent(user.username)}` : '/settings'

  return <header className="sticky top-0 z-20 border-b border-forum-border bg-forum-bg"><div className="mx-auto flex min-h-14 max-w-7xl items-center gap-3 px-4 sm:px-6"><Button variant="ghost" className="px-2 lg:hidden" aria-label="Открыть навигацию" icon={<Menu className="size-5" aria-hidden="true" />} onClick={onOpenNavigation} /><Link to="/" className="shrink-0 text-base font-semibold tracking-tight text-forum-text">fomo-forum.</Link><form className="mx-auto hidden max-w-md flex-1 sm:block" role="search" onSubmit={onSubmit}><label className="sr-only" htmlFor="forum-search">Поиск по форуму</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-forum-muted" aria-hidden="true" /><input id="forum-search" name="query" type="search" className="min-h-9 w-full rounded-md border border-forum-border bg-forum-sidebar py-1 pl-9 pr-3 text-sm text-forum-text placeholder:text-forum-subtle focus:outline-none focus:ring-2 focus:ring-forum-focus" placeholder="Поиск" /></div></form><nav className="ml-auto flex items-center gap-1" aria-label="Действия"><Link to="/topics/new" className="inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm text-forum-text hover:bg-forum-surface"><Plus className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Тема</span></Link>{status === 'authenticated' && user ? <Link to={userProfilePath} className="inline-flex min-h-10 items-center rounded-md px-2 text-sm text-forum-text hover:bg-forum-surface">{user.username ?? user.email ?? 'Профиль'}</Link> : <Link to="/login" className="inline-flex min-h-10 items-center rounded-md px-2 text-sm text-forum-text hover:bg-forum-surface">Войти</Link>}</nav></div></header>
}

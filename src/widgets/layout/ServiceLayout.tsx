import { Menu, Shield, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { Button } from '../../shared/ui/Button.tsx'
import { useAuth } from '../../features/auth/model/useAuth.ts'

type ServiceMode = 'admin' | 'moderation'

interface ServiceLayoutProps {
  mode: ServiceMode
}

interface ServiceNavigationProps {
  mode: ServiceMode
  onNavigate?: () => void
}

interface NavigationItem {
  to: string
  label: string
}

const navigationByMode: Record<ServiceMode, NavigationItem[]> = {
  admin: [
    { to: '/admin', label: 'Обзор' },
    { to: '/admin/categories', label: 'Категории' },
    { to: '/admin/users', label: 'Пользователи' },
    { to: '/moderation/reports', label: 'Жалобы' },
    { to: '/moderation/users', label: 'Блокировки' },
  ],
  moderation: [
    { to: '/moderation/reports', label: 'Жалобы' },
    { to: '/moderation/users', label: 'Блокировки' },
  ],
}

const itemClasses = (active: boolean) => `flex min-h-10 items-center rounded-md px-3 text-sm ${active ? 'bg-forum-surface text-forum-text' : 'text-forum-muted hover:bg-forum-surface hover:text-forum-text'}`

function ServiceNavigation({ mode, onNavigate }: ServiceNavigationProps) {
  return <nav className="grid gap-1" aria-label={mode === 'admin' ? 'Навигация администратора' : 'Навигация модератора'}>
    {navigationByMode[mode].map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/admin'} onClick={onNavigate} className={({ isActive }) => itemClasses(isActive)}>{item.label}</NavLink>)}
    <Link to="/" onClick={onNavigate} className="mt-3 flex min-h-10 items-center rounded-md border border-forum-border px-3 text-sm text-forum-text hover:bg-forum-surface">Вернуться на форум</Link>
  </nav>
}

export function ServiceLayout({ mode }: ServiceLayoutProps) {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => { document.body.style.overflow = previousOverflow }
  }, [mobileOpen])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false) }
    if (mobileOpen) document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])

  const navigationMode = user?.role === 'admin' ? 'admin' : mode
  const title = mode === 'admin' ? 'Администрирование' : 'Модерация'

  return <div className="min-h-screen bg-forum-bg"><header className="sticky top-0 z-20 border-b border-forum-border bg-forum-bg"><div className="mx-auto flex min-h-14 max-w-7xl items-center gap-3 px-4 sm:px-6"><Button variant="ghost" className="px-2 lg:hidden" aria-label="Открыть служебную навигацию" icon={<Menu className="size-5" aria-hidden="true" />} onClick={() => setMobileOpen(true)} /><Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-forum-text"><Shield className="size-4" aria-hidden="true" />{title}</Link></div></header><div className="mx-auto flex max-w-7xl"><aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-60 shrink-0 border-r border-forum-border bg-forum-sidebar p-3 lg:block"><ServiceNavigation mode={navigationMode} /></aside><main className="min-w-0 flex-1"><Outlet /></main></div>{mobileOpen ? <div className="fixed inset-0 z-30 lg:hidden" role="presentation"><button type="button" className="absolute inset-0 bg-black/70" aria-label="Закрыть служебную навигацию" onClick={() => setMobileOpen(false)} /><section className="relative h-full w-80 max-w-[calc(100%-2rem)] border-r border-forum-border bg-forum-sidebar p-3" role="dialog" aria-modal="true" aria-label="Служебная навигация"><div className="flex justify-end"><Button ref={closeButtonRef} variant="ghost" className="px-2" aria-label="Закрыть служебную навигацию" icon={<X className="size-5" aria-hidden="true" />} onClick={() => setMobileOpen(false)} /></div><ServiceNavigation mode={navigationMode} onNavigate={() => setMobileOpen(false)} /></section></div> : null}</div>
}

import { useState } from 'react'
import { Outlet } from 'react-router'
import { Header } from './Header.tsx'
import { MobileNavigation } from './MobileNavigation.tsx'
import { Sidebar } from './Sidebar.tsx'

export function MainLayout() { const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false); return <div className="min-h-screen bg-forum-bg"><Header onOpenNavigation={() => setMobileNavigationOpen(true)} /><div className="mx-auto flex max-w-7xl"><div className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-60 shrink-0 lg:block"><Sidebar /></div><main className="min-w-0 flex-1"><Outlet /></main></div><MobileNavigation open={mobileNavigationOpen} onClose={() => setMobileNavigationOpen(false)} /></div> }

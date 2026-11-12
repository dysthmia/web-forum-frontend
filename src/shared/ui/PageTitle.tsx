import type { ReactNode } from 'react'

interface PageTitleProps { title: string; description?: ReactNode; action?: ReactNode }

export function PageTitle({ action, title, description }: PageTitleProps) {
  return <header className="border-b border-forum-border pb-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h1 className="text-2xl font-medium tracking-tight text-forum-text sm:text-3xl">{title}</h1>{description ? <p className="mt-2 text-sm text-forum-muted">{description}</p> : null}</div>{action ? <div className="shrink-0">{action}</div> : null}</div></header>
}

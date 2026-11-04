import type { ReactNode } from 'react'

interface PageTitleProps { title: string; description?: ReactNode }

export function PageTitle({ title, description }: PageTitleProps) {
  return <header className="border-b border-forum-border pb-5"><h1 className="text-2xl font-medium tracking-tight text-forum-text sm:text-3xl">{title}</h1>{description ? <p className="mt-2 text-sm text-forum-muted">{description}</p> : null}</header>
}

import type { ReactNode } from 'react'
interface EmptyStateProps { title: string; description?: string; action?: ReactNode }
export function EmptyState({ action, description, title }: EmptyStateProps) { return <section className="border-y border-forum-border py-8 text-center"><h2 className="text-base font-medium text-forum-text">{title}</h2>{description ? <p className="mt-2 text-sm text-forum-muted">{description}</p> : null}{action ? <div className="mt-4">{action}</div> : null}</section> }

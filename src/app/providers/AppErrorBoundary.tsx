import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Button } from '../../shared/ui/Button.tsx'

interface AppErrorBoundaryProps { children: ReactNode }
interface AppErrorBoundaryState { error: Error | null }

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = { error: null }
  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState { return { error } }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void { console.error('Application error boundary caught an error.', error, errorInfo) }
  public render(): ReactNode { if (!this.state.error) return this.props.children; return <main className="mx-auto grid min-h-screen max-w-xl place-items-center px-4 text-center"><section><h1 className="text-2xl font-medium">Не удалось отобразить страницу</h1><p className="mt-3 text-sm text-forum-muted">Ошибка сохранена в консоли браузера. Попробуйте перезагрузить страницу.</p><Button className="mt-5" onClick={() => window.location.reload()}>Перезагрузить</Button></section></main> }
}

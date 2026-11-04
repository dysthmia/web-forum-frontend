import { AlertCircle } from 'lucide-react'
import { Button } from './Button.tsx'
interface ErrorStateProps { message: string; onRetry?: () => void }
export function ErrorState({ message, onRetry }: ErrorStateProps) { return <section className="border-y border-forum-border py-8 text-center" role="alert"><AlertCircle className="mx-auto size-5" aria-hidden="true" /><h2 className="mt-2 text-base font-medium text-forum-text">Не удалось загрузить данные</h2><p className="mt-2 text-sm text-forum-muted">{message}</p>{onRetry ? <Button className="mt-4" variant="secondary" onClick={onRetry}>Повторить</Button> : null}</section> }

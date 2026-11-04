interface LoadingStateProps { label?: string }
export function LoadingState({ label = 'Загрузка…' }: LoadingStateProps) { return <div className="py-8 text-sm text-forum-muted" role="status">{label}</div> }

import { FileWarning } from 'lucide-react'
import { EmptyState } from './EmptyState.tsx'

interface ApiContractPendingProps {
  resource: string
}

export function ApiContractPending({ resource }: ApiContractPendingProps) {
  return <EmptyState title={`${resource} пока недоступны`} description="Для этой страницы нужен подтверждённый API-контракт. Данные не подменяются демонстрационными записями." action={<span className="inline-flex items-center gap-2 text-sm text-forum-muted"><FileWarning className="size-4" aria-hidden="true" />API_CONTRACT_PENDING</span>} />
}

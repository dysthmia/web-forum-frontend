import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ApiContractPending } from '../shared/ui/ApiContractPending.tsx'
import { Button } from '../shared/ui/Button.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { Input } from '../shared/ui/Input.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const next = query.trim(); navigate(next ? `/search?q=${encodeURIComponent(next)}` : '/search') }
  return <main className="py-8"><Container><PageTitle title="Поиск" description="Поиск по темам и сообщениям." /><form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}><div className="flex-1"><Input label="Запрос" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Введите запрос" /></div><Button type="submit">Найти</Button></form><div className="mt-6"><ApiContractPending resource={query.trim() ? `Результаты для «${query.trim()}»` : 'Результаты поиска'} /></div></Container></main>
}

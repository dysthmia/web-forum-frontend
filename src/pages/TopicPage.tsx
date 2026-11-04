import { useParams } from 'react-router'
import { ApiContractPending } from '../shared/ui/ApiContractPending.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

export function TopicPage() {
  const { id } = useParams()
  if (!id) return null
  return <main className="py-8"><Container><PageTitle title="Тема" description={`Обсуждение #${id}`} /><div className="mt-5"><ApiContractPending resource="Сообщения темы" /></div></Container></main>
}

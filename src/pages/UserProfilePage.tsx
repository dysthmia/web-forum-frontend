import { useParams } from 'react-router'
import { ApiContractPending } from '../shared/ui/ApiContractPending.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

export function UserProfilePage() {
  const { username } = useParams()
  if (!username) return null
  return <main className="py-8"><Container><PageTitle title={`Профиль ${username}`} description="Публичная информация пользователя." /><div className="mt-5"><ApiContractPending resource="Профиль пользователя" /></div></Container></main>
}

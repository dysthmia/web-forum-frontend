import { ApiContractPending } from '../shared/ui/ApiContractPending.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'
import { Tabs } from '../shared/ui/Tabs.tsx'

export function HomePage() {
  return <main className="py-8"><Container><PageTitle title="Обсуждения" description="Последние и популярные темы форума." /><div className="mt-5"><Tabs /></div><div className="mt-4"><ApiContractPending resource="Список тем" /></div></Container></main>
}

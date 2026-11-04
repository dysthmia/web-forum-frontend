import { ApiContractPending } from '../shared/ui/ApiContractPending.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

export function CategoriesPage() {
  return <main className="py-8"><Container><PageTitle title="Категории" description="Разделы форума." /><div className="mt-5"><ApiContractPending resource="Категории" /></div></Container></main>
}

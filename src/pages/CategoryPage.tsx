import { useParams } from 'react-router'
import { ApiContractPending } from '../shared/ui/ApiContractPending.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'
import { SortSelect } from '../shared/ui/SortSelect.tsx'

export function CategoryPage() {
  const { slug } = useParams()
  if (!slug) return null
  return <main className="py-8"><Container><PageTitle title="Категория" description={`Раздел: ${slug}`} /><div className="mt-5 flex justify-end"><SortSelect options={[{ value: 'recent', label: 'Сначала новые' }, { value: 'active', label: 'По активности' }]} /></div><div className="mt-4"><ApiContractPending resource="Темы категории" /></div></Container></main>
}

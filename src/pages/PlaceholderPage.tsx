import { Container } from '../shared/ui/Container.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="py-10 sm:py-14">
      <Container>
        <PageTitle title={title} description={description ?? 'Страница будет доступна после реализации соответствующей функции.'} />
      </Container>
    </main>
  )
}

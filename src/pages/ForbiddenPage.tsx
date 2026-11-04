import { Link } from 'react-router'
import { Container } from '../shared/ui/Container.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

export function ForbiddenPage() { return <main className="py-12"><Container><PageTitle title="Недостаточно прав" description="Для просмотра этой страницы нужны дополнительные права." /><Link className="mt-6 inline-flex min-h-10 items-center rounded-md bg-forum-primary px-3 text-sm font-medium text-forum-primary-text" to="/">На главную</Link></Container></main> }

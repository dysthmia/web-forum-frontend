interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
      <section className="w-full border-y border-forum-border py-10" aria-labelledby="page-title">
        <p className="mb-3 text-sm text-forum-muted">forum.</p>
        <h1 id="page-title" className="text-3xl font-medium tracking-tight text-forum-text">{title}</h1>
        <p className="mt-3 max-w-xl text-forum-muted">
          {description ?? 'Страница будет доступна после реализации соответствующей функции.'}
        </p>
      </section>
    </main>
  )
}

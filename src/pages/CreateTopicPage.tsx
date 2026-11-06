import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { useCategoriesQuery } from '../features/categories/api/queries.ts'
import { forumApi } from '../features/forum/api/forumApi.ts'
import { ApiError } from '../shared/api/errors.ts'
import { Button } from '../shared/ui/Button.tsx'
import { EmptyState } from '../shared/ui/EmptyState.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { Input } from '../shared/ui/Input.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { Select } from '../shared/ui/Select.tsx'
import { Textarea } from '../shared/ui/Textarea.tsx'

const schema = z.object({
  categoryId: z.string().regex(/^[1-9]\d*$/, 'Выберите категорию.'),
  title: z.string().trim().min(1, 'Укажите заголовок темы.').max(200, 'Заголовок не должен превышать 200 символов.'),
  content: z.string().trim().min(1, 'Введите первое сообщение.'),
})
type Values = z.infer<typeof schema>

function topicErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Не удалось создать тему. Попробуйте ещё раз.'

  const suffix = error.problemTitle ? ` ${error.problemTitle}` : ''
  if (error.code === 'VALIDATION_ERROR' || error.status === 400) return `Проверьте категорию, заголовок и первое сообщение.${suffix}`
  if (error.code === 'UNAUTHORIZED' || error.status === 401) return 'Сессия истекла. Войдите снова и повторите попытку.'
  if (error.code === 'FORBIDDEN' || error.status === 403) return 'Публикация недоступна для вашей учётной записи.'
  if (error.code === 'CONFLICT' || error.status === 409) return `Тему не удалось создать из-за конфликта данных.${suffix}`
  if (error.code === 'RATE_LIMITED' || error.status === 429) return `Слишком много новых тем. Попробуйте позже.${suffix}`
  if (error.status === 503) return `Сервис публикации временно недоступен. Попробуйте позже.${suffix}`
  return error.problemTitle ?? error.message
}

export function CreateTopicPage() {
  const navigate = useNavigate()
  const client = useQueryClient()
  const categories = useCategoriesQuery()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { categoryId: '', title: '', content: '' } })
  const mutation = useMutation({
    mutationFn: forumApi.createTopic,
    onSuccess: async (result) => {
      await client.invalidateQueries({ queryKey: ['topics'] })
      navigate(`/topics/${result.topicId}`)
    },
  })
  const hasCategories = !categories.isPending && !categories.isError && categories.data.length > 0
  const canPublish = hasCategories && !mutation.isPending

  return <main className="mx-auto max-w-3xl px-4 py-8"><h1 className="text-2xl font-medium">Новая тема</h1><form className="mt-6 grid gap-4" onSubmit={form.handleSubmit((value) => mutation.mutate({ categoryId: Number(value.categoryId), title: value.title, content: value.content }))}><Select label="Категория" aria-required="true" disabled={!hasCategories || mutation.isPending} error={form.formState.errors.categoryId?.message} {...form.register('categoryId')}><option value="" disabled>Выберите категорию</option>{categories.data?.filter((category) => category.name).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>{categories.isPending ? <LoadingState label="Загрузка категорий…" /> : null}{categories.isError ? <ErrorState message={categories.error.message} onRetry={() => void categories.refetch()} /> : null}{!categories.isPending && !categories.isError && categories.data.length === 0 ? <EmptyState title="Категории недоступны" description="Администратор ещё не создал категории." /> : null}<Input label="Заголовок" disabled={mutation.isPending} error={form.formState.errors.title?.message} {...form.register('title')} /><Textarea label="Содержание" disabled={mutation.isPending} error={form.formState.errors.content?.message} {...form.register('content')} />{mutation.isError ? <p role="alert" className="text-sm text-forum-text">{topicErrorMessage(mutation.error)}</p> : null}<Button type="submit" loading={mutation.isPending} disabled={!canPublish}>Создать тему</Button></form></main>
}

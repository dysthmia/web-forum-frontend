import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Category } from '../entities/category/model/types.ts'
import { categoriesApi, type CategoryInput } from '../features/categories/api/categoriesApi.ts'
import { useCategoriesQuery } from '../features/categories/api/queries.ts'
import { ApiError } from '../shared/api/errors.ts'
import { queryKeys } from '../shared/api/queryKeys.ts'
import { Button } from '../shared/ui/Button.tsx'
import { ConfirmDialog } from '../shared/ui/ConfirmDialog.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { EmptyState } from '../shared/ui/EmptyState.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { Input } from '../shared/ui/Input.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'
import { Textarea } from '../shared/ui/Textarea.tsx'

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Укажите название категории.').max(100, 'Название не должно превышать 100 символов.'),
  slug: z.string().trim().min(1, 'Укажите slug категории.').max(100, 'Slug не должен превышать 100 символов.'),
  description: z.string().max(1000, 'Описание не должно превышать 1000 символов.'),
})

type CategoryValues = z.infer<typeof categorySchema>

function toInput(values: CategoryValues): CategoryInput {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim() || null,
  }
}

function defaultValues(category?: Category): CategoryValues {
  return { name: category?.name ?? '', slug: category?.slug ?? '', description: category?.description ?? '' }
}

function mutationError(error: unknown, action: 'save' | 'delete'): string {
  if (error instanceof ApiError && error.code === 'CONFLICT') {
    return action === 'delete'
      ? 'Нельзя удалить категорию, пока в ней есть темы.'
      : 'Этот slug уже используется другой категорией.'
  }
  return action === 'delete' ? 'Не удалось удалить категорию. Попробуйте ещё раз.' : 'Не удалось сохранить категорию. Попробуйте ещё раз.'
}

export function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const categories = useCategoriesQuery()
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const form = useForm<CategoryValues>({ resolver: zodResolver(categorySchema), defaultValues: defaultValues() })
  const saveMutation = useMutation({
    mutationFn: ({ categoryId, values }: { categoryId?: number; values: CategoryValues }) => categoryId === undefined
      ? categoriesApi.create(toInput(values))
      : categoriesApi.update(categoryId, toInput(values)),
    onSuccess: async () => {
      form.reset(defaultValues())
      setEditing(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
        queryClient.invalidateQueries({ queryKey: queryKeys.topics.all }),
      ])
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) => categoriesApi.remove(categoryId),
    onSuccess: async () => {
      setDeleting(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
        queryClient.invalidateQueries({ queryKey: queryKeys.topics.all }),
      ])
    },
  })
  const pending = saveMutation.isPending || deleteMutation.isPending
  const saveError = saveMutation.isError ? mutationError(saveMutation.error, 'save') : null
  const deleteError = deleteMutation.isError ? mutationError(deleteMutation.error, 'delete') : null
  const deleteDescription = deleteError ?? (deleting ? `Категория «${deleting.name}» будет удалена без возможности восстановления.` : '')

  const startEdit = (category: Category) => {
    setEditing(category)
    form.reset(defaultValues(category))
    saveMutation.reset()
  }

  const cancelEdit = () => {
    setEditing(null)
    form.reset(defaultValues())
    saveMutation.reset()
  }

  return <section className="py-8"><Container><PageTitle title="Управление категориями" description="Создавайте и редактируйте разделы форума." /><div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]"><section aria-labelledby="category-list-title"><h2 id="category-list-title" className="text-base font-medium text-forum-text">Категории</h2><div className="mt-3">{categories.isPending ? <LoadingState label="Загрузка категорий…" /> : categories.isError ? <ErrorState message={categories.error.message} onRetry={() => void categories.refetch()} /> : categories.data.length === 0 ? <EmptyState title="Категорий пока нет" description="Создайте первый раздел форума." /> : <ul className="border-t border-forum-border">{categories.data.map((category) => <li key={category.id} className="border-b border-forum-border py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-medium text-forum-text">{category.name}</h3><p className="mt-1 text-sm text-forum-muted">{category.slug}</p>{category.description ? <p className="mt-2 text-sm text-forum-muted">{category.description}</p> : null}</div><div className="flex gap-2"><Button variant="secondary" disabled={pending} onClick={() => startEdit(category)} aria-label={`Редактировать ${category.name}`}>Редактировать</Button><Button variant="ghost" disabled={pending} onClick={() => { deleteMutation.reset(); setDeleting(category) }} aria-label={`Удалить ${category.name}`}>Удалить</Button></div></div></li>)}</ul>}</div></section><section className="border-t border-forum-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0" aria-labelledby="category-form-title"><h2 id="category-form-title" className="text-base font-medium text-forum-text">{editing ? 'Редактирование категории' : 'Новая категория'}</h2><form className="mt-4 grid gap-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate({ categoryId: editing?.id, values }))}><Input label="Название" maxLength={100} disabled={pending} error={form.formState.errors.name?.message} {...form.register('name')} /><Input label="Slug" maxLength={100} disabled={pending} error={form.formState.errors.slug?.message} {...form.register('slug')} /><Textarea label="Описание" maxLength={1000} disabled={pending} error={form.formState.errors.description?.message} {...form.register('description')} />{saveError ? <p className="text-sm text-forum-text" role="alert">{saveError}</p> : null}<div className="flex flex-wrap gap-2"><Button type="submit" loading={saveMutation.isPending} disabled={deleteMutation.isPending}>{editing ? 'Сохранить изменения' : 'Создать категорию'}</Button>{editing ? <Button variant="ghost" disabled={pending} onClick={cancelEdit}>Отмена</Button> : null}</div></form></section></div><ConfirmDialog open={deleting !== null} title="Удалить категорию?" description={deleteDescription} confirmLabel="Удалить" loading={deleteMutation.isPending} onClose={() => { if (!deleteMutation.isPending) setDeleting(null) }} onConfirm={() => { if (deleting) deleteMutation.mutate(deleting.id) }} /></Container></section>
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { useCategoriesQuery } from '../features/forum/api/queries.ts'
import { forumApi } from '../features/forum/api/forumApi.ts'
import { Button } from '../shared/ui/Button.tsx'
import { Input } from '../shared/ui/Input.tsx'
import { Select } from '../shared/ui/Select.tsx'
import { Textarea } from '../shared/ui/Textarea.tsx'

const schema = z.object({ categoryId: z.string(), title: z.string().min(1).max(200), content: z.string().min(1) })
type Values = z.infer<typeof schema>
export function CreateTopicPage() { const navigate = useNavigate(); const client = useQueryClient(); const categories = useCategoriesQuery(); const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { categoryId: '' } }); const mutation = useMutation({ mutationFn: forumApi.createTopic, onSuccess: async (result) => { await client.invalidateQueries({ queryKey: ['topics'] }); navigate(`/topics/${result.topicId}`) } }); return <main className="mx-auto max-w-3xl px-4 py-8"><h1 className="text-2xl font-medium">Новая тема</h1><form className="mt-6 grid gap-4" onSubmit={form.handleSubmit((value) => mutation.mutate({ title: value.title, content: value.content, categoryId: value.categoryId ? Number(value.categoryId) : undefined }))}>{categories.data?.length ? <Select label="Категория" {...form.register('categoryId')}><option value="">Без категории</option>{categories.data.filter((category) => category.name).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select> : null}<Input label="Заголовок" error={form.formState.errors.title?.message} {...form.register('title')} /><Textarea label="Содержание" error={form.formState.errors.content?.message} {...form.register('content')} />{mutation.isError ? <p role="alert">Не удалось создать тему.</p> : null}<Button type="submit" loading={mutation.isPending}>Создать тему</Button></form></main> }

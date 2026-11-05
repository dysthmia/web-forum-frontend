import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../auth/model/useAuth.ts'
import { forumApi } from '../../forum/api/forumApi.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { Textarea } from '../../../shared/ui/Textarea.tsx'

export function ReplyComposer({ topicId, closed }: { topicId: number; closed: boolean }) { const { status } = useAuth(); const client = useQueryClient(); const [content, setContent] = useState(''); const mutation = useMutation({ mutationFn: () => forumApi.createPost(topicId, content), onSuccess: async () => { setContent(''); await client.invalidateQueries({ queryKey: ['topics', 'detail', topicId] }) } }); if (closed) return <p className="mt-6 text-sm text-forum-muted">Тема закрыта: новые ответы недоступны.</p>; if (status === 'guest') return <p className="mt-6 text-sm text-forum-muted"><Link className="text-forum-text underline" to="/login">Войдите</Link>, чтобы ответить.</p>; return <form className="mt-6 grid gap-3 border-t border-forum-border pt-5" onSubmit={(event) => { event.preventDefault(); if (content.trim()) mutation.mutate() }}><Textarea label="Ваш ответ" value={content} onChange={(event) => setContent(event.target.value)} /><p className="text-sm" role="alert">{mutation.isError ? 'Не удалось отправить ответ. Текст сохранён.' : ''}</p><Button type="submit" loading={mutation.isPending} disabled={!content.trim()}>Ответить</Button></form> }

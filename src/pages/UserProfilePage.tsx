import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { useAuth } from '../features/auth/model/useAuth.ts'
import { usePublicUserProfileByUsernameQuery } from '../features/forum/api/queries.ts'
import { formatDate } from '../shared/lib/formatDate.ts'
import { Button } from '../shared/ui/Button.tsx'
import { ConfirmDialog } from '../shared/ui/ConfirmDialog.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { Input } from '../shared/ui/Input.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

const profileSchema = z.object({
  username: z.string().trim().min(2, 'Минимум 2 символа').max(32).regex(/^[a-zA-Z0-9_]+$/, 'Только латинские буквы, цифры и _'),
  email: z.string().trim().email('Введите корректный email').max(254),
  currentPassword: z.string(),
  newPassword: z.string(),
  passwordConfirmation: z.string(),
}).superRefine((values, context) => {
  if (values.newPassword && values.newPassword.length < 8) context.addIssue({ code: 'custom', path: ['newPassword'], message: 'Минимум 8 символов' })
  if (values.newPassword && !values.currentPassword) context.addIssue({ code: 'custom', path: ['currentPassword'], message: 'Введите текущий пароль' })
  if (values.newPassword !== values.passwordConfirmation) context.addIssue({ code: 'custom', path: ['passwordConfirmation'], message: 'Пароли не совпадают' })
})

type ProfileValues = z.infer<typeof profileSchema>

export function UserProfilePage() {
  const { username = '' } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, logout, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const query = usePublicUserProfileByUsernameQuery(username)
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { username: currentUser?.username ?? '', email: currentUser?.email ?? '', currentPassword: '', newPassword: '', passwordConfirmation: '' } })

  const resetForm = () => form.reset({ username: currentUser?.username ?? '', email: currentUser?.email ?? '', currentPassword: '', newPassword: '', passwordConfirmation: '' })

  useEffect(() => {
    form.reset({ username: currentUser?.username ?? '', email: currentUser?.email ?? '', currentPassword: '', newPassword: '', passwordConfirmation: '' })
  }, [currentUser, form])

  if (query.isPending) return <main className="py-8"><Container><LoadingState label="Загрузка профиля…" /></Container></main>
  if (query.isError) return <main className="py-8"><Container><ErrorState message={query.error.message} onRetry={() => void query.refetch()} /></Container></main>

  const user = query.data
  const isOwnProfile = currentUser?.id === user.id
  const modePath = isOwnProfile && currentUser.role === 'admin' ? { href: '/admin', label: 'Режим администратора' } : isOwnProfile && currentUser?.role === 'moderator' ? { href: '/moderation/reports', label: 'Режим модератора' } : null
  const inputClassName = (field: keyof ProfileValues) => form.formState.dirtyFields[field] ? 'border-forum-text bg-forum-surface text-forum-text' : 'border-forum-border bg-forum-surface text-forum-muted'

  const closeEditor = () => { resetForm(); setIsEditing(false) }
  const submit = async (values: ProfileValues) => {
    try {
      if (!updateProfile) throw new Error('Profile updates are unavailable.')
      const profile = await updateProfile({ username: values.username, email: values.email, currentPassword: values.newPassword ? values.currentPassword : undefined, newPassword: values.newPassword || undefined })
      setIsEditing(false)
      navigate(`/users/${encodeURIComponent(profile.username ?? values.username)}`, { replace: true })
    } catch {
      form.setError('root', { message: 'Не удалось сохранить изменения. Проверьте введённые данные и текущий пароль.' })
    }
  }
  const confirmLogout = async () => { setIsLoggingOut(true); try { await logout() } finally { setIsLoggingOut(false); setLogoutConfirmationOpen(false); navigate('/', { replace: true }) } }

  return <main className="py-8"><Container><PageTitle title={user.username ?? username} description={<span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1"><span>{user.role}</span>{modePath ? <Link to={modePath.href} className="font-medium text-forum-text underline decoration-forum-border underline-offset-4 hover:decoration-forum-text">{modePath.label}</Link> : null}</span>} /><dl className="mt-5 grid gap-3 text-sm text-forum-muted"><div><dt className="text-forum-subtle">Дата регистрации</dt><dd className="mt-1 text-forum-text">{formatDate(user.createdAt)}</dd></div><div><dt className="text-forum-subtle">Темы</dt><dd className="mt-1 text-forum-text">{user.topicCount}</dd></div><div><dt className="text-forum-subtle">Сообщения</dt><dd className="mt-1 text-forum-text">{user.postCount}</dd></div></dl>{isOwnProfile ? <section className="mt-8 border-t border-forum-border pt-5" aria-labelledby="profile-settings-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="profile-settings-title" className="text-lg font-medium text-forum-text">Настройки профиля</h2><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setIsEditing(true)}>Редактировать профиль</Button><Button variant="ghost" onClick={() => setLogoutConfirmationOpen(true)}>Выйти из аккаунта</Button></div></div></section> : null}<ConfirmDialog open={logoutConfirmationOpen} title="Выйти из аккаунта?" description="Для продолжения потребуется войти снова." confirmLabel="Выйти" loading={isLoggingOut} onClose={() => { if (!isLoggingOut) setLogoutConfirmationOpen(false) }} onConfirm={() => void confirmLogout()} />{isEditing ? <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4" role="presentation"><section className="max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-forum-border bg-forum-sidebar p-5 text-forum-text" role="dialog" aria-modal="true" aria-labelledby="profile-editor-title"><h2 id="profile-editor-title" className="text-lg font-medium">Редактирование профиля</h2><form className="mt-5 grid gap-4" onSubmit={form.handleSubmit(submit)}><Input className={inputClassName('username')} label="Username" autoComplete="username" error={form.formState.errors.username?.message} {...form.register('username')} /><Input className={inputClassName('email')} label="Почта" type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register('email')} /><Input className={inputClassName('currentPassword')} label="Текущий пароль" type="password" autoComplete="current-password" hint="Требуется только при смене пароля." error={form.formState.errors.currentPassword?.message} {...form.register('currentPassword')} /><Input className={inputClassName('newPassword')} label="Новый пароль" type="password" autoComplete="new-password" error={form.formState.errors.newPassword?.message} {...form.register('newPassword')} /><Input className={inputClassName('passwordConfirmation')} label="Повторите новый пароль" type="password" autoComplete="new-password" error={form.formState.errors.passwordConfirmation?.message} {...form.register('passwordConfirmation')} />{form.formState.errors.root ? <p role="alert" className="text-sm text-forum-text">{form.formState.errors.root.message}</p> : null}<div className="flex justify-end gap-2"><Button variant="ghost" onClick={closeEditor}>Отмена</Button><Button type="submit" loading={form.formState.isSubmitting}>Сохранить изменения</Button></div></form></section></div> : null}</Container></main>
}

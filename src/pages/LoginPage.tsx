import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { useAuth } from '../features/auth/model/useAuth.ts'
import { Button } from '../shared/ui/Button.tsx'
import { Input } from '../shared/ui/Input.tsx'

const schema = z.object({ usernameOrEmail: z.string().min(3).max(254), password: z.string().min(8).max(128) })
type LoginValues = z.infer<typeof schema>
export function LoginPage() { const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const form = useForm<LoginValues>({ resolver: zodResolver(schema) }); const submit = async (values: LoginValues) => { try { await login(values); const from = typeof location.state?.from === 'string' && location.state.from.startsWith('/') ? location.state.from : '/'; navigate(from, { replace: true }) } catch { form.setError('root', { message: 'Не удалось выполнить вход. Проверьте данные и повторите попытку.' }) } }; return <main className="mx-auto max-w-md px-4 py-12"><h1 className="text-2xl font-medium">Вход</h1><form className="mt-6 grid gap-4" onSubmit={form.handleSubmit(submit)}><Input label="Username или email" autoComplete="username" error={form.formState.errors.usernameOrEmail?.message} {...form.register('usernameOrEmail')} /><Input label="Пароль" type="password" autoComplete="current-password" error={form.formState.errors.password?.message} {...form.register('password')} />{form.formState.errors.root ? <p role="alert" className="text-sm">{form.formState.errors.root.message}</p> : null}<Button type="submit" loading={form.formState.isSubmitting}>Войти</Button></form><p className="mt-4 text-sm text-forum-muted">Нет аккаунта? <Link className="text-forum-text underline" to="/register">Зарегистрироваться</Link></p></main> }

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; loading?: boolean; icon?: ReactNode }
const variantClasses: Record<ButtonVariant, string> = { primary: 'bg-forum-primary text-forum-primary-text hover:bg-forum-muted', secondary: 'border border-forum-border bg-forum-surface text-forum-text hover:bg-forum-border', ghost: 'text-forum-text hover:bg-forum-surface' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ children, className = '', disabled, icon, loading = false, type = 'button', variant = 'primary', ...props }, ref) {
  return <button {...props} ref={ref} type={type} disabled={disabled || loading} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}>{loading ? <span className="size-4 animate-pulse rounded-full border border-current" aria-hidden="true" /> : icon}{children}</button>
})

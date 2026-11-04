import { AlertCircle } from 'lucide-react'
import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label: string; error?: string }
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ children, error, id, label, required, ...props }, ref) { const generatedId = useId(); const selectId = id ?? generatedId; const errorId = `${selectId}-error`; return <div className="grid gap-2"><label htmlFor={selectId} className="text-sm font-medium text-forum-text">{label}{required ? <span aria-hidden="true"> *</span> : null}</label><select {...props} ref={ref} id={selectId} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className="min-h-10 w-full rounded-md border border-forum-border bg-forum-bg px-3 text-sm text-forum-text focus:outline-none focus:ring-2 focus:ring-forum-focus disabled:cursor-not-allowed disabled:opacity-50">{children}</select>{error ? <p id={errorId} className="flex items-center gap-1 text-sm text-forum-text"><AlertCircle className="size-4" aria-hidden="true" />{error}</p> : null}</div> })

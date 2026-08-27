import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-4 ${className}`}>
      {children}
    </div>
  )
}

export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const styles: Record<string, string> = {
    primary: 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400',
  }
  return (
    <button
      className={`rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="block text-xs font-medium text-slate-400 mb-1" {...props} />
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      {...props}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      {...props}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
      {...props}
    />
  )
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center py-16 text-slate-500">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-medium text-slate-300">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={color ? { backgroundColor: `${color}22`, color } : undefined}
    >
      {children}
    </span>
  )
}

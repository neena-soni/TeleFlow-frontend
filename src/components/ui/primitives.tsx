import type { ReactNode } from 'react'
import { statusTone } from '../../lib/format'
import type { OrderStatus, StepStatus } from '../../types'

export function Card({
  children,
  className = '',
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <section
      className={`rounded-2xl border border-tf-line bg-tf-surface shadow-[0_2px_10px_rgb(23_32_51_/0.04)] ${
        padded ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </section>
  )
}

export function SectionHeader({
  icon,
  title,
  meta,
  action,
}: {
  icon?: ReactNode
  title: string
  meta?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon ? (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-tf-primary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
          {meta ? <div className="text-xs text-tf-muted mt-0.5">{meta}</div> : null}
        </div>
      </div>
      {action}
    </div>
  )
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = statusTone[status] || statusTone.PENDING
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tone.bg} ${tone.text} ring-1 ${tone.ring}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {tone.label}
    </span>
  )
}

export function HealthBadge({ status }: { status: 'UP' | 'DOWN' | 'UNKNOWN' | 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' }) {
  const isUp = status === 'UP' || status === 'OPERATIONAL'
  const isDegraded = status === 'DEGRADED'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
        isUp
          ? 'text-emerald-500 bg-emerald-500/15 ring-emerald-500/30'
          : isDegraded
            ? 'text-amber-500 bg-amber-500/15 ring-amber-500/30'
            : 'text-rose-500 bg-rose-500/15 ring-rose-500/30'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isUp ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-rose-500'}`} />
      {status}
    </span>
  )
}

export function StepLamp({ state }: { state: StepStatus }) {
  const isRunning = state === 'RUNNING' || state === 'COMPENSATING'
  const isSuccess = state === 'SUCCESS'
  const isFailed = state === 'FAILED'
  const isCompensated = state === 'COMPENSATED'

  const color = isSuccess
    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
    : isRunning
      ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
      : isFailed
        ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
        : isCompensated
          ? 'bg-amber-600'
          : 'bg-slate-300'

  return (
    <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center">
      {isRunning ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/60" />
      ) : null}
      <span className={`relative inline-flex h-3 w-3 rounded-full ${color}`} />
    </span>
  )
}

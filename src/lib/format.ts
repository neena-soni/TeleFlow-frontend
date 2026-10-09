import type { OrderStatus, PlanName, StepName, StepStatus } from '../types'

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

export function formatDuration(msOrSec: number | null | undefined): string {
  if (msOrSec === null || msOrSec === undefined) return '—'
  const seconds = msOrSec > 500 ? Math.round(msOrSec / 1000) : msOrSec
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

export function planLabel(plan: PlanName | string): string {
  const map: Record<string, string> = {
    '5G_UNLIMITED': '5G Ultra Unlimited',
    '5G_BASIC': '5G Basic Starter',
    'FIBER_300MBPS': 'Fiber Pro 300 Mbps',
    'FIBER_100MBPS': 'Fiber Essential 100 Mbps',
  }
  return map[plan] || plan
}

export const serviceLabel = planLabel


export function stepLabel(step: StepName | string): string {
  const map: Record<string, string> = {
    INVENTORY: 'Inventory',
    NETWORK: 'Network',
    BILLING: 'Billing',
    NOTIFICATION: 'Notification',
  }
  return map[step] || step
}

export const statusTone: Record<
  OrderStatus,
  { bg: string; text: string; ring: string; label: string }
> = {
  PENDING: {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    ring: 'ring-slate-400/30',
    label: 'Pending',
  },
  IN_PROGRESS: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    ring: 'ring-blue-400/30',
    label: 'In Progress',
  },
  COMPLETED: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    ring: 'ring-emerald-400/30',
    label: 'Completed',
  },
  FAILED: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    ring: 'ring-rose-400/30',
    label: 'Failed',
  },
  ROLLED_BACK: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    ring: 'ring-amber-400/30',
    label: 'Rolled Back',
  },
}

export const stepStatusTone: Record<
  StepStatus,
  { bg: string; text: string; label: string }
> = {
  PENDING: { bg: 'bg-slate-700', text: 'text-slate-400', label: 'Pending' },
  RUNNING: { bg: 'bg-blue-500 animate-pulse', text: 'text-blue-400', label: 'Running' },
  SUCCESS: { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Success' },
  FAILED: { bg: 'bg-rose-500', text: 'text-rose-400', label: 'Failed' },
  COMPENSATING: { bg: 'bg-orange-500 animate-pulse', text: 'text-orange-400', label: 'Compensating' },
  COMPENSATED: { bg: 'bg-amber-500', text: 'text-amber-400', label: 'Compensated' },
  SKIPPED: { bg: 'bg-slate-600', text: 'text-slate-400', label: 'Skipped' },
}

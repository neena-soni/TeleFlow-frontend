import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Check,
  GitBranch,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, SectionHeader, StatusBadge, StepLamp } from '../components/ui/primitives'
import { useOps } from '../context/OpsContext'
import { formatDuration, planLabel, stepLabel } from '../lib/format'

type EventTone = 'info' | 'success' | 'warning' | 'danger'

const events: ReadonlyArray<readonly [string, string, string, EventTone]> = [
  ['10:01', 'Order Created', 'Customer order accepted by Order API', 'info'],
  ['10:02', 'Inventory Reserved', 'Port + ONT router allocation confirmed', 'success'],
  ['10:03', 'Network Activated', 'VLAN slice provisioned with guaranteed QoS', 'success'],
  ['10:04', 'Billing Processed', 'CBS payment invoice generated and charged', 'success'],
  ['10:05', 'Notification Sent', 'Dual alerts dispatched to Customer and Admin', 'success'],
]

const tone = {
  info: 'border-tf-primary/30 bg-tf-primary/10 text-tf-primary',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
  danger: 'border-rose-500/30 bg-rose-500/10 text-rose-600',
}

function ClipboardIcon() {
  return <GitBranch size={16} />
}

function Timeline() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <Card>
      <SectionHeader icon={<Activity size={16} />} title="Saga Activity Log" meta="Temporal event timeline" />
      <div className="relative ml-2 border-l border-tf-line pl-7">
        {events.map(([time, title, detail, eventTone], i) => (
          <motion.button
            key={title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setOpen(open === i ? null : i)}
            className="relative mb-4 block w-full text-left last:mb-0"
          >
            <span
              className={`absolute -left-[36px] top-1 grid h-4 w-4 place-items-center rounded-full border ${tone[eventTone]}`}
            >
              {eventTone === 'success' ? <Check size={10} /> : eventTone === 'danger' ? <X size={10} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-tf-muted">{time}</span>
              <span className="text-xs font-semibold text-slate-800">{title}</span>
              <span className="ml-auto text-[10px] text-tf-muted">{open === i ? 'Collapse' : 'Details'}</span>
            </div>
            <AnimatePresence>
              {open === i ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className={`mt-2 rounded-lg border px-3 py-2 text-xs ${tone[eventTone]}`}>{detail}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </Card>
  )
}

export function OrderDetailsPage() {
  const { id } = useParams()
  const { orders } = useOps()
  const order = orders.find((item) => String(item.id) === id || item.trackingId === id) ?? orders[0]

  if (!order) {
    return (
      <div className="py-12 text-center text-slate-400">
        <Link to="/orders" className="text-xs text-tf-primary hover:underline">← Back to Orders</Link>
        <p className="mt-2 text-sm">No order selected or found.</p>
      </div>
    )
  }

  const isRollback = order.status === 'ROLLED_BACK' || order.status === 'FAILED'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/orders" className="text-xs text-tf-muted hover:text-slate-900">Orders</Link>
        <ArrowRight size={13} className="text-tf-muted" />
        <span className="font-mono text-xs text-tf-primary font-bold">{order.trackingId}</span>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
        <Card>
          <SectionHeader icon={<ClipboardIcon />} title="Order Summary" meta="Saga execution record" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Tracking ID', order.trackingId],
              ['Customer ID', order.customerId],
              ['Plan', planLabel(order.planName)],
              ['Email', order.customerEmail || 'customer@teleflow.io'],
              ['Duration', formatDuration(order.activationDurationMs)],
              ['Saga Status', order.status],
              ['Compensation', isRollback ? 'Triggered (Auto-refunded)' : 'None (Active)'],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] uppercase tracking-wider text-tf-muted">{label}</div>
                <div className="mt-1 text-xs font-semibold text-slate-800">{value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader icon={<BrainCircuit size={16} />} title="Saga Observability" meta="Temporal Engine Diagnostics" />
          <div className={`rounded-xl border p-3 ${isRollback ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}>
            <div className="text-xs font-semibold">{isRollback ? 'Compensating Rollback Triggered' : 'Happy Path Execution'}</div>
            <div className="mt-1 font-medium text-xs">
              {order.failureReason || (isRollback ? 'Downstream microservice failed; saga compensated.' : 'All activities succeeded.')}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-slate-400">Order ID</span>
              <div className="mt-1 font-mono text-slate-800">#{order.id}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-slate-400">Created</span>
              <div className="mt-1 text-slate-800">{order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'Recent'}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionHeader title="Saga 4-Step Progress" meta="Compensation is armed for completed steps." />
          <div className="grid grid-cols-4 gap-2">
            {(['INVENTORY', 'NETWORK', 'BILLING', 'NOTIFICATION'] as const).map((stepName) => {
              const step = (order.steps || []).find((s) => s.stepName === stepName)
              const state = step ? step.stepStatus : 'PENDING'
              return (
                <div key={stepName} className="rounded-xl border border-tf-line bg-slate-50/60 p-3 text-center">
                  <StepLamp state={state} />
                  <div className="mt-2 text-xs font-bold text-slate-800">{stepLabel(stepName)}</div>
                  <div className="mt-1 text-[10px] text-slate-400">{state}</div>
                </div>
              )
            })}
          </div>
        </Card>
        <Timeline />
      </div>
    </div>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useOps } from '../../context/OpsContext'
import { formatDuration, planLabel, stepLabel } from '../../lib/format'
import type { OrderStatus, StepExecutionDTO } from '../../types'
import { StatusBadge, StepLamp } from '../ui/primitives'

export function LiveOrdersTable({
  limit,
  query = '',
  statuses,
}: {
  limit?: number
  query?: string
  statuses?: OrderStatus[]
}) {
  const { orders } = useOps()

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders
      .filter((o) => (statuses ? statuses.includes(o.status) : true))
      .filter((o) => {
        if (!q) return true
        return (
          o.trackingId.toLowerCase().includes(q) ||
          o.customerId.toLowerCase().includes(q) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
          planLabel(o.planName).toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q)
        )
      })
      .slice(0, limit)
  }, [orders, query, statuses, limit])

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-tf-line text-[11px] uppercase tracking-wider text-tf-muted">
            <th className="pb-3 font-semibold">Tracking ID</th>
            <th className="pb-3 font-semibold">Customer</th>
            <th className="pb-3 font-semibold">Plan Name</th>
            <th className="pb-3 font-semibold text-center">Saga 4-Step Pipeline</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold text-right">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tf-line">
          <AnimatePresence initial={false}>
            {rows.map((order) => {
              const stepsMap = (order.steps || []).reduce(
                (acc, step) => {
                  acc[step.stepName] = step
                  return acc
                },
                {} as Record<string, StepExecutionDTO>,
              )

              return (
                <motion.tr
                  key={order.id || order.trackingId}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3.5 font-mono text-xs font-semibold text-tf-primary">
                    <Link
                      to={`/orders/${order.id || order.trackingId}`}
                      className="hover:underline flex items-center gap-1.5"
                    >
                      {order.trackingId}
                    </Link>
                  </td>
                  <td className="py-3.5">
                    <div className="font-semibold text-slate-800 text-xs">{order.customerId}</div>
                    <div className="text-[11px] text-slate-400">
                      {order.customerEmail || 'customer@teleflow.io'}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="font-medium text-slate-700 text-xs">
                      {planLabel(order.planName)}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      {(['INVENTORY', 'NETWORK', 'BILLING', 'NOTIFICATION'] as const).map((stepName) => {
                        const step = stepsMap[stepName]
                        const status = step ? step.stepStatus : 'PENDING'
                        return (
                          <div
                            key={stepName}
                            className="flex flex-col items-center gap-0.5"
                            title={`${stepLabel(stepName)}: ${status}`}
                          >
                            <StepLamp state={status} />
                            <span className="text-[9px] font-mono uppercase text-slate-400">
                              {stepName.substring(0, 3)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={order.status} />
                    {order.failureReason && (
                      <div className="mt-1 max-w-[180px] truncate text-[10px] text-rose-500" title={order.failureReason}>
                        {order.failureReason}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-mono text-xs text-slate-500">
                    {formatDuration(order.activationDurationMs)}
                  </td>
                </motion.tr>
              )
            })}
          </AnimatePresence>
        </tbody>
      </table>
      {rows.length === 0 ? (
        <div className="py-10 text-center">
          <Clock size={24} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">No orders currently active.</p>
          <p className="text-xs text-slate-400 mt-1">
            Submit a new activation from the Customer Portal to trigger the saga workflow.
          </p>
        </div>
      ) : null}
    </div>
  )
}

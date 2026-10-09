import { motion } from 'framer-motion'
import {
  Activity,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Target,
  Zap,
} from 'lucide-react'
import { useOps } from '../../context/OpsContext'
import { formatDuration, formatNumber } from '../../lib/format'

export function KpiGrid() {
  const { kpis, orders } = useOps()

  // Calculate rolled back orders count directly from live orders if present
  const rolledBackCount = orders.filter((o) => o.status === 'ROLLED_BACK').length

  const items = [
    {
      key: 'totalOrders',
      label: 'Total Orders',
      icon: Target,
      value: formatNumber(kpis.totalOrders),
      tag: 'All time',
      accent: 'text-tf-primary',
    },
    {
      key: 'inProgressCount',
      label: 'Active Sagas',
      icon: Zap,
      value: formatNumber(kpis.inProgressCount),
      tag: 'Live in Temporal',
      accent: 'text-blue-500',
    },
    {
      key: 'successCount',
      label: 'Completed Sagas',
      icon: CheckCircle2,
      value: formatNumber(kpis.successCount),
      tag: '100% active',
      accent: 'text-emerald-500',
    },
    {
      key: 'successRatePercent',
      label: 'Success Rate',
      icon: Activity,
      value: `${(kpis.successRatePercent || 100).toFixed(1)}%`,
      tag: 'Target ≥95%',
      accent: 'text-emerald-600',
    },
    {
      key: 'rollbackCount',
      label: 'Rollback Compensations',
      icon: RotateCcw,
      value: formatNumber(rolledBackCount),
      tag: 'Zero partial state',
      accent: 'text-amber-500',
    },
    {
      key: 'avgActivationDurationMs',
      label: 'Avg Activation Time',
      icon: Clock3,
      value: formatDuration(kpis.avgActivationDurationMs),
      tag: 'End-to-end',
      accent: 'text-slate-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <motion.article
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="rounded-2xl border border-tf-line bg-tf-surface p-4 shadow-[0_2px_10px_rgb(23_32_51_/0.04)]"
          >
            <div className="flex items-start justify-between">
              <span className={`grid h-8 w-8 place-items-center rounded-lg bg-slate-100 ${item.accent}`}>
                <Icon size={16} />
              </span>
              <span className="text-[10px] font-semibold text-slate-400">{item.tag}</span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {item.value}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-500">{item.label}</div>
          </motion.article>
        )
      })}
    </div>
  )
}

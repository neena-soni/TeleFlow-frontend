import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LiveOrdersTable } from '../components/dashboard/LiveOrdersTable'
import { Card } from '../components/ui/primitives'
import { useOps } from '../context/OpsContext'
import type { OrderStatus } from '../types'

const filters: Array<{ id: 'ALL' | OrderStatus; label: string }> = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'ROLLED_BACK', label: 'Rolled Back' },
  { id: 'FAILED', label: 'Failed' },
  { id: 'PENDING', label: 'Pending' },
]

export function OrdersPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const [status, setStatus] = useState<(typeof filters)[number]['id']>('ALL')
  const { orders } = useOps()

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of orders) map.set(o.status, (map.get(o.status) ?? 0) + 1)
    return map
  }, [orders])

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatus(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              status === f.id
                ? 'bg-tf-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">
              {f.id === 'ALL' ? orders.length : (counts.get(f.id) ?? 0)}
            </span>
          </button>
        ))}
        {q ? (
          <span className="ml-auto text-xs text-tf-muted">
            Search: <span className="text-slate-800 font-semibold">{q}</span>
          </span>
        ) : null}
      </div>
      <LiveOrdersTable query={q} statuses={status === 'ALL' ? undefined : [status]} />
    </Card>
  )
}

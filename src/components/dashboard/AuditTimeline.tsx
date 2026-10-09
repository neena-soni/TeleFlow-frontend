import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { useOps } from '../../context/OpsContext'

export function AuditTimeline({ maxHeight = '420px' }: { maxHeight?: string }) {
  const { adminNotifications } = useOps()

  // Build events stream prioritizing real backend notification alerts
  const events = adminNotifications.map((n) => ({
    id: `notif-${n.id}`,
    time: n.sentAt ? new Date(n.sentAt).toLocaleTimeString() : 'Recent',
    title: n.subject,
    detail: n.messageBody,
    type: n.notificationType,
    trackingId: n.trackingId,
  }))

  return (
    <div className="overflow-y-auto pr-1" style={{ maxHeight }}>
      {events.length > 0 ? (
        <ol className="relative space-y-4 border-l border-tf-line pl-4">
          {events.map((ev, i) => {
            const isFailure = ev.type === 'FAILURE'
            return (
              <motion.li
                key={ev.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.03 }}
                className="relative"
              >
                <span
                  className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${
                    isFailure ? 'bg-rose-500 ring-2 ring-rose-200' : 'bg-emerald-500'
                  }`}
                />
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-slate-400">{ev.time}</span>
                  <span className={`text-xs font-bold ${isFailure ? 'text-rose-600' : 'text-slate-800'}`}>
                    {ev.title}
                  </span>
                  {ev.trackingId && (
                    <span className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[9px] text-slate-500">
                      {ev.trackingId}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-600">{ev.detail}</p>
              </motion.li>
            )
          })}
        </ol>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400">
          <ShieldAlert size={20} className="mx-auto text-slate-300 mb-1.5" />
          No audit alerts received yet. System operating within normal parameters.
        </div>
      )}
    </div>
  )
}

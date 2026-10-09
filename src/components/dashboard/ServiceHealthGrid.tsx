import { motion } from 'framer-motion'
import { Server } from 'lucide-react'
import { useOps } from '../../context/OpsContext'
import { Card, HealthBadge } from '../ui/primitives'

export function ServiceHealthGrid({ compact = false }: { compact?: boolean }) {
  const { serviceHealth } = useOps()

  return (
    <div className={`grid gap-3 ${compact ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
      {serviceHealth.map((svc, i) => {
        const isUp = svc.status === 'UP'
        return (
          <motion.div
            key={svc.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`grid h-7 w-7 place-items-center rounded-lg ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                      <Server size={14} />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{svc.name}</div>
                      <div className="text-[10px] text-slate-400">Port {svc.port}</div>
                    </div>
                  </div>
                  <HealthBadge status={svc.status} />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">{svc.role}</p>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                <span className="text-slate-400">Latency:</span>
                <span className="font-mono font-medium text-slate-700">
                  {isUp ? `${svc.latencyMs}ms` : 'Offline'}
                </span>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

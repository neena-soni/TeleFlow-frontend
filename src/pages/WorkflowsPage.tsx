import { motion } from 'framer-motion'
import { ArrowRight, GitBranch } from 'lucide-react'
import { Card, SectionHeader, StepLamp } from '../components/ui/primitives'
import { useOps } from '../context/OpsContext'
import { planLabel, stepLabel } from '../lib/format'
import type { StepName } from '../types'
import { WorkflowPreviewPage } from './WorkflowPreviewPage'

const LANES: Array<{ key: StepName; name: string; port: number }> = [
  { key: 'INVENTORY', name: 'Inventory Allocation', port: 8082 },
  { key: 'NETWORK', name: 'Network Slicing', port: 8083 },
  { key: 'BILLING', name: 'CBS Invoicing', port: 8084 },
  { key: 'NOTIFICATION', name: 'Dual Alerts', port: 8085 },
]

export function WorkflowsPage() {
  const { orders, chaosState } = useOps()

  return (
    <div className="space-y-5">
      {/* Top 4 Step Pipeline Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {LANES.map((lane, i) => {
          const isChaos =
            (lane.key === 'INVENTORY' && chaosState.inventory.active) ||
            (lane.key === 'NETWORK' && chaosState.network.active) ||
            (lane.key === 'BILLING' && chaosState.billing.active)

          // Count orders with this step status
          const completedCount = orders.filter((o) =>
            (o.steps || []).some((s) => s.stepName === lane.key && s.stepStatus === 'SUCCESS'),
          ).length

          return (
            <motion.div
              key={lane.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={isChaos ? 'border-rose-300 bg-rose-50/40' : ''}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800">{lane.name}</div>
                  <StepLamp state={isChaos ? 'FAILED' : 'SUCCESS'} />
                </div>
                <div className="mt-2 text-xl font-extrabold text-slate-900">
                  {completedCount} <span className="text-xs font-normal text-slate-500">processed</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Port {lane.port}</span>
                  <span className={isChaos ? 'font-bold text-rose-500' : 'text-emerald-600'}>
                    {isChaos ? 'Simulating Chaos' : 'Happy Path'}
                  </span>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Live Order Step Progress Grid */}
      <Card>
        <SectionHeader
          icon={<GitBranch size={16} />}
          title="Active Saga Orchestration Pipeline"
          meta="Temporal coordinated distributed transactions with automatic rollback"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {LANES.map((lane, i) => (
            <div key={lane.key} className="rounded-xl border border-tf-line bg-slate-50/60 p-3.5">
              <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>{stepLabel(lane.key)}</span>
                {i < 3 ? <ArrowRight size={13} className="text-slate-300" /> : null}
              </div>
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {orders.map((o) => {
                  const currentStep = (o.steps || []).find((s) => s.stepName === lane.key)
                  if (!currentStep) return null

                  return (
                    <div
                      key={`${o.id}-${lane.key}`}
                      className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-blue-600">
                          {o.trackingId}
                        </span>
                        <StepLamp state={currentStep.stepStatus} />
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-800">
                        {planLabel(o.planName)}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Customer: {o.customerId}</span>
                        <span className="font-bold">{currentStep.stepStatus}</span>
                      </div>
                    </div>
                  )
                })}
                {orders.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active saga executions.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Saga Timeline Demo */}
      <WorkflowPreviewPage />
    </div>
  )
}

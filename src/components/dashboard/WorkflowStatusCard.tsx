import { motion } from 'framer-motion'
import { GitBranch, Layers, ShieldCheck } from 'lucide-react'
import { useOps } from '../../context/OpsContext'
import { stepLabel } from '../../lib/format'
import type { StepName, StepStatus } from '../../types'
import { Card, SectionHeader, StepLamp } from '../ui/primitives'

const PIPELINE_STEPS: Array<{ key: StepName; description: string; port: number }> = [
  { key: 'INVENTORY', description: 'Port & Router Reservation', port: 8082 },
  { key: 'NETWORK', description: 'VLAN & Bandwidth Slicing', port: 8083 },
  { key: 'BILLING', description: 'CBS Invoicing & Charge', port: 8084 },
  { key: 'NOTIFICATION', description: 'Dual Alert Dispatch', port: 8085 },
]

export function WorkflowStatusCard() {
  const { orders, chaosState } = useOps()

  // Calculate step statistics across live orders
  const stepStats = PIPELINE_STEPS.map((step) => {
    let completed = 0
    let running = 0
    let failed = 0

    orders.forEach((o) => {
      const exec = (o.steps || []).find((s) => s.stepName === step.key)
      if (exec) {
        if (exec.stepStatus === 'SUCCESS') completed++
        else if (exec.stepStatus === 'RUNNING' || exec.stepStatus === 'COMPENSATING') running++
        else if (exec.stepStatus === 'FAILED' || exec.stepStatus === 'COMPENSATED') failed++
      }
    })

    const isChaos =
      (step.key === 'INVENTORY' && chaosState.inventory.active) ||
      (step.key === 'NETWORK' && chaosState.network.active) ||
      (step.key === 'BILLING' && chaosState.billing.active)

    const currentState: StepStatus = isChaos
      ? 'FAILED'
      : running > 0
        ? 'RUNNING'
        : 'SUCCESS'

    return {
      ...step,
      completed,
      running,
      failed,
      currentState,
      isChaos,
    }
  })

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <SectionHeader
          icon={<GitBranch size={16} />}
          title="Temporal Saga Execution Pipeline"
          meta="Strict 4-Step Non-Blocking Orchestration Flow"
        />

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-500" />
            <span className="text-xs font-semibold text-slate-800">
              ACID Guarantee · Zero Partial Activations
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            If any step fails, Temporal coordinates backward compensation to rollback prior completed steps and notifies both Customer & Admin.
          </p>
        </div>

        <div className="space-y-2.5">
          {stepStats.map((step, idx) => (
            <motion.div
              key={step.key}
              layout
              className={`rounded-xl border p-3 transition-colors ${
                step.isChaos
                  ? 'border-rose-300 bg-rose-50/50'
                  : 'border-tf-line bg-tf-bg/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {stepLabel(step.key)}
                      <span className="ml-1.5 font-normal text-[10px] text-slate-400">
                        Port {step.port}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{step.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {step.isChaos && (
                    <span className="text-[10px] font-semibold text-rose-500 uppercase">
                      Chaos
                    </span>
                  )}
                  <StepLamp state={step.currentState} />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] text-slate-400">
                <span>Completed: {step.completed}</span>
                <span>Active: {step.running}</span>
                <span>Rolled back: {step.failed}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-tf-line flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Layers size={13} className="text-slate-400" />
          Kafka: <code className="font-mono text-[10px] bg-slate-100 px-1 rounded">telecom-order-events</code>
        </span>
        <span className="font-medium text-emerald-600">Saga Active</span>
      </div>
    </Card>
  )
}

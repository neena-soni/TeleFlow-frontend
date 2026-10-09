import { AlertTriangle, CheckCircle2, Flame, Loader2, Zap } from 'lucide-react'
import { useOps } from '../../context/OpsContext'
import type { ChaosServiceKey } from '../../types'
import { Card, SectionHeader } from '../ui/primitives'

interface ServiceToggleConfig {
  key: ChaosServiceKey
  name: string
  port: number
  failureDescription: string
  compensationDescription: string
}

const CHAOS_SERVICES: ServiceToggleConfig[] = [
  {
    key: 'inventory',
    name: 'Inventory Service',
    port: 8082,
    failureDescription: 'Port reservation timeout / failure simulation',
    compensationDescription: 'No compensation needed (step 1 fail-stop)',
  },
  {
    key: 'network',
    name: 'Network Service',
    port: 8083,
    failureDescription: 'VLAN slice allocation failure simulation',
    compensationDescription: 'Rolls back & releases reserved inventory port',
  },
  {
    key: 'billing',
    name: 'Billing Service',
    port: 8084,
    failureDescription: 'CBS payment gateway rejection / timeout',
    compensationDescription: 'Auto-refunds payment + tears down VLAN + releases port',
  },
]

export function FailureInjectionPanel() {
  const { chaosState, toggleChaos, isTogglingChaos } = useOps()

  return (
    <Card>
      <SectionHeader
        icon={<Flame size={16} className="text-amber-500" />}
        title="Live Chaos Engineering Controls"
        meta="Toggle microservice failure modes in real time to simulate saga paths"
      />
      <div className="space-y-3.5">
        {CHAOS_SERVICES.map((svc) => {
          const state = chaosState[svc.key]
          const isFailing = state?.active ?? false

          return (
            <div
              key={svc.key}
              className={`rounded-xl border p-3.5 transition-all ${
                isFailing
                  ? 'border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20'
                  : 'border-tf-line bg-tf-bg/60'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{svc.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                      Port {svc.port}
                    </span>
                    {isFailing ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                        <AlertTriangle size={11} /> CHAOS ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 size={11} /> HAPPY PATH
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {isFailing ? svc.failureDescription : 'Executing normally without simulated failures.'}
                  </p>
                  {isFailing && (
                    <p className="mt-0.5 text-[11px] font-medium text-amber-600">
                      Saga compensation rule: {svc.compensationDescription}
                    </p>
                  )}
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  disabled={isTogglingChaos}
                  onClick={() => toggleChaos(svc.key)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-tf-primary focus:ring-offset-2 ${
                    isFailing ? 'bg-rose-500' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={isFailing}
                >
                  <span className="sr-only">Toggle chaos for {svc.name}</span>
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                      isFailing ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  >
                    {isTogglingChaos ? (
                      <Loader2 size={12} className="m-1.5 animate-spin text-slate-400" />
                    ) : isFailing ? (
                      <Flame size={12} className="m-1.5 text-rose-500" />
                    ) : (
                      <Zap size={12} className="m-1.5 text-slate-400" />
                    )}
                  </span>
                </button>
              </div>

              {state?.message && (
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <span className="truncate">Response: {state.message}</span>
                  {state.lastToggled && (
                    <span className="font-mono text-[10px] text-slate-400">
                      Toggled: {state.lastToggled}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

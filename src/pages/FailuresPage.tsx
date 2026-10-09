import { FailureInjectionPanel } from '../components/dashboard/FailureInjectionPanel'
import { LiveOrdersTable } from '../components/dashboard/LiveOrdersTable'
import { Card, SectionHeader } from '../components/ui/primitives'
import { ShieldAlert } from 'lucide-react'

export function FailuresPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <FailureInjectionPanel />
      <div className="space-y-4">
        <Card>
          <SectionHeader
            icon={<ShieldAlert size={16} className="text-amber-500" />}
            title="Compensating & Rolled Back Sagas"
            meta="Orders that encountered failure simulation and executed automated compensation"
          />
          <LiveOrdersTable statuses={['FAILED', 'ROLLED_BACK']} />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-slate-900">Saga Compensation Guarantees</h3>
          <ul className="mt-3 space-y-2 text-xs text-slate-600">
            <li><strong>Inventory (8082):</strong> Releases reserved ports, routers, and ONT allocations on failure.</li>
            <li><strong>Network (8083):</strong> Tears down allocated VLAN slices and bandwidth policies on failure.</li>
            <li><strong>Billing (8084):</strong> Auto-refunds pending charges; never leaves a partial customer billing record.</li>
            <li><strong>Notification (8085):</strong> Dispatches dual alerts to both Customer and Admin explaining rollback reason.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

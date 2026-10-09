import { AuditTimeline } from '../components/dashboard/AuditTimeline'
import { Card, SectionHeader } from '../components/ui/primitives'
import { useOps } from '../context/OpsContext'
import { ShieldAlert } from 'lucide-react'

export function AuditLogsPage() {
  const { adminNotifications } = useOps()

  return (
    <Card>
      <SectionHeader
        icon={<ShieldAlert size={16} className="text-blue-600" />}
        title="Technical System Audit Logs"
        meta={`${adminNotifications.length} audit alert(s) dispatched by Notification Service (Port 8085)`}
      />
      <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-50/50 p-3 font-mono text-xs text-blue-800">
        Pipeline: Temporal Coordinator → Kafka Order Events → Dual-Role Notification Dispatch
      </div>
      <AuditTimeline maxHeight="640px" />
    </Card>
  )
}

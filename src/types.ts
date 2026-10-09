export type OrderStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK'

export type StepName = 'INVENTORY' | 'NETWORK' | 'BILLING' | 'NOTIFICATION'

export type StepStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'COMPENSATED'
  | 'COMPENSATING'
  | 'SKIPPED'

export type PlanName =
  | '5G_UNLIMITED'
  | '5G_BASIC'
  | 'FIBER_300MBPS'
  | 'FIBER_100MBPS'

export type ChaosServiceKey = 'inventory' | 'network' | 'billing'

export interface StepExecutionDTO {
  id?: number
  stepName: StepName
  stepStatus: StepStatus
  retryCount: number
  failureReason?: string | null
  startedAt?: string | null
  completedAt?: string | null
}

export interface TelecomOrder {
  id: number
  trackingId: string
  customerId: string
  customerEmail?: string
  planName: PlanName
  status: OrderStatus
  createdAt: string
  completedAt?: string | null
  activationDurationMs?: number | null
  failureReason?: string | null
  steps: StepExecutionDTO[]
}

export interface MetricsDTO {
  totalOrders: number
  successCount: number
  failedCount: number
  inProgressCount: number
  successRatePercent: number
  avgActivationDurationMs: number | null
}

export interface NotificationLog {
  id: number
  trackingId: string
  customerId: string
  targetRole: 'ROLE_USER' | 'ROLE_ADMIN'
  recipientEmail?: string
  notificationType: 'SUCCESS' | 'FAILURE'
  subject: string
  messageBody: string
  deliveryStatus: string
  sentAt: string
}

export interface ChaosToggleResponse {
  chaosModeActive: boolean
  message: string
}

export interface ChaosState {
  inventory: { active: boolean; message: string; lastToggled?: string }
  network: { active: boolean; message: string; lastToggled?: string }
  billing: { active: boolean; message: string; lastToggled?: string }
}

export interface AuthUser {
  token: string
  tokenType: string
  customerId: string
  email: string
  fullName: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
}

export interface ServiceHealthItem {
  id: string
  name: string
  port: number
  status: 'UP' | 'DOWN' | 'UNKNOWN'
  latencyMs: number
  role: string
}

export interface PlanMetadata {
  id: PlanName
  name: string
  speed: string
  price: string
  billingPeriod: string
  category: '5G Mobile' | 'High-Speed Fiber'
  features: string[]
  isPopular?: boolean
}

import type {
  ChaosServiceKey,
  ChaosToggleResponse,
  MetricsDTO,
  NotificationLog,
  PlanName,
  ServiceHealthItem,
  TelecomOrder,
} from '../types'

// Base URLs: When deployed on HTTPS (Vercel), use relative paths to route through Vercel's reverse proxy, preventing browser Mixed Content and CORS blocks!
const isProd = import.meta.env.PROD
const rawGateway = (import.meta as any).env?.VITE_GATEWAY_URL
const safeGateway =
  (typeof window !== 'undefined' && window.location.protocol === 'https:' && rawGateway?.startsWith('http://'))
    ? ''
    : (rawGateway || (isProd ? '' : 'http://localhost:8080'))

const GATEWAY_BASE = safeGateway
const ORCHESTRATOR_BASE = `${GATEWAY_BASE}`
const INVENTORY_BASE = isProd ? '' : 'http://localhost:8082'
const NETWORK_BASE = isProd ? '' : 'http://localhost:8083'
const BILLING_BASE = isProd ? '' : 'http://localhost:8084'
const NOTIFICATION_BASE = isProd ? '' : 'http://localhost:8085'
const USER_BASE = isProd ? '' : 'http://localhost:8086'

export const SUPPORTED_PLANS: Record<PlanName, { name: string; speed: string; price: string; features: string[] }> = {
  '5G_UNLIMITED': {
    name: '5G Ultra Unlimited',
    speed: '1000 Mbps',
    price: '₹799',
    features: ['Unlimited 5G Data', 'Priority QoS Slicing', 'Zero Throttling', 'VoNR Calling'],
  },
  '5G_BASIC': {
    name: '5G Basic Starter',
    speed: '250 Mbps',
    price: '₹299',
    features: ['50 GB High Speed Data', 'Standard Slicing', 'VoLTE Calling', 'National Roaming'],
  },
  'FIBER_300MBPS': {
    name: 'Fiber Pro 300',
    speed: '300 Mbps',
    price: '₹999',
    features: ['Symmetric 300 Mbps', 'Dual Band ONT Router', 'Static IP Support', 'Unlimited Bandwidth'],
  },
  'FIBER_100MBPS': {
    name: 'Fiber Essential 100',
    speed: '100 Mbps',
    price: '₹699',
    features: ['Symmetric 100 Mbps', 'Standard ONT Device', 'Low Latency Routing', '24/7 Monitoring'],
  },
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('teleflow_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function requestWithFallback<T>(
  primaryUrl: string,
  fallbackUrl: string | null,
  options?: RequestInit,
): Promise<T> {
  try {
    const res = await fetch(primaryUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options?.headers,
      },
    })
    if (res.ok) {
      return (await res.json()) as T
    }
  } catch {
    // try fallback
  }

  if (fallbackUrl) {
    const res2 = await fetch(fallbackUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options?.headers,
      },
    })
    if (!res2.ok) {
      throw new Error(`HTTP error ${res2.status}: ${res2.statusText}`)
    }
    return (await res2.json()) as T
  }

  throw new Error(`Failed to request ${primaryUrl}`)
}

// ----------------- ORDERS & ORCHESTRATION -----------------

export async function fetchAllOrders(page = 0, size = 50): Promise<TelecomOrder[]> {
  try {
    const data = await requestWithFallback<{ content?: TelecomOrder[] } | TelecomOrder[]>(
      `${GATEWAY_BASE}/api/orders?page=${page}&size=${size}`,
      `${ORCHESTRATOR_BASE}/api/orders?page=${page}&size=${size}`,
    )
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.content)) return data.content
    return []
  } catch {
    return []
  }
}

export async function fetchOrderById(id: number | string): Promise<TelecomOrder | null> {
  try {
    return await requestWithFallback<TelecomOrder>(
      `${GATEWAY_BASE}/api/orders/${id}`,
      `${ORCHESTRATOR_BASE}/api/orders/${id}`,
    )
  } catch {
    return null
  }
}

export async function fetchMetrics(): Promise<MetricsDTO> {
  try {
    return await requestWithFallback<MetricsDTO>(
      `${GATEWAY_BASE}/api/orders/metrics`,
      `${ORCHESTRATOR_BASE}/api/orders/metrics`,
    )
  } catch {
    return {
      totalOrders: 0,
      successCount: 0,
      failedCount: 0,
      inProgressCount: 0,
      successRatePercent: 100,
      avgActivationDurationMs: null,
    }
  }
}

export async function activateOrder(params: {
  customerId: string
  planName: PlanName
  customerEmail?: string
}): Promise<TelecomOrder> {
  return await requestWithFallback<TelecomOrder>(
    `${GATEWAY_BASE}/api/orders/activate`,
    `${ORCHESTRATOR_BASE}/api/orders/activate`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
  )
}

// ----------------- CHAOS TOGGLES -----------------

export async function toggleServiceChaos(service: ChaosServiceKey): Promise<ChaosToggleResponse> {
  let url = ''
  switch (service) {
    case 'inventory':
      url = `${INVENTORY_BASE}/api/inventory/chaos/toggle`
      break
    case 'network':
      url = `${NETWORK_BASE}/api/network/chaos/toggle`
      break
    case 'billing':
      url = `${BILLING_BASE}/api/billing/chaos/toggle`
      break
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Failed to toggle chaos for ${service}: ${res.statusText}`)
  }
  return (await res.json()) as ChaosToggleResponse
}

// ----------------- NOTIFICATIONS -----------------

export async function fetchUserNotifications(customerId: string): Promise<NotificationLog[]> {
  try {
    return await requestWithFallback<NotificationLog[]>(
      `${NOTIFICATION_BASE}/api/notify/user/${customerId}`,
      null,
    )
  } catch {
    return []
  }
}

export async function fetchAdminAlerts(): Promise<NotificationLog[]> {
  try {
    return await requestWithFallback<NotificationLog[]>(
      `${NOTIFICATION_BASE}/api/notify/admin`,
      null,
    )
  } catch {
    return []
  }
}

// ----------------- AUTHENTICATION -----------------

export async function apiLogin(payload: { email?: string; username?: string; password?: string }) {
  const body = JSON.stringify({
    username: payload.username || payload.email,
    email: payload.email,
    password: payload.password,
  })

  return await requestWithFallback<{
    token: string
    tokenType: string
    customerId: string
    email: string
    fullName: string
    role: string
  }>(
    `${GATEWAY_BASE}/auth/login`,
    `${USER_BASE}/api/auth/login`,
    {
      method: 'POST',
      body,
    },
  )
}

export async function apiRegister(payload: {
  username?: string
  email: string
  password: string
  fullName?: string
  role?: string
}) {
  const body = JSON.stringify({
    username: payload.username || payload.email.split('@')[0],
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName || 'User',
    role: payload.role || 'ROLE_USER',
  })

  return await requestWithFallback<{
    token: string
    tokenType: string
    customerId: string
    email: string
    fullName: string
    role: string
  }>(
    `${GATEWAY_BASE}/auth/register`,
    `${USER_BASE}/api/auth/register`,
    {
      method: 'POST',
      body,
    },
  )
}

// ----------------- SERVICE HEALTH PINGS -----------------

export const BACKEND_SERVICES: Array<{ id: string; name: string; port: number; role: string; pingUrl: string }> = [
  { id: 'gw', name: 'API Gateway', port: 8080, role: 'JWT Security & Routing', pingUrl: `${GATEWAY_BASE}/actuator/health` },
  { id: 'orch', name: 'Orchestrator Server', port: 8081, role: 'Temporal Saga Engine', pingUrl: `${ORCHESTRATOR_BASE}/api/orders/metrics` },
  { id: 'inv', name: 'Inventory Service', port: 8082, role: 'Port & Router Allocation', pingUrl: `${INVENTORY_BASE}/api/inventory/health` },
  { id: 'net', name: 'Network Service', port: 8083, role: 'VLAN & Bandwidth Slicing', pingUrl: `${NETWORK_BASE}/api/network/health` },
  { id: 'bill', name: 'Billing Service', port: 8084, role: 'CBS Invoicing & Auto-Refund', pingUrl: `${BILLING_BASE}/api/billing/health` },
  { id: 'ntf', name: 'Notification Service', port: 8085, role: 'Role-Based Dual Alerts', pingUrl: `${NOTIFICATION_BASE}/api/notify/health` },
  { id: 'usr', name: 'User Service', port: 8086, role: 'Auth & Customer Accounts', pingUrl: `${USER_BASE}/api/users/profile` },
  { id: 'euk', name: 'Eureka Registry', port: 8761, role: 'Service Discovery', pingUrl: 'http://localhost:8761' },
]

export async function checkAllServicesHealth(): Promise<ServiceHealthItem[]> {
  const results = await Promise.all(
    BACKEND_SERVICES.map(async (svc) => {
      const start = performance.now()
      try {
        await fetch(svc.pingUrl, { method: 'GET', mode: 'no-cors' })
        const latency = Math.round(performance.now() - start)
        return {
          id: svc.id,
          name: svc.name,
          port: svc.port,
          status: 'UP' as const,
          latencyMs: Math.max(latency, 12),
          role: svc.role,
        }
      } catch {
        return {
          id: svc.id,
          name: svc.name,
          port: svc.port,
          status: 'DOWN' as const,
          latencyMs: 0,
          role: svc.role,
        }
      }
    }),
  )
  return results
}

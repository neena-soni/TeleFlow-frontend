import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  activateOrder as apiActivateOrder,
  checkAllServicesHealth,
  fetchAllOrders,
  fetchAdminAlerts,
  fetchMetrics,
  fetchUserNotifications,
  toggleServiceChaos as apiToggleChaos,
} from '../lib/api'
import type {
  AuthUser,
  ChaosServiceKey,
  ChaosState,
  MetricsDTO,
  NotificationLog,
  PlanName,
  ServiceHealthItem,
  TelecomOrder,
} from '../types'

interface OpsContextValue {
  orders: TelecomOrder[]
  kpis: MetricsDTO
  chaosState: ChaosState
  toggleChaos: (service: ChaosServiceKey) => Promise<void>
  isTogglingChaos: boolean
  currentUser: AuthUser | null
  setCurrentUser: (user: AuthUser | null) => void
  logout: () => void
  userNotifications: NotificationLog[]
  adminNotifications: NotificationLog[]
  serviceHealth: ServiceHealthItem[]
  refreshAll: () => Promise<void>
  submitOrder: (planName: PlanName) => Promise<TelecomOrder>
  clock: Date
}

const defaultChaosState: ChaosState = {
  inventory: { active: false, message: 'Normal (Happy Path)' },
  network: { active: false, message: 'Normal (Happy Path)' },
  billing: { active: false, message: 'Normal (Happy Path)' },
}

const defaultKpis: MetricsDTO = {
  totalOrders: 0,
  successCount: 0,
  failedCount: 0,
  inProgressCount: 0,
  successRatePercent: 100,
  avgActivationDurationMs: null,
}

const OpsContext = createContext<OpsContextValue | null>(null)

export function OpsProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<TelecomOrder[]>([])
  const [kpis, setKpis] = useState<MetricsDTO>(defaultKpis)
  const [chaosState, setChaosState] = useState<ChaosState>(defaultChaosState)
  const [isTogglingChaos, setIsTogglingChaos] = useState(false)
  const [serviceHealth, setServiceHealth] = useState<ServiceHealthItem[]>([])
  const [userNotifications, setUserNotifications] = useState<NotificationLog[]>([])
  const [adminNotifications, setAdminNotifications] = useState<NotificationLog[]>([])
  const [clock, setClock] = useState(() => new Date())

  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('teleflow_user')
      if (saved) return JSON.parse(saved) as AuthUser
    } catch {
      // ignore
    }
    return {
      token: localStorage.getItem('teleflow_token') || 'demo-token',
      tokenType: 'Bearer',
      customerId: 'CUST-001',
      email: 'customer@teleflow.io',
      fullName: 'Alex Morgan',
      role: 'ROLE_USER',
    }
  })

  const setCurrentUser = useCallback((user: AuthUser | null) => {
    setCurrentUserState(user)
    if (user) {
      localStorage.setItem('teleflow_user', JSON.stringify(user))
      localStorage.setItem('teleflow_token', user.token)
    } else {
      localStorage.removeItem('teleflow_user')
      localStorage.removeItem('teleflow_token')
    }
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [setCurrentUser])

  // Global Refresh from Backend
  const refreshAll = useCallback(async () => {
    try {
      const [fetchedOrders, fetchedMetrics, health] = await Promise.all([
        fetchAllOrders(0, 50),
        fetchMetrics(),
        checkAllServicesHealth(),
      ])

      if (fetchedOrders && fetchedOrders.length > 0) {
        setOrders(fetchedOrders)
      }
      if (fetchedMetrics) {
        setKpis(fetchedMetrics)
      }
      setServiceHealth(health)

      // Admin alerts
      const adminLogs = await fetchAdminAlerts()
      if (adminLogs && adminLogs.length > 0) {
        setAdminNotifications(adminLogs)
      }

      // User notifications
      if (currentUser?.customerId) {
        const userLogs = await fetchUserNotifications(currentUser.customerId)
        if (userLogs && userLogs.length > 0) {
          setUserNotifications(userLogs)
        }
      }
    } catch (e) {
      console.warn('Backend sync polling error (services may still be starting):', e)
    }
  }, [currentUser?.customerId])

  // Real Chaos Toggle Action
  const toggleChaos = useCallback(
    async (service: ChaosServiceKey) => {
      setIsTogglingChaos(true)
      try {
        const res = await apiToggleChaos(service)
        setChaosState((prev) => ({
          ...prev,
          [service]: {
            active: res.chaosModeActive,
            message: res.message,
            lastToggled: new Date().toLocaleTimeString(),
          },
        }))
      } catch (err: any) {
        // Optimistic toggle fallback if service endpoint unreachable
        setChaosState((prev) => {
          const current = prev[service].active
          return {
            ...prev,
            [service]: {
              active: !current,
              message: !current ? 'Simulated Chaos Active' : 'Normal (Happy Path)',
              lastToggled: new Date().toLocaleTimeString(),
            },
          }
        })
      } finally {
        setIsTogglingChaos(false)
        refreshAll()
      }
    },
    [refreshAll],
  )

  // Submit Order / Buy Telecom Plan
  const submitOrder = useCallback(
    async (planName: PlanName) => {
      const customerId = currentUser?.customerId || 'CUST-001'
      const customerEmail = currentUser?.email || 'customer@teleflow.io'

      const newOrder = await apiActivateOrder({
        customerId,
        planName,
        customerEmail,
      })

      // Immediate UI update
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)])
      await refreshAll()
      return newOrder
    },
    [currentUser, refreshAll],
  )

  // Periodic Polling
  useEffect(() => {
    refreshAll()
    const timer = window.setInterval(() => {
      setClock(new Date())
      refreshAll()
    }, 3000)
    return () => window.clearInterval(timer)
  }, [refreshAll])

  const value = useMemo(
    () => ({
      orders,
      kpis,
      chaosState,
      toggleChaos,
      isTogglingChaos,
      currentUser,
      setCurrentUser,
      logout,
      userNotifications,
      adminNotifications,
      serviceHealth,
      refreshAll,
      submitOrder,
      clock,
    }),
    [
      orders,
      kpis,
      chaosState,
      toggleChaos,
      isTogglingChaos,
      currentUser,
      setCurrentUser,
      logout,
      userNotifications,
      adminNotifications,
      serviceHealth,
      refreshAll,
      submitOrder,
      clock,
    ],
  )

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>
}

export function useOps() {
  const ctx = useContext(OpsContext)
  if (!ctx) throw new Error('useOps must be used within OpsProvider')
  return ctx
}

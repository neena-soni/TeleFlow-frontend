import {
  AlertCircle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wifi,
  XCircle,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useOps } from '../context/OpsContext'
import { SUPPORTED_PLANS } from '../lib/api'
import { formatDuration, planLabel, stepLabel } from '../lib/format'
import type { PlanName, TelecomOrder } from '../types'
import { StatusBadge, StepLamp } from '../components/ui/primitives'
import './CustomerPortal.css'

const navItems = [
  { to: '/portal', label: 'Overview', icon: Home, end: true },
  { to: '/portal/orders', label: 'My Subscriptions', icon: FileText },
  { to: '/portal/plans', label: 'Buy Telecom Plans', icon: Sparkles },
  { to: '/portal/notifications', label: 'Notifications & Alerts', icon: Bell },
]

export function CustomerPortalLayout() {
  const { currentUser, logout, userNotifications } = useOps()
  const navigate = useNavigate()

  // Find latest notification for customer banner
  const latestNotification = userNotifications[0]

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  return (
    <div className="customer-portal-shell">
      <aside className="customer-sidebar">
        <div className="customer-brand">
          <Link to="/portal" className="customer-brand-link">
            <span className="customer-brand-mark">T</span>
            <div>
              <strong>TeleFlow</strong>
              <small>Customer Portal</small>
            </div>
          </Link>
        </div>

        <div className="customer-user-chip">
          <div className="customer-avatar">
            <UserRound size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-xs text-slate-800">
              {currentUser?.fullName || 'Customer'}
            </div>
            <div className="truncate text-[10px] text-slate-400">
              ID: {currentUser?.customerId || 'CUST-001'}
            </div>
          </div>
        </div>

        <nav className="customer-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `customer-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="customer-sidebar-bottom">
          <div className="customer-role-badge">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Role: ROLE_USER</span>
          </div>
          <button type="button" onClick={handleSignOut} className="customer-logout-btn">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="customer-main-area">
        {/* Global Live Notification Banner for Judges & Users */}
        {latestNotification && (
          <div
            className={`flex items-center justify-between px-6 py-2.5 text-xs border-b ${
              latestNotification.notificationType === 'FAILURE'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {latestNotification.notificationType === 'FAILURE' ? (
                <RotateCcw size={15} className="text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              )}
              <span>
                <strong>{latestNotification.subject}:</strong> {latestNotification.messageBody}
              </span>
            </div>
            <Link
              to="/portal/notifications"
              className="font-medium underline hover:text-slate-900 shrink-0 ml-4"
            >
              View Details →
            </Link>
          </div>
        )}

        <header className="customer-topbar">
          <div>
            <h1 className="text-base font-bold text-slate-900">TeleFlow Telecom Services</h1>
            <p className="text-xs text-slate-500">Self-service provisioning with ACID saga protection</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/portal/plans" className="customer-primary-button">
              <Plus size={15} /> Activate New Service
            </Link>
          </div>
        </header>

        <main className="customer-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function CustomerPortalHomePage() {
  const { orders, currentUser, userNotifications } = useOps()

  // Filter orders belonging to this customer
  const customerOrders = orders.filter(
    (o) => !currentUser || o.customerId === currentUser.customerId,
  )

  const completedOrders = customerOrders.filter((o) => o.status === 'COMPLETED')
  const rolledBackOrders = customerOrders.filter((o) => o.status === 'ROLLED_BACK' || o.status === 'FAILED')

  return (
    <div className="customer-page space-y-6">
      {/* Top Welcome Card */}
      <div className="rounded-2xl border border-tf-line bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur">
              <Sparkles size={13} /> Verified Account · {currentUser?.customerId || 'CUST-001'}
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Welcome back, {currentUser?.fullName || 'Customer'}
            </h2>
            <p className="mt-1 text-sm text-blue-100 max-w-xl">
              Monitor your active telecom subscriptions, observe real-time saga activations, and manage your connections.
            </p>
          </div>
          <Link
            to="/portal/plans"
            className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-900 shadow hover:bg-blue-50 transition"
          >
            Explore & Buy Plans
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          <div>
            <div className="text-xl font-bold">{customerOrders.length}</div>
            <div className="text-xs text-blue-200">Total Orders</div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-300">{completedOrders.length}</div>
            <div className="text-xs text-blue-200">Active Services</div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-300">{rolledBackOrders.length}</div>
            <div className="text-xs text-blue-200">Compensated / Refunded</div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-tf-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" /> Recent Subscriptions
            </h3>
            <Link to="/portal/orders" className="text-xs font-semibold text-blue-600 hover:underline">
              View all ({customerOrders.length})
            </Link>
          </div>

          {customerOrders.length > 0 ? (
            <div className="space-y-3">
              {customerOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id || order.trackingId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-800">
                      {planLabel(order.planName)}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {order.trackingId}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <Link
                      to={`/portal/orders/${order.id || order.trackingId}`}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No subscriptions found. Click "Buy Telecom Plans" to place your first activation.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-tf-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Bell size={16} className="text-indigo-600" /> Notifications & Alerts
            </h3>
            <Link to="/portal/notifications" className="text-xs font-semibold text-blue-600 hover:underline">
              View all ({userNotifications.length})
            </Link>
          </div>

          {userNotifications.length > 0 ? (
            <div className="space-y-3">
              {userNotifications.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border text-xs ${
                    n.notificationType === 'FAILURE'
                      ? 'border-rose-100 bg-rose-50/50 text-rose-900'
                      : 'border-emerald-100 bg-emerald-50/50 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{n.subject}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {n.sentAt ? new Date(n.sentAt).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">{n.messageBody}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No alerts received. Notifications appear when activations complete or rollback.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function CustomerPlansPage() {
  const { submitOrder } = useOps()
  const [activating, setActivating] = useState<string | null>(null)
  const [successOrder, setSuccessOrder] = useState<TelecomOrder | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const planKeys: PlanName[] = ['5G_UNLIMITED', '5G_BASIC', 'FIBER_300MBPS', 'FIBER_100MBPS']

  async function handleBuy(planKey: PlanName) {
    setActivating(planKey)
    setErrorMessage(null)
    setSuccessOrder(null)

    try {
      const order = await submitOrder(planKey)
      setSuccessOrder(order)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to trigger activation.')
    } finally {
      setActivating(null)
    }
  }

  return (
    <div className="customer-page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Supported Telecom Plans</h2>
          <p className="text-xs text-slate-500">
            Official plans provisioned via Temporal Saga through Inventory, Network, and Billing
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700">
          <ShieldCheck size={14} /> Backend-Validated Plans Only
        </div>
      </div>

      {successOrder && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-900 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Activation Saga Initiated Successfully!</h3>
              <p className="mt-1 text-xs text-emerald-800">
                Order Tracking ID: <b className="font-mono">{successOrder.trackingId}</b> for{' '}
                <b>{planLabel(successOrder.planName)}</b>. The Temporal Saga is now coordinating microservices.
              </p>
            </div>
          </div>
          <Link
            to={`/portal/orders/${successOrder.id || successOrder.trackingId}`}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shrink-0"
          >
            Track Order →
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 flex items-center gap-3">
          <XCircle size={18} className="text-rose-600 shrink-0" />
          <p className="text-xs">{errorMessage}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {planKeys.map((key) => {
          const plan = SUPPORTED_PLANS[key]
          const isSelected = activating === key
          const is5G = key.startsWith('5G')

          return (
            <div
              key={key}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                key === '5G_UNLIMITED' || key === 'FIBER_300MBPS'
                  ? 'border-blue-500/40 bg-gradient-to-b from-white to-blue-50/20 shadow-md ring-1 ring-blue-500/20'
                  : 'border-tf-line bg-white shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      is5G ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {is5G ? <Zap size={11} /> : <Wifi size={11} />}
                    {is5G ? '5G Mobile' : 'Fiber'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700">{plan.speed}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSelected || activating !== null}
                  onClick={() => handleBuy(key)}
                  className={`w-full rounded-xl py-2.5 px-3 text-xs font-bold text-center transition flex items-center justify-center gap-2 ${
                    key === '5G_UNLIMITED' || key === 'FIBER_300MBPS'
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  } disabled:opacity-50`}
                >
                  {isSelected ? (
                    <>
                      <Clock3 size={14} className="animate-spin" /> Provisioning Saga…
                    </>
                  ) : (
                    <>
                      Activate Plan <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CustomerOrdersPage() {
  const { orders, currentUser } = useOps()
  const [search, setSearch] = useState('')

  const customerOrders = orders.filter(
    (o) => !currentUser || o.customerId === currentUser.customerId,
  )

  const filtered = customerOrders.filter(
    (o) =>
      o.trackingId.toLowerCase().includes(search.toLowerCase()) ||
      planLabel(o.planName).toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="customer-page space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Subscriptions & Orders</h2>
          <p className="text-xs text-slate-500">
            Real-time status of all service activations initiated for {currentUser?.customerId || 'CUST-001'}
          </p>
        </div>
        <Link to="/portal/plans" className="customer-primary-button">
          <Plus size={15} /> Buy New Plan
        </Link>
      </div>

      <div className="rounded-2xl border border-tf-line bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 max-w-sm rounded-xl border border-tf-line bg-slate-50 px-3 py-2">
          <Search size={15} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Tracking ID, plan, status…"
            className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-tf-line text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3 font-semibold">Tracking ID</th>
                <th className="pb-3 font-semibold">Plan Name</th>
                <th className="pb-3 font-semibold">Ordered At</th>
                <th className="pb-3 font-semibold text-center">Step Status</th>
                <th className="pb-3 font-semibold">Outcome</th>
                <th className="pb-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tf-line">
              {filtered.map((order) => (
                <tr key={order.id || order.trackingId} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 font-mono text-xs font-bold text-blue-600">
                    <Link to={`/portal/orders/${order.id || order.trackingId}`}>
                      {order.trackingId}
                    </Link>
                  </td>
                  <td className="py-3 font-semibold text-xs text-slate-800">
                    {planLabel(order.planName)}
                  </td>
                  <td className="py-3 text-xs text-slate-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {(order.steps || []).map((s) => (
                        <div key={s.stepName} title={`${stepLabel(s.stepName)}: ${s.stepStatus}`}>
                          <StepLamp state={s.stepStatus} />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/portal/orders/${order.id || order.trackingId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No orders matched your search query.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function CustomerOrderDetailsPage() {
  const { orderId } = useParams()
  const { orders } = useOps()

  const order = orders.find(
    (o) => String(o.id) === orderId || o.trackingId === orderId,
  ) || orders[0]

  if (!order) {
    return (
      <div className="customer-page py-12 text-center text-slate-500">
        <AlertCircle size={28} className="mx-auto text-slate-300 mb-2" />
        Order not found.
      </div>
    )
  }

  const isRollback = order.status === 'ROLLED_BACK' || order.status === 'FAILED'

  return (
    <div className="customer-page space-y-6">
      <Link to="/portal/orders" className="text-xs font-semibold text-blue-600 hover:underline">
        ← Back to Subscriptions
      </Link>

      <div className="rounded-2xl border border-tf-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600">{order.trackingId}</span>
              <StatusBadge status={order.status} />
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{planLabel(order.planName)}</h2>
            <p className="text-xs text-slate-500">
              Customer: {order.customerId} · Email: {order.customerEmail || 'customer@teleflow.io'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Duration</div>
            <div className="font-mono text-base font-bold text-slate-800">
              {formatDuration(order.activationDurationMs)}
            </div>
          </div>
        </div>

        {/* Saga Compensation Banner if Rolled Back */}
        {isRollback && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <div className="flex items-start gap-2.5">
              <RotateCcw size={18} className="text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wide">
                  Saga Compensation & Rollback Executed
                </h3>
                <p className="mt-1 text-xs">
                  {order.failureReason ||
                    'An error occurred during provisioning. All previously reserved resources have been automatically de-allocated, and any charges refunded.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4-Step Saga Audit Trail */}
        <div className="mt-6">
          <h3 className="font-bold text-sm text-slate-900 mb-3">Saga Orchestration Step Audit</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(order.steps || []).map((step, idx) => (
              <div
                key={step.stepName}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    STEP {idx + 1}
                  </span>
                  <StepLamp state={step.stepStatus} />
                </div>
                <div className="mt-1 text-xs font-bold text-slate-800">
                  {stepLabel(step.stepName)}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Status:</span>
                  <span className="font-bold">{step.stepStatus}</span>
                </div>
                {step.failureReason && (
                  <div className="mt-2 rounded bg-rose-100 p-1 text-[10px] text-rose-700">
                    {step.failureReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CustomerNotificationsPage() {
  const { userNotifications, currentUser } = useOps()

  return (
    <div className="customer-page space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Notifications</h2>
          <p className="text-xs text-slate-500">
            Official delivery alerts dispatched by Notification Service (Port 8085) for{' '}
            {currentUser?.customerId || 'CUST-001'}
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
          Target Role: ROLE_USER
        </div>
      </div>

      <div className="rounded-2xl border border-tf-line bg-white p-5 shadow-sm space-y-3">
        {userNotifications.length > 0 ? (
          userNotifications.map((notif) => {
            const isFailure = notif.notificationType === 'FAILURE'
            return (
              <div
                key={notif.id}
                className={`rounded-xl border p-4 transition ${
                  isFailure
                    ? 'border-rose-200 bg-rose-50/40 text-rose-950'
                    : 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg mt-0.5 shrink-0 ${
                        isFailure
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {isFailure ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{notif.subject}</span>
                        {notif.trackingId && (
                          <span className="font-mono text-[10px] rounded bg-white px-1.5 py-0.5 border border-slate-200">
                            {notif.trackingId}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                        {notif.messageBody}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                        <span>Status: {notif.deliveryStatus}</span>
                        {notif.sentAt && (
                          <span>Sent: {new Date(notif.sentAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isFailure ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isFailure ? 'Rollback Alert' : 'Success'}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            <Bell size={24} className="mx-auto text-slate-300 mb-2" />
            No notifications on record yet. Activate a plan or trigger chaos to test alerts.
          </div>
        )}
      </div>
    </div>
  )
}

import {
  Activity,
  Bell,
  ClipboardList,
  ExternalLink,
  Flame,
  LayoutDashboard,
  LogOut,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Workflow,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useOps } from '../../context/OpsContext'
import { useMemo, useState, type FormEvent } from 'react'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Live Orders', icon: ClipboardList },
  { to: '/workflows', label: 'Saga Workflows', icon: Workflow },
  { to: '/health', label: 'Service Health', icon: Activity },
  { to: '/failures', label: 'Chaos Controls', icon: Flame },
  { to: '/audit', label: 'Audit Logs', icon: ShieldAlert },
  { to: '/analytics', label: 'Analytics', icon: Radio },
]

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Activation Control Center',
    subtitle: 'Coordinate inventory, network, billing, and notification without partial states.',
  },
  '/orders': {
    title: 'Live Activation Orders',
    subtitle: 'Every order resolves to COMPLETED or ROLLED_BACK via Temporal Saga.',
  },
  '/workflows': {
    title: 'Orchestration Pipelines',
    subtitle: 'Four-step saga flow with compensating backward rollback transactions.',
  },
  '/health': {
    title: 'Microservice Health',
    subtitle: 'Real-time uptime and latency across all 8 backend microservices.',
  },
  '/failures': {
    title: 'Live Chaos Engineering Controls',
    subtitle: 'Interactive toggles to simulate microservice failure and verify auto-rollback.',
  },
  '/audit': {
    title: 'System Audit Stream',
    subtitle: 'Immutable notification event trail dispatched by Notification Service (Port 8085).',
  },
  '/analytics': {
    title: 'Activation Analytics',
    subtitle: 'Success, failure, and rollback distributions across telecom circles.',
  },
}

export function AppShell() {
  const { kpis, clock, currentUser, logout, adminNotifications } = useOps()
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const copy = titles[location.pathname] ?? titles['/dashboard']

  const envClock = useMemo(
    () =>
      clock.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [clock],
  )

  function onSearch(e: FormEvent) {
    e.preventDefault()
    navigate(`/orders?q=${encodeURIComponent(query.trim())}`)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-tf-bg text-slate-700">
      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-tf-line bg-white px-4 py-5 lg:flex">
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-tf-primary font-bold text-white shadow-sm">
              T
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-900">TeleFlow</div>
              <div className="text-[11px] text-tf-muted">Orchestrator Control Plane</div>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-tf-line bg-tf-bg px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-tf-muted">Temporal Saga Status</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">Active Pipeline</span>
              <span className="h-2 w-2 rounded-full bg-tf-success" />
            </div>
            <div className="text-[11px] text-tf-muted">{kpis.inProgressCount} active saga(s)</div>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-tf-primary/10 text-tf-primary font-semibold'
                        : 'text-slate-500 hover:bg-tf-bg hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          {/* Quick link to Customer Portal */}
          <div className="mb-3">
            <Link
              to="/portal"
              className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100/60 transition"
            >
              <span>Customer Portal</span>
              <ExternalLink size={13} />
            </Link>
          </div>

          <div className="rounded-xl border border-tf-line bg-tf-bg p-3 text-[11px] text-tf-muted">
            <div className="font-semibold text-slate-800 flex items-center gap-1 mb-0.5">
              <ShieldCheck size={12} className="text-emerald-500" /> ACID Guarantee
            </div>
            Activations never stay partial. Saga always resolves to{' '}
            <span className="font-semibold text-emerald-600">COMPLETED</span> or{' '}
            <span className="font-semibold text-amber-600">ROLLED_BACK</span>.
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-tf-line bg-white/95 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-3.5 md:gap-4 md:px-5">
              <div className="hidden min-w-0 flex-1 md:block">
                <div className="text-[11px] uppercase tracking-[0.18em] text-tf-muted">
                  TeleFlow · Microservices Platform
                </div>
                <h1 className="truncate text-base font-semibold text-slate-900">{copy.title}</h1>
              </div>

              <form onSubmit={onSearch} className="relative min-w-0 flex-1 md:max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tf-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search order tracking ID, customer ID…"
                  className="h-10 w-full rounded-xl border border-tf-line bg-tf-bg pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-tf-primary/50"
                />
              </form>

              <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                GATEWAY :8080 · ORCHESTRATOR :8081
              </span>

              <Link
                to="/audit"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-tf-line bg-tf-surface text-slate-500 hover:text-slate-900"
                aria-label="Notifications"
                title={`${adminNotifications.length} Admin Alert(s)`}
              >
                <Bell size={16} />
                {adminNotifications.length > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </Link>

              {/* User Profile Chip with Logout */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                  <UserRound size={16} />
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-semibold text-slate-900">
                    {currentUser?.fullName || 'NOC Administrator'}
                  </div>
                  <div className="text-[10px] text-tf-muted">
                    {currentUser?.role || 'ROLE_ADMIN'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="ml-1 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>

            {/* Mobile Nav */}
            <nav
              aria-label="Primary navigation"
              className="flex gap-1 overflow-x-auto border-t border-tf-line px-3 py-2 lg:hidden"
            >
              {nav.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
                        isActive ? 'bg-tf-primary/10 text-tf-primary' : 'text-slate-500 hover:bg-tf-bg'
                      }`
                    }
                  >
                    <Icon size={14} />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6">
            <div className="mb-5 hidden items-end justify-between lg:flex">
              <p className="max-w-2xl text-sm text-tf-muted">{copy.subtitle}</p>
              <p className="font-mono text-xs text-slate-400">{envClock} IST</p>
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

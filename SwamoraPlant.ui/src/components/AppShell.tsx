import { type ReactNode } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Home, ScanLine, Cpu, Map as MapIcon, Settings, LogOut, Bell } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: typeof Home
}

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/diagnose', label: 'Diagnose', icon: ScanLine },
  { to: '/devices', label: 'Devices', icon: Cpu },
  { to: '/map', label: 'Map', icon: MapIcon },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface AppShellProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const handleLogout = () => {
    clearAuth()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur-sm">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-border">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
              <path
                d="M16 5C9 7 7 13 5.5 18l1.2.4.6-1.4a3 3 0 0 0 1.7.5C15 17.5 18 6 18 6c-.5 1-4 1-4 1l2.5-3L16 5z"
                fill="currentColor"
                className="text-primary"
              />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">SwamoraPlant</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Diagnostics
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-3 border-t border-border">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 sm:px-5 md:px-8 py-3 md:py-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {actions}
            <button
              type="button"
              className="h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
            </button>
            <div
              className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold"
              title={user?.email}
            >
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-5 md:px-8 py-5 sm:py-6 md:py-8 min-w-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-border bg-card/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
        <ul className="flex items-stretch justify-around">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = pathname === item.to
            return (
              <li key={item.to} className="flex-1 min-w-0">
                <Link
                  to={item.to}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2 sm:py-2.5 text-[10px] transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="leading-none truncate max-w-full px-1">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

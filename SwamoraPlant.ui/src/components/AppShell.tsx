import { type ReactNode } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Bell,
  Calendar,
  ClipboardList,
  Download,
  Hash,
  Leaf,
  Lightbulb,
  LogOut,
  Mic,
  Moon,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Droplets,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: typeof Leaf
}

// Icon-only vertical rail. Routes are remapped to existing app routes,
// while presenting the AI Greenhouse iconography from the mockup.
const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Leaf },
  { to: '/diagnose', label: 'Diagnose', icon: Droplets },
  { to: '/devices', label: 'Schedule', icon: Calendar },
  { to: '/map', label: 'Controls', icon: SlidersHorizontal },
  { to: '/settings', label: 'Reports', icon: ClipboardList },
]

interface AppShellProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const handleLogout = () => {
    clearAuth()
    navigate({ to: '/login' })
  }

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen w-full">
      {/* Outer padding to expose the lush gradient background */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Glassy frame that contains the entire app */}
        <div className="glass-card rounded-[28px] overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center gap-3 px-4 sm:px-6 py-4">
            {/* Logo + title */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="glass-pill h-11 w-11 rounded-2xl flex items-center justify-center">
                <LogoMark />
              </div>
              <span className="hidden sm:block text-base md:text-lg font-semibold tracking-tight">
                AI Greenhouse
              </span>
            </Link>

            {/* Search + mic, centered */}
            <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
              <div className="glass-pill flex items-center gap-2 rounded-full h-10 px-4 w-full max-w-xs sm:max-w-sm md:max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                aria-label="Voice"
                className="glass-pill h-10 w-10 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="ai-pill hidden sm:inline-flex items-center gap-1.5 rounded-full h-9 px-3 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                AI Assistant
              </button>
              <IconButton aria="Tips"><Lightbulb className="h-4 w-4" /></IconButton>
              <IconButton aria="Downloads"><Download className="h-4 w-4" /></IconButton>
              <IconButton aria="Notifications"><Bell className="h-4 w-4" /></IconButton>
              <IconButton aria="Dark"><Moon className="h-4 w-4" /></IconButton>
              <IconButton aria="Light"><Sun className="h-4 w-4" /></IconButton>
            </div>
          </header>

          {/* Body: sidebar rail + main */}
          <div className="flex gap-4 px-4 sm:px-6 pb-6">
            {/* Vertical icon rail */}
            <aside className="hidden md:flex flex-col items-center justify-between py-2">
              <nav className="flex flex-col gap-3">
                {NAV.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.to
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      title={item.label}
                      aria-label={item.label}
                      className={cn(
                        'h-11 w-11 rounded-2xl flex items-center justify-center transition-colors',
                        active
                          ? 'bg-[oklch(0.78_0.18_145)] text-[oklch(0.18_0.06_145)] shadow-[0_6px_18px_rgba(98,200,88,0.35)]'
                          : 'glass-pill text-foreground/70 hover:text-foreground',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  )
                })}
                <div className="glass-pill h-11 w-11 rounded-2xl flex items-center justify-center text-foreground/60">
                  <Hash className="h-5 w-5" />
                </div>
              </nav>
              <div className="flex flex-col items-center gap-3">
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className="glass-pill h-11 w-11 rounded-2xl flex items-center justify-center text-foreground/70 hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="h-11 w-11 rounded-full overflow-hidden border border-white/70 shadow-[0_2px_8px_rgba(20,40,30,0.12)] bg-[oklch(0.94_0.04_145)] text-[oklch(0.24_0.06_145)] flex items-center justify-center text-sm font-semibold"
                >
                  {initial}
                </button>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-white/40 bg-white/70 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <ul className="flex items-stretch justify-around">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = pathname === item.to
            return (
              <li key={item.to} className="flex-1 min-w-0">
                <Link
                  to={item.to}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="leading-none truncate max-w-full px-1">{item.label}</span>
                </Link>
              </li>
            )
          })}
          <li className="flex-1 min-w-0">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] text-muted-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

function IconButton({ children, aria }: { children: ReactNode; aria: string }) {
  return (
    <button
      type="button"
      aria-label={aria}
      className="glass-pill h-9 w-9 rounded-full hidden sm:inline-flex items-center justify-center hover:bg-white/90 transition-colors text-foreground/80"
    >
      {children}
    </button>
  )
}

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 11.5 12 5l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-7.5Z"
        stroke="oklch(0.4 0.14 145)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 9c.5 1.4 1.6 2.4 3 2.5-.2 1.6-1.4 2.8-3 3-1.6-.2-2.8-1.4-3-3 1.4-.1 2.5-1.1 3-2.5Z"
        fill="oklch(0.6 0.2 145)"
      />
    </svg>
  )
}

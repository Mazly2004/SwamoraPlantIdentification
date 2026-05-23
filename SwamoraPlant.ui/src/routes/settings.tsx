import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const ready = useAuthGuard()
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  if (!ready) return null

  const handleLogout = () => {
    clearAuth()
    navigate({ to: '/' })
  }

  return (
    <AppShell title="Settings" subtitle="Manage your account">
      <div className="max-w-xl space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-paper">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name ?? '—'}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-paper">
          <div className="text-sm font-medium">Session</div>
          <p className="text-xs text-muted-foreground mt-1">
            Sign out of this device. You'll need to log in again to access your dashboard.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className="mt-4 gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </AppShell>
  )
}

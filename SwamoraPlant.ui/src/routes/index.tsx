import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Activity,
  Cloud,
  Droplets,
  FlaskConical,
  Leaf,
  ScanLine,
  Sprout,
  Thermometer,
  Wind,
} from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { AppShell } from '@/components/AppShell'
import { StatCard } from '@/components/StatCard'
import { useAuthStore } from '@/store/authStore'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const ready = useAuthGuard()
  const { user } = useAuthStore()

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    )
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <AppShell
      title={`Hello, ${user?.name || user?.email?.split('@')[0]}`}
      subtitle={today}
    >
      <div className="grid grid-cols-12 gap-4 md:gap-5">
        {/* Hero weather card */}
        <div className="col-span-12 lg:col-span-8 rounded-xl border border-border bg-card p-5 md:p-6 shadow-paper">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Local conditions</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-semibold tracking-tight">24</span>
                <span className="text-2xl text-muted-foreground">°C</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Cloud className="h-4 w-4" />
                <span>Sunny · H:28° L:17°</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Garden</div>
              <div className="text-sm font-medium mt-1">Spinach Garden 08</div>
              <div className="text-xs text-muted-foreground mt-1">PL-02J · 200 m²</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat icon={Wind} label="Wind" value="2" unit="m/s" />
            <MiniStat icon={Droplets} label="Humidity" value="82" unit="%" />
            <MiniStat icon={FlaskConical} label="pH" value="7.6" />
            <MiniStat icon={Sprout} label="Soil" value="65" unit="%" />
          </div>
        </div>

        {/* Plant health hero */}
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-4"
          label="Plant Health"
          value="94"
          unit="%"
          icon={Leaf}
          tone="primary"
          description="Your plants are thriving and showing excellent health."
        />

        {/* Secondary tiles */}
        <StatCard
          className="col-span-6 sm:col-span-4 lg:col-span-3"
          label="Temperature"
          value="19"
          unit="°C"
          icon={Thermometer}
          description="Maintain between 16–20°C"
        />
        <StatCard
          className="col-span-6 sm:col-span-4 lg:col-span-3"
          label="Activity"
          value="6"
          unit="events"
          icon={Activity}
          description="Last 24 hours"
        />

        {/* Quick action: Diagnose */}
        <Link
          to="/diagnose"
          className="col-span-12 sm:col-span-4 lg:col-span-6 group rounded-xl border border-primary/20 bg-gradient-to-br from-primary/8 to-primary/2 p-5 md:p-6 shadow-paper hover:from-primary/12 hover:to-primary/4 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <ScanLine className="h-5 w-5" />
            </div>
            <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Open →
            </span>
          </div>
          <div className="mt-6">
            <div className="text-base font-semibold">Diagnose a plant</div>
            <div className="text-sm text-muted-foreground mt-1">
              Capture a leaf to detect disease and get a treatment recommendation.
            </div>
          </div>
        </Link>

        {/* Recent activity placeholder */}
        <div className="col-span-12 rounded-xl border border-border bg-card p-5 md:p-6 shadow-paper">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Recent activity</div>
              <div className="text-sm font-medium mt-1">Diagnoses & device events</div>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all
            </button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
            No recent diagnoses yet. Tap “Diagnose a plant” to get started.
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Wind
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-xl font-semibold">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}

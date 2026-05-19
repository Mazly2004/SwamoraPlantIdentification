import { createFileRoute } from '@tanstack/react-router'
import { Cpu, Wifi, AlertTriangle } from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { AppShell } from '@/components/AppShell'

export const Route = createFileRoute('/devices')({
  component: DevicesPage,
})

interface Device {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'warning'
  signal?: string
}

const DEMO_DEVICES: Device[] = [
  { id: 'SM201', name: 'JLNew H10: Soil Moisture Sensor', type: 'Sensor', status: 'online' },
  { id: 'WS004', name: 'HC T200 Wind Sensor', type: 'Sensor', status: 'online' },
  {
    id: 'TH011',
    name: 'ACE Temperature & Humidity Sensor',
    type: 'Sensor',
    status: 'warning',
    signal: 'Signal issue since 08:02 AM',
  },
  { id: 'CM042', name: 'VG550 Camera', type: 'Camera', status: 'online' },
  { id: 'PM225', name: 'Sanity PH Meter', type: 'Sensor', status: 'online' },
]

function DevicesPage() {
  const ready = useAuthGuard()
  if (!ready) return null

  return (
    <AppShell title="Devices" subtitle="Sensors and cameras connected to your gardens">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DEMO_DEVICES.map((d) => {
          const isWarning = d.status === 'warning'
          return (
            <div
              key={d.id}
              className="rounded-xl border border-border bg-card p-4 shadow-paper"
            >
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Cpu className="h-4 w-4" />
                </div>
                <span
                  className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md ${
                    isWarning
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isWarning ? 'bg-amber-500' : 'bg-primary'
                    }`}
                  />
                  {d.status}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  #{d.id} · {d.type}
                </div>
              </div>
              {d.signal && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  {d.signal}
                </div>
              )}
              {!d.signal && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wifi className="h-3 w-3" />
                  Healthy
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}

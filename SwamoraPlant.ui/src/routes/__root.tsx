import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ThemeProvider } from '@/components/theme-provider'
import { PlantLoader } from '@/components/PlantLoader'

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="farmsight-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Outlet />
        <PlantLoader />
      </div>
    </ThemeProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})

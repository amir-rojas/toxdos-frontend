import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useInitializeAuth } from '@/features/auth/api/useInitializeAuth'
import { useCurrentSession } from '@/features/cash-sessions/api/useCurrentSession'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

export function AppShell() {
  useInitializeAuth()
  useCurrentSession()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background h-svh overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '../AppSidebar'
import { useAuthStore } from '@/shared/store/auth.store'

// Quick-ops' dialogs pull in real data-fetching hooks (categories, customers, pawns).
// This test only cares about role-gated visibility of the panel itself, so the
// dialogs/modal are stubbed out to keep the test focused and network-free.
vi.mock('@/features/pawns/components/PawnFormDialog', () => ({
  PawnFormDialog: () => null,
}))
vi.mock('@/features/payments/components/PaymentFormDialog', () => ({
  PaymentFormDialog: () => null,
}))
vi.mock('@/features/quick-ops/components/CustomerPawnSearchModal', () => ({
  CustomerPawnSearchModal: () => null,
}))
vi.mock('@/features/customers/components/CustomerFormDialog', () => ({
  CustomerFormDialog: () => null,
}))

function renderSidebar(role: 'admin' | 'cashier') {
  useAuthStore.setState({
    user: { user_id: 1, full_name: 'Test User', email: 'test@test.com', role },
    token: 'fake-token',
  })

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('AppSidebar — QuickOpsPanel visibility', () => {
  it('hides the quick-ops panel for an admin user (moved to the dashboard)', () => {
    renderSidebar('admin')

    expect(screen.queryByText('Nuevo Contrato')).not.toBeInTheDocument()
    expect(screen.queryByText('Renovaciones')).not.toBeInTheDocument()
    expect(screen.queryByText('Cancelación')).not.toBeInTheDocument()
    expect(screen.queryByText('Nuevo Cliente')).not.toBeInTheDocument()
  })

  it('shows the quick-ops actions for a cashier user', () => {
    renderSidebar('cashier')

    expect(screen.getByText('Nuevo Contrato')).toBeInTheDocument()
    expect(screen.getByText('Renovaciones')).toBeInTheDocument()
    expect(screen.getByText('Cancelación')).toBeInTheDocument()
    expect(screen.getByText('Nuevo Cliente')).toBeInTheDocument()
  })
})

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CajaPage } from '@/pages/CajaPage'
import { ClientesPage } from '@/pages/ClientesPage'
import { EmpenosPage } from '@/pages/EmpenosPage'
import { PagosPage } from '@/pages/PagosPage'
import { VentasPage } from '@/pages/VentasPage'
import { GastosPage } from '@/pages/GastosPage'
import { MovimientosPage } from '@/pages/MovimientosPage'
import { InteresPage } from '@/pages/InteresPage'
import { AppShell } from '@/app/AppShell'
import { AuthGuard } from './AuthGuard'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'caja', element: <CajaPage /> },
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'empenos', element: <EmpenosPage /> },
      { path: 'pagos', element: <PagosPage /> },
      { path: 'ventas', element: <VentasPage /> },
      { path: 'gastos', element: <GastosPage /> },
      { path: 'movimientos', element: <MovimientosPage /> },
      { path: 'interes', element: <InteresPage /> },
    ],
  },
])

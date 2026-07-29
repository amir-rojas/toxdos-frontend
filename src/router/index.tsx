import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage }       from '@/pages/LoginPage'
import { DashboardPage }   from '@/pages/DashboardPage'
import { CajaPage }        from '@/pages/CajaPage'
import { ClientesPage }    from '@/pages/ClientesPage'
import { CustomerDetailPage } from '@/pages/CustomerDetailPage'
import { EmpenosPage }     from '@/pages/EmpenosPage'
import { PagosPage }       from '@/pages/PagosPage'
import { VentasPage }      from '@/pages/VentasPage'
import { GastosPage }      from '@/pages/GastosPage'
import { MovimientosPage } from '@/pages/MovimientosPage'
import { InteresPage }     from '@/pages/InteresPage'
import { UsuariosPage }    from '@/pages/UsuariosPage'
import { AppShell }        from '@/app/AppShell'
import { AuthGuard }       from './AuthGuard'
import { RoleGuard }       from './RoleGuard'
import { NotFoundPage }    from '@/pages/NotFoundPage'

const ADMIN_ONLY = ['admin'] as const

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/caja" replace /> },
      {
        path: 'dashboard',
        element: <RoleGuard allowedRoles={ADMIN_ONLY}><DashboardPage /></RoleGuard>,
      },
      { path: 'caja',        element: <CajaPage /> },
      { path: 'clientes',    element: <ClientesPage /> },
      { path: 'clientes/:id', element: <CustomerDetailPage /> },
      { path: 'empenos',     element: <EmpenosPage /> },
      { path: 'pagos',       element: <PagosPage /> },
      { path: 'ventas',      element: <VentasPage /> },
      { path: 'gastos',      element: <GastosPage /> },
      { path: 'movimientos', element: <MovimientosPage /> },
      {
        path: 'interes',
        element: <RoleGuard allowedRoles={ADMIN_ONLY}><InteresPage /></RoleGuard>,
      },
      {
        path: 'usuarios',
        element: <RoleGuard allowedRoles={ADMIN_ONLY}><UsuariosPage /></RoleGuard>,
      },
    ],
  },
])

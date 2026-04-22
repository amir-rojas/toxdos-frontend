import {
  LayoutDashboard,
  Landmark,
  Users,
  Package,
  CreditCard,
  Receipt,
  ShoppingBag,
  ArrowLeftRight,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Panel', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Caja', href: '/caja', icon: Landmark },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Empeños', href: '/empenos', icon: Package },
      { label: 'Clientes', href: '/clientes', icon: Users },
      { label: 'Pagos', href: '/pagos', icon: CreditCard },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { label: 'Gastos', href: '/gastos', icon: Receipt },
      { label: 'Ventas', href: '/ventas', icon: ShoppingBag },
      { label: 'Movimientos', href: '/movimientos', icon: ArrowLeftRight },
      { label: 'Interés', href: '/interes', icon: TrendingUp },
    ],
  },
]

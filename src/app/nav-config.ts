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
  UserCog,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/shared/types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles?: UserRole[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Panel',  href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
      { label: 'Caja',   href: '/caja',      icon: Landmark },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Empeños',  href: '/empenos',  icon: Package },
      { label: 'Clientes', href: '/clientes', icon: Users },
      { label: 'Pagos',    href: '/pagos',    icon: CreditCard },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { label: 'Gastos',       href: '/gastos',       icon: Receipt,         roles: ['admin'] },
      { label: 'Ventas',       href: '/ventas',        icon: ShoppingBag,     roles: ['admin'] },
      { label: 'Movimientos',  href: '/movimientos',   icon: ArrowLeftRight,  roles: ['admin'] },
      { label: 'Interés',      href: '/interes',       icon: TrendingUp,      roles: ['admin'] },
    ],
  },
  {
    label: 'Administración',
    items: [
      { label: 'Usuarios', href: '/usuarios', icon: UserCog, roles: ['admin'] },
    ],
  },
]

export function getNavForRole(role: UserRole): NavGroup[] {
  return NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0)
}

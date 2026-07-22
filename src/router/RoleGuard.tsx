import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import type { UserRole } from '@/shared/types'
import type { ReactNode } from 'react'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: ReactNode
  redirectTo?: string
}

export function RoleGuard({ allowedRoles, children, redirectTo = '/caja' }: RoleGuardProps) {
  const user = useCurrentUser()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

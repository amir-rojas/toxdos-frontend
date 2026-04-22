import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/auth.store'
import type { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const token = useAuthStore((s) => s.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

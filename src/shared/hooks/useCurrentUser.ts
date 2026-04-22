import { useAuthStore } from '@/shared/store/auth.store'

interface TokenPayload {
  sub: string
  email: string
  role: 'admin' | 'cashier'
}

function decodeToken(token: string): TokenPayload | null {
  try {
    return JSON.parse(atob(token.split('.')[1]!)) as TokenPayload
  } catch {
    return null
  }
}

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token)
  if (!token) return null
  return decodeToken(token)
}

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/store/auth.store'
import { getMe } from './auth.api'

export function useInitializeAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const { data, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: !!token && !user, // solo si hay token pero no hay user cargado
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (data && token) {
      setAuth(data, token)
    }
  }, [data, token, setAuth])

  useEffect(() => {
    if (isError) {
      clearAuth()
    }
  }, [isError, clearAuth])
}

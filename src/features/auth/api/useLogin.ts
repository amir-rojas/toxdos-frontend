import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/auth.store'
import { login } from './auth.api'
import type { LoginDto } from '../types'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
    onSuccess: ({ token, user }) => {
      setAuth(user, token)
      navigate('/dashboard', { replace: true })
    },
  })
}

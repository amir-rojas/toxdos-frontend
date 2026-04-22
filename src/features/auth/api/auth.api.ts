import { apiClient } from '@/shared/api/client'
import type { LoginDto, LoginResponse, AuthUser } from '../types'

export async function login(dto: LoginDto): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', dto)
  return data
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me')
  return data.user
}

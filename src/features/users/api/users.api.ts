import { apiClient } from '@/shared/api/client'
import type { AppUser } from '../types'

export async function getUsers(): Promise<AppUser[]> {
  const { data } = await apiClient.get<{ data: AppUser[] }>('/auth/users')
  return data.data
}

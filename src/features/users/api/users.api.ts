import { apiClient } from '@/shared/api/client'
import type { AppUser, ChangePasswordPayload, CreateUserPayload, UpdateUserPayload } from '../types'

export async function getUsers(): Promise<AppUser[]> {
  const { data } = await apiClient.get<{ data: AppUser[] }>('/auth/users')
  return data.data.map((u) => ({ ...u, user_id: Number(u.user_id) }))
}

export async function createUser(dto: CreateUserPayload): Promise<AppUser> {
  const { data } = await apiClient.post<{ user: AppUser }>('/auth/users', dto)
  return { ...data.user, user_id: Number(data.user.user_id) }
}

export async function updateUser(id: number, dto: UpdateUserPayload): Promise<AppUser> {
  const { data } = await apiClient.put<{ user: AppUser }>(`/auth/users/${id}`, dto)
  return { ...data.user, user_id: Number(data.user.user_id) }
}

export async function deactivateUser(id: number): Promise<void> {
  await apiClient.put(`/auth/users/${id}/deactivate`)
}

export async function changePassword(id: number, dto: ChangePasswordPayload): Promise<void> {
  await apiClient.put(`/auth/users/${id}/password`, dto)
}

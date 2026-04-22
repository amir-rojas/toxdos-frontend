import { apiClient } from '@/shared/api/client'
import type { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ data: Category[] }>('/api/categories')
  return data.data
}

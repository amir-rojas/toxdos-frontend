import { apiClient } from '@/shared/api/client'
import type { FinancesSummary } from '../types'

export async function getFinancesSummary(): Promise<FinancesSummary> {
  const { data } = await apiClient.get<{ data: FinancesSummary }>('/api/finances/summary')
  return data.data
}

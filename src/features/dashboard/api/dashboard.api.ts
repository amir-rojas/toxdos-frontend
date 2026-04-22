import { apiClient } from '@/shared/api/client'
import type { DashboardSummary } from '../types'

export async function getDashboardSummary(sessionId?: number): Promise<DashboardSummary> {
  const params = sessionId ? { session_id: sessionId } : {}
  const { data } = await apiClient.get<{ data: DashboardSummary }>('/api/dashboard/summary', { params })
  return data.data
}

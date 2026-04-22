import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from './dashboard.api'

export function useDashboardSummary(sessionId?: number) {
  return useQuery({
    queryKey: ['dashboard-summary', sessionId],
    queryFn:  () => getDashboardSummary(sessionId),
    staleTime: 60_000,
  })
}

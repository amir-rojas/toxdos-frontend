import { useQuery } from '@tanstack/react-query'
import { getFinancesSummary } from './finances.api'

export function useFinancesSummary() {
  return useQuery({
    queryKey: ['finances-summary'],
    queryFn:  getFinancesSummary,
    staleTime: 5 * 60 * 1000,
  })
}

import { useQuery } from '@tanstack/react-query'
import { getExpenses } from './expenses.api'

export function useExpenses(params?: {
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: ['expenses', params?.page ?? 1, params?.limit ?? 50, params?.dateFrom ?? '', params?.dateTo ?? ''],
    queryFn: () => getExpenses(params),
  })
}

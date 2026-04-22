import { useQuery } from '@tanstack/react-query'
import { getSales } from './sales.api'

export function useSales(pagination?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['sales', pagination?.page ?? 1, pagination?.limit ?? 50],
    queryFn: () => getSales(pagination),
    staleTime: 30_000,
  })
}

import { useQuery } from '@tanstack/react-query'
import { getPawnsByCustomer } from './pawns.api'

export function usePawnsByCustomer(
  customerId: number,
  pagination?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ['pawns-by-customer', customerId, pagination?.page ?? 1, pagination?.limit ?? 50],
    queryFn: () => getPawnsByCustomer(customerId, pagination),
    enabled: Number.isFinite(customerId) && customerId > 0,
    staleTime: 30_000,
  })
}

import { useQuery } from '@tanstack/react-query'
import { getItems } from './items.api'

export function useItems(params?: { status?: string }) {
  return useQuery({
    queryKey: ['items', params?.status ?? 'all'],
    queryFn: () => getItems(params ? { status: params.status, limit: 100 } : { limit: 100 }),
    staleTime: 30_000,
  })
}

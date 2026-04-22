import { useQuery } from '@tanstack/react-query'
import { getMovements } from './movements.api'

export function useMovements(params?: {
  page?:         number
  limit?:        number
  movementType?: string
  category?:     string
  dateFrom?:     string
  dateTo?:       string
  userId?:       number
}) {
  return useQuery({
    queryKey: [
      'movements',
      params?.page         ?? 1,
      params?.limit        ?? 100,
      params?.movementType ?? '',
      params?.category     ?? '',
      params?.dateFrom     ?? '',
      params?.dateTo       ?? '',
      params?.userId       ?? 0,
    ],
    queryFn: () => getMovements(params),
  })
}

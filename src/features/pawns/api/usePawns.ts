import { useQuery } from '@tanstack/react-query'
import { getPawns } from './pawns.api'

export function usePawns(
  status?: string,
  pagination?: { page?: number; limit?: number },
  search?: string,
  overdue?: boolean,
  dueDateFrom?: string,
  dueDateTo?: string
) {
  return useQuery({
    queryKey: ['pawns', status ?? '', pagination?.page ?? 1, pagination?.limit ?? 50, search ?? '', overdue ?? false, dueDateFrom ?? '', dueDateTo ?? ''],
    queryFn: () => getPawns(status, pagination, search, overdue, dueDateFrom, dueDateTo),
    staleTime: 30_000,
  })
}

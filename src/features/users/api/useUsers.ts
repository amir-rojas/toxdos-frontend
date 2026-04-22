import { useQuery } from '@tanstack/react-query'
import { getUsers } from './users.api'

export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users'],
    queryFn:  getUsers,
    staleTime: 5 * 60 * 1000,
    enabled:  options?.enabled ?? true,
  })
}

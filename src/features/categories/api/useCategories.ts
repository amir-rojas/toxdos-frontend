import { useQuery } from '@tanstack/react-query'
import { getCategories } from './categories.api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 300_000, // 5 min — catálogo estable
  })
}

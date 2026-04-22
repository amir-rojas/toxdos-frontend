import { useQuery } from '@tanstack/react-query'
import { searchCustomers, getCustomers } from './customers.api'

// Used by combobox/search — returns plain Customer[] with LIMIT 10
export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ['customers-search', search ?? ''],
    queryFn: () => (search ? searchCustomers(search) : Promise.resolve([])),
    staleTime: 30_000,
  })
}

// Used by ClientesPage — returns paginated result
export function useCustomersList(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['customers', page, limit],
    queryFn: () => getCustomers({ page, limit }),
    staleTime: 30_000,
  })
}

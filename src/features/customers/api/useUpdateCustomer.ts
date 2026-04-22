import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCustomer } from './customers.api'
import type { Customer, UpdateCustomerDto } from '../types'

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation<Customer, Error, { id: number; dto: UpdateCustomerDto }>({
    mutationFn: ({ id, dto }) => updateCustomer(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

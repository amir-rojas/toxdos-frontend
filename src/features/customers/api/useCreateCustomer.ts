import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCustomer } from './customers.api'
import type { CreateCustomerDto } from '../types'

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => createCustomer(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPayment } from './payments.api'
import type { CreatePaymentDto } from '../types'

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePaymentDto) => createPayment(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      if (variables.payment_type === 'redemption') {
        queryClient.invalidateQueries({ queryKey: ['pawns'] })
      }
    },
  })
}

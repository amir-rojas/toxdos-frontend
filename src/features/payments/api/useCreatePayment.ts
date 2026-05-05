import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPayment } from './payments.api'
import type { CreatePaymentDto } from '../types'

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePaymentDto) => createPayment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['pawns'] })
    },
  })
}

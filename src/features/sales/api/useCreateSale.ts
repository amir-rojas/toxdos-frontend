import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSale } from './sales.api'
import type { CreateSaleDto } from '../types'

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSaleDto) => createSale(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

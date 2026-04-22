import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createExpense } from './expenses.api'
import type { CreateExpenseDto } from '../types'

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateExpenseDto) => createExpense(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

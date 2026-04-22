import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPawn } from './pawns.api'
import type { CreatePawnDto } from '../types'

export function useCreatePawn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreatePawnDto) => createPawn(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pawns'] })
    },
  })
}

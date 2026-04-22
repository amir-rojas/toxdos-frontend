import { useMutation, useQueryClient } from '@tanstack/react-query'
import { forfeitPawn } from './pawns.api'

export function useForfeitPawn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pawnId: number) => forfeitPawn(pawnId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pawns'] })
    },
  })
}

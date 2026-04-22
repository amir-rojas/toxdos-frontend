import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'

export interface PawnDebt {
  interest_amount: number
  custody_amount: number
  loan_amount: number
}

async function getPawnDebt(pawnId: number): Promise<PawnDebt> {
  const { data } = await apiClient.get<{ data: PawnDebt }>(`/api/pawns/${pawnId}/debt`)
  return data.data
}

export function usePawnDebt(pawnId: number | undefined) {
  return useQuery({
    queryKey: ['pawn-debt', pawnId],
    queryFn: () => getPawnDebt(pawnId!),
    enabled: pawnId !== undefined,
    staleTime: 0,  // siempre fresco — el cajero necesita el monto real del día
  })
}

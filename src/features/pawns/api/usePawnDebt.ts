import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'

export interface PawnDebt {
  interest_amount: number
  custody_amount: number
  loan_amount: number
}

interface RawPawnDebt {
  interest_amount: string | number
  custody_amount: string | number
  loan_amount: string | number
}

function round2(v: string | number): number {
  return Math.round(parseFloat(String(v)) * 100) / 100
}

async function getPawnDebt(pawnId: number): Promise<PawnDebt> {
  const { data } = await apiClient.get<{ data: RawPawnDebt }>(`/api/pawns/${pawnId}/debt`)
  const raw = data.data
  return {
    interest_amount: round2(raw.interest_amount),
    custody_amount: round2(raw.custody_amount),
    loan_amount: round2(raw.loan_amount),
  }
}

export function usePawnDebt(pawnId: number | undefined) {
  return useQuery({
    queryKey: ['pawn-debt', pawnId],
    queryFn: () => getPawnDebt(pawnId!),
    enabled: pawnId !== undefined,
    staleTime: 0,  // siempre fresco — el cajero necesita el monto real del día
  })
}

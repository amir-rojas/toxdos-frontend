import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'

export interface PawnDebt {
  loan_amount:        number
  interest_per_block: number
  custody_per_block:  number
  blocks_due:         number
}

interface RawPawnDebt {
  loan_amount:        string | number
  interest_per_block: string | number
  custody_per_block:  string | number
  blocks_due:         string | number
}

function round2(v: string | number): number {
  return parseFloat(parseFloat(String(v)).toFixed(2))
}

async function getPawnDebt(pawnId: number): Promise<PawnDebt> {
  const { data } = await apiClient.get<{ data: RawPawnDebt }>(`/api/pawns/${pawnId}/debt`)
  const raw = data.data
  return {
    loan_amount:        round2(raw.loan_amount),
    interest_per_block: round2(raw.interest_per_block),
    custody_per_block:  round2(raw.custody_per_block),
    blocks_due:         parseInt(String(raw.blocks_due), 10),
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

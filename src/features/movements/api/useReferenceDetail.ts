import { useQuery } from '@tanstack/react-query'
import type { Movement } from '../types'
import { getPawnById } from '@/features/pawns/api/pawns.api'
import { getPaymentById } from '@/features/payments/api/payments.api'
import { getSaleById } from '@/features/sales/api/sales.api'
import { getExpenseById } from '@/features/expenses/api/expenses.api'

type ReferenceType = NonNullable<Movement['reference_type']>

async function fetchReference(type: ReferenceType, id: number) {
  switch (type) {
    case 'pawn':    return getPawnById(id)
    case 'payment': return getPaymentById(id)
    case 'sale':    return getSaleById(id)
    case 'expense': return getExpenseById(id)
  }
}

export function useReferenceDetail(
  type: ReferenceType | null,
  id: number | null
) {
  return useQuery({
    queryKey: ['reference-detail', type, id],
    queryFn:  () => fetchReference(type!, id!),
    enabled:  type !== null && id !== null,
    staleTime: 60_000,
  })
}

import { useQuery } from '@tanstack/react-query'
import { getPayments } from './payments.api'
import type { Payment } from '../types'

type PaymentFilters = {
  pawnId?: number
  search?: string
  paymentType?: Payment['payment_type']
  paymentMethod?: Payment['payment_method']
  paidFrom?: string
  paidTo?: string
}

export function usePayments(filters?: PaymentFilters, pagination?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [
      'payments',
      filters?.pawnId,
      filters?.search,
      filters?.paymentType,
      filters?.paymentMethod,
      filters?.paidFrom,
      filters?.paidTo,
      pagination?.page ?? 1,
      pagination?.limit ?? 50,
    ],
    queryFn: () => getPayments(filters, pagination),
    staleTime: 30_000,
  })
}

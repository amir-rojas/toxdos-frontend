import { apiClient } from '@/shared/api/client'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { Payment, CreatePaymentDto } from '../types'

function parsePayment(raw: Payment): Payment {
  return {
    ...raw,
    payment_id: Number(raw.payment_id),
    pawn_id:    Number(raw.pawn_id),
    session_id: Number(raw.session_id),
    interest_amount:  String(parseFloat(String(raw.interest_amount))),
    custody_amount:   String(parseFloat(String(raw.custody_amount))),
    principal_amount: String(parseFloat(String(raw.principal_amount))),
    total:            String(parseFloat(String(raw.total))),
  }
}

export async function getPayments(
  filters?: {
    pawnId?: number
    search?: string
    paymentType?: 'interest' | 'redemption' | 'partial'
    paymentMethod?: 'cash' | 'transfer' | 'qr'
    paidFrom?: string
    paidTo?: string
  },
  pagination?: { page?: number; limit?: number }
): Promise<{ data: Payment[]; meta: PaginationMeta }> {
  const params = {
    ...(filters?.pawnId     !== undefined ? { pawn_id:        filters.pawnId }        : {}),
    ...(filters?.search                   ? { search:         filters.search }         : {}),
    ...(filters?.paymentType              ? { payment_type:   filters.paymentType }    : {}),
    ...(filters?.paymentMethod            ? { payment_method: filters.paymentMethod }  : {}),
    ...(filters?.paidFrom                 ? { paid_from:      filters.paidFrom }       : {}),
    ...(filters?.paidTo                   ? { paid_to:        filters.paidTo }         : {}),
    ...pagination,
  }
  const { data } = await apiClient.get<{ data: Payment[]; meta: PaginationMeta }>('/api/payments', { params })
  return { data: data.data.map(parsePayment), meta: data.meta }
}

export async function getPaymentById(paymentId: number): Promise<Payment> {
  const { data } = await apiClient.get<{ data: Payment }>(`/api/payments/${paymentId}`)
  return parsePayment(data.data)
}

export async function createPayment(dto: CreatePaymentDto): Promise<Payment> {
  const { data } = await apiClient.post<{ data: Payment }>('/api/payments', dto)
  return parsePayment(data.data)
}

export async function printPaymentVoucher(paymentId: number): Promise<void> {
  const response = await apiClient.get<string>(`/api/payments/${paymentId}/voucher`, { responseType: 'text' })
  const blob = new Blob([response.data], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

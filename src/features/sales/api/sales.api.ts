import { apiClient } from '@/shared/api/client'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { Sale, CreateSaleDto } from '../types'

function parseSale(raw: Sale): Sale {
  return {
    ...raw,
    sale_id: Number(raw.sale_id),
    item_id: Number(raw.item_id),
    session_id: Number(raw.session_id),
    buyer_customer_id: raw.buyer_customer_id ? Number(raw.buyer_customer_id) : null,
    sale_price: parseFloat(String(raw.sale_price)),
  }
}

export async function getSales(
  pagination?: { page?: number; limit?: number }
): Promise<{ data: Sale[]; meta: PaginationMeta }> {
  const { data } = await apiClient.get<{ data: Sale[]; meta: PaginationMeta }>(
    '/api/sales',
    { params: pagination }
  )
  return { data: data.data.map(parseSale), meta: data.meta }
}

export async function getSaleById(saleId: number): Promise<Sale> {
  const { data } = await apiClient.get<{ data: Sale }>(`/api/sales/${saleId}`)
  return parseSale(data.data)
}

export async function createSale(dto: CreateSaleDto): Promise<Sale> {
  const { data } = await apiClient.post<{ data: Sale }>('/api/sales', dto)
  return parseSale(data.data)
}

import { apiClient } from '@/shared/api/client'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { Item } from '../types'

function parseItem(raw: Item): Item {
  return {
    ...raw,
    item_id: Number(raw.item_id),
    pawn_id: Number(raw.pawn_id),
    appraised_value: parseFloat(String(raw.appraised_value)),
  }
}

export async function getItems(
  params?: { status?: string; page?: number; limit?: number }
): Promise<{ data: Item[]; meta: PaginationMeta }> {
  const { data } = await apiClient.get<{ data: Item[]; meta: PaginationMeta }>(
    '/api/items',
    { params }
  )
  return { data: data.data.map(parseItem), meta: data.meta }
}

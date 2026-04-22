import { apiClient } from '@/shared/api/client'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { Movement } from '../types'

function parseMovement(raw: Movement): Movement {
  return {
    ...raw,
    movement_id:  Number(raw.movement_id),
    session_id:   Number(raw.session_id),
    user_id:      Number(raw.user_id),
    reference_id: raw.reference_id ? Number(raw.reference_id) : null,
    amount:       parseFloat(String(raw.amount)),
  }
}

export async function getMovements(params?: {
  page?:          number
  limit?:         number
  movementType?:  string
  category?:      string
  dateFrom?:      string
  dateTo?:        string
  userId?:        number
}): Promise<{ data: Movement[]; meta: PaginationMeta }> {
  const { data } = await apiClient.get<{ data: Movement[]; meta: PaginationMeta }>(
    '/api/movements',
    {
      params: {
        page:          params?.page,
        limit:         params?.limit,
        movement_type: params?.movementType,
        category:      params?.category,
        date_from:     params?.dateFrom,
        date_to:       params?.dateTo,
        user_id:       params?.userId,
      },
    }
  )
  return { data: data.data.map(parseMovement), meta: data.meta }
}

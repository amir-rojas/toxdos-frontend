import { apiClient } from '@/shared/api/client'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { Pawn, PawnWithItems, CreatePawnDto } from '../types'

function parsePawn(raw: Pawn): Pawn {
  return {
    ...raw,
    pawn_id: Number(raw.pawn_id),
    customer_id: Number(raw.customer_id),
    user_id: Number(raw.user_id),
    loan_amount: String(parseFloat(String(raw.loan_amount))),
    interest_rate: String(parseFloat(String(raw.interest_rate))),
    custody_rate: String(parseFloat(String(raw.custody_rate))),
  }
}

export async function getPawns(
  status?: string,
  pagination?: { page?: number; limit?: number },
  search?: string,
  overdue?: boolean,
  dueDateFrom?: string,
  dueDateTo?: string
): Promise<{ data: Pawn[]; meta: PaginationMeta }> {
  const params = {
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
    ...(overdue ? { overdue: 'true' } : {}),
    ...(dueDateFrom ? { due_date_from: dueDateFrom } : {}),
    ...(dueDateTo ? { due_date_to: dueDateTo } : {}),
    ...pagination,
  }
  const { data } = await apiClient.get<{ data: Pawn[]; meta: PaginationMeta }>('/api/pawns', { params })
  return { data: data.data.map(parsePawn), meta: data.meta }
}

export async function createPawn(dto: CreatePawnDto): Promise<Pawn> {
  const { data } = await apiClient.post<{ data: Pawn }>('/api/pawns', dto)
  return parsePawn(data.data)
}

export async function getPawnById(pawnId: number): Promise<PawnWithItems> {
  const { data } = await apiClient.get<{ data: PawnWithItems }>(`/api/pawns/${pawnId}`)
  return data.data
}

export async function forfeitPawn(pawnId: number): Promise<PawnWithItems> {
  const { data } = await apiClient.patch<{ data: PawnWithItems }>(`/api/pawns/${pawnId}/forfeit`)
  return data.data
}

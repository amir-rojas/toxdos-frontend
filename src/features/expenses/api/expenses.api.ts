import { apiClient } from '@/shared/api/client'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { Expense, ExpensesStats, CreateExpenseDto } from '../types'

function parseExpense(raw: Expense): Expense {
  return {
    ...raw,
    expense_id: Number(raw.expense_id),
    session_id: Number(raw.session_id),
    user_id: Number(raw.user_id),
    amount: parseFloat(String(raw.amount)),
  }
}

export async function getExpenses(params?: {
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
}): Promise<{ data: Expense[]; meta: PaginationMeta; stats: ExpensesStats }> {
  const { data } = await apiClient.get<{ data: Expense[]; meta: PaginationMeta; stats: ExpensesStats }>(
    '/api/expenses',
    {
      params: {
        page: params?.page,
        limit: params?.limit,
        date_from: params?.dateFrom,
        date_to: params?.dateTo,
      },
    }
  )
  return { data: data.data.map(parseExpense), meta: data.meta, stats: data.stats }
}

export async function getExpenseById(expenseId: number): Promise<Expense> {
  const { data } = await apiClient.get<{ data: Expense }>(`/api/expenses/${expenseId}`)
  return parseExpense(data.data)
}

export async function createExpense(dto: CreateExpenseDto): Promise<Expense> {
  const { data } = await apiClient.post<{ data: Expense }>('/api/expenses', dto)
  return parseExpense(data.data)
}

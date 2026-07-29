import type { Pawn } from '../types'

const ACTIVE_STATUSES: ReadonlySet<Pawn['status']> = new Set(['active', 'renewed'])

export interface CustomerStats {
  total: number
  activeCount: number
  totalLoaned: number
  overdueCount: number
  forSaleCount: number
}

// Pure — used by CustomerDetailPage to derive summary stats from a customer's pawn history
export function computeCustomerStats(pawns: Pawn[]): CustomerStats {
  const today = new Date()

  return {
    total: pawns.length,
    activeCount: pawns.filter((p) => ACTIVE_STATUSES.has(p.status)).length,
    totalLoaned: pawns.reduce((sum, p) => sum + parseFloat(p.loan_amount), 0),
    overdueCount: pawns.filter((p) => ACTIVE_STATUSES.has(p.status) && new Date(p.due_date) < today).length,
    forSaleCount: pawns.filter((p) => p.status === 'forfeited').length,
  }
}

// Shared with CustomerDetailPage to highlight overdue rows in the pawns table
export function isPawnOverdue(pawn: Pawn): boolean {
  return ACTIVE_STATUSES.has(pawn.status) && new Date(pawn.due_date) < new Date()
}

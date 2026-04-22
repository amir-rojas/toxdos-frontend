export type MovementType = 'in' | 'out'

export type MovementCategory =
  | 'loan'
  | 'interest_payment'
  | 'custody_payment'
  | 'redemption'
  | 'sale'
  | 'operating_expense'
  | 'cash_withdrawal'
  | 'cash_deposit'

export interface Movement {
  movement_id: number
  session_id: number
  user_id: number
  movement_type: MovementType
  category: MovementCategory
  amount: number
  reference_type: 'payment' | 'pawn' | 'sale' | 'expense' | null
  reference_id: number | null
  notes: string | null
  created_at: string
}

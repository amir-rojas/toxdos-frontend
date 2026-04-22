export interface CashSession {
  session_id: number
  user_id: number
  cashier_name: string
  opening_amount: number
  closing_amount: number | null
  expected_amount: number | null
  difference: number | null
  notes: string | null
  status: 'open' | 'closed'
  opened_at: string
  closed_at: string | null
}

export interface OpenSessionDto {
  opening_amount: number
}

export interface CloseSessionDto {
  closing_amount: number
  notes?: string
}

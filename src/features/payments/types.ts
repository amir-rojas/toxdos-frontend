export interface PaymentsStats {
  collected_today: string
  count_today: number
}

export interface Payment {
  payment_id: number
  pawn_id: number
  session_id: number
  interest_amount: string   // NUMERIC string
  custody_amount: string    // NUMERIC string
  principal_amount: string  // NUMERIC string
  total: string             // GENERATED: interest + custody + principal
  payment_type: 'interest' | 'redemption' | 'partial'
  payment_method: 'cash' | 'transfer' | 'qr'
  paid_at: string           // ISO 8601
  customer_name: string | null  // JOIN customers via pawns
}

export interface CreatePaymentDto {
  pawn_id:           number
  months_paid:       number
  principal_amount?: number  // >= 0 (redemption only)
  payment_type:      'interest' | 'redemption' | 'partial'
  payment_method?:   'cash' | 'transfer' | 'qr'
}

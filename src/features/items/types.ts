export interface Item {
  item_id: number
  pawn_id: number
  category_id: number | null
  description: string
  brand: string | null
  model: string | null
  serial_number: string | null
  appraised_value: number    // NUMERIC parsed to number
  status: 'pawned' | 'redeemed' | 'available_for_sale' | 'sold'
  photo_url: string | null
  created_at: string
  updated_at: string
}
